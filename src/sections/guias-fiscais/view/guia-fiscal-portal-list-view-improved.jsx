'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { m, LazyMotion, domAnimation } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useGetGuiasFiscaisPortal, useGetPastasGuiasPortal } from 'src/actions/cliente-portal-guias-api';
import { downloadGuiaFiscalPortal } from 'src/utils/portal-guia-download';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TablePaginationCustom } from 'src/components/table';

import { collectPastaTreeItemIds, findPastaNodeById } from '../utils';
import { GuiaFiscalPortalCard } from '../components/guia-fiscal-portal-card';
import { ClienteDocumentoPastaTreeView } from '../components/cliente-documento-pasta-tree-view';

// ----------------------------------------------------------------------

function apiErr(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.message || err.error || 'Erro na operação';
}

export function GuiaFiscalPortalListViewImproved() {
  const router = useRouter();
  const theme = useTheme();

  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const { folders, isLoading: loadingPastas } = useGetPastasGuiasPortal();

  const listParams = useMemo(
    () => ({
      folderId: selectedFolderId || undefined,
      page: page + 1,
      limit: rowsPerPage,
    }),
    [selectedFolderId, page, rowsPerPage]
  );

  const { data, isLoading } = useGetGuiasFiscaisPortal(listParams);

  const guias = data?.guias ?? [];
  const total = data?.total ?? 0;

  const expandedIds = useMemo(() => collectPastaTreeItemIds(folders || []), [folders]);

  const pastaSelecionada = useMemo(
    () => (selectedFolderId ? findPastaNodeById(folders || [], selectedFolderId) : null),
    [folders, selectedFolderId]
  );

  useEffect(() => {
    setPage(0);
  }, [selectedFolderId]);

  const handleViewDetails = useCallback(
    (id) => {
      router.push(paths.cliente.guiasFiscais.details(id));
    },
    [router]
  );

  const handleDownload = useCallback(async (id, nomeArquivo) => {
    try {
      await downloadGuiaFiscalPortal(id, nomeArquivo);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error(apiErr(error));
    }
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <Box
            sx={{
              p: 4,
              bgcolor: 'background.neutral',
              borderRadius: '16px 16px 0 0',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Guias e documentos
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Navegue pelas pastas e baixe os arquivos disponíveis. Envio e organização ficam no painel
                administrativo.
              </Typography>
            </Box>
            <Button
              component="a"
              href={paths.cliente.guiasFiscais.calendar}
              variant="outlined"
              startIcon={<Iconify icon="solar:calendar-bold" />}
            >
              Ver Calendário
            </Button>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ p: 2, mb: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:folder-bold-duotone" width={24} sx={{ color: 'success.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Total nesta visão:
                  </Typography>
                  <Chip label={total} size="small" color="primary" variant="soft" />
                </Stack>
                {pastaSelecionada && (
                  <>
                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Pasta: <strong>{pastaSelecionada.nome}</strong>
                    </Typography>
                  </>
                )}
              </Stack>
            </Box>

            {loadingPastas && !folders?.length ? (
              <Stack alignItems="center" spacing={2} sx={{ py: 5 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Carregando pastas...
                </Typography>
              </Stack>
            ) : (
              <Grid container spacing={2}>
                <Grid xs={12} md={4}>
                  <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon="solar:folder-favourite-bookmark-bold-duotone" width={26} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Pastas
                        </Typography>
                      </Stack>
                      <Button size="small" variant="outlined" onClick={() => setSelectedFolderId(null)}>
                        Ver todas
                      </Button>
                      <Box sx={{ maxHeight: 480, overflow: 'auto' }}>
                        {folders?.length ? (
                          <ClienteDocumentoPastaTreeView
                            folders={folders}
                            selectedId={selectedFolderId}
                            onSelect={setSelectedFolderId}
                            defaultExpandedItems={expandedIds}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma pasta disponível.
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

                <Grid xs={12} md={8}>
                  {isLoading ? (
                    <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
                      <CircularProgress />
                      <Typography variant="body2" color="text.secondary">
                        Carregando documentos...
                      </Typography>
                    </Stack>
                  ) : !guias.length ? (
                    <Stack alignItems="center" spacing={2} sx={{ py: 10, textAlign: 'center' }}>
                      <Iconify icon="solar:documents-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
                      <Typography variant="h6" color="text.secondary">
                        Nenhum documento nesta visão
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Escolha outra pasta ou aguarde novos arquivos enviados pela equipe.
                      </Typography>
                    </Stack>
                  ) : (
                    <>
                      <Scrollbar sx={{ maxHeight: { xs: 'none', md: 560 } }}>
                        <Stack spacing={2}>
                          {guias.map((guia) => (
                            <GuiaFiscalPortalCard
                              key={guia._id}
                              guia={guia}
                              onView={handleViewDetails}
                              onDownload={handleDownload}
                            />
                          ))}
                        </Stack>
                      </Scrollbar>
                      <TablePaginationCustom
                        count={total}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={[25, 50, 100]}
                        onPageChange={(_, p) => setPage(p)}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                        sx={{ borderTop: (th) => `1px solid ${th.palette.divider}`, mt: 2 }}
                      />
                    </>
                  )}
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
}
