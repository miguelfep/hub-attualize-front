'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import LoadingButton from '@mui/lab/LoadingButton';

import Grid from '@mui/material/Grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

import { useMaterial, comprarMaterial, registrarAcessoMaterial, downloadMaterial } from 'src/actions/comunidade';
import { endpoints } from 'src/utils/axios';

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
  const { data: material, isLoading, mutate } = useMaterial(id);
  const [loadingComprar, setLoadingComprar] = useState(false);
  const [loadingAcesso, setLoadingAcesso] = useState(false);

  const temAcesso = material?.arquivoUrl || material?.linkExterno || (material?.tipo === 'videoaula' && material?.linkExterno);

  const handleComprar = async () => {
    try {
      setLoadingComprar(true);
      const response = await comprarMaterial(id);
      
      if (response?.invoice?._id) {
        // Redirecionar para checkout - usar o endpoint completo
        const checkoutUrl = `${endpoints.invoices.checkout}/${response.invoice._id}`;
        window.location.href = checkoutUrl;
      } else {
        toast.error('Erro ao processar compra');
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Erro ao processar compra');
    } finally {
      setLoadingComprar(false);
    }
  };

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
        // Para arquivos, podemos abrir em nova aba ou fazer download
        window.open(material.arquivoUrl, '_blank');
      }
      
      mutate();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Erro ao acessar material');
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
      const response = await downloadMaterial(id);
      
      if (response?.fileUrl) {
        window.open(response.fileUrl, '_blank');
        await registrarAcessoMaterial(id, 'download');
        mutate();
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Erro ao fazer download');
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

  if (!material) {
    return (
      <DashboardContent>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6">Material não encontrado</Typography>
        </Box>
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
            ) : material.thumbnailUrl ? (
              <CardMedia
                component="img"
                height="400"
                image={material.thumbnailUrl}
                alt={material.titulo}
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
                <>
                  <Box>
                    <Typography variant="h4" color="primary.main">
                      {fCurrency(material.preco)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Material pago
                    </Typography>
                  </Box>

                  <LoadingButton
                    fullWidth
                    size="large"
                    variant="contained"
                    loading={loadingComprar}
                    onClick={handleComprar}
                    startIcon={<Iconify icon="solar:cart-bold-duotone" />}
                  >
                    Comprar Agora
                  </LoadingButton>
                </>
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
                            ? 'Faça o download ou visualize o vídeo'
                            : 'Faça o download ou visualize o material'}
                        </Typography>
                      </Box>

                      {material.tipo !== 'link' && material.tipo !== 'videoaula' && (
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

                      {material.tipo === 'videoaula' && material.arquivoUrl && (
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

                      <LoadingButton
                        fullWidth
                        size="large"
                        variant="contained"
                        loading={loadingAcesso}
                        onClick={handleAcessar}
                        startIcon={
                          <Iconify
                            icon={
                              material.tipo === 'link'
                                ? 'eva:external-link-fill'
                                : material.tipo === 'videoaula'
                                ? 'solar:play-circle-bold-duotone'
                                : 'eva:eye-fill'
                            }
                          />
                        }
                      >
                        {material.tipo === 'link'
                          ? 'Abrir Link'
                          : material.tipo === 'videoaula'
                          ? 'Assistir Vídeo'
                          : 'Visualizar'}
                      </LoadingButton>
                    </>
                  )}
                </>
              )}

              {material.tipoAcesso === 'pago' && !temAcesso && (
                <Typography variant="caption" color="text.secondary" align="center">
                  Após a compra, você terá acesso completo ao material
                </Typography>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
