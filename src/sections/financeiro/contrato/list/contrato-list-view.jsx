'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { getContratos, updateContrato } from 'src/actions/financeiro';

import { Label } from 'src/components/label';
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
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { ContratoTableRow } from './contrato-table-row';
import { ContratoTableToolbar } from './contrato-table-toolbar';
import { ContratoTableFiltersResult } from './contrato-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'titulo', label: 'Contrato', width: 50 },
  { id: 'tipoContrato', label: 'Tipo do contrato', width: 130 },
  { id: 'status', label: 'Status', width: 80 },
  { id: '', width: 8 },
];

export const CONTRATO_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Encerrado' },
];

// ----------------------------------------------------------------------

export function ContratoListView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 100 });
  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = useSetState({ titulo: '', status: 'all' });

  const fetchContratos = useCallback(async () => {
    try {
      const contratos = await getContratos();
      setTableData(contratos);
    } catch (error) {
      toast.error('Failed to fetch contratos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContratos();
  }, [fetchContratos]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset = !!filters.state.titulo || filters.state.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        // Inativa o contrato e atualiza a lista

        await updateContrato(id, { status: 'inativo', atualizarCobrancas: true });
        toast.success('Contrato inativado!');
        fetchContratos();
      } catch (error) {
        toast.error('Erro ao inativar contrato');
      } finally {
        confirm.onFalse();
      }
    },
    [fetchContratos, confirm]
  );

  const handleActivateRow = useCallback(
    async (id) => {
      try {
        await updateContrato(id, { status: 'ativo' });
        toast.success('Contrato ativado!');
        fetchContratos();
      } catch (error) {
        toast.error('Erro ao ativar contrato');
      }
    },
    [fetchContratos]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      // Inativa os contratos selecionados e atualiza a lista
      toast.success('Contratos inativados!');
      fetchContratos();
    } catch (error) {
      toast.error('Erro ao inativar contratos');
    } finally {
      confirm.onFalse();
    }
  }, [fetchContratos, confirm]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.contratos.edit(id));
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
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Todos os contratos"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Contratos', href: paths.dashboard.contratos.root },
            { name: 'Todos' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.contratos.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Novo Contrato
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={filters.state.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) =>
                `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }}
          >
            {CONTRATO_STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.state.status) && 'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === 'ativo' && 'success') ||
                      (tab.value === 'inativo' && 'warning') ||
                      'default'
                    }
                  >
                    {tab.value === 'all'
                      ? tableData.length
                      : tableData.filter((user) => user.status === tab.value).length}
                  </Label>
                }
              />
            ))}
          </Tabs>
          <ContratoTableToolbar filters={filters} onResetPage={table.onResetPage} tableData={dataFiltered} />

          {canReset && (
            <ContratoTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

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
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <ContratoTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                        onActivateRow={() => handleActivateRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onUpdate={fetchContratos}
                      />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// Função de aplicação de filtros
function applyFilter({ inputData, comparator, filters }) {
  const { titulo, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  // Filtragem pelo título do contrato ou pela razão social do cliente
  if (titulo) {
    inputData = inputData.filter(
      (row) =>
        row.titulo.toLowerCase().includes(titulo.toLowerCase()) ||
        row.cliente.razaoSocial.toLowerCase().includes(titulo.toLowerCase())
    );
  }

  // Filtragem pelo status do contrato
  if (status !== 'all') {
    inputData = inputData.filter((row) => row.status === status);
  }

  return inputData;
}
