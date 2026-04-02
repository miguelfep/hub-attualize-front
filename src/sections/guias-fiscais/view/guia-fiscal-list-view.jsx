'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
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

import { findPastaNodeById } from '../utils';
import { GuiaFiscalTableRow } from '../guia-fiscal-table-row';
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

  const canReset =
    !!filters.state.clienteId ||
    filters.state.tipoGuia !== 'all' ||
    filters.state.categoria !== 'all' ||
    filters.state.status !== 'all' ||
    !!filters.state.dataInicio ||
    !!filters.state.dataFim ||
    !!selectedFolderId;

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
      setSelectedFolderId(null);
      filters.setState({ clienteId: clienteId || '' });
      table.onResetPage();
    },
    [filters, table]
  );

  const handleResetFilters = useCallback(() => {
    filters.setState(DEFAULT_FILTERS);
    setSelectedFolderId(null);
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
        pt: { xs: 1, md: 1.5 },
        pb: 2,
        px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
        width: 1,
        maxWidth: 1,
      }}
    >
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
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Upload
          </Button>
        }
        sx={{ mb: 2 }}
      />

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{ alignItems: 'stretch', minHeight: 0, flex: 1 }}
      >
        <Box
          sx={{
            width: { xs: '100%', lg: 300 },
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 'auto', lg: 400 },
          }}
        >
          {filters.state.clienteId ? (
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
          ) : (
            <Card variant="outlined" sx={{ height: '100%', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stack spacing={1} alignItems="center" textAlign="center">
                <Iconify icon="solar:users-group-rounded-bold-duotone" width={40} sx={{ color: 'text.disabled' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Selecione um cliente nos filtros
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  As pastas aparecem à esquerda; documentos e datas à direita.
                </Typography>
              </Stack>
            </Card>
          )}
        </Box>

        <Box
          sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}
          onDragEnter={handleListaDragEnter}
          onDragLeave={handleListaDragLeave}
          onDragOver={handleListaDragOver}
          onDrop={handleListaDrop}
        >
          {dragOverLista && filters.state.clienteId && selectedFolderId && (
            <Box
              sx={{
                pointerEvents: 'none',
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                border: `2px dashed ${theme.palette.primary.main}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:cloud-upload-bold-duotone" width={32} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Solte para enviar à pasta selecionada
                </Typography>
              </Stack>
            </Box>
          )}
      <Card
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          transition: theme.transitions.create(['box-shadow', 'border-color']),
          ...(dragOverLista &&
            filters.state.clienteId &&
            selectedFolderId && {
              boxShadow: `0 0 0 2px ${theme.palette.primary.main} inset`,
            }),
        }}
      >
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

        {filters.state.clienteId && selectedFolderId && (
          <Typography variant="caption" sx={{ px: 2, pt: 0, pb: 0.5, display: 'block' }} color="text.secondary">
            Também pode arrastar PDF ou Excel para esta área (lista) — o mesmo modal de vencimento e competência será aberto.
          </Typography>
        )}

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

        <TableContainer sx={{ position: 'relative', overflow: 'auto', flex: 1, minHeight: 280 }}>
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
                      onMoveRow={
                        filters.state.clienteId
                          ? () => handleOpenMoveGuia(row._id)
                          : undefined
                      }
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
        </Box>
      </Stack>

      <GuiaFiscalPastaUploadDialog
        open={pastaUploadOpen}
        onClose={() => {
          if (!pastaUploading) {
            setPastaUploadOpen(false);
            setPastaUploadFiles([]);
          }
        }}
        files={pastaUploadFiles}
        pastaNome={pastaSelecionadaNome}
        uploading={pastaUploading}
        onConfirm={handleConfirmPastaUpload}
      />

      <GuiaFiscalMovePastaDialog
        open={moveDialog.value}
        onClose={() => {
          if (!movingGuia) {
            moveDialog.onFalse();
            setGuiaIdToMove(null);
          }
        }}
        folders={folders}
        onConfirm={handleConfirmMoveGuia}
        loading={movingGuia}
      />

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
