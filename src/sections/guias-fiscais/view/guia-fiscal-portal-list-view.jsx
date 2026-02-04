'use client';

import { useMemo, useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetGuiasFiscaisPortal, downloadGuiaFiscalPortal } from 'src/actions/guias-fiscais';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { GuiaFiscalTableRow } from '../guia-fiscal-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nomeArquivo', label: 'Arquivo' },
  { id: 'tipoGuia', label: 'Tipo' },
  { id: 'dataVencimento', label: 'Vencimento' },
  { id: 'status', label: 'Status' },
  { id: '', width: 88 },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'processado', label: 'Processado' },
  { value: 'erro', label: 'Erro' },
];

const DEFAULT_FILTERS = {
  tipoGuia: 'all',
  status: 'all',
  dataInicio: null,
  dataFim: null,
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { tipoGuia, status, dataInicio, dataFim } = filters;

  let filteredData = [...inputData];

  // Ordenação
  const stabilizedThis = filteredData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  filteredData = stabilizedThis.map((el) => el[0]);

  // Filtro por tipo de guia
  if (tipoGuia !== 'all') {
    filteredData = filteredData.filter((guia) => guia.tipoGuia === tipoGuia);
  }

  // Filtro por status
  if (status !== 'all') {
    filteredData = filteredData.filter((guia) => guia.status === status);
  }

  // Filtro por data de vencimento
  if (dataInicio) {
    filteredData = filteredData.filter(
      (guia) => guia.dataVencimento && new Date(guia.dataVencimento) >= new Date(dataInicio)
    );
  }

  if (dataFim) {
    filteredData = filteredData.filter(
      (guia) => guia.dataVencimento && new Date(guia.dataVencimento) <= new Date(dataFim)
    );
  }

  return filteredData;
}

// ----------------------------------------------------------------------

export function GuiaFiscalPortalListView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 50 });

  const router = useRouter();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Buscar guias fiscais do portal
  const { data, isLoading, error } = useGetGuiasFiscaisPortal({
    tipoGuia: filters.tipoGuia !== 'all' ? filters.tipoGuia : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    dataInicio: filters.dataInicio ? filters.dataInicio.toISOString() : undefined,
    dataFim: filters.dataFim ? filters.dataFim.toISOString() : undefined,
    page: table.page + 1,
    limit: table.rowsPerPage,
  });

  const total = data?.total || 0;

  // Dados filtrados localmente
  const dataFiltered = useMemo(
    () => {
      const guias = data?.guias || [];
      return applyFilter({
        inputData: guias,
        comparator: getComparator(table.order, table.orderBy),
        filters,
      });
    },
    [data?.guias, table.order, table.orderBy, filters]
  );

  const canReset =
    filters.tipoGuia !== 'all' ||
    filters.status !== 'all' ||
    !!filters.dataInicio ||
    !!filters.dataFim;

  const notFound = (!dataFiltered.length && canReset) || (!dataFiltered.length && !isLoading);

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.cliente.guiasFiscais.details(id));
    },
    [router]
  );

  const handleDownload = useCallback(
    async (id, nomeArquivo) => {
      try {
        await downloadGuiaFiscalPortal(id, nomeArquivo);
      } catch (downloadError) {
        console.error('Erro ao fazer download:', downloadError);
      }
    },
    []
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Guias Fiscais"
        links={[
          { name: 'Dashboard', href: paths.cliente.dashboard },
          { name: 'Guias Fiscais' },
        ]}
        action={
          <Button
            component="a"
            href={paths.cliente.guiasFiscais.calendar}
            variant="outlined"
            startIcon={<Iconify icon="solar:calendar-bold" />}
          >
            Ver Calendário
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={dataFiltered.length}
                onSort={table.onSort}
              />

              <TableBody>
                {isLoading ? (
                  <TableNoData notFound loading />
                ) : notFound ? (
                  <TableNoData notFound />
                ) : (
                  dataFiltered.map((row) => (
                    <GuiaFiscalTableRow
                      key={row._id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onViewRow={() => handleViewRow(row._id)}
                      onEditRow={() => handleViewRow(row._id)}
                      onDownloadRow={handleDownload}
                    />
                  ))
                )}

                <TableEmptyRows
                  height={table.dense ? 52 : 72}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={total}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </DashboardContent>
  );
}
