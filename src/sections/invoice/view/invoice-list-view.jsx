'use client';

import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useState, useEffect, useCallback } from 'react'; // Adicione esta linha para importar o locale

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

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { sumBy } from 'src/utils/helper';
import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { getInvoices, deleteInvoiceById } from 'src/actions/invoices';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { InvoiceAnalytic } from '../invoice-analytic';
import { InvoiceTableRow } from '../invoice-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'dataVencimento', label: 'Data de Vencimento' },
  { id: 'total', label: 'Total' },
  { id: 'desconto', label: 'Desconto' },
  { id: 'status', label: 'Status' },
  { id: '' },
];

// ----------------------------------------------------------------------

export function InvoiceListView() {
  const theme = useTheme();
  const router = useRouter();
  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const table = useTable({ defaultOrderBy: 'dataVencimento', defaultRowsPerPage: 50 });

  const fetchInvoices = useCallback(async () => {
    try {
      const invoices = await getInvoices();
      if (Array.isArray(invoices)) {
        setTableData(invoices);
      } else {
        setTableData([]);
        console.error("Expected 'getInvoices' to return an array.");
      }
    } catch (error) {
      setFetchError('Failed to fetch invoices');
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filters = useSetState({
    name: '',
    service: [],
    status: 'all',
    startDate: dayjs().startOf('month'),
    endDate: dayjs().endOf('month'),
  });

  const dateError = fIsAfter(filters.state.startDate, filters.state.endDate);

  // Contagem de todas as faturas com base nas datas, sem o filtro de status
  const { filteredData, counts, totals } = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: { ...filters.state, status: 'all' }, // Não filtrar por status nas contagens
    dateError,
  });

  // Aplicando o filtro de status apenas para a tabela
  const tableFilteredData = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state, // Aqui o status é aplicado
    dateError,
  }).filteredData;

  const dataInPage = rowInPage(tableFilteredData, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.name ||
    filters.state.service.length > 0 ||
    filters.state.status !== 'all' ||
    (!!filters.state.startDate && !!filters.state.endDate);

  const notFound = (!tableFilteredData.length && canReset) || !tableFilteredData.length;

  const getInvoiceLength = (status) => counts[status] || 0;
  const getTotalAmount = (status) => totals[status] || 0;
  const getPercentByStatus = (status) => (getInvoiceLength(status) / filteredData.length) * 100;

  const TABS = [
    {
      value: 'all',
      label: 'Todos',
      color: 'default',
      count: filteredData.length, // Mostrar a contagem total para todas as faturas
    },
    {
      value: 'pago',
      label: 'Pagas',
      color: 'success',
      count: counts.pago || 0,
    },
    {
      value: 'aprovada',
      label: 'Aprovada',
      color: 'secondary',
      count: counts.aprovada || 0,
    },
    {
      value: 'perdida',
      label: 'Perdida',
      color: 'error',
      count: counts.perdida || 0,
    },
    {
      value: 'orcamento',
      label: 'Orçamentos',
      color: 'default',
      count: counts.orcamento || 0,
    },
  ];

   const handleDeleteRow = useCallback(
    async (id) => {
      const res = await deleteInvoiceById(id);
      if (res) {
        toast.success('Venda deletada com sucesso!');
        await fetchInvoices();
      } else {
        toast.error('Erro ao deletar venda');
      }

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, fetchInvoices]
  );


  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );

  return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Lista de vendas"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Vendas', href: paths.dashboard.invoice.root },
            { name: 'Todas' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.invoice.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nova Venda
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Stack direction="row" spacing={2} sx={{ p: 2.5 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <DatePicker
              label="Data Inicio"
              value={filters.state.startDate}
              onChange={(newValue) => filters.setState({ startDate: newValue })}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="Data Fim"
              value={filters.state.endDate}
              onChange={(newValue) => filters.setState({ endDate: newValue })}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </Stack>

        <Card sx={{ mb: { xs: 3, md: 5 } }}>
          <Scrollbar sx={{ minHeight: 108 }}>
            <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} sx={{ py: 2 }}>
              <InvoiceAnalytic
                title="Total"
                total={filteredData.length}
                percent={100}
                price={sumBy(filteredData, (invoice) => invoice.total)}
                icon="solar:bill-list-bold-duotone"
                color={theme.vars.palette.info.main}
              />
              <InvoiceAnalytic
                title="Pago"
                total={getInvoiceLength('pago')}
                percent={getPercentByStatus('pago')}
                price={getTotalAmount('pago')}
                icon="solar:file-check-bold-duotone"
                color={theme.vars.palette.success.main}
              />
              <InvoiceAnalytic
                title="Aprovada"
                total={getInvoiceLength('aprovada')}
                percent={getPercentByStatus('aprovada')}
                price={getTotalAmount('aprovada')}
                icon="solar:sort-by-time-bold-duotone"
                color={theme.vars.palette.secondary.main}
              />   
            <InvoiceAnalytic
                title="Perdida"
                total={getInvoiceLength('perdida')}
                percent={getPercentByStatus('perdida')}
                price={getTotalAmount('perdida')}
                icon="solar:bell-bing-bold-duotone"
                color={theme.vars.palette.error.main}
              />
              <InvoiceAnalytic
                title="Orçamentos"
                total={getInvoiceLength('orcamento')}
                percent={getPercentByStatus('orcamento')}
                price={getTotalAmount('orcamento')}
                icon="solar:file-corrupted-bold-duotone"
                color={theme.vars.palette.text.secondary}
              />
            </Stack>
          </Scrollbar>
        </Card>

        <Card>
          <Tabs
            value={filters.state.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label variant="soft" color={tab.color}>
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Box sx={{ position: 'relative' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableFilteredData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableFilteredData.map((row) => row._id)
                    )
                  }
                />
                <TableBody>
                  {tableFilteredData.map((row) => (
                    <InvoiceTableRow
                      key={row._id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onViewRow={() => handleViewRow(row._id)}
                      onEditRow={() => handleEditRow(row._id)}
                      onDeleteRow={() => handleDeleteRow(row._id)}
                    />
                  ))}
                  <TableEmptyRows height={table.dense ? 56 : 76} emptyRows={emptyRows(table.page, table.rowsPerPage, tableFilteredData.length)} />
                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
            <TablePaginationCustom
              page={table.page}
              dense={table.dense}
              count={tableFilteredData.length}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
            />
          </Box>
        </Card>
      </DashboardContent>
  );
}


function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, status, service, startDate, endDate } = filters;

  if (!Array.isArray(inputData)) {
    return { filteredData: [], counts: {}, totals: {} };
  }

  // Ordena os dados
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el) => el[0]);

  // Filtro de nome
  if (name) {
    inputData = inputData.filter((invoice) =>
      invoice.cliente.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Filtro de status (Pagas, Aprovadas, etc.)
  if (status !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === status);
  }

  // Filtro de serviços
  if (service.length) {
    inputData = inputData.filter((invoice) =>
      invoice.items.some((filterItem) => service.includes(filterItem.description))
    );
  }

  // Filtro de data (Aplicado a todas as TABS)
  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((invoice) =>
      fIsBetween(invoice.dataVencimento, startDate, endDate)
    );
  }

  // Contagem por status e totalização
  const counts = {};
  const totals = {};

  inputData.forEach((invoice) => {
    if (!counts[invoice.status]) {
      counts[invoice.status] = 0;
      totals[invoice.status] = 0;
    }
    counts[invoice.status] += 1;
    totals[invoice.status] += invoice.total;
  });

  return { filteredData: inputData, counts, totals };
}
