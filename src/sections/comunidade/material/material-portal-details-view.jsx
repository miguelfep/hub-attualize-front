'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';
import { endpoints, getFullAssetUrl } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMaterial, downloadMaterial, registrarAcessoMaterial } from 'src/actions/comunidade';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const getTipoLabel = (tipo) => {
  const tipoMap = {
    ebook: 'E-book',
    videoaula: 'Videoaula',
    documento: 'Documento',
    link: 'Link',
    outro: 'Outro',
  };
  return tipoMap[tipo] || tipo;
};

const getTipoAcessoColor = (tipoAcesso) => {
  const colorMap = {
    gratuito: 'success',
    exclusivo_cliente: 'info',
    pago: 'warning',
  };
  return colorMap[tipoAcesso] || 'default';
};

const getTipoAcessoLabel = (tipoAcesso) => {
  const tipoMap = {
    gratuito: 'Gratuito',
    exclusivo_cliente: 'Exclusivo para Clientes',
    pago: 'Pago',
  };
  return tipoMap[tipoAcesso] || tipoAcesso;
};

// ----------------------------------------------------------------------

export function MaterialPortalDetailsView({ id }) {
  const router = useRouter();
  const { data: material, isLoading, error, mutate } = useMaterial(id);
  const [loadingAcesso, setLoadingAcesso] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  // Sempre usar URL padrão (sem extensão): {BASE}/comunidade/materiais/{id}/thumbnail
  const materialThumbnailSrc = id ? endpoints.comunidade.materiais.thumbnail(id) : null;

  const materialRestrito = error?.response?.status === 403 ? error?.response?.data?.material : null;
  const motivoRestrito = error?.response?.data?.motivo;

  const temAcesso = material
    ? (material.temAcesso ?? !!(material.arquivoUrl || material.linkExterno))
    : false;

  const handleAcessar = async () => {
    try {
      setLoadingAcesso(true);
      
      // Registrar visualização
      await registrarAcessoMaterial(id, 'visualizacao');
      
      if (material.tipo === 'link' && material.linkExterno) {
        window.open(material.linkExterno, '_blank');
      } else if (material.tipo === 'videoaula' && material.linkExterno) {
        // Videoaula com YouTube - abrir em nova aba ou mostrar player
        window.open(material.linkExterno, '_blank');
      } else if (material.arquivoUrl) {
        const arquivoUrl = getFullAssetUrl(material.arquivoUrl) || material.arquivoUrl;
        window.open(arquivoUrl, '_blank');
      }
      
      mutate();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Erro ao acessar material');
    } finally {
      setLoadingAcesso(false);
    }
  };

  // Extrair ID do vídeo do YouTube
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeVideoId = material?.tipo === 'videoaula' && material?.linkExterno 
    ? getYouTubeVideoId(material.linkExterno) 
    : null;

  const handleDownload = async () => {
    try {
      setLoadingAcesso(true);
      await downloadMaterial(id);
      mutate();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Erro ao fazer download');
    } finally {
      setLoadingAcesso(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography>Carregando...</Typography>
        </Box>
      </DashboardContent>
    );
  }

  if (!material && !materialRestrito) {
    return (
      <DashboardContent>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6">Material não encontrado</Typography>
        </Box>
      </DashboardContent>
    );
  }

  if (materialRestrito) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading={materialRestrito.titulo}
          links={[
            { name: 'Dashboard', href: paths.cliente.dashboard },
            { name: 'Comunidade', href: paths.cliente.comunidade.materiais.root },
            { name: materialRestrito.titulo },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Card sx={{ p: 3, maxWidth: 560, mx: 'auto' }}>
          <Stack spacing={2}>
            <Label variant="soft" color={getTipoAcessoColor(materialRestrito.tipoAcesso)}>
              {getTipoAcessoLabel(materialRestrito.tipoAcesso)}
            </Label>
            <Typography variant="h5">{materialRestrito.titulo}</Typography>
            {motivoRestrito && (
              <Typography variant="body2" color="text.secondary">
                {motivoRestrito}
              </Typography>
            )}
            {materialRestrito.tipoAcesso === 'pago' && (
              <Typography variant="body1" color="text.secondary">
                Acesso concedido mediante vínculo. Entre em contato para mais informações.
              </Typography>
            )}
          </Stack>
        </Card>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={material.titulo}
        links={[
          { name: 'Dashboard', href: paths.cliente.dashboard },
          { name: 'Comunidade', href: paths.cliente.comunidade.materiais.root },
          { name: material.titulo },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            {youtubeVideoId ? (
              <Box
                sx={{
                  position: 'relative',
                  paddingBottom: '56.25%', // 16:9 aspect ratio
                  height: 0,
                  overflow: 'hidden',
                  bgcolor: 'background.neutral',
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    border: 0,
                  }}
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title={material.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
            ) : materialThumbnailSrc && !thumbnailError ? (
              <CardMedia
                component="img"
                height="400"
                image={materialThumbnailSrc}
                alt={material.titulo}
                onError={() => setThumbnailError(true)}
              />
            ) : null}

            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Label variant="soft" color={getTipoAcessoColor(material.tipoAcesso)}>
                    {getTipoAcessoLabel(material.tipoAcesso)}
                  </Label>
                  <Label variant="soft">{getTipoLabel(material.tipo)}</Label>
                </Stack>

                <Typography variant="h4">{material.titulo}</Typography>

                {material.descricao && (
                  <Typography variant="body1" color="text.secondary">
                    {material.descricao}
                  </Typography>
                )}

                <Divider />

                <Stack direction="row" spacing={3}>
                  {material.visualizacoes > 0 && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="eva:eye-fill" width={20} />
                      <Typography variant="body2">{material.visualizacoes} visualizações</Typography>
                    </Stack>
                  )}
                  {material.downloads > 0 && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="eva:download-fill" width={20} />
                      <Typography variant="body2">{material.downloads} downloads</Typography>
                    </Stack>
                  )}
                  {material.duracao && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:clock-circle-bold-duotone" width={20} />
                      <Typography variant="body2">{material.duracao} minutos</Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Stack spacing={3}>
              {material.tipoAcesso === 'pago' && !temAcesso && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Material pago
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {fCurrency(material.preco)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Acesso concedido mediante vínculo. Entre em contato para mais informações.
                  </Typography>
                </Box>
              )}

              {temAcesso && (
                <>
                  {youtubeVideoId ? (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Você tem acesso a este material
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        O vídeo está disponível acima. Você pode assistir diretamente na página.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Você tem acesso a este material
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {material.tipo === 'link'
                            ? 'Clique no botão abaixo para acessar o link externo'
                            : material.tipo === 'videoaula'
                            ? 'O vídeo está disponível acima. Você pode fazer download se houver arquivo.'
                            : 'Faça o download do material.'}
                        </Typography>
                      </Box>

                      {/* Documento, ebook, outro: apenas Download */}
                      {(material.tipo === 'documento' || material.tipo === 'ebook' || material.tipo === 'outro') && (
                        <LoadingButton
                          fullWidth
                          size="large"
                          variant="contained"
                          loading={loadingAcesso}
                          onClick={handleDownload}
                          startIcon={<Iconify icon="eva:download-fill" />}
                        >
                          Download
                        </LoadingButton>
                      )}

                      {/* Link externo: apenas Abrir Link */}
                      {material.tipo === 'link' && (
                        <LoadingButton
                          fullWidth
                          size="large"
                          variant="contained"
                          loading={loadingAcesso}
                          onClick={handleAcessar}
                          startIcon={<Iconify icon="eva:external-link-fill" />}
                        >
                          Abrir Link
                        </LoadingButton>
                      )}

                      {/* Videoaula: Download (se tiver arquivo) e Assistir (abre em nova aba quando não for YouTube embedido acima) */}
                      {material.tipo === 'videoaula' && (
                        <>
                          {material.arquivoUrl && (
                            <LoadingButton
                              fullWidth
                              size="large"
                              variant="outlined"
                              loading={loadingAcesso}
                              onClick={handleDownload}
                              startIcon={<Iconify icon="eva:download-fill" />}
                            >
                              Download
                            </LoadingButton>
                          )}
                          {material.linkExterno && (
                            <LoadingButton
                              fullWidth
                              size="large"
                              variant="contained"
                              loading={loadingAcesso}
                              onClick={handleAcessar}
                              startIcon={<Iconify icon="solar:play-circle-bold-duotone" />}
                            >
                              Assistir Vídeo
                            </LoadingButton>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
