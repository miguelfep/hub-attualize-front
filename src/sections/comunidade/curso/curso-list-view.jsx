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
import { useCursos, deleteCurso } from 'src/actions/comunidade';

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

import { CursoTableRow } from './curso-table-row';
import { CursoTableToolbar } from './curso-table-toolbar';
import { CursoTableFiltersResult } from './curso-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'titulo', label: 'Título' },
  { id: 'tipoAcesso', label: 'Acesso' },
  { id: 'preco', label: 'Preço' },
  { id: 'materiais', label: 'Materiais' },
  { id: 'status', label: 'Status' },
  { id: 'visualizacoes', label: 'Visualizações' },
  { id: 'inscricoes', label: 'Inscrições' },
  { id: 'acoes', label: 'Ações', width: 88, align: 'right' },
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
  tipoAcesso: 'all',
  status: 'all',
  busca: '',
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  let filteredData = [...inputData];

  const { busca, tipoAcesso, status } = filters;

  if (busca) {
    filteredData = filteredData.filter(
      (curso) =>
        curso.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
        curso.descricao?.toLowerCase().includes(busca.toLowerCase())
    );
  }

  if (tipoAcesso !== 'all') {
    filteredData = filteredData.filter((curso) => curso.tipoAcesso === tipoAcesso);
  }

  if (status !== 'all') {
    filteredData = filteredData.filter((curso) => curso.status === status);
  }

  return filteredData.sort(comparator);
}

// ----------------------------------------------------------------------

export function CursoListView() {
  const table = useTable();

  const confirm = useBoolean();

  const router = useRouter();

  const filters = useSetState(DEFAULT_FILTERS);

  const [tableData, setTableData] = useState([]);
  const [cursoIdToDelete, setCursoIdToDelete] = useState(null);

  const { data: cursos, isLoading, mutate } = useCursos();

  // Revalidar lista ao montar a página (ex.: ao voltar de criar/editar)
  useEffect(() => {
    mutate();
  }, [mutate]);

  useEffect(() => {
    if (cursos.length) {
      setTableData(cursos);
    }
  }, [cursos]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 76;

  const canReset = !Object.values(filters.state).every((item) => item === '' || item === 'all');

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useMemo(
    () => ({
      onResetFilters: () => {
        filters.setState(DEFAULT_FILTERS);
      },
    }),
    [filters]
  );

  const handleDeleteRow = async (id) => {
    try {
      await deleteCurso(id);
      toast.success('Curso deletado com sucesso');
      mutate();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Erro ao deletar curso');
    }
  };

  const handleEditRow = (id) => {
    router.push(paths.dashboard.comunidade.cursos.edit(id));
  };

  const handleViewRow = (id) => {
    router.push(paths.dashboard.comunidade.cursos.details(id));
  };

  const handleOpenConfirm = (id) => {
    setCursoIdToDelete(id);
    confirm.onTrue();
  };

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Cursos"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Comunidade', href: paths.dashboard.comunidade.root },
            { name: 'Cursos' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.comunidade.cursos.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Novo Curso
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <CursoTableToolbar
            filters={filters.state}
            onFilters={filters.setState}
            canReset={canReset}
            onResetFilters={handleFilters.onResetFilters}
            tipoAcessoOptions={TIPO_ACESSO_OPTIONS}
            statusOptions={STATUS_OPTIONS}
          />

          {canReset && (
            <CursoTableFiltersResult
              filters={filters.state}
              onFilters={filters.setState}
              onResetFilters={handleFilters.onResetFilters}
              results={dataFiltered.length}
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
                  {dataInPage.map((row) => (
                    <CursoTableRow
                      key={row._id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onDeleteRow={() => handleOpenConfirm(row._id)}
                      onEditRow={() => handleEditRow(row._id)}
                      onViewRow={() => handleViewRow(row._id)}
                    />
                  ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </DashboardContent>

      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setCursoIdToDelete(null);
        }}
        title="Deletar"
        content="Tem certeza que deseja deletar este curso?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              const idsToDelete = cursoIdToDelete
                ? [cursoIdToDelete]
                : table.selected.filter(Boolean);
              if (idsToDelete.length > 0) {
                await Promise.all(idsToDelete.map((id) => handleDeleteRow(id)));
                table.onSelectAllRows(false, []);
                setCursoIdToDelete(null);
              }
              confirm.onFalse();
            }}
          >
            Deletar
          </Button>
        }
      />
    </>
  );
}
