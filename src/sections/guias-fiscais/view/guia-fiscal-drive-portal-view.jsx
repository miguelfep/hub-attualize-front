'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';
import {
  downloadGuiaFiscalPortal,
  visualizarGuiaFiscalPortal,
  isGuiaVisualizavelNoNavegador,
} from 'src/utils/portal-guia-download';

import { getStatusEmissaoDas } from 'src/actions/serpro-portal';
import {
  useGetPastasGuiasPortal,
  useGetGuiasFiscaisPortal,
  revalidarCachesListagemGuiasPortal,
} from 'src/actions/cliente-portal-guias-api';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { isDocumentoNovoParaClientePortal } from '../guia-documento-visualizacao';
import { GuiaFiscalDrivePortalToolbar } from '../components/guia-fiscal-drive-portal-toolbar';
import { GuiaFiscalEmitirDasPortalDialog } from '../components/guia-fiscal-emitir-das-portal-dialog';
import { getCompetencia, findPastaNodeById, formatCompetencia, resolveNomeDownloadGuia } from '../utils';
import {
  DRIVE_SHADOW_SOFT,
  DRIVE_BORDER_COLOR,
  DRIVE_FILE_GRID_SX,
  DRIVE_SURFACE_RADIUS,
  DRIVE_SECTION_TITLE_SX,
  DRIVE_FOLDER_GRID_AUTO_SX,
} from '../guia-drive-file-visual';
import {
  DriveRootEmptyZone,
  DriveFolderCardGrid,
  DriveFolderStripCard,
  DriveFolderEmptyPortal,
  DriveFileCardGridPortal,
  DriveFileCardListPortal,
} from '../components/guia-fiscal-drive-admin-cards';

// ----------------------------------------------------------------------

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

function apiErr(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.message || err.error || 'Erro na operação';
}

function FileMetaLines({ file }) {
  const comp = getCompetencia(file);
  const showVenc = Boolean(file?.dataVencimento);
  if (!comp && !showVenc && !file?.semArquivo) return null;
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
      {file?.semArquivo ? (
        <Typography variant="caption" color="warning.main" sx={{ lineHeight: 1.35 }} noWrap>
          Sem PDF (sincronizado via PGDAS)
        </Typography>
      ) : null}
    </Stack>
  );
}

export function GuiaFiscalDrivePortalView() {
  const theme = useTheme();
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [filesViewMode, setFilesViewMode] = useState('grid');

  const emitDas = useBoolean();
  const [statusEmissao, setStatusEmissao] = useState({ podeEmitir: true, motivo: '' });

  useEffect(() => {
    let cancelado = false;
    getStatusEmissaoDas()
      .then((result) => {
        if (!cancelado) setStatusEmissao(result);
      })
      .catch(() => {
        // best-effort: se falhar, botão fica habilitado (backend valida)
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const handleEmitSuccess = useCallback(() => {
    revalidarCachesListagemGuiasPortal();
    getStatusEmissaoDas()
      .then(setStatusEmissao)
      .catch(() => { });
  }, []);

  const { folders, isLoading: loadingFolders } = useGetPastasGuiasPortal();
  const { data, isLoading: loadingFiles } = useGetGuiasFiscaisPortal({
    folderId: currentFolderId || undefined,
    page: 1,
    limit: 200,
  });

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
    if (!currentFolderId) return [];
    return Array.isArray(data?.guias) ? data.guias : [];
  }, [data?.guias, currentFolderId]);

  const hasFolderOrFiles =
    (!currentFolderId && mainFolders.length > 0) ||
    visibleSubfolders.length > 0 ||
    files.length > 0;

  const showFilesLoadingPlaceholder = Boolean(loadingFiles && !hasFolderOrFiles);

  const handleGoBack = useCallback(() => {
    if (!currentFolderId) return;
    const parent = findParentFolderId(folders, currentFolderId);
    setCurrentFolderId(parent !== undefined ? parent : null);
  }, [folders, currentFolderId]);

  const handleDownload = useCallback(async (file) => {
    try {
      await downloadGuiaFiscalPortal(file._id, resolveNomeDownloadGuia(file));
    } catch (error) {
      toast.error(apiErr(error));
    }
  }, []);

  const handlePreview = useCallback(async (file) => {
    try {
      await visualizarGuiaFiscalPortal(file._id, resolveNomeDownloadGuia(file));
    } catch (error) {
      toast.error(apiErr(error));
    }
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Card sx={{ borderRadius: 3 }}>
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: '16px 16px 0 0',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            spacing={2}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Meus Documentos
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Navegue pelas pastas e acesse seus arquivos.
              </Typography>
            </Box>

            <Tooltip title={statusEmissao.podeEmitir ? '' : statusEmissao.motivo}>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Iconify icon="solar:document-add-bold-duotone" />}
                  onClick={emitDas.onTrue}
                  disabled={!statusEmissao.podeEmitir}
                >
                  Emitir 2ª Via
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Card
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: DRIVE_SURFACE_RADIUS,
              bgcolor: 'background.paper',
              border: `1px solid ${DRIVE_BORDER_COLOR}`,
              boxShadow: DRIVE_SHADOW_SOFT,
            }}
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
                  <GuiaFiscalDrivePortalToolbar
                    canGoBack={Boolean(currentFolderId)}
                    onGoBack={handleGoBack}
                    onNavigateRoot={() => setCurrentFolderId(null)}
                    folderPath={folderPath}
                    onNavigateFolder={setCurrentFolderId}
                    filesViewMode={filesViewMode}
                    onFilesViewModeChange={setFilesViewMode}
                  />

                  <Box sx={{ pt: 2 }}>
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
                                    hideActions
                                    onOpen={() => setCurrentFolderId(folder._id)}
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
                                    hideActions
                                    onOpen={() => setCurrentFolderId(folder._id)}
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

                        <Box>
                          {currentFolderId ? (
                            <>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                flexWrap="wrap"
                                useFlexGap
                                sx={{ mb: 2 }}
                              >
                                <Typography sx={DRIVE_SECTION_TITLE_SX}>Arquivos</Typography>
                                {loadingFiles ? <CircularProgress size={16} /> : null}
                              </Stack>

                              {files.length ? (
                                filesViewMode === 'grid' ? (
                                  <Box sx={DRIVE_FILE_GRID_SX}>
                                    {files.map((file) => (
                                      <DriveFileCardGridPortal
                                        key={file._id}
                                        file={file}
                                        fileMetaLines={<FileMetaLines file={file} />}
                                        isNovo={isDocumentoNovoParaClientePortal(file)}
                                        onDownload={
                                          file.semArquivo
                                            ? undefined
                                            : () => handleDownload(file)
                                        }
                                        onPreview={
                                          file.semArquivo ||
                                          !isGuiaVisualizavelNoNavegador(resolveNomeDownloadGuia(file))
                                            ? undefined
                                            : () => handlePreview(file)
                                        }
                                      />
                                    ))}
                                  </Box>
                                ) : (
                                  <Stack spacing={1}>
                                    {files.map((file) => (
                                      <DriveFileCardListPortal
                                        key={file._id}
                                        file={file}
                                        fileMetaLines={<FileMetaLines file={file} />}
                                        isNovo={isDocumentoNovoParaClientePortal(file)}
                                        onDownload={
                                          file.semArquivo
                                            ? undefined
                                            : () => handleDownload(file)
                                        }
                                        onPreview={
                                          file.semArquivo ||
                                          !isGuiaVisualizavelNoNavegador(resolveNomeDownloadGuia(file))
                                            ? undefined
                                            : () => handlePreview(file)
                                        }
                                      />
                                    ))}
                                  </Stack>
                                )
                              ) : (
                                <DriveFolderEmptyPortal />
                              )}
                            </>
                          ) : (
                            <DriveRootEmptyZone />
                          )}
                        </Box>
                      </Stack>
                    )}
                  </Box>
                </>
              )}
            </Stack>
          </Card>
        </CardContent>
      </Card>

      <GuiaFiscalEmitirDasPortalDialog
        open={emitDas.value}
        onClose={emitDas.onFalse}
        onSuccess={handleEmitSuccess}
      />
    </Box>
  );
}
