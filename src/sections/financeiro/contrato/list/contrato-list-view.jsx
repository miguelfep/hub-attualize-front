'use client';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  getContratos,
  updateContrato,
  getCobrancasPorData,
  aplicarReajustesContratos,
} from 'src/actions/financeiro';

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

import { getUser } from 'src/auth/context/jwt';

import { ContratoTableRow } from './contrato-table-row';
import { ContratoTableToolbar } from './contrato-table-toolbar';
import { ContratoTableFiltersResult } from './contrato-table-filters-result';
import { getReajusteInfo, agruparPendentesPorContrato } from '../contrato-reajuste-utils';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'titulo', label: 'Contrato', width: 50 },
  { id: 'tipoContrato', label: 'Tipo do contrato', width: 130 },
  { id: 'valorMensalidade', label: 'Valor mensal', width: 120 },
  { id: 'reajuste', label: 'Reajuste', width: 150 },
  { id: 'pendente', label: 'Em atraso', width: 120 },
  { id: 'status', label: 'Status', width: 80 },
  { id: '', width: 8 },
];

export const CONTRATO_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Encerrado' },
];

// Filtros de análise (computados no client a partir dos contratos e cobranças).
export const CONTRATO_ANALISE_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'pendente', label: 'Com cobranças vencidas/expiradas' },
  { value: 'sem-reajuste', label: 'Sem reajuste ativo' },
  { value: 'a-reajustar', label: 'A reajustar (vencido)' },
  { value: 'proximo', label: 'Reajuste próximo (30 dias)' },
];

// Aplica o filtro de análise a um contrato.
function matchAnalise(contrato, analise, pendenteMap) {
  if (analise === 'all') return true;

  if (analise === 'pendente') {
    return (pendenteMap[contrato._id]?.valor ?? 0) > 0;
  }

  const info = getReajusteInfo(contrato);

  if (analise === 'sem-reajuste') {
    return contrato.status === 'ativo' && info.category === 'desabilitado';
  }
  if (analise === 'a-reajustar') {
    return contrato.status === 'ativo' && info.category === 'vencido';
  }
  if (analise === 'proximo') {
    return contrato.status === 'ativo' && info.category === 'proximo';
  }
  return true;
}

// ----------------------------------------------------------------------

export function ContratoListView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 100 });
  const router = useRouter();

  const confirm = useBoolean();
  const confirmReajuste = useBoolean();
  const loadingReajuste = useBoolean();

  const user = getUser();
  const podeAplicarReajuste = user?.role === 'admin' || user?.role === 'financeiro';

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendenteMap, setPendenteMap] = useState({});

  const filters = useSetState({ titulo: '', status: 'all', analise: 'all' });

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

  // Busca cobranças dos últimos 12 meses e agrega apenas as vencidas/expiradas por contrato.
  const fetchPendentes = useCallback(async () => {
    try {
      const dataInicio = dayjs().subtract(12, 'month').startOf('day').format('YYYY-MM-DD');
      const dataFim = dayjs().endOf('day').format('YYYY-MM-DD');
      const cobrancas = await getCobrancasPorData(dataInicio, dataFim);
      setPendenteMap(agruparPendentesPorContrato(cobrancas));
    } catch (error) {
      // Pendências são complementares — não bloqueiam a listagem.
      console.error('Erro ao carregar pendências dos contratos:', error);
    }
  }, []);

  useEffect(() => {
    fetchContratos();
    fetchPendentes();
  }, [fetchContratos, fetchPendentes]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
    pendenteMap,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  // Contagens por filtro de análise (sobre todos os contratos carregados).
  const analiseCounts = useMemo(() => {
    const counts = {};
    CONTRATO_ANALISE_OPTIONS.forEach((opt) => {
      counts[opt.value] =
        opt.value === 'all'
          ? tableData.length
          : tableData.filter((contrato) => matchAnalise(contrato, opt.value, pendenteMap)).length;
    });
    return counts;
  }, [tableData, pendenteMap]);

  const canReset =
    !!filters.state.titulo || filters.state.status !== 'all' || filters.state.analise !== 'all';

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
        await updateContrato(id, { status: 'ativo', atualizarCobrancas: true });
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

  const handleAplicarReajustes = useCallback(async () => {
    loadingReajuste.onTrue();
    try {
      const resultado = await aplicarReajustesContratos();

      const reajustados = resultado?.contratosReajustados ?? 0;
      const elegiveis = resultado?.contratosElegiveis ?? 0;
      const semPercentual = resultado?.contratosSemPercentualConfigurado ?? 0;
      const comErro = resultado?.contratosComErro?.length ?? 0;

      if (reajustados > 0) {
        toast.success(`${reajustados} de ${elegiveis} contrato(s) reajustado(s) com sucesso.`);
      } else {
        toast.info('Nenhum contrato elegível para reajuste no momento.');
      }

      if (semPercentual > 0) {
        toast.warning(`${semPercentual} contrato(s) elegível(eis) sem percentual configurado.`);
      }

      if (comErro > 0) {
        toast.error(`${comErro} contrato(s) apresentaram erro ao reajustar.`);
      }

      fetchContratos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao aplicar reajustes');
    } finally {
      loadingReajuste.onFalse();
      confirmReajuste.onFalse();
    }
  }, [fetchContratos, loadingReajuste, confirmReajuste]);

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
            <Stack direction="row" spacing={1.5}>
              {podeAplicarReajuste && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={confirmReajuste.onTrue}
                  startIcon={<Iconify icon="solar:refresh-circle-bold-duotone" />}
                >
                  Aplicar reajustes
                </Button>
              )}

              <Button
                component={RouterLink}
                href={paths.dashboard.contratos.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Novo Contrato
              </Button>
            </Stack>
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
                      : tableData.filter((contrato) => contrato.status === tab.value).length}
                  </Label>
                }
              />
            ))}
          </Tabs>
          <ContratoTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            tableData={dataFiltered}
            analiseOptions={CONTRATO_ANALISE_OPTIONS}
            analiseCounts={analiseCounts}
          />

          {canReset && (
            <ContratoTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              analiseOptions={CONTRATO_ANALISE_OPTIONS}
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
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1200 }}>
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
                        pendente={pendenteMap[row._id]}
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

      <ConfirmDialog
        open={confirmReajuste.value}
        onClose={confirmReajuste.onFalse}
        title="Aplicar reajustes anuais"
        content="Esta ação aplica o percentual de reajuste configurado em cada contrato elegível (ativos, mensais e com reajuste anual habilitado que já completaram 12 meses e possuem percentual maior que zero). Deseja continuar?"
        action={
          <LoadingButton
            variant="contained"
            color="primary"
            loading={loadingReajuste.value}
            onClick={handleAplicarReajustes}
          >
            Aplicar agora
          </LoadingButton>
        }
      />
    </>
  );
}

// Função de aplicação de filtros
function applyFilter({ inputData, comparator, filters, pendenteMap = {} }) {
  const { titulo, status, analise } = filters;

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

  // Filtragem pela análise (pendências / situação de reajuste)
  if (analise && analise !== 'all') {
    inputData = inputData.filter((row) => matchAnalise(row, analise, pendenteMap));
  }

  return inputData;
}
