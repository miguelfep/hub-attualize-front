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
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { toast } from 'sonner';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { sumBy } from 'src/utils/helper';

import { DashboardContent } from 'src/layouts/dashboard';
import { getCobrancasPorData } from 'src/actions/financeiro';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { ReceberAnalytic } from '../receber-analytic';
import { ReceberTableRow } from './receber-table-row';
import { ReceberTableFiltersResult } from './receber-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'valor', label: 'Valor do contrato' },
  { id: 'vencimento', label: 'Vencimento' },
  { id: 'status', label: 'Status' },
  { id: 'emitido', label: 'Emitido' },
  { id: 'data', label: 'Lembrete' },
  { id: '', label: '' },
];

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  let filteredData = [...inputData];

  if (filters.descricao) {
    filteredData = filteredData.filter((row) =>
      row.contrato.cliente.razaoSocial.toLowerCase().includes(filters.descricao.toLowerCase())
    );
  }

  if (filters.status !== 'all') {
    filteredData = filteredData.filter((row) => row.status === filters.status);
  }

  filteredData.sort(comparator);

  return filteredData;
}

// ----------------------------------------------------------------------

export function ReceberListView() {
  const theme = useTheme();
  const router = useRouter();
  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    descricao: '',
    status: 'all',
    startDate: dayjs().startOf('month'),
    endDate: dayjs().endOf('month'),
  });

  const table = useTable({ defaultOrderBy: 'vencimento', defaultRowsPerPage: 50 });

  const fetchCobrancas = useCallback(async () => {
    try {
      const start = filters.startDate.format('YYYY-MM-DD');
      const end = filters.endDate.format('YYYY-MM-DD');
      const cobrancas = await getCobrancasPorData(start, end);
      setTableData(cobrancas);
    } catch (error) {
      toast.error('Erro ao buscar cobranças');
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchCobrancas();
  }, [fetchCobrancas]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const handleFilterStatus = (event, newValue) => {
    table.onResetPage();
    setFilters({ ...filters, status: newValue });
  };

  const canReset =
    !!filters.descricao || filters.status !== 'all' || !!filters.startDate || !!filters.endDate;

  const TABS = [
    { value: 'all', label: 'Todos', color: 'default', count: tableData.length },
    {
      value: 'RECEBIDO',
      label: 'Pagas',
      color: 'success',
      count: tableData.filter((d) => d.status === 'RECEBIDO').length,
    },
    {
      value: 'VENCIDO',
      label: 'Vencidas',
      color: 'error',
      count: tableData.filter((d) => d.status === 'VENCIDO').length,
    },
    {
      value: 'EMABERTO',
      label: 'Pendentes',
      color: 'warning',
      count: tableData.filter((d) => d.status === 'EMABERTO').length,
    },
  ];

  const total = sumBy(tableData, (cobranca) => cobranca.valor);
  const pagas = sumBy(
    tableData.filter((d) => d.status === 'RECEBIDO'),
    (cobranca) => cobranca.valor
  );
  const vencidas = sumBy(
    tableData.filter((d) => d.status === 'VENCIDO'),
    (cobranca) => cobranca.valor
  );
  const pendentes = sumBy(
    tableData.filter((d) => d.status === 'EMABERTO'),
    (cobranca) => cobranca.valor
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Lista de Cobranças"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Cobranças', href: paths.dashboard.cobrancas },
        ]}
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
              price={total}
              icon="solar:bill-list-bold-duotone"
              color={theme.vars.palette.info.main}
            />

            <ReceberAnalytic
              title="Pagas"
              total={TABS[1].count}
              percent={(pagas / total) * 100}
              price={pagas}
              icon="solar:file-check-bold-duotone"
              color={theme.vars.palette.success.main}
            />

            <ReceberAnalytic
              title="Vencidas"
              total={TABS[2].count}
              percent={(vencidas / total) * 100}
              price={vencidas}
              icon="solar:sort-by-time-bold-duotone"
              color={theme.vars.palette.error.main}
            />

            <ReceberAnalytic
              title="Pendentes"
              total={TABS[3].count}
              percent={(pendentes / total) * 100}
              price={pendentes}
              icon="solar:bell-bing-bold-duotone"
              color={theme.vars.palette.warning.main}
            />
          </Stack>
        </Scrollbar>
      </Card>

      <Card sx={{ mb: 3 }}>
        <Tabs value={filters.status} onChange={handleFilterStatus} sx={{ px: 2.5 }}>
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={
                <Label variant="filled" color={tab.color}>
                  {tab.count}
                </Label>
              }
            />
          ))}
        </Tabs>
      </Card>

      <Stack direction="row" spacing={2} sx={{ p: 2.5 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          <DatePicker
            label="Data Inicial"
            value={filters.startDate}
            onChange={(newValue) => setFilters({ ...filters, startDate: newValue })}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
          <DatePicker
            label="Data Final"
            value={filters.endDate}
            onChange={(newValue) => setFilters({ ...filters, endDate: newValue })}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>
      </Stack>

      {canReset && (
        <ReceberTableFiltersResult
          filters={filters}
          setFilters={setFilters}
          totalResults={dataFiltered.length}
          onResetPage={table.onResetPage}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      <Card>
        <Box sx={{ position: 'relative' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={dataFiltered.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                dataFiltered.map((row) => row._id)
              )
            }
            action={
              <Tooltip title="Delete">
                <IconButton color="primary" onClick={confirm.onTrue}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            }
          />
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
                  <ReceberTableRow
                    key={row._id}
                    row={row}
                    selected={table.selected.includes(row._id)}
                    onSelectRow={() => table.onSelectRow(row._id)}                   
                  />
                ))}

                <TableEmptyRows
                  height={table.dense ? 56 : 56 + 20}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />

                <TableNoData notFound={!dataFiltered.length} />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          rowsPerPageOptions={[50, 100, 150]}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={`Tem certeza que quer deletar ${table.selected.length} itens?`}
        action={
          <Button variant="contained" color="error">
            Deletar
          </Button>
        }
      />
    </DashboardContent>
  );
}
