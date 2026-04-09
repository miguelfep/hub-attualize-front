'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import Autocomplete from '@mui/material/Autocomplete';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CardActionArea from '@mui/material/CardActionArea';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetAllClientes } from 'src/actions/clientes';
import {
  deleteGuiaFiscal,
  downloadGuiaFiscal,
  useGetGuiasFiscais,
  deletePastaGuiasAdmin,
  useGetPastasGuiasAdmin,
  uploadManualPastaAdmin,
  createSubpastaGuiasAdmin,
} from 'src/actions/guias-fiscais';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { GuiaFiscalPortalReadEye } from '../components/guia-fiscal-portal-read-eye';
import { GuiaFiscalPastaUploadDialog } from '../components/guia-fiscal-pasta-upload-dialog';
import { getCompetencia, SLUG_PASTA_REGEX, findPastaNodeById, formatCompetencia, suggestSlugFromNome } from '../utils';

// ----------------------------------------------------------------------

function apiErrUpload(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.message || err.error || 'Erro na operação';
}

function apiErrMsg(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.message || err.error || 'Erro na operação';
}

function findFolderPath(nodes, id, trail = []) {
  const list = nodes || [];
  for (let i = 0; i < list.length; i += 1) {
    const node = list[i];
    const nextTrail = [...trail, node];
    if (node._id === id) return nextTrail;
    if (node.children?.length) {
      const found = findFolderPath(node.children, id, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

/** Retorna o parentId direto de childId na árvore, ou null se for raiz. */
function findParentFolderId(nodes, childId, parentId = null) {
  const list = nodes || [];
  for (let i = 0; i < list.length; i += 1) {
    const n = list[i];
    if (n._id === childId) return parentId;
    if (n.children?.length) {
      const found = findParentFolderId(n.children, childId, n._id);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

function podeExcluirPasta(node) {
  return Boolean(node && !node.isPadrao && !(node.children?.length > 0));
}

function getClienteLabel(cliente) {
  if (!cliente) return 'Cliente';
  const codigo = cliente.codigoCliente || cliente.codigo || cliente.code || cliente._id?.slice?.(-6) || '-';
  const razaoSocial = cliente.nomeRazaoSocial || cliente.razaoSocial || cliente.nome || 'Sem razão social';
  return `${codigo} - ${razaoSocial}`;
}

function FileMetaLines({ file }) {
  const comp = getCompetencia(file);
  const showVenc = Boolean(file?.dataVencimento);
  if (!comp && !showVenc) return null;
  return (
    <Stack spacing={0.15}>
      {comp ? (
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }} noWrap>
          Competência: {formatCompetencia(comp)}
        </Typography>
      ) : null}
      {showVenc ? (
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }} noWrap>
          Vencimento: {fDate(file.dataVencimento)}
        </Typography>
      ) : null}
    </Stack>
  );
}

export function GuiaFiscalDriveAdminView() {
  const router = useRouter();
  const [clienteId, setClienteId] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pastaUploadOpen, setPastaUploadOpen] = useState(false);
  const [pastaUploadFiles, setPastaUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [filesViewMode, setFilesViewMode] = useState('grid');

  const [menuState, setMenuState] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [parentIdForNewFolder, setParentIdForNewFolder] = useState(null);
  const [novaSubpastaNome, setNovaSubpastaNome] = useState('');
  const [novaSubpastaSlug, setNovaSubpastaSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [fileMenuState, setFileMenuState] = useState(null);
  const [deleteFileOpen, setDeleteFileOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deletingFile, setDeletingFile] = useState(false);

  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [filesBulkDelete, setFilesBulkDelete] = useState([]);
  const [deletingBulk, setDeletingBulk] = useState(false);

  const { data: clientes = [], isLoading: loadingClientes } = useGetAllClientes({ status: true });
  const { folders, isLoading: loadingFolders, mutate: mutateFolders } = useGetPastasGuiasAdmin(clienteId || null);
  const { data, isLoading: loadingFiles, mutate: mutateFiles } = useGetGuiasFiscais({
    clienteId: clienteId || undefined,
    folderId: currentFolderId || undefined,
    page: 1,
    limit: 200,
  });

  const selectedCliente = useMemo(
    () => (clienteId ? clientes.find((c) => c._id === clienteId) || null : null),
    [clientes, clienteId]
  );

  const folderPath = useMemo(
    () => (currentFolderId ? findFolderPath(folders, currentFolderId) || [] : []),
    [folders, currentFolderId]
  );

  const visibleFolders = useMemo(() => {
    if (!currentFolderId) return folders || [];
    return findPastaNodeById(folders, currentFolderId)?.children || [];
  }, [folders, currentFolderId]);

  const files = useMemo(() => (Array.isArray(data?.guias) ? data.guias : []), [data?.guias]);

  const hasFolderOrFiles = visibleFolders.length > 0 || files.length > 0;
  const showFilesLoadingPlaceholder = Boolean(loadingFiles && !hasFolderOrFiles);

  useEffect(() => {
    setSelectedFileIds([]);
  }, [clienteId, currentFolderId]);

  useEffect(() => {
    const valid = new Set(files.map((f) => f._id));
    setSelectedFileIds((prev) => prev.filter((id) => valid.has(id)));
  }, [files]);

  const pastaSelecionadaNome = useMemo(
    () =>
      currentFolderId && folders?.length
        ? findPastaNodeById(folders, currentFolderId)?.nome
        : undefined,
    [folders, currentFolderId]
  );

  const closeMenu = useCallback(() => setMenuState(null), []);

  const closeFileMenu = useCallback(() => setFileMenuState(null), []);

  const openDeleteFileDialog = useCallback(
    (file) => {
      if (!file?._id) return;
      setFileToDelete(file);
      setDeleteFileOpen(true);
      closeFileMenu();
    },
    [closeFileMenu]
  );

  const handleConfirmDeleteFile = useCallback(async () => {
    if (!fileToDelete?._id) return;
    try {
      setDeletingFile(true);
      await deleteGuiaFiscal(fileToDelete._id);
      toast.success('Documento excluído com sucesso.');
      setDeleteFileOpen(false);
      setFileToDelete(null);
      setSelectedFileIds((prev) => prev.filter((id) => id !== fileToDelete._id));
      await mutateFiles();
    } catch (err) {
      toast.error(apiErrMsg(err));
    } finally {
      setDeletingFile(false);
    }
  }, [fileToDelete, mutateFiles]);

  const toggleFileSelected = useCallback((fileId) => {
    setSelectedFileIds((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]));
  }, []);

  const openBulkDeleteDialog = useCallback(() => {
    const list = files.filter((f) => f._id && selectedFileIds.includes(f._id));
    if (!list.length) return;
    setFilesBulkDelete(list);
    setBulkDeleteOpen(true);
  }, [files, selectedFileIds]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (!filesBulkDelete.length) return;
    let ok = 0;
    let fail = 0;
    setDeletingBulk(true);
    try {
      await filesBulkDelete.reduce(
        (promiseChain, file) =>
          promiseChain.then(async () => {
            try {
              await deleteGuiaFiscal(file._id);
              ok += 1;
            } catch (err) {
              fail += 1;
              toast.error(apiErrMsg(err) || `Falha ao excluir: ${file.nomeArquivo || file._id}`);
            }
          }),
        Promise.resolve()
      );
      setBulkDeleteOpen(false);
      setFilesBulkDelete([]);
      setSelectedFileIds([]);
      await mutateFiles();
      if (ok && !fail) {
        toast.success(`${ok} documento(s) excluído(s) com sucesso.`);
      } else if (ok && fail) {
        toast.warning(`${ok} excluído(s), ${fail} com erro.`);
      } else if (fail) {
        toast.error('Nenhum documento foi excluído.');
      }
    } finally {
      setDeletingBulk(false);
    }
  }, [filesBulkDelete, mutateFiles]);

  const handleFileContextMenu = useCallback(
    (e, file) => {
      e.preventDefault();
      e.stopPropagation();
      if (!clienteId) return;
      setFileMenuState({ type: 'context', mouseX: e.clientX, mouseY: e.clientY, file });
    },
    [clienteId]
  );

  const openCreateDialog = useCallback((parentId) => {
    if (!parentId) {
      toast.error('Abra uma pasta primeiro para criar uma subpasta (clique duas vezes em uma pasta raiz).');
      return;
    }
    setParentIdForNewFolder(parentId);
    setNovaSubpastaNome('');
    setNovaSubpastaSlug('');
    setCreateOpen(true);
    closeMenu();
  }, [closeMenu]);

  const handleNomeSubpastaChange = (value) => {
    setNovaSubpastaNome(value);
    setNovaSubpastaSlug(suggestSlugFromNome(value));
  };

  const handleConfirmCreate = async () => {
    const nome = novaSubpastaNome.trim();
    const slug = novaSubpastaSlug.trim().toLowerCase();
    if (!nome) {
      toast.error('Informe o nome da pasta.');
      return;
    }
    if (!SLUG_PASTA_REGEX.test(slug)) {
      toast.error('Slug inválido: use letras minúsculas, números e hífens.');
      return;
    }
    if (!parentIdForNewFolder || !clienteId) return;
    try {
      setCreating(true);
      const res = await createSubpastaGuiasAdmin(parentIdForNewFolder, {
        clienteId,
        slug,
        nome,
      });
      if (res.success !== false) {
        toast.success('Pasta criada.');
        setCreateOpen(false);
        await mutateFolders();
      } else {
        toast.error(res.message || 'Não foi possível criar a pasta.');
      }
    } catch (err) {
      toast.error(apiErrMsg(err));
    } finally {
      setCreating(false);
    }
  };

  const openDeleteDialog = useCallback(
    (folder) => {
      if (!podeExcluirPasta(folder)) {
        toast.error('Só é possível excluir pasta vazia (sem subpastas). As pastas padrão não podem ser removidas.');
        return;
      }
      setFolderToDelete(folder);
      setDeleteOpen(true);
      closeMenu();
    },
    [closeMenu]
  );

  const handleConfirmDelete = async () => {
    if (!folderToDelete?._id || !clienteId) return;
    try {
      setDeleting(true);
      const res = await deletePastaGuiasAdmin(folderToDelete._id, clienteId);
      if (res.success !== false) {
        toast.success('Pasta removida.');
        setDeleteOpen(false);
        if (currentFolderId === folderToDelete._id) {
          const parent = findParentFolderId(folders, folderToDelete._id);
          setCurrentFolderId(parent !== undefined ? parent : null);
        }
        setFolderToDelete(null);
        await Promise.all([mutateFolders(), mutateFiles()]);
      } else {
        toast.error(res.message || 'Não foi possível remover a pasta.');
      }
    } catch (err) {
      toast.error(apiErrMsg(err));
    } finally {
      setDeleting(false);
    }
  };

  const queuePastaUploadFiles = useCallback(
    (fileList) => {
      if (!fileList.length) return;
      if (!clienteId) {
        toast.error('Selecione um cliente.');
        return;
      }
      if (!currentFolderId) {
        toast.error('Entre em uma pasta para enviar arquivos (área atual do Drive).');
        return;
      }
      setPastaUploadFiles(fileList);
      setPastaUploadOpen(true);
    },
    [clienteId, currentFolderId]
  );

  const handleConfirmPastaUpload = useCallback(
    async ({ dataVencimento, competencia }) => {
      if (!pastaUploadFiles.length || !currentFolderId || !clienteId) return;
      const total = pastaUploadFiles.length;
      let ok = 0;
      let fail = 0;
      setUploading(true);
      try {
        await pastaUploadFiles.reduce(
          (promiseChain, file, index) =>
            promiseChain.then(async () => {
              setUploadProgress({ current: index + 1, total });
              try {
                const res = await uploadManualPastaAdmin(currentFolderId, [file], {
                  clienteId,
                  dataVencimento,
                  competencia,
                });
                if (res.success !== false) ok += 1;
                else {
                  fail += 1;
                  toast.error(res.message || `Falha ao enviar: ${file.name}`);
                }
              } catch (err) {
                fail += 1;
                toast.error(typeof err === 'string' ? err : err?.message || `Erro em ${file.name}`);
              }
            }),
          Promise.resolve()
        );
        await Promise.all([mutateFiles(), mutateFolders()]);
        setPastaUploadOpen(false);
        setPastaUploadFiles([]);
        if (ok && !fail) {
          toast.success(`${ok} arquivo(s) enviado(s) com sucesso.`);
        } else if (ok && fail) {
          toast.warning(`${ok} enviado(s), ${fail} com erro.`);
        } else if (fail) {
          toast.error('Nenhum arquivo foi enviado.');
        }
      } finally {
        setUploading(false);
        setUploadProgress(null);
      }
    },
    [pastaUploadFiles, currentFolderId, clienteId, mutateFiles, mutateFolders]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types?.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = e.relatedTarget;
    if (!next || !e.currentTarget.contains(next)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer?.files || []);
      if (!droppedFiles.length) return;
      queuePastaUploadFiles(droppedFiles);
    },
    [queuePastaUploadFiles]
  );

  const handleDriveSurfaceContextMenu = useCallback(
    (e) => {
      if (!clienteId) return;
      if (e.target.closest?.('[data-folder-card]') || e.target.closest?.('[data-file-card]')) return;
      e.preventDefault();
      setMenuState({ type: 'context', mouseX: e.clientX, mouseY: e.clientY, folder: null });
    },
    [clienteId]
  );

  const handleFolderContextMenu = useCallback((e, folder) => {
    e.preventDefault();
    e.stopPropagation();
    if (!clienteId) return;
    setMenuState({ type: 'context', mouseX: e.clientX, mouseY: e.clientY, folder });
  }, [clienteId]);

  const renderFolderMenuItems = () => {
    if (!menuState) return null;
    const { folder } = menuState;

    if (folder) {
      const podeExcluir = podeExcluirPasta(folder);
      return (
        <>
          <MenuItem
            onClick={() => {
              setCurrentFolderId(folder._id);
              closeMenu();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:folder-open-bold-duotone" width={20} />
            </ListItemIcon>
            <ListItemText primary="Abrir" secondary="Entrar nesta pasta" />
          </MenuItem>
          <MenuItem onClick={() => openCreateDialog(folder._id)}>
            <ListItemIcon>
              <Iconify icon="solar:add-folder-bold" width={20} />
            </ListItemIcon>
            <ListItemText primary="Nova subpasta" />
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem disabled={!podeExcluir} onClick={() => podeExcluir && openDeleteDialog(folder)}>
            <ListItemIcon>
              <Iconify icon="solar:trash-bin-trash-bold" width={20} sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary="Excluir pasta" primaryTypographyProps={{ color: 'error' }} />
          </MenuItem>
        </>
      );
    }

    return (
      <MenuItem disabled={!currentFolderId} onClick={() => openCreateDialog(currentFolderId)}>
        <ListItemIcon>
          <Iconify icon="solar:add-folder-bold" width={20} />
        </ListItemIcon>
        <ListItemText
          primary="Nova pasta"
          secondary={!currentFolderId ? 'Abra uma pasta para adicionar subpasta neste nível' : 'Criar dentro da pasta atual'}
        />
      </MenuItem>
    );
  };

  return (
    <DashboardContent maxWidth={false} sx={{ py: 2 }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto', width: '100%' }}>
        <CustomBreadcrumbs
          heading="Documentos e guias"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Documentos e guias', href: paths.dashboard.guiasEDocumentos.list },
          ]}
          sx={{ mb: 2 }}
        />

        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Autocomplete
              fullWidth
              options={clientes}
              loading={loadingClientes}
              value={selectedCliente}
              onChange={(_, value) => {
                setClienteId(value?._id || '');
                setCurrentFolderId(null);
              }}
              getOptionLabel={(option) => getClienteLabel(option)}
              renderOption={(props, option) => (
                <li {...props} key={option?._id || option?.codigoCliente || option?.codigo}>
                  {getClienteLabel(option)}
                </li>
              )}
              renderInput={(params) => <TextField {...params} label="Selecionar cliente" placeholder="Digite para buscar..." />}
            />
          </Stack>

          {!clienteId ? (
            <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
              <Iconify icon="solar:users-group-rounded-bold-duotone" width={48} sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary">
                Selecione um cliente para visualizar as pastas e arquivos.
              </Typography>
            </Stack>
          ) : (
            <Card
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                position: 'relative',
                border: isDragOver ? (theme) => `2px dashed ${theme.palette.primary.main}` : undefined,
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Stack spacing={2.5}>
                {loadingFolders && !folders?.length ? (
                  <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                      Carregando pastas...
                    </Typography>
                  </Stack>
                ) : (
                  <>
                    <Divider />

                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                      <Button size="small" variant={!currentFolderId ? 'contained' : 'outlined'} onClick={() => setCurrentFolderId(null)}>
                        Drive do cliente
                      </Button>
                      {folderPath.map((folder) => (
                        <Button key={folder._id} size="small" variant="text" onClick={() => setCurrentFolderId(folder._id)}>
                          / {folder.nome}
                        </Button>
                      ))}
                    </Stack>

                    <Alert severity="info" variant="outlined" sx={{ alignItems: 'flex-start', py: 1.25 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          <strong>Arraste e solte arquivos</strong> neste quadro para enviar à <strong>pasta atual</strong> (caminho acima). Você
                          também pode usar <strong>Enviar arquivos</strong>.
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Vários arquivos de uma vez: após confirmar no diálogo, o envio é feito em <strong>fila</strong> (um por vez).
                        </Typography>
                      </Stack>
                    </Alert>

                    <Typography variant="caption" color="text.secondary">
                      Pastas: botão direito na área vazia ou no cartão da pasta. Arquivos: marque os checkboxes para excluir em massa; botão direito ou
                      três pontos para excluir um a um.
                    </Typography>

                    <Box>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap">
                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                          <Iconify icon="solar:folder-with-files-bold-duotone" width={22} />
                          <Typography variant="subtitle1">Pastas e arquivos</Typography>
                          {visibleFolders.length > 0 ? <Chip size="small" label={`${visibleFolders.length} pasta(s)`} /> : null}
                          <Chip size="small" label={`${files.length} arquivo(s)`} />
                          {loadingFiles ? <CircularProgress size={18} /> : null}
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Iconify icon="solar:upload-bold" />}
                            disabled={!currentFolderId || uploading}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.multiple = true;
                              input.accept =
                                '.pdf,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';
                              input.onchange = () => {
                                const picked = Array.from(input.files || []);
                                queuePastaUploadFiles(picked);
                              };
                              input.click();
                            }}
                          >
                            Enviar arquivos
                          </Button>
                          <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={filesViewMode}
                            onChange={(_, value) => {
                              if (value) setFilesViewMode(value);
                            }}
                          >
                            <ToggleButton value="grid">
                              <Iconify icon="solar:widget-5-bold-duotone" width={16} />
                            </ToggleButton>
                            <ToggleButton value="list">
                              <Iconify icon="solar:list-bold-duotone" width={16} />
                            </ToggleButton>
                          </ToggleButtonGroup>
                          {files.length > 0 ? (
                            <>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() =>
                                  setSelectedFileIds((prev) =>
                                    prev.length === files.length ? [] : files.map((f) => f._id).filter(Boolean)
                                  )
                                }
                              >
                                {selectedFileIds.length === files.length ? 'Desmarcar todos' : 'Selecionar todos'}
                              </Button>
                              <Button
                                size="small"
                                variant="text"
                                disabled={!selectedFileIds.length}
                                onClick={() => setSelectedFileIds([])}
                              >
                                Limpar seleção
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="soft"
                                disabled={!selectedFileIds.length}
                                startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={18} />}
                                onClick={openBulkDeleteDialog}
                              >
                                Excluir ({selectedFileIds.length})
                              </Button>
                            </>
                          ) : null}
                        </Stack>
                      </Stack>

                      <Box onContextMenu={handleDriveSurfaceContextMenu} sx={{ minHeight: 80 }}>
                        {showFilesLoadingPlaceholder ? (
                          <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
                            <CircularProgress size={24} />
                            <Typography variant="body2" color="text.secondary">
                              Carregando documentos...
                            </Typography>
                          </Stack>
                        ) : !hasFolderOrFiles ? (
                          <Typography variant="body2" color="text.secondary">
                            Esta pasta está vazia. Arraste arquivos para cá ou use Enviar arquivos. Botão direito nesta área para criar pasta (é
                            preciso estar <strong>dentro</strong> de uma pasta para subpastas).
                          </Typography>
                        ) : filesViewMode === 'grid' ? (
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
                              gap: 1,
                            }}
                          >
                            {visibleFolders.map((folder) => (
                              <Card
                                key={folder._id}
                                data-folder-card
                                variant="outlined"
                                sx={{ position: 'relative' }}
                                onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                              >
                                <Tooltip title="Mais ações">
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 4,
                                      zIndex: 2,
                                      bgcolor: 'background.paper',
                                      boxShadow: 1,
                                      '&:hover': { bgcolor: 'background.paper' },
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setMenuState({ type: 'icon', anchorEl: e.currentTarget, folder });
                                    }}
                                  >
                                    <Iconify icon="eva:more-vertical-fill" width={18} />
                                  </IconButton>
                                </Tooltip>
                                <CardActionArea onClick={() => setCurrentFolderId(folder._id)} sx={{ p: 1.5, pr: 5 }}>
                                  <Stack direction="row" alignItems="center" spacing={1.2}>
                                    <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.dark' }}>
                                      <Iconify icon="solar:folder-with-files-bold-duotone" width={20} />
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography variant="subtitle2" noWrap>
                                        {folder.nome}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Abrir pasta
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </CardActionArea>
                              </Card>
                            ))}
                            {files.map((file) => (
                              <Card
                                key={file._id}
                                data-file-card
                                variant="outlined"
                                sx={{
                                  p: 1,
                                  position: 'relative',
                                  pr: 4.5,
                                  ...(selectedFileIds.includes(file._id)
                                    ? { boxShadow: (t) => `0 0 0 2px ${t.palette.primary.main}` }
                                    : {}),
                                }}
                                onContextMenu={(e) => handleFileContextMenu(e, file)}
                              >
                                <Checkbox
                                  size="small"
                                  checked={selectedFileIds.includes(file._id)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFileSelected(file._id);
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    top: 2,
                                    left: 2,
                                    zIndex: 3,
                                    p: 0.25,
                                    bgcolor: 'background.paper',
                                    borderRadius: 0.5,
                                    boxShadow: 1,
                                  }}
                                />
                                <Tooltip title="Mais ações">
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 4,
                                      zIndex: 2,
                                      bgcolor: 'background.paper',
                                      boxShadow: 1,
                                      '&:hover': { bgcolor: 'background.paper' },
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setFileMenuState({ type: 'icon', anchorEl: e.currentTarget, file });
                                    }}
                                  >
                                    <Iconify icon="eva:more-vertical-fill" width={18} />
                                  </IconButton>
                                </Tooltip>
                                <Stack spacing={0.8} sx={{ pl: 3 }}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.lighter', color: 'primary.main' }}>
                                      <Iconify icon="solar:file-text-bold-duotone" width={16} />
                                    </Avatar>
                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0 }}>
                                      {file.tipoGuia || 'Arquivo'}
                                    </Typography>
                                  </Stack>
                                  <Typography variant="body2" fontWeight={600} noWrap>
                                    {file.nomeArquivo || 'Documento'}
                                  </Typography>
                                  <FileMetaLines file={file} />
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    columnGap={1}
                                    rowGap={0.5}
                                    flexWrap="wrap"
                                  >
                                    <Stack direction="row" spacing={0.6}>
                                      <Button
                                        size="small"
                                        sx={{ minWidth: 0, px: 1 }}
                                        onClick={() => router.push(paths.dashboard.guiasFiscais.details(file._id))}
                                      >
                                        Ver
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        sx={{ minWidth: 0, px: 1 }}
                                        onClick={() => downloadGuiaFiscal(file._id, file.nomeArquivo)}
                                      >
                                        Baixar
                                      </Button>
                                    </Stack>
                                    <GuiaFiscalPortalReadEye guia={file} showInlineSummary iconWidth={20} />
                                  </Stack>
                                </Stack>
                              </Card>
                            ))}
                          </Box>
                        ) : (
                          <Stack spacing={1}>
                            {visibleFolders.map((folder) => (
                              <Card
                                key={`list-${folder._id}`}
                                data-folder-card
                                variant="outlined"
                                sx={{ p: 1, position: 'relative', pr: 5 }}
                                onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                              >
                                <Tooltip title="Mais ações">
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 6,
                                      right: 6,
                                      zIndex: 2,
                                      bgcolor: 'background.paper',
                                      boxShadow: 1,
                                      '&:hover': { bgcolor: 'background.paper' },
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setMenuState({ type: 'icon', anchorEl: e.currentTarget, folder });
                                    }}
                                  >
                                    <Iconify icon="eva:more-vertical-fill" width={18} />
                                  </IconButton>
                                </Tooltip>
                                <Stack direction="row" alignItems="center" spacing={1.2}>
                                  <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.dark', width: 30, height: 30 }}>
                                    <Iconify icon="solar:folder-with-files-bold-duotone" width={18} />
                                  </Avatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={600} noWrap>
                                      {folder.nome}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Pasta
                                    </Typography>
                                  </Box>
                                  <Button size="small" variant="outlined" onClick={() => setCurrentFolderId(folder._id)}>
                                    Abrir
                                  </Button>
                                </Stack>
                              </Card>
                            ))}
                            {files.map((file) => (
                              <Card
                                key={file._id}
                                data-file-card
                                variant="outlined"
                                sx={{
                                  p: 1,
                                  position: 'relative',
                                  pr: 5,
                                  ...(selectedFileIds.includes(file._id)
                                    ? { boxShadow: (t) => `0 0 0 2px ${t.palette.primary.main}` }
                                    : {}),
                                }}
                                onContextMenu={(e) => handleFileContextMenu(e, file)}
                              >
                                <Tooltip title="Mais ações">
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 6,
                                      right: 6,
                                      zIndex: 2,
                                      bgcolor: 'background.paper',
                                      boxShadow: 1,
                                      '&:hover': { bgcolor: 'background.paper' },
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setFileMenuState({ type: 'icon', anchorEl: e.currentTarget, file });
                                    }}
                                  >
                                    <Iconify icon="eva:more-vertical-fill" width={18} />
                                  </IconButton>
                                </Tooltip>
                                <Stack direction="row" alignItems="flex-start" spacing={1}>
                                  <Checkbox
                                    size="small"
                                    checked={selectedFileIds.includes(file._id)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFileSelected(file._id);
                                    }}
                                    sx={{ p: 0.25, mt: 0.25 }}
                                  />
                                  <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.lighter', color: 'primary.main', mt: 0.25 }}>
                                    <Iconify icon="solar:file-text-bold-duotone" width={16} />
                                  </Avatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={600} noWrap sx={{ minWidth: 0 }}>
                                      {file.nomeArquivo || 'Documento'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {file.tipoGuia || 'Arquivo'}
                                    </Typography>
                                    <FileMetaLines file={file} />
                                  </Box>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.8}
                                    sx={{ flexShrink: 0, pt: 0.25 }}
                                  >
                                    <Button size="small" onClick={() => router.push(paths.dashboard.guiasFiscais.details(file._id))}>
                                      Ver
                                    </Button>
                                    <Button size="small" variant="outlined" onClick={() => downloadGuiaFiscal(file._id, file.nomeArquivo)}>
                                      Baixar
                                    </Button>
                                    <GuiaFiscalPortalReadEye guia={file} showInlineSummary iconWidth={20} />
                                  </Stack>
                                </Stack>
                              </Card>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    </Box>
                  </>
                )}
              </Stack>
              {(isDragOver || uploading) && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 3,
                    bgcolor: 'rgba(20, 20, 20, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                  }}
                >
                  <Stack spacing={1.2} alignItems="center" sx={{ color: 'common.white' }}>
                    {uploading ? (
                      <CircularProgress size={28} color="inherit" />
                    ) : (
                      <Iconify icon="solar:cloud-upload-bold-duotone" width={34} />
                    )}
                    <Typography variant="subtitle2" align="center">
                      {uploading
                        ? uploadProgress
                          ? `Enviando ${uploadProgress.current} de ${uploadProgress.total}…`
                          : 'Enviando arquivos…'
                        : 'Solte os arquivos para enviar para a pasta atual'}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Card>
          )}
        </Stack>

        <Menu
          open={Boolean(menuState)}
          onClose={closeMenu}
          anchorReference={menuState?.type === 'context' ? 'anchorPosition' : 'anchorEl'}
          anchorPosition={
            menuState?.type === 'context'
              ? { top: menuState.mouseY, left: menuState.mouseX }
              : undefined
          }
          anchorEl={menuState?.type === 'icon' ? menuState.anchorEl : undefined}
          MenuListProps={{ onContextMenu: (e) => e.preventDefault() }}
        >
          {renderFolderMenuItems()}
        </Menu>

        <ConfirmDialog
          maxWidth="sm"
          open={createOpen}
          onClose={() => !creating && setCreateOpen(false)}
          title="Nova pasta"
          content={
            <Stack spacing={2} sx={{ mt: 1, width: '100%' }}>
              <TextField label="Nome exibido" value={novaSubpastaNome} onChange={(e) => handleNomeSubpastaChange(e.target.value)} fullWidth />
              <TextField
                label="Slug (identificador)"
                value={novaSubpastaSlug}
                onChange={(e) => setNovaSubpastaSlug(e.target.value.toLowerCase())}
                helperText="Ex.: relatorios-mensais, 2025"
                fullWidth
              />
            </Stack>
          }
          action={
            <Button variant="contained" onClick={handleConfirmCreate} disabled={creating}>
              {creating ? 'Salvando…' : 'Criar'}
            </Button>
          }
        />

        <ConfirmDialog
          open={deleteOpen}
          onClose={() => !deleting && setDeleteOpen(false)}
          title="Excluir pasta"
          content={
            <>
              Excluir a pasta <strong>{folderToDelete?.nome}</strong>? Só é permitido se estiver vazia (sem subpastas e sem documentos, conforme a
              API).
            </>
          }
          action={
            <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? 'Excluindo…' : 'Excluir'}
            </Button>
          }
        />

        <Menu
          open={Boolean(fileMenuState)}
          onClose={closeFileMenu}
          anchorReference={fileMenuState?.type === 'context' ? 'anchorPosition' : 'anchorEl'}
          anchorPosition={
            fileMenuState?.type === 'context'
              ? { top: fileMenuState.mouseY, left: fileMenuState.mouseX }
              : undefined
          }
          anchorEl={fileMenuState?.type === 'icon' ? fileMenuState.anchorEl : undefined}
          MenuListProps={{ onContextMenu: (e) => e.preventDefault() }}
        >
          <MenuItem
            onClick={() => {
              const f = fileMenuState?.file;
              if (f) router.push(paths.dashboard.guiasFiscais.details(f._id));
              closeFileMenu();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:eye-bold" width={20} />
            </ListItemIcon>
            <ListItemText primary="Ver detalhes" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              const f = fileMenuState?.file;
              if (f) downloadGuiaFiscal(f._id, f.nomeArquivo);
              closeFileMenu();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:download-bold" width={20} />
            </ListItemIcon>
            <ListItemText primary="Baixar" />
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              if (fileMenuState?.file) openDeleteFileDialog(fileMenuState.file);
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:trash-bin-trash-bold" width={20} sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary="Excluir documento" primaryTypographyProps={{ color: 'error' }} />
          </MenuItem>
        </Menu>

        <ConfirmDialog
          open={deleteFileOpen}
          onClose={() => !deletingFile && setDeleteFileOpen(false)}
          title="Excluir documento"
          content={
            <>
              Excluir <strong>{fileToDelete?.nomeArquivo || 'este documento'}</strong>? Esta ação não pode ser desfeita.
            </>
          }
          action={
            <Button variant="contained" color="error" onClick={handleConfirmDeleteFile} disabled={deletingFile}>
              {deletingFile ? 'Excluindo…' : 'Excluir'}
            </Button>
          }
        />

        <ConfirmDialog
          maxWidth="sm"
          open={bulkDeleteOpen}
          onClose={() => {
            if (!deletingBulk) {
              setBulkDeleteOpen(false);
              setFilesBulkDelete([]);
            }
          }}
          title="Excluir documentos em massa"
          content={
            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
              <Typography variant="body2">
                Excluir <strong>{filesBulkDelete.length}</strong> documento(s)? Esta ação não pode ser desfeita.
              </Typography>
              <Box
                sx={{
                  maxHeight: 220,
                  overflow: 'auto',
                  bgcolor: 'background.neutral',
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                {filesBulkDelete.map((f) => (
                  <Typography key={f._id} variant="body2" color="text.secondary" sx={{ py: 0.25 }} noWrap>
                    {f.nomeArquivo || f._id}
                  </Typography>
                ))}
              </Box>
            </Stack>
          }
          action={
            <Button variant="contained" color="error" onClick={handleConfirmBulkDelete} disabled={deletingBulk}>
              {deletingBulk ? 'Excluindo…' : `Excluir ${filesBulkDelete.length}`}
            </Button>
          }
        />

        <GuiaFiscalPastaUploadDialog
          open={pastaUploadOpen}
          onClose={() => {
            if (!uploading) {
              setPastaUploadOpen(false);
              setPastaUploadFiles([]);
            }
          }}
          files={pastaUploadFiles}
          pastaNome={pastaSelecionadaNome}
          uploading={uploading}
          uploadProgress={uploadProgress}
          onConfirm={handleConfirmPastaUpload}
        />
      </Box>
    </DashboardContent>
  );
}
