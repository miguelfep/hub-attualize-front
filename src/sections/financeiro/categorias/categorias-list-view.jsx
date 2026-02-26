'use client';

import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box'
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { useDebounce } from 'src/hooks/use-debounce';

import { applySortFilter } from 'src/utils/constants/table-utils';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  criarCategoriaFinanceira,
  deletarCategoriaFinanceira,
  listarCategoriasFinanceiras,
  atualizarCategoriaFinanceira,
} from 'src/actions/categorias-financeiras';

import { Iconify } from 'src/components/iconify';
import { useTable } from 'src/components/table/use-table';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { TableNoData, TableHeadCustom } from 'src/components/table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const TIPOS = [
  { value: 'RECEITA', label: 'Receita' },
  { value: 'DESPESA', label: 'Despesa' },
];

const TABLE_HEAD = [
  { id: 'nome', label: 'Categoria' },
  { id: '', width: 60 },
];

// ----------------------------------------------------------------------

function TabelaCategorias({ titulo, lista, total, table, onEditar, onExcluir, onAdicionar, loading }) {
  const theme = useTheme();

  return (
    <Card sx={{
      boxShadow: theme.customShadows?.card || 0,
      border: `1px solid ${theme.palette.divider}`
    }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: 2.5,
          bg: theme.palette.background.neutral,
          bgcolor: alpha(theme.palette.grey[500], 0.04),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
          {titulo}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 0.75,
              typography: 'caption',
              fontWeight: 'bold',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.dark,
            }}
          >
            {total} itens
          </Box>

          <Button
            size="medium"
            variant="contained"
            disableElevation
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={onAdicionar}
            sx={{ borderRadius: 1 }}
          >
            Adicionar
          </Button>
        </Stack>
      </Stack>

      <TableContainer sx={{ position: 'relative', minHeight: 180 }}>
        <Table size="medium">
          <TableHeadCustom
            order={table.order}
            orderBy={table.orderBy}
            onSort={table.onSort}
            headLabel={TABLE_HEAD}
          />
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 10 }}>
                  <CircularProgress size={32} thickness={2} color="inherit" />
                </TableCell>
              </TableRow>
            ) : (
              <>
                {lista.map((row) => (
                  <CategoriaTableRow key={row._id} row={row} onEditar={onEditar} onExcluir={onExcluir} />
                ))}
                <TableNoData notFound={lista.length === 0} sx={{ py: 6 }} />
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        page={table.page}
        count={total}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 30]}
        sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
      />
    </Card>
  );
}

function CategoriaTableRow({ row, onEditar, onExcluir }) {
  const popover = usePopover();

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ fontWeight: 'medium' }}>{row.nome}</TableCell>
        <TableCell align="right">
          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
        <MenuList>
          <MenuItem onClick={() => { popover.onClose(); onEditar(row); }}>
            <Iconify icon="solar:pen-bold" /> Editar
          </MenuItem>
          <MenuItem onClick={() => { popover.onClose(); onExcluir(row); }} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" /> Deletar
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}

// ----------------------------------------------------------------------

export function CategoriasListView() {
  const theme = useTheme();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, nome: '' });
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nome: '', tipo: 'DESPESA' });

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const tableReceitas = useTable({ defaultRowsPerPage: 10, defaultOrderBy: 'nome' });
  const tableDespesas = useTable({ defaultRowsPerPage: 10, defaultOrderBy: 'nome' });

  // 1. IMPORTANTE: Resetar as páginas quando o usuário digita na busca
  useEffect(() => {
    tableReceitas.onResetPage();
    tableDespesas.onResetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarCategoriasFinanceiras();
      setLista(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // 2. Filtro com trim() para evitar falhas por espaços em branco
  const filtered = lista.filter((i) => {
    const termo = debouncedSearch.toLowerCase().trim();
    return i.nome?.toLowerCase().includes(termo);
  });

  // 3. Processamento de Receitas (Filtrar -> Ordenar -> Paginar)
  const receitasAll = filtered.filter(i => i.tipo === 'RECEITA');
  const receitasSorted = applySortFilter({
    inputData: receitasAll,
    order: tableReceitas.order,
    orderBy: tableReceitas.orderBy,
  });
  const receitasPaged = receitasSorted.slice(
    tableReceitas.page * tableReceitas.rowsPerPage,
    (tableReceitas.page + 1) * tableReceitas.rowsPerPage
  );

  // 4. Processamento de Despesas (Filtrar -> Ordenar -> Paginar)
  const despesasAll = filtered.filter(i => i.tipo === 'DESPESA');
  const despesasSorted = applySortFilter({
    inputData: despesasAll,
    order: tableDespesas.order,
    orderBy: tableDespesas.orderBy,
  });
  const despesasPaged = despesasSorted.slice(
    tableDespesas.page * tableDespesas.rowsPerPage,
    (tableDespesas.page + 1) * tableDespesas.rowsPerPage
  );

  const abrirNovo = (tipo = 'DESPESA') => {
    setEditingId(null);
    setForm({ nome: '', tipo });
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      toast.error('Nome obrigatório');
      return;
    }

    try {
      if (editingId) {
        await atualizarCategoriaFinanceira(editingId, form);
      } else {
        await criarCategoriaFinanceira(form);
      }
      toast.success(editingId ? 'Atualizado!' : 'Criado!');
      setDialogOpen(false);
      carregar();
    } catch (e) {
      toast.error('Erro ao salvar');
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Gestão de Categorias"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Financeiro', href: paths.dashboard.financeiro.root },
          { name: 'Categorias' },
        ]}
        sx={{ mb: 3 }}
      />

      <Card
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          // Mesma borda e sombra das suas tabelas para manter o padrão
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.customShadows?.card || 0,
        }}
      >
        <TextField
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar categoria..."
          size="small" // Mantém o campo mais discreto
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            // Estilização opaca e sem cores estranhas no foco
            '& .MuiOutlinedInput-root': {
              bgcolor: alpha(theme.palette.grey[500], 0.05),
              '& fieldset': {
                border: 'none', // Remove a borda padrão para ficar limpo
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: `1px solid ${theme.palette.grey[400]}`, // Borda cinza discreta ao focar
              },
              '&.Mui-focused': {
                bgcolor: alpha(theme.palette.grey[500], 0.08),
              }
            }
          }}
        />

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => abrirNovo()}
          sx={{
            whiteSpace: 'nowrap',
            height: 40,
            px: 2.5,
            fontWeight: 600,
            borderRadius: 1,
            bgcolor: theme.palette.text.primary,
            color: theme.palette.background.paper,
            '&:hover': {
              bgcolor: theme.palette.text.secondary,
            }
          }}
        >
          Nova Categoria
        </Button>
      </Card>

      <Stack spacing={4}>
        <TabelaCategorias
          titulo="Receitas"
          lista={receitasPaged}
          total={receitasAll.length}
          table={tableReceitas}
          loading={loading}
          onAdicionar={() => abrirNovo('RECEITA')}
          onEditar={(row) => { setEditingId(row._id); setForm(row); setDialogOpen(true); }}
          onExcluir={(row) => setConfirmDelete({ open: true, id: row._id, nome: row.nome })}
        />

        <TabelaCategorias
          titulo="Despesas"
          lista={despesasPaged}
          total={despesasAll.length}
          table={tableDespesas}
          loading={loading}
          onAdicionar={() => abrirNovo('DESPESA')}
          onEditar={(row) => { setEditingId(row._id); setForm(row); setDialogOpen(true); }}
          onExcluir={(row) => setConfirmDelete({ open: true, id: row._id, nome: row.nome })}
        />
      </Stack>

      {/* MODAL PADRÃO */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.customShadows?.z24,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 0, typography: 'h5', fontWeight: 600 }}>
          {editingId ? 'Editar' : 'Nova'} Categoria
        </DialogTitle>

        <DialogContent sx={{ p: 3, overflowY: 'visible' }}>
          <Stack spacing={5} sx={{ mt: 4 }}>

            <TextField
              label="Nome da Categoria"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              fullWidth
              autoFocus
              InputLabelProps={{ sx: { px: 1 } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 56,
                  bgcolor: alpha(theme.palette.grey[500], 0.06),
                  '& fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: `1.5px solid ${theme.palette.grey[400]}` },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: 'text.primary' }
              }}
            />

            <TextField
              select
              label="Tipo de Fluxo"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 56,
                  bgcolor: alpha(theme.palette.grey[500], 0.06),
                  '& fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: `1.5px solid ${theme.palette.grey[400]}` },
                }
              }}
            >
              {TIPOS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={{ py: 1.5, typography: 'subtitle2' }}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 4, pt: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ color: 'text.disabled', fontWeight: 700, mr: 'auto' }}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSalvar}
            variant="contained"
            sx={{
              bgcolor: 'text.primary',
              color: 'background.paper',
              px: 5,
              height: 48,
              fontWeight: 800,
              borderRadius: 1.5,
              '&:hover': { bgcolor: theme.palette.grey[800] }
            }}
          >
            {editingId ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null, nome: '' })}
        title="Excluir"
        content={<Typography>Excluir <strong>{confirmDelete.nome}</strong>?</Typography>}
        action={<Button variant="contained" color="error" onClick={() => {
          deletarCategoriaFinanceira(confirmDelete.id).then(() => {
            toast.success('Excluído!');
            carregar();
          });
          setConfirmDelete({ open: false, id: null, nome: '' });
        }}>Excluir</Button>}
      />
    </DashboardContent >
  );
}