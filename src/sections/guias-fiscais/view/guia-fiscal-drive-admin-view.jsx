'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

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
  moveGuiaParaPastaAdmin,
  createSubpastaGuiasAdmin,
} from 'src/actions/guias-fiscais';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { GuiaFiscalMovePastaDialog } from '../components/guia-fiscal-move-pasta-dialog';
import { GuiaFiscalPastaUploadDialog } from '../components/guia-fiscal-pasta-upload-dialog';
import { GuiaFiscalDriveAdminToolbar } from '../components/guia-fiscal-drive-admin-toolbar';
import { getCompetencia, SLUG_PASTA_REGEX, findPastaNodeById, formatCompetencia, suggestSlugFromNome } from '../utils';
import {
  DriveFileCardGrid,
  DriveFileCardList,
  DriveEmptyDropZone,
  DriveFolderCardGrid,
  DriveFolderStripCard,
} from '../components/guia-fiscal-drive-admin-cards';
import {
  DRIVE_SHADOW_SOFT,
  DRIVE_BORDER_COLOR,
  DRIVE_FILE_GRID_SX,
  DRIVE_SURFACE_RADIUS,
  DRIVE_SECTION_TITLE_SX,
  DRIVE_FOLDER_GRID_AUTO_SX,
} from '../guia-drive-file-visual';

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

  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [guiaIdsToMove, setGuiaIdsToMove] = useState([]);
  const [movingGuias, setMovingGuias] = useState(false);

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

  const mainFolders = useMemo(() => folders || [], [folders]);

  const visibleSubfolders = useMemo(() => {
    if (!currentFolderId) return [];
    return findPastaNodeById(folders, currentFolderId)?.children || [];
  }, [folders, currentFolderId]);

  const files = useMemo(() => {
    if (!Array.isArray(data?.guias)) return [];
    // Na raiz do drive, exibir apenas documentos novos que ainda não foram vistos no portal.
    if (!currentFolderId) {
      return [];
    }
    return data.guias;
  }, [data?.guias, currentFolderId]);

  const hasFolderOrFiles =
    (!currentFolderId && mainFolders.length > 0) ||
    visibleSubfolders.length > 0 ||
    files.length > 0;

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

  const openMoveDialogFromFileMenu = useCallback(
    (file) => {
      if (!file?._id || !clienteId) return;
      setGuiaIdsToMove([file._id]);
      setMoveDialogOpen(true);
      closeFileMenu();
    },
    [clienteId, closeFileMenu]
  );

  const openBulkMoveDialog = useCallback(() => {
    const ids = selectedFileIds.filter(Boolean);
    if (!ids.length || !clienteId) return;
    setGuiaIdsToMove(ids);
    setMoveDialogOpen(true);
  }, [selectedFileIds, clienteId]);

  const handleConfirmMoveGuias = useCallback(
    async (folderIdDestino) => {
      if (!folderIdDestino || !guiaIdsToMove.length) return;
      if (currentFolderId && folderIdDestino === currentFolderId) {
        toast.error('Selecione uma pasta diferente da pasta em que você está.');
        return;
      }
      setMovingGuias(true);
      let ok = 0;
      let fail = 0;
      try {
        await guiaIdsToMove.reduce(
          (promiseChain, guiaId) =>
            promiseChain.then(async () => {
              try {
                const res = await moveGuiaParaPastaAdmin(guiaId, folderIdDestino);
                if (res.success !== false) {
                  ok += 1;
                } else {
                  fail += 1;
                  toast.error(res.message || 'Não foi possível mover um dos documentos.');
                }
              } catch (err) {
                fail += 1;
                toast.error(apiErrMsg(err) || 'Erro ao mover documento.');
              }
            }),
          Promise.resolve()
        );
        setMoveDialogOpen(false);
        setGuiaIdsToMove([]);
        setSelectedFileIds([]);
        await mutateFiles();
        await mutateFolders();
        if (ok && !fail) {
          toast.success(ok > 1 ? `${ok} documentos movidos.` : 'Documento movido.');
        } else if (ok && fail) {
          toast.warning(`${ok} movido(s), ${fail} com erro.`);
        } else if (fail) {
          toast.error('Não foi possível mover os documentos.');
        }
      } finally {
        setMovingGuias(false);
      }
    },
    [guiaIdsToMove, currentFolderId, mutateFiles, mutateFolders]
  );

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

  const handleGoBack = useCallback(() => {
    if (!currentFolderId) return;
    const parent = findParentFolderId(folders, currentFolderId);
    setCurrentFolderId(parent !== undefined ? parent : null);
  }, [folders, currentFolderId]);

  const handleTriggerUpload = useCallback(() => {
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
  }, [queuePastaUploadFiles]);

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
        [
          <MenuItem
            key="open"
            onClick={() => {
              setCurrentFolderId(folder._id);
              closeMenu();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:folder-open-bold-duotone" width={20} />
            </ListItemIcon>
            <ListItemText primary="Abrir" secondary="Entrar nesta pasta" />
          </MenuItem>,

          <MenuItem key="create" onClick={() => openCreateDialog(folder._id)}>
            <ListItemIcon>
              <Iconify icon="solar:add-folder-bold" width={20} />
            </ListItemIcon>
            <ListItemText primary="Nova subpasta" />
          </MenuItem>,

          <Divider key="divider" sx={{ my: 0.5 }} />,

          <MenuItem key="delete" disabled={!podeExcluir} onClick={() => podeExcluir && openDeleteDialog(folder)}>
            <ListItemIcon>
              <Iconify icon="solar:trash-bin-trash-bold" width={20} sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary="Excluir pasta" primaryTypographyProps={{ color: 'error' }} />
          </MenuItem>
        ]
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

  const breadcrumbLinks = useMemo(() => {
    const links = [
      { name: 'Dashboard', href: paths.dashboard.root },
      { name: 'Documentos', href: paths.dashboard.guiasEDocumentos.list },
    ];
    if (selectedCliente) {
      links.push({ name: getClienteLabel(selectedCliente) });
    }
    folderPath.forEach((folder) => {
      links.push({ name: folder.nome });
    });
    return links;
  }, [selectedCliente, folderPath]);

  return (
    <DashboardContent maxWidth sx={{ py: 2 }}>
      <Box sx={{ width: '100%' }}>
        <CustomBreadcrumbs heading="Documentos e Guias" links={breadcrumbLinks} sx={{ mb: 2 }} />

        <Stack spacing={2.5}>
          <Card
            variant="outlined"
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: DRIVE_SURFACE_RADIUS,
              border: `1px solid ${DRIVE_BORDER_COLOR}`,
              boxShadow: DRIVE_SHADOW_SOFT,
              bgcolor: 'background.paper',
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                  }}
                >
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={28} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1, pt: 0.25 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.02em', mb: 0.25 }}>
                    Cliente Ativo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Altere o cliente para atualizar pastas, documentos e uploads do drive.
                  </Typography>
                </Box>
              </Stack>
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
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Selecionar cliente"
                    placeholder="Busque por código ou razão social..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: DRIVE_SURFACE_RADIUS,
                        bgcolor: 'background.paper',
                        fontSize: '0.9375rem',
                      },
                    }}
                  />
                )}
              />
            </Stack>
          </Card>

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
                borderRadius: DRIVE_SURFACE_RADIUS,
                position: 'relative',
                bgcolor: 'background.paper',
                transition: (theme) =>
                  theme.transitions.create(['border-color', 'box-shadow'], { duration: theme.transitions.duration.shorter }),
                border: (theme) =>
                  isDragOver
                    ? `2px dashed ${theme.palette.primary.main}`
                    : `1px solid ${DRIVE_BORDER_COLOR}`,
                boxShadow: isDragOver
                  ? (theme) => `0 0 0 4px ${theme.palette.primary.lighter}`
                  : '0 1px 3px rgba(15, 23, 42, 0.06)',
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
                    <GuiaFiscalDriveAdminToolbar
                      canGoBack={Boolean(currentFolderId)}
                      onGoBack={handleGoBack}
                      onNavigateRoot={() => setCurrentFolderId(null)}
                      folderPath={folderPath}
                      onNavigateFolder={setCurrentFolderId}
                      onUpload={handleTriggerUpload}
                      uploadDisabled={!currentFolderId || uploading}
                      filesViewMode={filesViewMode}
                      onFilesViewModeChange={setFilesViewMode}
                    />

                    <Box onContextMenu={handleDriveSurfaceContextMenu} sx={{ pt: 2 }}>
                      {showFilesLoadingPlaceholder ? (
                        <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
                          <CircularProgress size={24} />
                          <Typography variant="body2" color="text.secondary">
                            Carregando documentos...
                          </Typography>
                        </Stack>
                      ) : (
                        <Stack spacing={3}>
                          {!currentFolderId ? (
                            <Box>
                              <Typography sx={{ ...DRIVE_SECTION_TITLE_SX, mb: 1.5 }}>
                                Pastas principais
                              </Typography>
                              {mainFolders.length ? (
                                <Box sx={DRIVE_FOLDER_GRID_AUTO_SX}>
                                  {mainFolders.map((folder) => (
                                    <DriveFolderCardGrid
                                      key={folder._id}
                                      folder={folder}
                                      onOpen={() => setCurrentFolderId(folder._id)}
                                      onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                                      onMoreClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setMenuState({ type: 'icon', anchorEl: e.currentTarget, folder });
                                      }}
                                    />
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>
                                  Nenhuma pasta principal disponível.
                                </Typography>
                              )}
                            </Box>
                          ) : null}

                          {currentFolderId ? (
                            <Box>
                              <Typography sx={{ ...DRIVE_SECTION_TITLE_SX, mb: 1.5 }}>
                                Subpastas
                              </Typography>
                              {visibleSubfolders.length ? (
                                <Box sx={DRIVE_FOLDER_GRID_AUTO_SX}>
                                  {visibleSubfolders.map((folder) => (
                                    <DriveFolderStripCard
                                      key={folder._id}
                                      folder={folder}
                                      onOpen={() => setCurrentFolderId(folder._id)}
                                      onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                                      onMoreClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setMenuState({ type: 'icon', anchorEl: e.currentTarget, folder });
                                      }}
                                    />
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>
                                  Nenhuma subpasta neste nível.
                                </Typography>
                              )}
                            </Box>
                          ) : null}

                          <Box sx={{ mt: 0, pt: 0 }} onContextMenu={handleDriveSurfaceContextMenu}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              spacing={1}
                              flexWrap="wrap"
                              useFlexGap
                              sx={{ mb: 2 }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                                <Typography sx={DRIVE_SECTION_TITLE_SX}>
                                  Arquivos
                                </Typography>
                                {loadingFiles ? <CircularProgress size={16} /> : null}
                              </Stack>

                              {files.length > 0 ? (
                                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
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
                                    Limpar
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="soft"
                                    color="primary"
                                    disabled={!selectedFileIds.length}
                                    startIcon={<Iconify icon="solar:transfer-horizontal-bold" width={18} />}
                                    onClick={openBulkMoveDialog}
                                  >
                                    Mover ({selectedFileIds.length})
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
                                </Stack>
                              ) : null}
                            </Stack>

                            {files.length ? (
                              filesViewMode === 'grid' ? (
                                <Box sx={DRIVE_FILE_GRID_SX}>
                                  {files.map((file) => (
                                    <DriveFileCardGrid
                                      key={file._id}
                                      file={file}
                                      selected={selectedFileIds.includes(file._id)}
                                      fileMetaLines={<FileMetaLines file={file} />}
                                      onToggleSelect={() => toggleFileSelected(file._id)}
                                      onContextMenu={(e) => handleFileContextMenu(e, file)}
                                      onMoreClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setFileMenuState({ type: 'icon', anchorEl: e.currentTarget, file });
                                      }}
                                      onDownload={() => downloadGuiaFiscal(file._id, file.nomeArquivo)}
                                    />
                                  ))}
                                </Box>
                              ) : (
                                <Stack spacing={1}>
                                  {files.map((file) => (
                                    <DriveFileCardList
                                      key={file._id}
                                      file={file}
                                      selected={selectedFileIds.includes(file._id)}
                                      fileMetaLines={<FileMetaLines file={file} />}
                                      onToggleSelect={() => toggleFileSelected(file._id)}
                                      onContextMenu={(e) => handleFileContextMenu(e, file)}
                                      onMoreClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setFileMenuState({ type: 'icon', anchorEl: e.currentTarget, file });
                                      }}
                                      onDownload={() => downloadGuiaFiscal(file._id, file.nomeArquivo)}
                                    />
                                  ))}
                                </Stack>
                              )
                            ) : currentFolderId ? (
                              <DriveEmptyDropZone
                                onUpload={handleTriggerUpload}
                                uploadDisabled={uploading}
                                hint="Solte PDFs ou planilhas nesta pasta. Você também pode usar o botão Enviar arquivos acima."
                              />
                            ) : (
                              <Stack
                                alignItems="center"
                                justifyContent="center"
                                spacing={3}
                                sx={{
                                  py: 8,
                                  px: 3,
                                  borderRadius: DRIVE_SURFACE_RADIUS,
                                  border: (theme) => `1px solid ${theme.palette.divider}`,
                                  bgcolor: (theme) => theme.palette.mode === 'light' ? '#F4F6F8' : 'background.neutral',
                                  textAlign: 'center',
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: (theme) => theme.palette.action.hover,
                                    color: 'text.disabled',
                                  }}
                                >
                                  <Iconify icon="solar:file-bold" width={48} />
                                </Box>

                                <Stack spacing={1} alignItems="center">
                                  <Typography variant="h6" color="text.secondary">
                                    Área da Raiz
                                  </Typography>
                                  <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 400 }}>
                                    Não é possível adicionar arquivos diretamente aqui.
                                    Navegue entre as pastas principais e as subpastas para encontrar e fazer upload de novos arquivos.
                                  </Typography>
                                </Stack>
                              </Stack>
                            )}

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                              {currentFolderId
                                ? 'Arraste arquivos para esta área ou use Enviar arquivos. Botão direito para criar subpasta ou ações nos itens.'
                                : ''}
                            </Typography>
                          </Box>
                        </Stack>
                      )}
                    </Box>
                  </>
                )}
              </Stack>
              {(isDragOver || uploading) && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: DRIVE_SURFACE_RADIUS,
                    bgcolor: (theme) => theme.palette.primary.light,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    backdropFilter: 'blur(2px)',
                  }}
                >
                  <Stack
                    spacing={1.2}
                    alignItems="center"
                    sx={{
                      px: 3,
                      py: 2,
                      borderRadius: DRIVE_SURFACE_RADIUS,
                      bgcolor: 'background.paper',
                      boxShadow: (theme) => theme.shadows[8],
                    }}
                  >
                    {uploading ? (
                      <CircularProgress size={28} color="primary" />
                    ) : (
                      <Iconify icon="solar:cloud-upload-bold-duotone" width={36} sx={{ color: 'primary.main' }} />
                    )}
                    <Typography variant="subtitle2" align="center" color="text.primary">
                      {uploading
                        ? uploadProgress
                          ? `Enviando ${uploadProgress.current} de ${uploadProgress.total}…`
                          : 'Enviando arquivos…'
                        : 'Solte os arquivos na pasta atual'}
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
              if (f) router.push(paths.dashboard.guiasEDocumentos.details(f._id));
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
          <MenuItem
            disabled={!clienteId}
            onClick={() => {
              const f = fileMenuState?.file;
              if (f) openMoveDialogFromFileMenu(f);
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:transfer-horizontal-bold" width={20} />
            </ListItemIcon>
            <ListItemText primary="Mover para pasta" />
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

        <GuiaFiscalMovePastaDialog
          open={moveDialogOpen}
          onClose={() => {
            if (!movingGuias) {
              setMoveDialogOpen(false);
              setGuiaIdsToMove([]);
            }
          }}
          title={
            guiaIdsToMove.length > 1 ? `Mover ${guiaIdsToMove.length} documentos` : 'Mover para pasta'
          }
          folders={folders}
          loading={movingGuias}
          onConfirm={handleConfirmMoveGuias}
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
    </DashboardContent >
  );
}
