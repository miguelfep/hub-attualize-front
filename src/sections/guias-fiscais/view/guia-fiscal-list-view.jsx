'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetAllClientes } from 'src/actions/clientes';
import {
  deleteGuiaFiscal,
  useGetGuiasFiscais,
  uploadManualPastaAdmin,
  useGetPastasGuiasAdmin,
  moveGuiaParaPastaAdmin,
  deleteGuiasFiscaisBatch,
} from 'src/actions/guias-fiscais';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
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
import { findPastaNodeById, getTopLevelPastaNome } from '../utils';
import { GuiaFiscalTableToolbar } from '../guia-fiscal-table-toolbar';
import { GuiaFiscalTableFiltersResult } from '../guia-fiscal-table-filters-result';
import { GuiaFiscalMovePastaDialog } from '../components/guia-fiscal-move-pasta-dialog';
import { GuiaFiscalAdminPastasPanel } from '../components/guia-fiscal-admin-pastas-panel';
import { GuiaFiscalPastaUploadDialog } from '../components/guia-fiscal-pasta-upload-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nomeArquivo', label: 'Nome do Arquivo' },
  { id: 'tipoGuia', label: 'Tipo' },
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'clienteNome', label: 'Razão Social' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'dataVencimento', label: 'Competência / Vencimento' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Enviado em' },
  { id: 'clienteVisualizou', label: 'Cliente (portal)' },
  { id: '', width: 120 },
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
  { value: 'OUTROS', label: 'Outros' },
];

const CATEGORIA_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'GUIA_FISCAL', label: 'Guia Fiscal' },
  { value: 'GUIA_DP', label: 'Guia DP' },
  { value: 'DOCUMENTO_DP', label: 'Documento DP' },
  { value: 'ARQUIVO_GERAL', label: 'Arquivo geral' },
];

const DEFAULT_FILTERS = {
  tipoGuia: 'all',
  categoria: 'all',
  status: 'all',
  clienteId: '',
  dataInicio: null,
  dataFim: null,
};

function apiErrUpload(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.message || err.error || 'Erro na operação';
}

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
  const theme = useTheme();
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 50 });

  const router = useRouter();

  const confirm = useBoolean();
  const confirmBatch = useBoolean();
  const moveDialog = useBoolean();

  const [guiaIdToDelete, setGuiaIdToDelete] = useState(null);
  const [guiaIdToMove, setGuiaIdToMove] = useState(null);
  const [movingGuia, setMovingGuia] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const [pastaUploadOpen, setPastaUploadOpen] = useState(false);
  const [pastaUploadFiles, setPastaUploadFiles] = useState([]);
  const [pastaUploading, setPastaUploading] = useState(false);
  const [dragOverLista, setDragOverLista] = useState(false);

  const filters = useSetState(DEFAULT_FILTERS);

  // Buscar clientes ativos
  const { data: clientes, isLoading: loadingClientes } = useGetAllClientes({ status: true });

  const { folders, isLoading: loadingPastas, mutate: mutatePastas } = useGetPastasGuiasAdmin(
    filters.state.clienteId || null
  );

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

    if (selectedFolderId) {
      params.folderId = selectedFolderId;
    }

    return params;
  }, [
    filters.state.clienteId,
    filters.state.tipoGuia,
    filters.state.categoria,
    filters.state.status,
    filters.state.dataInicio,
    filters.state.dataFim,
    selectedFolderId,
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

  const waitingForFolderSelection = !!filters.state.clienteId && !selectedFolderId;

  const dataDisplayed = useMemo(() => {
    if (waitingForFolderSelection) return [];
    return dataFiltered;
  }, [waitingForFolderSelection, dataFiltered]);

  const resultFolderNames = useMemo(() => {
    const rows = data?.guias || [];
    const names = rows
      .map((row) => getTopLevelPastaNome(folders, row?.folderId))
      .filter(Boolean);

    return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [data?.guias, folders]);

  const canReset =
    !!filters.state.clienteId ||
    filters.state.tipoGuia !== 'all' ||
    filters.state.categoria !== 'all' ||
    filters.state.status !== 'all' ||
    !!filters.state.dataInicio ||
    !!filters.state.dataFim ||
    !!selectedFolderId;

  const showSelectFolderHint = waitingForFolderSelection && !isLoading;

  const notFound =
    !showSelectFolderHint &&
    ((!dataDisplayed.length && canReset) || (!dataDisplayed.length && !isLoading));

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
      const { value } = event.target;
      filters.setState({ status: value });
      table.onResetPage();
    },
    [filters, table]
  );

  const handleFilterTipoGuia = useCallback(
    (event) => {
      const { value } = event.target;
      filters.setState({ tipoGuia: value });
      table.onResetPage();
    },
    [filters, table]
  );

  const handleFilterCategoria = useCallback(
    (event) => {
      const { value } = event.target;
      filters.setState({ categoria: value });
      table.onResetPage();
    },
    [filters, table]
  );

  const handleFilterCliente = useCallback(
    (clienteId) => {
      setSelectedFolderId(null);
      filters.setState({ clienteId: clienteId || '' });
      table.onSelectAllRows(false);
      table.onResetPage();
    },
    [filters, table]
  );

  const handleResetFilters = useCallback(() => {
    filters.setState(DEFAULT_FILTERS);
    setSelectedFolderId(null);
    table.onSelectAllRows(false);
    table.onResetPage();
  }, [filters, table]);

  const handleOpenMoveGuia = useCallback(
    (id) => {
      setGuiaIdToMove(id);
      moveDialog.onTrue();
    },
    [moveDialog]
  );

  const handleConfirmMoveGuia = useCallback(
    async (folderIdDestino) => {
      if (!guiaIdToMove) return;
      try {
        setMovingGuia(true);
        const res = await moveGuiaParaPastaAdmin(guiaIdToMove, folderIdDestino);
        if (res.success !== false) {
          toast.success(res.message || 'Documento movido.');
          mutate();
          mutatePastas();
          moveDialog.onFalse();
          setGuiaIdToMove(null);
        } else {
          toast.error(res.message || 'Não foi possível mover o documento.');
        }
      } catch (err) {
        const msg = typeof err === 'string' ? err : err?.message || 'Erro ao mover documento';
        toast.error(msg);
      } finally {
        setMovingGuia(false);
      }
    },
    [guiaIdToMove, mutate, mutatePastas, moveDialog]
  );

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

  const queuePastaUploadFiles = useCallback(
    (files) => {
      if (!files.length) return;
      if (!filters.state.clienteId) {
        toast.error('Selecione um cliente nos filtros.');
        return;
      }
      if (!selectedFolderId) {
        toast.error('Selecione uma pasta à esquerda para enviar arquivos.');
        return;
      }
      setPastaUploadFiles(files);
      setPastaUploadOpen(true);
    },
    [filters.state.clienteId, selectedFolderId]
  );

  const handleConfirmPastaUpload = useCallback(
    async ({ dataVencimento, competencia }) => {
      if (!pastaUploadFiles.length || !selectedFolderId || !filters.state.clienteId) return;
      try {
        setPastaUploading(true);
        const res = await uploadManualPastaAdmin(selectedFolderId, pastaUploadFiles, {
          clienteId: filters.state.clienteId,
          dataVencimento,
          competencia,
        });
        if (res.success !== false) {
          toast.success(res.message || `${res?.data?.total ?? pastaUploadFiles.length} arquivo(s) enviado(s).`);
          mutate();
          mutatePastas();
          setPastaUploadOpen(false);
          setPastaUploadFiles([]);
        } else {
          toast.error(res.message || 'Falha no upload');
        }
      } catch (err) {
        toast.error(apiErrUpload(err));
      } finally {
        setPastaUploading(false);
      }
    },
    [pastaUploadFiles, selectedFolderId, filters.state.clienteId, mutate, mutatePastas]
  );

  const pastaSelecionadaNome = useMemo(
    () =>
      selectedFolderId && folders?.length
        ? findPastaNodeById(folders, selectedFolderId)?.nome
        : undefined,
    [folders, selectedFolderId]
  );

  const handleListaDragEnter = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types?.includes('Files') && filters.state.clienteId && selectedFolderId) {
        setDragOverLista(true);
      }
    },
    [filters.state.clienteId, selectedFolderId]
  );

  const handleListaDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = e.relatedTarget;
    if (!next || !e.currentTarget.contains(next)) {
      setDragOverLista(false);
    }
  }, []);

  const handleListaDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleListaDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverLista(false);
      const dropped = Array.from(e.dataTransfer?.files || []);
      queuePastaUploadFiles(dropped);
    },
    [queuePastaUploadFiles]
  );

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        py: 2,
      }}
    >
      {/* 1. CABEÇALHO E AÇÃO PRINCIPAL */}
      <Box sx={{ px: { lg: 1 } }}>
        <CustomBreadcrumbs
          heading="Gerenciador de Arquivos"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Gerenciador de Arquivos', href: paths.dashboard.guiasFiscais.root },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.guiasFiscais.upload}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Express
            </Button>
          }
          sx={{ mb: 0 }}
        />
      </Box>

      {/* 2. ÁREA PRINCIPAL: PASTAS (ESQUERDA) + FILTROS/TABELA (DIREITA) */}
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{ flex: 1, minHeight: 0, alignItems: 'stretch' }}
      >
        {/* ESTRUTURA DE PASTAS (ESQUERDA) */}
        <Box
          sx={{
            width: { xs: '100%', lg: 270 },
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 260, lg: 0 },
          }}
        >
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.neutral',
              border: (t) => `solid 1px ${t.palette.divider}`,
              borderRadius: 1.5,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ px: 2, py: 1.5, borderBottom: (t) => `dashed 1px ${t.palette.divider}` }}
            >
              <Iconify icon="solar:folder-2-bold-duotone" sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle2">Estrutura de Pastas</Typography>
            </Stack>

            {filters.state.clienteId ? (
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <GuiaFiscalAdminPastasPanel
                  clienteId={filters.state.clienteId}
                  folders={folders}
                  loadingFolders={loadingPastas}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={(id) => {
                    setSelectedFolderId(id);
                    table.onResetPage();
                  }}
                  onRefreshTree={() => mutatePastas()}
                  onUploadedDocuments={() => mutate()}
                  onQueueFilesForUpload={queuePastaUploadFiles}
                  uploading={pastaUploading}
                />
              </Box>
            ) : (
              <Stack flexGrow={1} alignItems="center" justifyContent="center" spacing={1} sx={{ p: 2, textAlign: 'center' }}>
                <Iconify icon="solar:users-group-rounded-bold-duotone" width={48} sx={{ color: 'text.disabled', opacity: 0.5 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Nenhum cliente selecionado
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  Selecione um cliente no filtro acima para visualizar suas pastas e arquivos.
                </Typography>
              </Stack>
            )}
          </Card>
        </Box>

        {/* CONTEÚDO (DIREITA): FILTRO ACIMA DA TABELA */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            position: 'relative',
          }}
          onDragEnter={handleListaDragEnter}
          onDragLeave={handleListaDragLeave}
          onDragOver={handleListaDragOver}
          onDrop={handleListaDrop}
        >
          {/* DROP ZONE OVERLAY - Mais moderno */}
          {dragOverLista && filters.state.clienteId && selectedFolderId && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                border: (t) => `2px dashed ${t.palette.primary.main}`,
                backdropFilter: 'blur(4px)',
                transition: 'all 0.3s',
              }}
            >
              <Stack alignItems="center" spacing={1}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    boxShadow: (t) => t.customShadows.primary,
                  }}
                >
                  <Iconify icon="solar:cloud-upload-bold-duotone" width={32} />
                </Box>
                <Typography variant="h6" sx={{ color: 'primary.darker' }}>
                  Soltar para Upload
                </Typography>
              </Stack>
            </Box>
          )}

          <Card
            variant="outlined"
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.neutral',
              border: (t) => `solid 1px ${t.palette.divider}`,
              borderRadius: 1.5,
              boxShadow: 'none',
            }}
          >
            <Box sx={{ px: 2.25, pt: 2, pb: 1.25, borderBottom: (t) => `dashed 1px ${t.palette.divider}` }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:list-check-bold-duotone" width={22} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1">Filtros e Documentos</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Refine os filtros para localizar guias e documentos com mais rapidez.
              </Typography>
            </Box>

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
                results={total}
                folderCount={resultFolderNames.length}
                folderNames={resultFolderNames}
                tipoGuiaOptions={TIPO_GUIA_OPTIONS}
                statusOptions={STATUS_OPTIONS}
                categoriaOptions={CATEGORIA_OPTIONS}
                clientes={clientes}
              />
            )}

            <Divider sx={{ borderStyle: 'dashed', mx: 2.25 }} />

            {/* INFO DE ATALHO */}
            {filters.state.clienteId && selectedFolderId && (
              <Box
                sx={{
                  mx: 2.25,
                  mt: 1,
                  mb: 0.5,
                  px: 1.25,
                  py: 0.85,
                  bgcolor: 'background.paper',
                  border: (t) => `solid 1px ${t.palette.divider}`,
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="solar:info-circle-bold" width={14} />
                  Dica: Arraste PDF ou Excel diretamente para a lista para upload rápido.
                </Typography>
              </Box>
            )}

            <TableContainer sx={{ position: 'relative', overflow: 'auto', flex: 1, minHeight: 320 }}>
              <Scrollbar>
                <Table size="small" sx={{ minWidth: 780 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={dataDisplayed.length}
                    numSelected={table.selected.length}
                    onSelectAllRows={(checked) => {
                      const allIds = dataDisplayed.map((row) => row._id);
                      table.onSelectAllRows(checked, allIds);
                    }}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    {isLoading ? (
                      <TableNoData notFound loading />
                    ) : showSelectFolderHint ? (
                      <TableRow>
                        <TableCell colSpan={12}>
                          <EmptyContent
                            filled
                            title="Selecione uma pasta"
                            description="Escolha Fiscal, Departamento pessoal, Contábil ou outra pasta à esquerda para listar os arquivos deste cliente."
                            sx={{ py: 10 }}
                          />
                        </TableCell>
                      </TableRow>
                    ) : notFound ? (
                      <TableNoData notFound />
                    ) : (
                      dataDisplayed.map((row) => (
                        <GuiaFiscalTableRow
                          key={row._id}
                          row={row}
                          selected={table.selected.includes(row._id)}
                          onSelectRow={() => table.onSelectRow(row._id)}
                          onViewRow={() => handleViewRow(row._id)}
                          onEditRow={() => handleEditRow(row._id)}
                          onDeleteRow={() => handleOpenConfirm(row._id)}
                          onMoveRow={filters.state.clienteId ? () => handleOpenMoveGuia(row._id) : undefined}
                        />
                      ))
                    )}
                    <TableEmptyRows height={40} emptyRows={emptyRows(table.page, table.rowsPerPage, dataDisplayed?.length ?? 0)} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <TablePaginationCustom
              count={waitingForFolderSelection ? 0 : total}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
            />
          </Card>
        </Box>
      </Stack>

      {/* DIALOGS - Mantidos no final por organização */}
      <GuiaFiscalPastaUploadDialog
        open={pastaUploadOpen}
        onClose={() => { if (!pastaUploading) { setPastaUploadOpen(false); setPastaUploadFiles([]); } }}
        files={pastaUploadFiles}
        pastaNome={pastaSelecionadaNome}
        uploading={pastaUploading}
        onConfirm={handleConfirmPastaUpload}
      />

      <GuiaFiscalMovePastaDialog
        open={moveDialog.value}
        onClose={() => { if (!movingGuia) { moveDialog.onFalse(); setGuiaIdToMove(null); } }}
        folders={folders}
        onConfirm={handleConfirmMoveGuia}
        loading={movingGuia}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Deletar"
        content="Tem certeza que deseja deletar esta guia fiscal? Esta ação não pode ser desfeita."
        action={<Button variant="contained" color="error" onClick={() => guiaIdToDelete && handleDeleteRow(guiaIdToDelete)}>Deletar</Button>}
      />

      <ConfirmDialog
        open={confirmBatch.value}
        onClose={confirmBatch.onFalse}
        title="Deletar Múltiplas Guias"
        content={`Tem certeza que deseja deletar ${table.selected.length} guia(s) fiscal(is)?`}
        action={<Button variant="contained" color="error" onClick={handleDeleteBatch}>Deletar Selecionados</Button>}
      />
    </DashboardContent>
  );
}
