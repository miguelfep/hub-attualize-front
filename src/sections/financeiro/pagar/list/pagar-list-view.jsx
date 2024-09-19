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

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'descricao', label: 'Descrição' },
  { id: 'valor', label: 'Valor da Conta' },
  { id: 'vencimento', label: 'Data de Vencimento' },
  { id: 'status', label: 'Status' },
  { id: 'banco', label: 'Banco' },
  { id: '', label: '' },
];

// ----------------------------------------------------------------------

export function ContasPagarListView() {
  const theme = useTheme();
  const router = useRouter();
  const confirm = useBoolean();
  const modalOpen = useBoolean(); // Controlar o modal

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    descricao: '',
    status: 'all',
    startDate: dayjs().startOf('month'),
    endDate: dayjs().endOf('month'),
  });

  const [newConta, setNewConta] = useState({
    descricao: '',
    valor: 0,
    dataVencimento: dayjs(),
    status: 'PENDENTE',
    banco: '',
  });

  const [rowsPerPage, setRowsPerPage] = useState(10); // Controla o limite de linhas por página
  const [page, setPage] = useState(0); // Controla a página atual

  const table = useTable({ defaultOrderBy: 'dataVencimento' });

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

  const handleDateChange = (field) => (newValue) => {
    setFilters({ ...filters, [field]: newValue });
  };

  const handleFilterStatus = (event, newValue) => {
    table.onResetPage();
    setFilters({ ...filters, status: newValue });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage); // Atualiza a página
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Atualiza o limite de linhas por página
    setPage(0); // Volta para a primeira página
  };

  const dataFiltered = tableData
    .filter((row) => row.descricao.toLowerCase().includes(filters.descricao.toLowerCase()))
    .filter((row) => filters.status === 'all' || row.status === filters.status);

  const dataInPage = rowInPage(dataFiltered, page, rowsPerPage); // Limita as linhas por página

  const total = sumBy(tableData, (conta) => conta.valor);
  const pagos = sumBy(
    tableData.filter((d) => d.status === 'PAGO'),
    (conta) => conta.valor
  );
  const pendentes = sumBy(
    tableData.filter((d) => d.status === 'PENDENTE'),
    (conta) => conta.valor
  );

  return (
    <DashboardContent>
      {/* Breadcrumbs com o botão de Nova Conta */}
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

      {/* Analíticos acima da Tabela */}
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
              price={total}
              icon="solar:bill-list-bold-duotone"
              color={theme.vars.palette.info.main}
            />

            <ReceberAnalytic
              title="Pagos"
              total={dataFiltered.filter((d) => d.status === 'PAGO').length}
              percent={(pagos / total) * 100}
              price={pagos}
              icon="solar:file-check-bold-duotone"
              color={theme.vars.palette.success.main}
            />

            <ReceberAnalytic
              title="Pendentes"
              total={dataFiltered.filter((d) => d.status === 'PENDENTE').length}
              percent={(pendentes / total) * 100}
              price={pendentes}
              icon="solar:bell-bing-bold-duotone"
              color={theme.vars.palette.warning.main}
            />
          </Stack>
        </Scrollbar>
      </Card>

      {/* Tabs para filtrar as contas */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={filters.status} onChange={handleFilterStatus} sx={{ px: 2.5 }}>
          <Tab value="all" label="Todos" />
          <Tab value="PAGO" label="Pagos" />
          <Tab value="PENDENTE" label="Pendentes" />
        </Tabs>
      </Card>

      {/* Filtros de Data e Descrição */}
      <Stack direction="row" spacing={2} sx={{ p: 2.5 }}>
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
      </Stack>

      {/* Tabela de Contas a Pagar */}
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

        {/* Paginação da Tabela */}
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
