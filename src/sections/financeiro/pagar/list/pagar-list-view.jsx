'use client';

import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { IconButton } from '@mui/material';
import Divider from '@mui/material/Divider';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { paths } from 'src/routes/paths'; // paths deve vir antes de RouterLink
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { sumBy } from 'src/utils/helper';
import { exportContasPagarExcel } from 'src/utils/export-contas-pagar-excel';

import { DashboardContent } from 'src/layouts/dashboard';
import { buscarContasPagarPorPeriodo } from 'src/actions/contas';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { ContaPagarTableRow } from './pagar-table-row';
import { ReceberTableToolbar } from './pagar-table-toolbar';
import { ReceberAnalytic } from '../../receber/receber-analytic';

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

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos', color: 'default' },
  { value: 'PAGO', label: 'Pagos', color: 'success' },
  { value: 'PENDENTE', label: 'Pendentes', color: 'warning' },
  { value: 'AGENDADO', label: 'Agendados', color: 'info' },
  { value: 'CANCELADO', label: 'Cancelados', color: 'text.secondary' },
  { value: 'a_pagar', label: 'A Pagar', color: 'error' },
];

const TIPO_OPTIONS = [
  { value: 'all', label: 'Todos', color: 'default' },
  { value: 'AVULSA', label: 'Avulsas', color: 'primary' },
  { value: 'RECORRENTE', label: 'Recorrentes', color: 'secondary' },
];

// ----------------------------------------------------------------------

export function ContasPagarListView() {
  const theme = useTheme();
  const router = useRouter();
  const confirm = useBoolean();
  const modalOpen = useBoolean();
  const exportModal = useBoolean();
  const [exportPeriod, setExportPeriod] = useState({
    startDate: dayjs().startOf('month'),
    endDate: dayjs().endOf('month'),
  });
  const [exporting, setExporting] = useState(false);

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    descricao: '',
    status: 'all',
    tipo: 'all',
    startDate: dayjs().startOf('month'),
    endDate: dayjs().endOf('month'),
  });

  const [analiticoData, setAnaliticoData] = useState({
    total: 0,
    pagos: 0,
    pendentes: 0,
    apagar: 0,
  });

  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [page, setPage] = useState(0);

  const table = useTable({ defaultOrderBy: 'dataVencimento', defaultRowsPerPage: 50 });

  const fetchContas = useCallback(async () => {
    try {
      const start = filters.startDate.format('YYYY-MM-DD');
      const end = filters.endDate.format('YYYY-MM-DD');
      const contas = await buscarContasPagarPorPeriodo(start, end);
      setTableData(contas);
    } catch (error) {
      console.error('Erro ao buscar contas a pagar:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchContas();
  }, [fetchContas]);

  useEffect(() => {
    const total = sumBy(tableData, (conta) => conta.valor);
    const pagos = sumBy(
      tableData.filter((d) => d.status === 'PAGO'),
      (conta) => conta.valor
    );
    const pendentes = sumBy(
      tableData.filter((d) => d.status === 'PENDENTE'),
      (conta) => conta.valor
    );

    const apagar = sumBy(
      tableData.filter((d) => d.status === 'PENDENTE' || d.status === 'AGENDADO'),
      (conta) => conta.valor
    );

    setAnaliticoData({ total, pagos, pendentes, apagar });
  }, [filters.startDate, filters.endDate, tableData]);

  // Função para avançar um mês
  const handleNextMonth = () => {
    const newStartDate = filters.startDate.add(1, 'month').startOf('month');
    const newEndDate = filters.endDate.add(1, 'month').endOf('month');
    setFilters({
      ...filters,
      startDate: newStartDate,
      endDate: newEndDate,
    });
  };

  // Função para voltar um mês
  const handlePreviousMonth = () => {
    const newStartDate = filters.startDate.subtract(1, 'month').startOf('month');
    const newEndDate = filters.endDate.subtract(1, 'month').endOf('month');
    setFilters({
      ...filters,
      startDate: newStartDate,
      endDate: newEndDate,
    });
  };

  const handleDateChange = (field) => (newValue) => {
    setFilters({ ...filters, [field]: newValue });
  };

  const handleFilterStatus = (newValue) => {
    table.onResetPage();
    setFilters({ ...filters, status: newValue });
  };

  const handleFilterTipo = (newValue) => {
    table.onResetPage();
    setFilters({ ...filters, tipo: newValue });
  };

  const getStatusCount = (status) => {
    if (status === 'all') return tableData.length;
    if (status === 'a_pagar') {
      return tableData.filter((d) => d.status === 'PENDENTE' || d.status === 'AGENDADO').length;
    }
    return tableData.filter((d) => d.status === status).length;
  };

  const getTipoCount = (tipo) => {
    if (tipo === 'all') return tableData.length;
    return tableData.filter((d) => d.tipo === tipo).length;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const dataFiltered = tableData
    .filter((row) => {
      const searchTerm = filters.descricao.toLowerCase().trim();
      if (!searchTerm) return true;

      const matchDescricao = row.descricao?.toLowerCase().includes(searchTerm);

      const matchNome = row.nome?.toLowerCase().includes(searchTerm);

      let matchValor = false;
      if (row.valor !== undefined && row.valor !== null) {
        const valorStr = String(row.valor).replace(/[.,\s]/g, '');

        const searchTermNumeric = searchTerm.replace(/[^\d]/g, '');

        if (searchTermNumeric) {
          matchValor = valorStr.includes(searchTermNumeric);
        }
      }

      return matchDescricao || matchNome || matchValor;
    })
    .filter((row) =>
      filters.status === 'all'
        ? true
        : filters.status === 'a_pagar'
          ? ['PENDENTE', 'AGENDADO'].includes(row.status)
          : row.status === filters.status
    )
    .filter((row) =>
      filters.tipo === 'all' ? true : row.tipo === filters.tipo
    );

  const dataInPage = rowInPage(dataFiltered, page, rowsPerPage);

  const handleOpenExportModal = () => {
    setExportPeriod({
      startDate: (filters.startDate && dayjs(filters.startDate).isValid() ? dayjs(filters.startDate) : dayjs().startOf('month')).startOf('day'),
      endDate: (filters.endDate && dayjs(filters.endDate).isValid() ? dayjs(filters.endDate) : dayjs().endOf('month')).endOf('day'),
    });
    exportModal.onTrue();
  };

  const handleExportExcel = async () => {
    if (exportPeriod.startDate.isAfter(exportPeriod.endDate)) {
      toast.error('Data inicial não pode ser maior que a data final');
      return;
    }
    setExporting(true);
    try {
      const start = exportPeriod.startDate.format('YYYY-MM-DD');
      const end = exportPeriod.endDate.format('YYYY-MM-DD');
      const contas = await buscarContasPagarPorPeriodo(start, end);
      if (!contas?.length) {
        toast.error('Nenhuma conta no período selecionado para exportar');
        return;
      }
      exportContasPagarExcel(contas, exportPeriod.startDate, exportPeriod.endDate);
      toast.success('Planilha exportada com sucesso');
      exportModal.onFalse();
    } catch (err) {
      toast.error(err?.message || 'Erro ao exportar');
    } finally {
      setExporting(false);
    }
  };

  const setExportQuickPeriod = (type) => {
    if (type === 'current') {
      setExportPeriod({ startDate: dayjs().startOf('month'), endDate: dayjs().endOf('month') });
    } else if (type === 'previous') {
      const prev = dayjs().subtract(1, 'month');
      setExportPeriod({ startDate: prev.startOf('month'), endDate: prev.endOf('month') });
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Lista de Contas a Pagar"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Contas a Pagar', href: paths.dashboard.contratos.pagar },
          { name: 'Todas' },
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="vscode-icons:file-type-excel" />}
              onClick={handleOpenExportModal}
            >
              Exportar Excel
            </Button>
            <Button
              component={RouterLink}
              href={paths.dashboard.financeiro.pagarnovo}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nova Conta
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: { xs: 3, md: 5 } }}>
        <Scrollbar sx={{ minHeight: 108 }}>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ py: 2 }}
          >
            <ReceberAnalytic
              title="Total"
              total={tableData.length}
              percent={100}
              price={analiticoData.total}
              icon="solar:bill-list-bold-duotone"
              color={theme.vars.palette.info.main}
              onClick={() => {
                setFilters({ ...filters, status: 'all' });
              }}
            />

            <ReceberAnalytic
              title="Pagos"
              total={tableData.filter((d) => d.status === 'PAGO').length}
              percent={(analiticoData.pagos / analiticoData.total) * 100}
              price={analiticoData.pagos}
              icon="solar:file-check-bold-duotone"
              color={theme.vars.palette.success.main}
              onClick={() => setFilters({ ...filters, status: 'PAGO' })} // Filtro Pagos
            />

            <ReceberAnalytic
              title="Pendentes"
              total={tableData.filter((d) => d.status === 'PENDENTE').length}
              percent={(analiticoData.pendentes / analiticoData.total) * 100}
              price={analiticoData.pendentes}
              icon="solar:bell-bing-bold-duotone"
              color={theme.vars.palette.warning.main}
              onClick={() => setFilters({ ...filters, status: 'PENDENTE' })} // Filtro Pendentes
            />

            <ReceberAnalytic
              title="A Pagar"
              total={
                tableData.filter((d) => d.status === 'PENDENTE' || d.status === 'AGENDADO').length
              }
              percent={(analiticoData.apagar / analiticoData.total) * 100}
              price={analiticoData.apagar}
              icon="solar:wad-of-money-broken"
              color={theme.vars.palette.error.main}
              onClick={() => setFilters({ ...filters, status: 'a_pagar' })} // Filtro A Pagar
            />
          </Stack>
        </Scrollbar>
      </Card>

      {/* Card de Filtros */}
      <Card sx={{ mb: 3 }}>
        <Stack spacing={2.5} sx={{ p: 2.5 }}>
          {/* Filtro de Período - Compacto */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <IconButton
              onClick={handlePreviousMonth}
              size="small"
              sx={{
                border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                }
              }}
            >
              <Iconify icon="mingcute:arrow-left-fill" width={18} />
            </IconButton>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <DatePicker
                label="Data Inicial"
                value={filters.startDate}
                onChange={handleDateChange('startDate')}
                slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
              />
              <DatePicker
                label="Data Final"
                value={filters.endDate}
                onChange={handleDateChange('endDate')}
                slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
              />
            </LocalizationProvider>
            <IconButton
              onClick={handleNextMonth}
              size="small"
              sx={{
                border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                }
              }}
            >
              <Iconify icon="mingcute:arrow-right-fill" width={18} />
            </IconButton>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ mb: 1, fontSize: '13px', display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                Filtrar por Status:
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {STATUS_OPTIONS.map((option) => {
                  const count = getStatusCount(option.value);
                  const isActive = filters.status === option.value;

                  return (
                    <Button
                      key={option.value}
                      size="small"
                      variant={isActive ? 'contained' : 'outlined'}
                      onClick={() => handleFilterStatus(option.value)}
                      sx={{
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.75rem',
                        borderColor: isActive ? undefined : alpha(theme.palette.grey[500], 0.32),
                        color: isActive ? 'white' : 'text.secondary',
                        bgcolor: isActive ? `${option.color}.main` : 'transparent',
                        '&:hover': {
                          bgcolor: isActive ? `${option.color}.dark` : alpha(theme.palette.grey[500], 0.08),
                        },
                      }}
                    >
                      {option.label} <Box component="span" sx={{ ml: 0.5, opacity: 0.9 }}>({count})</Box>
                    </Button>
                  );
                })}
              </Stack>
            </Box>

            <Box sx={{ flex: { xs: 1, md: '0 0 auto' }, minWidth: { xs: 0, md: 200 } }}>
              <Typography variant="caption" sx={{ mb: 1, fontSize: '13px', display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                Filtrar por Tipo:
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {TIPO_OPTIONS.map((option) => {
                  const count = getTipoCount(option.value);
                  const isActive = filters.tipo === option.value;

                  return (
                    <Button
                      key={option.value}
                      size="small"
                      variant={isActive ? 'contained' : 'outlined'}
                      onClick={() => handleFilterTipo(option.value)}
                      sx={{
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.75rem',
                        borderColor: isActive ? undefined : alpha(theme.palette.grey[500], 0.32),
                        color: isActive ? 'white' : 'text.secondary',
                        bgcolor: isActive ? `${option.color}.main` : 'transparent',
                        '&:hover': {
                          bgcolor: isActive ? `${option.color}.dark` : alpha(theme.palette.grey[500], 0.08),
                        },
                      }}
                    >
                      {option.label} <Box component="span" sx={{ ml: 0.5, opacity: 0.9 }}>({count})</Box>
                    </Button>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Card>
      <ReceberTableToolbar
        filters={filters}
        setFilters={setFilters}
        onResetPage={table.onResetPage}
        contas={dataFiltered} // Passa as contas filtradas
        contasSelecionadas={table.selected.map((id) => tableData.find((conta) => conta._id === id))} // Mapeia as contas selecionadas
      />

      <Card>
        <Box sx={{ position: 'relative' }}>
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
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row._id)
                  )
                }
              />
              <TableBody>
                {dataInPage.map((row) => (
                  <ContaPagarTableRow
                    key={row._id}
                    row={row}
                    selected={table.selected.includes(row._id)}
                    onSelectRow={() => table.onSelectRow(row._id)}
                    onEditRow={() => router.push(`/dashboard/financeiro/pagar/${row._id}/edit`)}
                    fetchContas={fetchContas}
                  />
                ))}
                <TableEmptyRows height={emptyRows(page, rowsPerPage, dataFiltered.length)} />
                <TableNoData notFound={!dataFiltered.length} />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={page}
          rowsPerPage={rowsPerPage}
          count={dataFiltered.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Deletar"
        content={`Tem certeza que deseja deletar ${table.selected.length} itens?`}
        action={
          <Button variant="contained" color="error">
            Deletar
          </Button>
        }
      />

      {/* Modal Exportar Excel */}
      <Dialog
        open={exportModal.value}
        onClose={exportModal.onFalse}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (t) => alpha(t.palette.success.main, 0.12),
                color: 'success.main',
              }}
            >
              <Iconify icon="vscode-icons:file-type-excel" width={28} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Exportar para Excel
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Escolha o período. O arquivo será gerado com o nome e intervalo abaixo.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, pb: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 600, color: 'text.primary' }}>
                Período
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2, py: 1 }} flexWrap="wrap" useFlexGap>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setExportQuickPeriod('current')}
                  sx={{
                    borderColor: alpha(theme.palette.grey[500], 0.32),
                    color: 'text.secondary',
                    '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) },
                  }}
                >
                  Este mês
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setExportQuickPeriod('previous')}
                  sx={{
                    borderColor: alpha(theme.palette.grey[500], 0.32),
                    color: 'text.secondary',
                    '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) },
                  }}
                >
                  Mês passado
                </Button>
              </Stack>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <DatePicker
                    label="Data inicial"
                    value={exportPeriod.startDate}
                    onChange={(date) => setExportPeriod((p) => ({ ...p, startDate: date ? dayjs(date).startOf('day') : p.startDate }))}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        sx: { '& .MuiInputBase-root': { borderRadius: 1.5 } },
                      },
                    }}
                  />
                  <DatePicker
                    label="Data final"
                    value={exportPeriod.endDate}
                    onChange={(date) => setExportPeriod((p) => ({ ...p, endDate: date ? dayjs(date).endOf('day') : p.endDate }))}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        sx: { '& .MuiInputBase-root': { borderRadius: 1.5 } },
                      },
                    }}
                  />
                </Stack>
              </LocalizationProvider>
            </Box>

            <Box
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 1.5,
                bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
                border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.2)}`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                Nome do arquivo
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, color: 'text.primary' }}>
                {exportPeriod.startDate.format('YYYY-MM') === exportPeriod.endDate.format('YYYY-MM')
                  ? `contas-a-pagar-${exportPeriod.startDate.format('YYYY-MM')}.xlsx`
                  : `contas-a-pagar-${exportPeriod.startDate.format('YYYY-MM')}-${exportPeriod.endDate.format('YYYY-MM')}.xlsx`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {exportPeriod.startDate.format('DD/MM/YYYY')} a {exportPeriod.endDate.format('DD/MM/YYYY')}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 2, pt: 1.5, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={exportModal.onFalse} disabled={exporting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={exporting ? null : <Iconify icon="vscode-icons:file-type-excel" width={20} />}
            onClick={handleExportExcel}
            disabled={exporting}
          >
            {exporting ? 'Exportando…' : 'Exportar'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
