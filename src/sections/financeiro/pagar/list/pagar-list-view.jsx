'use client';

import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { IconButton } from '@mui/material';
import Divider from '@mui/material/Divider';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { paths } from 'src/routes/paths'; // paths deve vir antes de RouterLink
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { sumBy } from 'src/utils/helper';

import { DashboardContent } from 'src/layouts/dashboard';
import { buscarContasPagarPorPeriodo } from 'src/actions/contas';

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
import { ReceberAnalytic } from '../../receber/receber-analytic';
import { ReceberTableToolbar } from './pagar-table-toolbar';

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

// ----------------------------------------------------------------------

export function ContasPagarListView() {
  const theme = useTheme();
  const router = useRouter();
  const confirm = useBoolean();
  const modalOpen = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    descricao: '',
    status: 'all',
    startDate: dayjs().startOf('month'),
    endDate: dayjs().endOf('month'),
  });

  const [analiticoData, setAnaliticoData] = useState({
    total: 0,
    pagos: 0,
    pendentes: 0,
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

    setAnaliticoData({ total, pagos, pendentes });
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

  const handleFilterStatus = (event, newValue) => {
    table.onResetPage();
    setFilters({ ...filters, status: newValue });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const dataFiltered = tableData
    .filter((row) => row.descricao.toLowerCase().includes(filters.descricao.toLowerCase()))
    .filter((row) => filters.status === 'all' || row.status === filters.status);

  const dataInPage = rowInPage(dataFiltered, page, rowsPerPage);

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
          <Button
            component={RouterLink}
            href={paths.dashboard.financeiro.pagarnovo}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Nova Conta
          </Button>
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
            />

            <ReceberAnalytic
              title="Pagos"
              total={dataFiltered.filter((d) => d.status === 'PAGO').length}
              percent={(analiticoData.pagos / analiticoData.total) * 100}
              price={analiticoData.pagos}
              icon="solar:file-check-bold-duotone"
              color={theme.vars.palette.success.main}
            />

            <ReceberAnalytic
              title="Pendentes"
              total={dataFiltered.filter((d) => d.status === 'PENDENTE').length}
              percent={(analiticoData.pendentes / analiticoData.total) * 100}
              price={analiticoData.pendentes}
              icon="solar:bell-bing-bold-duotone"
              color={theme.vars.palette.warning.main}
            />
          </Stack>
        </Scrollbar>
      </Card>

      <Card sx={{ mb: 3 }}>
        <Tabs value={filters.status} onChange={handleFilterStatus} sx={{ px: 2.5 }}>
          <Tab value="all" label="Todos" />
          <Tab value="PAGO" label="Pagos" />
          <Tab value="PENDENTE" label="Pendentes" />
          <Tab value="AGENDADO" label="Agendado" />
        </Tabs>
      </Card>

      {/* Adicionando botões de avanço e retrocesso */}
      <Stack direction="row" spacing={2} sx={{ p: 2.5 }}>
        <IconButton  onClick={handlePreviousMonth} >
          <Iconify icon="mingcute:arrow-left-fill" />
        </IconButton>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          <DatePicker
            label="Data Inicial"
            value={filters.startDate}
            onChange={handleDateChange('startDate')}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
          <DatePicker
            label="Data Final"
            value={filters.endDate}
            onChange={handleDateChange('endDate')}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>
        <IconButton onClick={handleNextMonth}>
          <Iconify icon="mingcute:arrow-right-fill" />
        </IconButton>
      </Stack>
        <ReceberTableToolbar
          filters={filters}
          setFilters={setFilters} // Passe o setFilters corretamente
          onResetPage={table.onResetPage}
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
    </DashboardContent>
  );
}
