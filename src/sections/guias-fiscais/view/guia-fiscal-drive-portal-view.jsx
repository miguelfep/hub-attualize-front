'use client';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import CardActionArea from '@mui/material/CardActionArea';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { downloadGuiaFiscalPortal } from 'src/utils/portal-guia-download';

import {
  uploadParaPastaPortal,
  useGetPastasGuiasPortal,
  useGetGuiasFiscaisPortal,
} from 'src/actions/cliente-portal-guias-api';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { isDocumentoNovoParaClientePortal } from '../guia-documento-visualizacao';

// ----------------------------------------------------------------------

function findFolderById(nodes, id) {
  if (!id || !nodes?.length) return null;
  const queue = [...nodes];
  while (queue.length) {
    const current = queue.shift();
    if (current._id === id) return current;
    if (current.children?.length) queue.push(...current.children);
  }
  return null;
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

function apiErr(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.message || err.error || 'Erro na operação';
}

export function GuiaFiscalDrivePortalView() {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filesViewMode, setFilesViewMode] = useState('grid');

  const { folders, isLoading: loadingFolders, mutate: mutateFolders } = useGetPastasGuiasPortal();
  const { data, isLoading: loadingFiles, mutate: mutateFiles } = useGetGuiasFiscaisPortal({
    folderId: currentFolderId || undefined,
    page: 1,
    limit: 200,
  });

  const folderPath = useMemo(
    () => (currentFolderId ? findFolderPath(folders, currentFolderId) || [] : []),
    [folders, currentFolderId]
  );

  const visibleFolders = useMemo(() => {
    if (!currentFolderId) return folders || [];
    return findFolderById(folders, currentFolderId)?.children || [];
  }, [folders, currentFolderId]);

  const rawGuias = useMemo(() => Array.isArray(data?.guias) ? data.guias : [], [data?.guias]);

  const files = useMemo(() => {
    // Na raiz: só documentos novos ou ainda não lidos no portal; dentro da pasta: todos.
    if (!currentFolderId) {
      return rawGuias.filter((guia) => isDocumentoNovoParaClientePortal(guia));
    }
    return rawGuias;
  }, [rawGuias, currentFolderId]);

  const openFolder = useCallback((id) => setCurrentFolderId(id), []);

  const handleDownload = useCallback(async (id, nomeArquivo) => {
    try {
      await downloadGuiaFiscalPortal(id, nomeArquivo);
    } catch (error) {
      toast.error(apiErr(error));
    }
  }, []);

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
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer?.files || []);
      if (!droppedFiles.length) return;

      if (!currentFolderId) {
        toast.error('Abra uma pasta para enviar os arquivos.');
        return;
      }

      try {
        setUploading(true);
        const res = await uploadParaPastaPortal(currentFolderId, droppedFiles);
        if (res?.success === false) {
          toast.error(res.message || 'Falha ao enviar arquivos.');
          return;
        }
        toast.success(res?.message || `${droppedFiles.length} arquivo(s) enviado(s) com sucesso.`);
        await Promise.all([mutateFiles(), mutateFolders()]);
      } catch (error) {
        toast.error(apiErr(error));
      } finally {
        setUploading(false);
      }
    },
    [currentFolderId, mutateFiles, mutateFolders]
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
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
          <Box>
            <Typography variant="h4">Meus Documentos</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Navegue pelas pastas e acesse os arquivos em um layout centralizado.
            </Typography>
          </Box>

          <Divider />

          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Button size="small" variant={!currentFolderId ? 'contained' : 'outlined'} onClick={() => setCurrentFolderId(null)}>
              Meu Drive
            </Button>
            {folderPath.map((folder) => (
              <Button key={folder._id} size="small" variant="text" onClick={() => setCurrentFolderId(folder._id)}>
                / {folder.nome}
              </Button>
            ))}
          </Stack>

          {loadingFolders || loadingFiles ? (
            <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Carregando conteúdos...
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 1.5 }}
                >
                  <Iconify icon="solar:folder-open-bold-duotone" width={22} sx={{ color: 'warning.main' }} />
                  <Typography variant="subtitle1" component="span">
                    Pastas
                  </Typography>
                  <Divider orientation="vertical" flexItem sx={{ height: 18, alignSelf: 'center', borderStyle: 'dashed' }} />
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                      <Box component="span" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}>
                        {visibleFolders.length}
                      </Box>
                      {visibleFolders.length === 1 ? 'pasta' : 'pastas'}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" aria-hidden>
                      ·
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                      <Box component="span" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}>
                        {rawGuias.length}
                      </Box>
                      {rawGuias.length === 1 ? 'arquivo' : 'arquivos'}
                    </Typography>
                  </Stack>
                </Stack>
                {visibleFolders.length ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                      gap: 1.5,
                    }}
                  >
                    {visibleFolders.map((folder) => (
                      <Card key={folder._id} variant="outlined">
                        <CardActionArea onClick={() => openFolder(folder._id)} sx={{ p: 1.5 }}>
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
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma subpasta neste nível.
                  </Typography>
                )}
              </Box>

              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:documents-bold-duotone" width={22} sx={{ color: 'primary.main' }} />
                    <Typography variant="subtitle1">Últimos Arquivos</Typography>
                  </Stack>
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
                </Stack>
                {files.length ? (
                  filesViewMode === 'grid' ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
                        gap: 1,
                      }}
                    >
                      {files.map((file) => (
                        <Card key={file._id} variant="outlined" sx={{ p: 1 }}>
                          <Stack spacing={0.8}>
                            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                              <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.lighter', color: 'primary.main' }}>
                                <Iconify icon="solar:file-text-bold-duotone" width={16} />
                              </Avatar>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0 }}>
                                {file.tipoGuia || 'Arquivo'}
                              </Typography>
                              {isDocumentoNovoParaClientePortal(file) && (
                                <Chip label="Novo" color="info" size="small" variant="soft" sx={{ height: 22 }} />
                              )}
                            </Stack>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {file.nomeArquivo || 'Documento'}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{ minWidth: 0, px: 1, alignSelf: 'flex-start' }}
                              onClick={() => handleDownload(file._id, file.nomeArquivo)}
                            >
                              Baixar
                            </Button>
                          </Stack>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {files.map((file) => (
                        <Card key={file._id} variant="outlined" sx={{ p: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1.2}>
                            <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.lighter', color: 'primary.main' }}>
                              <Iconify icon="solar:file-text-bold-duotone" width={16} />
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1, minWidth: 0 }}>
                                  {file.nomeArquivo || 'Documento'}
                                </Typography>
                                {isDocumentoNovoParaClientePortal(file) && (
                                  <Chip label="Novo" color="info" size="small" variant="soft" sx={{ height: 22, flexShrink: 0 }} />
                                )}
                              </Stack>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {file.tipoGuia || 'Arquivo'}
                              </Typography>
                            </Box>
                            <Button size="small" variant="outlined" onClick={() => handleDownload(file._id, file.nomeArquivo)}>
                              Baixar
                            </Button>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Você não possui arquivos novos. Acesse seus documentos e guias pelo menu superior ou aguarde um novo envio
                    pela equipe.
                  </Typography>
                )}
              </Box>
            </Stack>
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
              {uploading ? <CircularProgress size={28} color="inherit" /> : <Iconify icon="solar:cloud-upload-bold-duotone" width={34} />}
              <Typography variant="subtitle2">
                {uploading ? 'Enviando arquivos...' : 'Solte os arquivos para enviar para a pasta atual'}
              </Typography>
            </Stack>
          </Box>
        )}
      </Card>
    </Box>
  );
}
