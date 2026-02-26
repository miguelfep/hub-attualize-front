'use client';

import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { toast } from 'sonner';
import { useState, useEffect, useCallback, } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { ICON_KEYS } from 'src/layouts/config-nav-dashboard';
import { buscarContasPagarPorPeriodo } from 'src/actions/contas';
import {
  criarCentroCusto,
  deletarCentroCusto,
  listarCentrosCusto,
  atualizarCentroCusto,
} from 'src/actions/centros-custo';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { ContaPagarTableRow } from '../pagar/list/pagar-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome' },
  { id: 'valor', label: 'Valor da Conta' },
  { id: 'vencimento', label: 'Data de Vencimento' },
  { id: 'status', label: 'Status' },
  { id: 'banco', label: 'Banco' },
  { id: 'categoria', label: 'Categoria' },
  { id: '', label: '' },
];

function CentroCustoIcon({ iconKey, size = 48 }) {
  if (iconKey && ICON_KEYS.includes(iconKey)) {
    return (
      <SvgColor
        src={`${CONFIG.site.basePath}/assets/icons/navbar/ic-${iconKey}.svg`}
        sx={{ width: size, height: size }}
      />
    );
  }
  if (iconKey) {
    return <Iconify icon={iconKey} width={size} />;
  }
  return <Iconify icon="mdi:tag-outline" width={size} sx={{ color: 'text.disabled' }} />;
}

// ----------------------------------------------------------------------

function CentroCustoCard({ row, selected, onSelect, onEditar, onExcluir }) {
  const popover = usePopover();

  return (
    <>
      <Paper
        variant="outlined"
        onClick={() => onSelect(row._id)}
        sx={{
          position: 'relative',
          p: 2.5,
          minWidth: 200,
          flexShrink: 0,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          borderWidth: 2,
          transition: (theme) => theme.transitions.create(['border-color', 'box-shadow']),
          ...(selected && {
            borderColor: 'primary.main',
            boxShadow: (theme) => theme.customShadows.z8,
            bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.2),
          }),
        }}
      >
        <IconButton
          size="small"
          color={popover.open ? 'inherit' : 'default'}
          onClick={(e) => {
            e.stopPropagation();
            popover.onOpen(e);
          }}
          sx={{ position: 'absolute', top: 4, right: 4 }}
          aria-label="Mais opções"
        >
          <Iconify icon="eva:more-vertical-fill" width={20} />
        </IconButton>
        <CentroCustoIcon iconKey={row.icon} size={48} />
        <Typography variant="subtitle2" noWrap sx={{ width: '100%', textAlign: 'center', px: 0.5 }}>
          {row.nome}
        </Typography>
      </Paper>
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'bottom-end' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              onEditar(row);
            }}
          >
            <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem
            onClick={() => {
              popover.onClose();
              onExcluir(row);
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
            Deletar
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}

// ----------------------------------------------------------------------

function CentroCustoSkeleton() {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        minWidth: 200,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Iconify icon="mdi:tag-outline" width={48} sx={{ color: 'action.hover' }} />
      </Box>
      <Skeleton variant="rounded" width={120} height={24} sx={{ borderRadius: 1 }} />
    </Paper>
  );
}

// ----------------------------------------------------------------------

export function CentroCustoListView() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, nome: '' });
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nome: '', icon: '' });

  const [centroSelecionadoId, setCentroSelecionadoId] = useState(null);
  const [periodo, setPeriodo] = useState({
    startDate: dayjs().startOf('month'),
    endDate: dayjs().endOf('month'),
  });
  const [contasDoPeriodo, setContasDoPeriodo] = useState([]);
  const [loadingContas, setLoadingContas] = useState(false);

  const table = useTable({ defaultOrderBy: 'dataVencimento', defaultRowsPerPage: 25 });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const fetchCentroCusto = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarCentrosCusto();
      setLista(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Erro ao carregar centros de custo');
      setLista([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContas = useCallback(async () => {
    setLoadingContas(true);
    try {
      const start = periodo.startDate.format('YYYY-MM-DD');
      const end = periodo.endDate.format('YYYY-MM-DD');
      const contas = await buscarContasPagarPorPeriodo(
        start,
        end,
        centroSelecionadoId || undefined
      );
      setContasDoPeriodo(Array.isArray(contas) ? contas : []);
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Erro ao carregar contas');
      setContasDoPeriodo([]);
    } finally {
      setLoadingContas(false);
    }
  }, [periodo.startDate, periodo.endDate, centroSelecionadoId]);

  useEffect(() => {
    fetchCentroCusto();
  }, [fetchCentroCusto]);

  useEffect(() => {
    fetchContas();
  }, [fetchContas]);

  const abrirNovo = () => {
    setEditingId(null);
    setForm({ nome: '', icon: '' });
    setDialogOpen(true);
  };

  const abrirEditar = (row, e) => {
    e?.stopPropagation?.();
    setEditingId(row._id);
    setForm({ nome: row.nome || '', icon: row.icon || '' });
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    if (!form.nome?.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      if (editingId) {
        await atualizarCentroCusto(editingId, {
          nome: form.nome.trim(),
          icon: form.icon?.trim() || undefined,
        });
        toast.success('Centro de custo atualizado');
      } else {
        await criarCentroCusto({
          nome: form.nome.trim(),
          icon: form.icon?.trim() || undefined,
        });
        toast.success('Centro de custo criado');
      }
      setDialogOpen(false);
      fetchCentroCusto();
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Erro ao salvar');
    }
  };

  const handleExcluir = (e) => {
    e?.stopPropagation?.();
    if (!confirmDelete.id) return;
    const { id } = confirmDelete;
    setConfirmDelete({ open: false, id: null, nome: '' });
    if (centroSelecionadoId === id) setCentroSelecionadoId(null);
    deletarCentroCusto(id)
      .then(() => {
        toast.success('Centro de custo excluído');
        fetchCentroCusto();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || err?.message || 'Erro ao excluir');
      });
  };

  const handlePrevMonth = () => {
    setPeriodo({
      startDate: periodo.startDate.subtract(1, 'month').startOf('month'),
      endDate: periodo.endDate.subtract(1, 'month').endOf('month'),
    });
  };

  const handleNextMonth = () => {
    setPeriodo({
      startDate: periodo.startDate.add(1, 'month').startOf('month'),
      endDate: periodo.endDate.add(1, 'month').endOf('month'),
    });
  };

  const dataFiltered = contasDoPeriodo;
  const dataInPage = rowInPage(dataFiltered, page, rowsPerPage);
  const emptyRowsCount = emptyRows(page, rowsPerPage, dataFiltered.length);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const centroSelecionado = lista.find((c) => c._id === centroSelecionadoId);
  const tituloTabela =
    centroSelecionadoId == null
      ? 'Todas as contas no período'
      : `Contas a pagar – ${centroSelecionado?.nome ?? 'Centro'}`;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Centros de Custo"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Financeiro', href: paths.dashboard.financeiro.root },
          { name: 'Centro de custo' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={abrirNovo}
          >
            Novo Centro de Custo
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Carrossel de centros (scroll horizontal) */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="text.primary" sx={{ mb: 1.5, color: 'text.secondary' }}>
            Selecione um centro para ver as contas a pagar
          </Typography>
          {loading ? (
            <Scrollbar sx={{ width: '100%', minHeight: 100 }}>
              <Box sx={{ display: 'flex', gap: 2, pb: 1, flexWrap: 'nowrap' }}>
                {[...Array(5)].map((_, i) => (
                  <CentroCustoSkeleton key={i} />
                ))}
              </Box>
            </Scrollbar>
          ) : lista.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">Nenhum centro de custo cadastrado.</Typography>
            </Box>
          ) : (
            <Scrollbar sx={{ width: '100%', minHeight: 100, py: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2, pb: 1, flexWrap: 'nowrap' }}>
                {/* Card "Todos" */}
                <Paper
                  variant="outlined"
                  onClick={() => setCentroSelecionadoId(null)}
                  sx={{
                    p: 2.5,
                    minWidth: 200,
                    flexShrink: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    borderWidth: 2,
                    transition: (theme) => theme.transitions.create(['border-color', 'box-shadow']),
                    ...(centroSelecionadoId === null && {
                      borderColor: 'primary.main',
                      boxShadow: (theme) => theme.customShadows.z8,
                      bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.2),
                    }),
                  }}
                >
                  <Iconify icon="mdi:format-list-bulleted" width={48} sx={{ color: 'text.secondary' }} />
                  <Typography variant="subtitle2" noWrap sx={{ width: '100%', textAlign: 'center' }}>
                    Todos
                  </Typography>
                </Paper>

                {lista.map((row) => (
                  <CentroCustoCard
                    key={row._id}
                    row={row}
                    selected={centroSelecionadoId === row._id}
                    onSelect={setCentroSelecionadoId}
                    onEditar={(r) => abrirEditar(r, null)}
                    onExcluir={(r) => setConfirmDelete({ open: true, id: r._id, nome: r.nome })}
                  />
                ))}
              </Box>
            </Scrollbar>
          )}
        </Box>
      </Card>

      {/* Seletor de período + Tabela de contas do centro */}
      <Card>
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
            <Typography variant="h6">{tituloTabela}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton size="small" onClick={handlePrevMonth} aria-label="Mês anterior">
                <Iconify icon="eva:arrow-ios-back-fill" />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 140, textAlign: 'center', textTransform: 'capitalize' }}>
                {periodo.startDate.locale('pt-br').format('MMMM YYYY')}
              </Typography>
              <IconButton size="small" onClick={handleNextMonth} aria-label="Próximo mês">
                <Iconify icon="eva:arrow-ios-forward-fill" />
              </IconButton>
            </Stack>
          </Stack>

          {loadingContas ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography color="text.secondary">Carregando contas…</Typography>
            </Box>
          ) : (
            <>
              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={dataFiltered.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(checked, dataFiltered.map((row) => row._id))
                    }
                  />
                  <TableBody>
                    {dataInPage.map((row) => (
                      <ContaPagarTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        fetchContas={fetchContas}
                      />
                    ))}
                    <TableEmptyRows height={emptyRowsCount} />
                    <TableNoData notFound={!dataFiltered.length} />
                  </TableBody>
                </Table>
              </Scrollbar>
              <TablePaginationCustom
                page={page}
                rowsPerPage={rowsPerPage}
                count={dataFiltered.length}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Box>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingId ? 'Editar Centro de Custo' : 'Crie um novo Centro de Custo'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Escolha um ícone e defina o nome
          </Typography>

          {/* Perfil: grid de ícones (ícone do perfil) */}
          <Scrollbar sx={{ maxHeight: 220, mx: -1 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 1,
                py: 1,
              }}
            >
              {ICON_KEYS.map((key) => (
                <Paper
                  key={key}
                  variant="outlined"
                  onClick={() => setForm((f) => ({ ...f, icon: key }))}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    transition: (theme) => theme.transitions.create(['border-color', 'bgcolor']),
                    ...(form.icon === key && {
                      borderColor: 'primary.main',
                      bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.2),
                    }),
                  }}
                >
                  <SvgColor
                    src={`${CONFIG.site.basePath}/assets/icons/navbar/ic-${key}.svg`}
                    sx={{ width: 32, height: 32 }}
                  />
                </Paper>
              ))}
            </Box>
          </Scrollbar>

          <TextField
            label="Nome"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            required
            fullWidth
            placeholder="Ex: Marketing, Operações"
            sx={{ mt: 2.5 }}
          />

          <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSalvar}>
              Salvar
            </Button>
          </Stack>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null, nome: '' })}
        title="Excluir centro de custo?"
        content={`Confirma a exclusão de "${confirmDelete.nome}"?`}
        action={
          <Button variant="contained" color="error" onClick={handleExcluir}>
            Excluir
          </Button>
        }
      />
    </DashboardContent>
  );
}
