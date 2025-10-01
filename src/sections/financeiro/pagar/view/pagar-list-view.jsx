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
import { getClientes, updateCliente } from 'src/actions/clientes';

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

import { ClienteTableToolbar } from 'src/sections/cliente/cliente-table-toolbar';
import { ClienteTableFiltersResult } from 'src/sections/cliente/cliente-table-filters-result';

import { ContaPagarTableRow } from '../list/pagar-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'codigo', label: 'Código', width: 20 },
  { id: 'name', label: 'Nome', width: 50 },
  { id: 'razaoSocial', label: 'Razão Social', width: 130 },
  { id: 'status', label: 'Status', width: 80 },
  { id: '', width: 8 },
];

export const CLIENTE_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: true, label: 'Ativo' },
  { value: false, label: 'Inativo' },
  { value: 'lead', label: 'Lead' },
];

// ----------------------------------------------------------------------

export function PagarClienteListView() {
  const table = useTable({ defaultDense: true });

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = useSetState({ name: '', status: 'all' });

  const fetchClientes = useCallback(async () => {
    try {
      const clientes = await getClientes();
      setTableData(clientes);
    } catch (error) {
      toast.error('Falha ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset = !!filters.state.nome || filters.state.status !== 'todos';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await updateCliente(id, { status: false });
        toast.success('Cliente inativado!');
        fetchClientes();
      } catch (error) {
        toast.error('Erro ao inativar cliente');
      } finally {
        confirm.onFalse();
      }
    },
    [fetchClientes, confirm]
  );

  const handleActivateRow = useCallback(
    async (id) => {
      try {
        await updateCliente(id, { status: true });
        toast.success('Cliente ativado!');
        fetchClientes();
      } catch (error) {
        toast.error('Erro ao ativar cliente');
      }
    },
    [fetchClientes]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map((id) => updateCliente(id, { status: false })));
      toast.success('Clientes inativados!');
      fetchClientes();
    } catch (error) {
      toast.error('Erro ao inativar clientes');
    } finally {
      confirm.onFalse();
    }
  }, [table.selected, fetchClientes, confirm]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.cliente.edit(id));
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
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Clientes', href: paths.dashboard.cliente.root },
            { name: 'Todos' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.cliente.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Novo Cliente
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
            {CLIENTE_STATUS_OPTIONS.map((tab) => (
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
                      (tab.value === true && 'success') ||
                      (tab.value === false && 'warning') ||
                      (tab.value === 'lead' && 'info') ||
                      'default'
                    }
                  >
                    {tab.value === 'all'
                      ? tableData.length
                      : tab.value === 'lead'
                        ? tableData.filter((user) => user.tipoContato === 'lead').length
                        : tableData.filter((user) => user.status === tab.value).length}
                  </Label>
                }
              />
            ))}
          </Tabs>
          <ClienteTableToolbar filters={filters} onResetPage={table.onResetPage} />

          {canReset && (
            <ClienteTableFiltersResult
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
                  dataFiltered.map((row) => row.id)
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
                      dataFiltered.map((row) => row.id)
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
                      <ContaPagarTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                        onActivateRow={() => handleActivateRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onUpdate={fetchClientes}
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

function applyFilter({ inputData, comparator, filters }) {
  const { nome, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (nome) {
    inputData = inputData.filter(
      (user) => user.nome.toLowerCase().indexOf(nome.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    if (status === 'lead') {
      inputData = inputData.filter((user) => user.tipoContato === 'lead');
    } else {
      const isActive = status === true;
      inputData = inputData.filter((user) => user.status === isActive);
    }
  }

  return inputData;
}
