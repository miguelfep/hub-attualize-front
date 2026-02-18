'use client';

import { useMemo, useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMateriais, deleteMaterial } from 'src/actions/comunidade';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
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

import { MaterialTableRow } from './material-table-row';
import { MaterialTableToolbar } from './material-table-toolbar';
import { MaterialTableFiltersResult } from './material-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'titulo', label: 'Título' },
  { id: 'tipo', label: 'Tipo' },
  { id: 'tipoAcesso', label: 'Acesso' },
  { id: 'preco', label: 'Preço' },
  { id: 'status', label: 'Status' },
  { id: 'visualizacoes', label: 'Visualizações' },
  { id: 'downloads', label: 'Downloads' },
  { id: '', width: 88 },
];

const TIPO_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'ebook', label: 'E-book' },
  { value: 'videoaula', label: 'Videoaula' },
  { value: 'documento', label: 'Documento' },
  { value: 'link', label: 'Link' },
  { value: 'outro', label: 'Outro' },
];

const TIPO_ACESSO_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'gratuito', label: 'Gratuito' },
  { value: 'exclusivo_cliente', label: 'Exclusivo Cliente' },
  { value: 'pago', label: 'Pago' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'rascunho', label: 'Rascunho' },
];

const DEFAULT_FILTERS = {
  tipo: 'all',
  tipoAcesso: 'all',
  status: 'all',
  busca: '',
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  let filteredData = [...inputData];

  const { busca, tipo, tipoAcesso, status } = filters;

  if (busca) {
    filteredData = filteredData.filter(
      (material) =>
        material.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
        material.descricao?.toLowerCase().includes(busca.toLowerCase())
    );
  }

  if (tipo !== 'all') {
    filteredData = filteredData.filter((material) => material.tipo === tipo);
  }

  if (tipoAcesso !== 'all') {
    filteredData = filteredData.filter((material) => material.tipoAcesso === tipoAcesso);
  }

  if (status !== 'all') {
    filteredData = filteredData.filter((material) => material.status === status);
  }

  const stabilizedThis = filteredData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  filteredData = stabilizedThis.map((el) => el[0]);

  return filteredData;
}

// ----------------------------------------------------------------------

export function MaterialListView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 50 });

  const router = useRouter();

  const confirm = useBoolean();

  const [materialIdToDelete, setMaterialIdToDelete] = useState(null);

  const filters = useSetState(DEFAULT_FILTERS);

  // Buscar materiais
  const apiParams = useMemo(() => {
    const params = {
      page: table.page + 1,
      limit: table.rowsPerPage,
    };

    if (filters.state.tipo && filters.state.tipo !== 'all') {
      params.tipo = filters.state.tipo;
    }

    if (filters.state.tipoAcesso && filters.state.tipoAcesso !== 'all') {
      params.tipoAcesso = filters.state.tipoAcesso;
    }

    if (filters.state.status && filters.state.status !== 'all') {
      params.status = filters.state.status;
    }

    if (filters.state.busca) {
      params.busca = filters.state.busca;
    }

    return params;
  }, [
    filters.state.tipo,
    filters.state.tipoAcesso,
    filters.state.status,
    filters.state.busca,
    table.page,
    table.rowsPerPage,
  ]);

  const { data, total, isLoading, mutate } = useMateriais(apiParams);

  // Dados filtrados localmente (para busca por título)
  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: data,
        comparator: getComparator(table.order, table.orderBy),
        filters: filters.state,
      }),
    [data, table.order, table.orderBy, filters.state]
  );

  const dataInPage = useMemo(
    () =>
      dataFiltered.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
      ),
    [dataFiltered, table.page, table.rowsPerPage]
  );

  const canReset = !!(
    filters.state.tipo ||
    filters.state.tipoAcesso ||
    filters.state.status ||
    filters.state.busca
  );

  const notFound = (!dataFiltered.length && canReset) || (!isLoading && !dataFiltered.length);

  const handleFilters = useMemo(
    () => ({
      onResetFilters: () => {
        filters.setState(DEFAULT_FILTERS);
        table.onResetPage();
      },
    }),
    [filters, table]
  );

  const handleDeleteRow = async () => {
    try {
      await deleteMaterial(materialIdToDelete);
      toast.success('Material deletado com sucesso');
      confirm.onFalse();
      setMaterialIdToDelete(null);
      mutate();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Erro ao deletar material');
    }
  };

  const handleEditRow = (id) => {
    router.push(paths.dashboard.comunidade.materiais.edit(id));
  };

  const handleViewRow = (id) => {
    router.push(paths.dashboard.comunidade.materiais.details(id));
  };

  const handleFilterStatus = (event, newValue) => {
    filters.setState({ status: newValue });
    table.onResetPage();
  };

  const handleFilterTipo = (event, newValue) => {
    filters.setState({ tipo: newValue });
    table.onResetPage();
  };

  const handleFilterTipoAcesso = (event, newValue) => {
    filters.setState({ tipoAcesso: newValue });
    table.onResetPage();
  };

  const handleOpenConfirm = (id) => {
    setMaterialIdToDelete(id);
    confirm.onTrue();
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Materiais"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Comunidade', href: paths.dashboard.comunidade.root },
          { name: 'Materiais' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.comunidade.materiais.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Novo Material
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <MaterialTableToolbar
          filters={filters.state}
          onFilters={filters.setState}
          onResetFilters={handleFilters.onResetFilters}
          tipoOptions={TIPO_OPTIONS}
          tipoAcessoOptions={TIPO_ACESSO_OPTIONS}
          statusOptions={STATUS_OPTIONS}
          canReset={canReset}
        />

        {canReset && (
          <MaterialTableFiltersResult
            filters={filters.state}
            onFilters={filters.setState}
            onResetFilters={handleFilters.onResetFilters}
            results={dataFiltered.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
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
                    dataFiltered.map((row) => row._id).filter(Boolean)
                  )
                }
              />

              <TableBody>
                {isLoading ? (
                  <TableNoData notFound loading />
                ) : notFound ? (
                  <TableNoData notFound />
                ) : (
                  dataInPage.map((row) => (
                    <MaterialTableRow
                      key={row._id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onViewRow={() => handleViewRow(row._id)}
                      onEditRow={() => handleEditRow(row._id)}
                      onDeleteRow={() => handleOpenConfirm(row._id)}
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Deletar"
        content={
          <>
            Tem certeza que deseja deletar este material? Esta ação não pode ser desfeita.
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleDeleteRow}>
            Deletar
          </Button>
        }
      />
    </DashboardContent>
  );
}
