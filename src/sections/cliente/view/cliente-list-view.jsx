'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

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
import { ClienteTableRowSkeleton } from 'src/components/skeleton/ClienteTableRowSkeleton';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { ClienteTableRow } from '../cliente-table-row';
import { ClienteTableToolbar } from '../cliente-table-toolbar';
import { ClienteTableFiltersResult } from '../cliente-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'codigo', label: 'Código', width: 20 },
  { id: 'name', label: 'Nome', width: 50 },
  { id: 'razaoSocial', label: 'Razão Social', width: 130 },
  { id: 'status', label: 'Status', width: 80 },
  { id: '', width: 8 },
];

const STATUS_ALL = 'all';
const STATUS_ACTIVE = true;
const STATUS_INACTIVE = false;

export const CLIENTE_STATUS_OPTIONS = [
  { value: STATUS_ALL, label: 'Todos' },
  { value: STATUS_ACTIVE, label: 'Ativo' },
  { value: STATUS_INACTIVE, label: 'Inativo' },
];

const DEFAULT_FILTERS = {
  razaoSocial: '',
  status: STATUS_ALL,
};

// ----------------------------------------------------------------------

/**
 * Calcula a contagem de clientes por status
 */
function getStatusCounts(clientes) {
  return {
    all: clientes.length,
    active: clientes.filter((cliente) => cliente.status === STATUS_ACTIVE).length,
    inactive: clientes.filter((cliente) => cliente.status === STATUS_INACTIVE).length,
  };
}

/**
 * Obtém a cor do label baseado no valor do status
 */
function getStatusColor(statusValue) {
  if (statusValue === STATUS_ACTIVE) return 'success';
  if (statusValue === STATUS_INACTIVE) return 'warning';
  return 'default';
}

/**
 * Obtém a contagem para exibir no label da tab
 */
function getStatusCount(statusValue, counts) {
  if (statusValue === STATUS_ALL) return counts.all;
  if (statusValue === STATUS_ACTIVE) return counts.active;
  if (statusValue === STATUS_INACTIVE) return counts.inactive;
  return 0;
}

/**
 * Aplica filtros e ordenação aos dados
 */
function applyFilter({ inputData, comparator, filters }) {
  const { razaoSocial, status } = filters || {};

  // Ordenação estável
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    // Primeiro, ordena por status (ativos primeiro, inativos depois)
    const statusA = a[0].status === STATUS_ACTIVE ? 0 : 1;
    const statusB = b[0].status === STATUS_ACTIVE ? 0 : 1;
    if (statusA !== statusB) {
      return statusA - statusB;
    }
    
    // Depois, aplica a ordenação do usuário (se houver)
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    
    // Por último, mantém a ordem original para estabilidade
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  // Filtro por nome, razão social ou email
  if (razaoSocial?.trim()) {
    const searchLower = razaoSocial.toLowerCase().trim();
    filteredData = filteredData.filter(
      (cliente) =>
        cliente.nome?.toLowerCase().includes(searchLower) ||
        cliente.razaoSocial?.toLowerCase().includes(searchLower) ||
        cliente.email?.toLowerCase().includes(searchLower)
    );
  }

  // Filtro por status
  if (status !== STATUS_ALL) {
    if (status === STATUS_ACTIVE) {
      filteredData = filteredData.filter(
        (cliente) => cliente.status === STATUS_ACTIVE && cliente.tipoContato !== 'lead'
      );
    } else if (status === STATUS_INACTIVE) {
      filteredData = filteredData.filter((cliente) => cliente.status === STATUS_INACTIVE);
    }
  }

  return filteredData;
}

// ----------------------------------------------------------------------

export function ClienteListView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 50 });

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = useSetState(DEFAULT_FILTERS);

  // Memoizar contagens de status
  const statusCounts = useMemo(() => getStatusCounts(tableData), [tableData]);

  // Memoizar dados filtrados
  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: tableData,
        comparator: getComparator(table.order, table.orderBy),
        filters: filters.state,
      }),
    [tableData, table.order, table.orderBy, filters.state]
  );

  // Memoizar se pode resetar filtros
  const canReset = useMemo(
    () => !!filters.state.razaoSocial?.trim() || filters.state.status !== STATUS_ALL,
    [filters.state]
  );

  // Memoizar se não há dados
  const notFound = useMemo(
    () => (!dataFiltered.length && canReset) || (!dataFiltered.length && !loading),
    [dataFiltered.length, canReset, loading]
  );

  // Carregar clientes
  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const clientes = await getClientes();
      setTableData(Array.isArray(clientes) ? clientes : []);
    } catch (err) {
      const errorMessage = err?.message || 'Falha ao carregar clientes';
      setError(errorMessage);
      toast.error(errorMessage);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Inativar cliente
  const handleDeleteRow = useCallback(
    async (id) => {
      if (!id) {
        toast.error('ID do cliente não fornecido');
        return;
      }

      try {
        await updateCliente(id, { status: false });
        toast.success('Cliente inativado com sucesso!');
        await fetchClientes();
      } catch (err) {
        const errorMessage = err?.message || 'Erro ao inativar cliente';
        toast.error(errorMessage);
      } finally {
        confirm.onFalse();
      }
    },
    [fetchClientes, confirm]
  );

  // Ativar cliente
  const handleActivateRow = useCallback(
    async (id) => {
      if (!id) {
        toast.error('ID do cliente não fornecido');
        return;
      }

      try {
        await updateCliente(id, { status: true });
        toast.success('Cliente ativado com sucesso!');
        await fetchClientes();
      } catch (err) {
        const errorMessage = err?.message || 'Erro ao ativar cliente';
        toast.error(errorMessage);
      }
    },
    [fetchClientes]
  );

  // Inativar múltiplos clientes
  const handleDeleteRows = useCallback(async () => {
    if (!table.selected.length) {
      toast.error('Nenhum cliente selecionado');
      return;
    }

    try {
      await Promise.all(
        table.selected.map((id) => {
          if (!id) return Promise.resolve();
          return updateCliente(id, { status: false });
        })
      );
      toast.success(`${table.selected.length} cliente(s) inativado(s) com sucesso!`);
      await fetchClientes();
    } catch (err) {
      const errorMessage = err?.message || 'Erro ao inativar clientes';
      toast.error(errorMessage);
    } finally {
      confirm.onFalse();
      table.onSelectAllRows(false, []);
    }
  }, [table, fetchClientes, confirm]);

  // Editar cliente
  const handleEditRow = useCallback(
    (id) => {
      if (!id) {
        toast.error('ID do cliente não fornecido');
        return;
      }
      router.push(paths.dashboard.cliente.edit(id));
    },
    [router]
  );

  // Filtrar por status
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
          heading="Lista de Clientes"
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
            value={filters.state.status ?? STATUS_ALL}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) =>
                `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }}
          >
            {CLIENTE_STATUS_OPTIONS.map((tab) => {
              const isSelected = filters.state.status === tab.value;
              const count = getStatusCount(tab.value, statusCounts);

              return (
                <Tab
                  key={String(tab.value)}
                  iconPosition="end"
                  value={tab.value}
                  label={tab.label}
                  icon={
                    <Label variant={isSelected ? 'filled' : 'soft'} color={getStatusColor(tab.value)}>
                      {count}
                    </Label>
                  }
                />
              );
            })}
          </Tabs>

          <ClienteTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            tableData={dataFiltered}
          />

          {canReset && (
            <ClienteTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              minHeight: 600,
              height: 600,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row._id || row.id).filter(Boolean)
                )
              }
              action={
                <Tooltip title="Inativar selecionados">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <Scrollbar sx={{ width: '100%', maxWidth: '100%', height: '100%' }}>
                <Table
                  size={table.dense ? 'small' : 'medium'}
                  sx={{
                    minWidth: 960,
                    tableLayout: 'auto',
                    width: '100%',
                  }}
                >
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
                        dataFiltered.map((row) => row._id || row.id).filter(Boolean)
                      )
                    }
                  />

                  <TableBody>
                    {loading ? (
                      <>
                        {[...Array(table.rowsPerPage)].map((_, index) => (
                          <ClienteTableRowSkeleton key={`skeleton-${index}`} />
                        ))}
                      </>
                    ) : (
                      <>
                        {dataFiltered
                          .slice(
                            table.page * table.rowsPerPage,
                            table.page * table.rowsPerPage + table.rowsPerPage
                          )
                          .map((row) => {
                            const rowId = row._id || row.id;
                            if (!rowId) return null;

                            return (
                              <ClienteTableRow
                                key={rowId}
                                row={row}
                                selected={table.selected.includes(rowId)}
                                onSelectRow={() => table.onSelectRow(rowId)}
                                onDeleteRow={() => handleDeleteRow(rowId)}
                                onActivateRow={() => handleActivateRow(rowId)}
                                onEditRow={() => handleEditRow(rowId)}
                                onUpdate={fetchClientes}
                              />
                            );
                          })}

                        <TableEmptyRows
                          height={table.dense ? 56 : 76}
                          emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                        />

                        <TableNoData notFound={notFound} />
                      </>
                    )}
                  </TableBody>
                </Table>
              </Scrollbar>
            </Box>
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
        title="Inativar Clientes"
        content={
          <>
            Tem certeza que deseja inativar <strong>{table.selected.length}</strong> cliente(s)?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteRows}
          >
            Inativar
          </Button>
        }
      />
    </>
  );
}
