'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

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
import { useGetAllClientes } from 'src/actions/clientes';
import { deleteGuiaFiscal, useGetGuiasFiscais, deleteGuiasFiscaisBatch } from 'src/actions/guias-fiscais';

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

import { GuiaFiscalTableRow } from '../guia-fiscal-table-row';
import { GuiaFiscalTableToolbar } from '../guia-fiscal-table-toolbar';
import { GuiaFiscalTableFiltersResult } from '../guia-fiscal-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nomeArquivo', label: 'Nome do Arquivo' },
  { id: 'tipoGuia', label: 'Tipo' },
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'clienteNome', label: 'Razão Social' },
  { id: 'dataVencimento', label: 'Competência / Vencimento' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Enviado em' },
  { id: '', width: 88 },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'processado', label: 'Processado' },
  { value: 'erro', label: 'Erro' },
];

const TIPO_GUIA_OPTIONS = [
  { value: 'all', label: 'Todos' },
  // Guias Fiscais
  { value: 'DAS', label: 'DAS' },
  { value: 'EXTRATO_PGDAS', label: 'Extrato PGDAS' },
  { value: 'DARF', label: 'DARF' },
  { value: 'ICMS', label: 'ICMS' },
  { value: 'ISS', label: 'ISS' },
  { value: 'PIS', label: 'PIS' },
  { value: 'COFINS', label: 'COFINS' },
  // Guias DP
  { value: 'INSS', label: 'INSS' },
  { value: 'FGTS', label: 'FGTS' },
  // Documentos DP
  { value: 'HOLERITE', label: 'Holerite' },
  { value: 'EXTRATO_FOLHA_PAGAMENTO', label: 'Extrato Folha' },
];

const CATEGORIA_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'GUIA_FISCAL', label: 'Guia Fiscal' },
  { value: 'GUIA_DP', label: 'Guia DP' },
  { value: 'DOCUMENTO_DP', label: 'Documento DP' },
];

const DEFAULT_FILTERS = {
  tipoGuia: 'all',
  categoria: 'all',
  status: 'all',
  clienteId: '',
  dataInicio: null,
  dataFim: null,
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  // Como os filtros já vêm aplicados da API, apenas ordenamos os dados
  let filteredData = [...inputData];

  // Ordenação
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

export function GuiaFiscalListView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 50 });

  const router = useRouter();

  const confirm = useBoolean();
  const confirmBatch = useBoolean();

  const [guiaIdToDelete, setGuiaIdToDelete] = useState(null);

  const filters = useSetState(DEFAULT_FILTERS);

  // Buscar clientes ativos
  const { data: clientes, isLoading: loadingClientes } = useGetAllClientes({ status: true });

  // Buscar guias fiscais - apenas enviar parâmetros que têm valor
  const apiParams = useMemo(() => {
    const params = {
      page: table.page + 1,
      limit: table.rowsPerPage,
    };

    if (filters.state.clienteId) {
      params.clienteId = filters.state.clienteId;
    }

    if (filters.state.tipoGuia && filters.state.tipoGuia !== 'all') {
      params.tipoGuia = filters.state.tipoGuia;
    }

    if (filters.state.categoria && filters.state.categoria !== 'all') {
      params.categoria = filters.state.categoria;
    }

    if (filters.state.status && filters.state.status !== 'all') {
      params.status = filters.state.status;
    }

    if (filters.state.dataInicio) {
      params.dataInicio = filters.state.dataInicio.toISOString();
    }

    if (filters.state.dataFim) {
      params.dataFim = filters.state.dataFim.toISOString();
    }

    return params;
  }, [
    filters.state.clienteId,
    filters.state.tipoGuia,
    filters.state.categoria,
    filters.state.status,
    filters.state.dataInicio,
    filters.state.dataFim,
    table.page,
    table.rowsPerPage,
  ]);

  const { data, isLoading, error, mutate } = useGetGuiasFiscais(apiParams);

  const total = data?.total || 0;

  // Revalidar dados quando a página receber foco (após voltar do upload)
  useEffect(() => {
    const handleFocus = () => {
      mutate();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [mutate]);

  // Revalidar quando a URL tiver parâmetro refresh
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh')) {
      mutate();
      // Limpar parâmetro da URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [mutate]);

  // Dados filtrados localmente (para busca por nome)
  const dataFiltered = useMemo(
    () => {
      const guias = data?.guias || [];
      return applyFilter({
        inputData: guias,
        comparator: getComparator(table.order, table.orderBy),
        filters: filters.state,
      });
    },
    [data?.guias, table.order, table.orderBy, filters.state]
  );

  const canReset =
    !!filters.state.clienteId ||
    filters.state.tipoGuia !== 'all' ||
    filters.state.categoria !== 'all' ||
    filters.state.status !== 'all' ||
    !!filters.state.dataInicio ||
    !!filters.state.dataFim;

  const notFound = (!dataFiltered.length && canReset) || (!dataFiltered.length && !isLoading);

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await deleteGuiaFiscal(id);
        toast.success('Guia deletada com sucesso!');
        mutate();
      } catch (err) {
        const errorMessage = err?.message || 'Erro ao deletar guia';
        toast.error(errorMessage);
      } finally {
        confirm.onFalse();
        setGuiaIdToDelete(null);
      }
    },
    [mutate, confirm]
  );

  const handleDeleteBatch = useCallback(
    async () => {
      const selectedIds = table.selected;
      if (selectedIds.length === 0) {
        toast.error('Nenhuma guia selecionada');
        return;
      }

      try {
        const result = await deleteGuiasFiscaisBatch(selectedIds);
        
        if (result.success) {
          const { deletadas, naoEncontradas, erros } = result.data || {};
          
          if (deletadas > 0) {
            toast.success(`${deletadas} guia(s) deletada(s) com sucesso!`);
          }
          
          if (naoEncontradas && naoEncontradas.length > 0) {
            toast.warning(`${naoEncontradas.length} guia(s) não encontrada(s)`);
          }
          
          if (erros && erros.length > 0) {
            toast.error(`${erros.length} erro(s) ao deletar`);
          }
          
          table.onSelectAllRows(false);
          mutate();
        } else {
          toast.error(result.message || 'Erro ao deletar guias');
        }
      } catch (err) {
        const errorMessage = err?.message || 'Erro ao deletar guias';
        toast.error(errorMessage);
      } finally {
        confirmBatch.onFalse();
      }
    },
    [table, mutate, confirmBatch]
  );

  const handleOpenConfirm = useCallback((id) => {
    setGuiaIdToDelete(id);
    confirm.onTrue();
  }, [confirm]);

  const handleFilterStatus = useCallback(
    (event) => {
      const {value} = event.target;
      filters.setState({ status: value });
      table.onResetPage();
    },
    [filters, table]
  );

  const handleFilterTipoGuia = useCallback(
    (event) => {
      const {value} = event.target;
      filters.setState({ tipoGuia: value });
      table.onResetPage();
    },
    [filters, table]
  );

  const handleFilterCategoria = useCallback(
    (event) => {
      const {value} = event.target;
      filters.setState({ categoria: value });
      table.onResetPage();
    },
    [filters, table]
  );

  const handleFilterCliente = useCallback(
    (clienteId) => {
      filters.setState({ clienteId: clienteId || '' });
      table.onResetPage();
    },
    [filters, table]
  );

  const handleResetFilters = useCallback(() => {
    filters.setState(DEFAULT_FILTERS);
    table.onResetPage();
  }, [filters, table]);

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.guiasFiscais.details(id));
    },
    [router]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.guiasFiscais.edit(id));
    },
    [router]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Guias e Documentos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Guias e Documentos', href: paths.dashboard.guiasFiscais.root },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.guiasFiscais.upload}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Upload de Documentos
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <GuiaFiscalTableToolbar
          filters={filters.state}
          onFilters={(key, value) => {
            filters.setState({ [key]: value });
            table.onResetPage();
          }}
          onFilterCliente={handleFilterCliente}
          onFilterStatus={handleFilterStatus}
          onFilterTipoGuia={handleFilterTipoGuia}
          onFilterCategoria={handleFilterCategoria}
          onResetFilters={handleResetFilters}
          canReset={canReset}
          tipoGuiaOptions={TIPO_GUIA_OPTIONS}
          categoriaOptions={CATEGORIA_OPTIONS}
          clientes={clientes}
          loadingClientes={loadingClientes}
          numSelected={table.selected.length}
          onDeleteBatch={() => confirmBatch.onTrue()}
        />

        {canReset && (
          <GuiaFiscalTableFiltersResult
            filters={filters.state}
            onFilters={(newFilters) => filters.setState(newFilters)}
            onResetFilters={handleResetFilters}
            results={dataFiltered.length}
            tipoGuiaOptions={TIPO_GUIA_OPTIONS}
            statusOptions={STATUS_OPTIONS}
            categoriaOptions={CATEGORIA_OPTIONS}
            clientes={clientes}
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
                onSelectAllRows={(checked) => {
                  if (checked) {
                    const allIds = dataFiltered.map((row) => row._id);
                    table.onSelectAllRows(checked, allIds);
                  } else {
                    table.onSelectAllRows(checked, []);
                  }
                }}
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
            Tem certeza que deseja deletar esta guia fiscal? Esta ação não pode ser desfeita.
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (guiaIdToDelete) {
                handleDeleteRow(guiaIdToDelete);
              }
            }}
          >
            Deletar
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmBatch.value}
        onClose={confirmBatch.onFalse}
        title="Deletar Múltiplas Guias"
        content={
          <>
            Tem certeza que deseja deletar {table.selected.length} guia(s) fiscal(is)? Esta ação não pode ser desfeita.
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteBatch}
          >
            Deletar {table.selected.length} guia(s)
          </Button>
        }
      />
    </DashboardContent>
  );
}
