'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useCurso,
  marcarMaterialCompleto,
  registrarVisualizacaoCurso,
} from 'src/actions/comunidade';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

export function CursoPortalDetailsView({ id }) {
  const router = useRouter();
  const { data: curso, isLoading, error, mutate } = useCurso(id);
  const [loadingMaterial, setLoadingMaterial] = useState({});
  const [thumbnailError, setThumbnailError] = useState(false);
  // Sempre usar URL padrão (sem extensão): {BASE}/comunidade/cursos/{id}/thumbnail
  const cursoThumbnailSrc = id ? endpoints.comunidade.cursos.thumbnail(id) : null;

  const cursoRestrito = error?.response?.status === 403 ? error?.response?.data?.curso : null;
  const motivoRestrito = error?.response?.data?.motivo;

  const temAcesso = curso
    ? (curso.temAcesso ?? curso?.materiais?.some(
        (m) => m.arquivoUrl || m.linkExterno || (m.tipo === 'videoaula' && m.linkExterno)
      ))
    : false;

  const handleMarcarCompleto = async (materialId) => {
    try {
      setLoadingMaterial((prev) => ({ ...prev, [materialId]: true }));
      const data = await marcarMaterialCompleto(id, materialId);
      toast.success('Material marcado como completo');
      // Atualiza o cache com a resposta da API (progresso e materiaisCompletos) para refletir na hora
      if (data?.acesso?.materiaisCompletos) {
        mutate(
          (current) =>
            current?.curso
              ? {
                  ...current,
                  curso: {
                    ...current.curso,
                    materiaisCompletos: data.acesso.materiaisCompletos,
                    progresso: data.acesso.progresso,
                  },
                }
              : current,
          false
        );
      } else {
        mutate();
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Erro ao marcar material como completo');
    } finally {
      setLoadingMaterial((prev) => ({ ...prev, [materialId]: false }));
    }
  };

  const handleAcessarMaterial = (materialId) => {
    router.push(paths.cliente.comunidade.materiais.details(materialId));
  };

  useEffect(() => {
    if (curso?._id) {
      registrarVisualizacaoCurso(curso._id);
    }
  }, [curso?._id]);

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography>Carregando...</Typography>
        </Box>
      </DashboardContent>
    );
  }

  if (!curso && !cursoRestrito) {
    return (
      <DashboardContent>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6">Curso não encontrado</Typography>
        </Box>
      </DashboardContent>
    );
  }

  if (cursoRestrito) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading={cursoRestrito.titulo}
          links={[
            { name: 'Dashboard', href: paths.cliente.dashboard },
            { name: 'Comunidade', href: paths.cliente.comunidade.root },
            { name: 'Cursos', href: paths.cliente.comunidade.cursos.root },
            { name: cursoRestrito.titulo },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Card sx={{ p: 3, maxWidth: 560, mx: 'auto' }}>
          <Stack spacing={2}>
            <Label variant="soft" color={getTipoAcessoColor(cursoRestrito.tipoAcesso)}>
              {getTipoAcessoLabel(cursoRestrito.tipoAcesso)}
            </Label>
            <Typography variant="h5">{cursoRestrito.titulo}</Typography>
            {motivoRestrito && (
              <Typography variant="body2" color="text.secondary">
                {motivoRestrito}
              </Typography>
            )}
            {cursoRestrito.tipoAcesso === 'pago' && (
              <Typography variant="body1" color="text.secondary">
                Acesso concedido mediante vínculo. Entre em contato para mais informações.
              </Typography>
            )}
          </Stack>
        </Card>
      </DashboardContent>
    );
  }

  const progresso =
    typeof curso.progresso === 'number'
      ? curso.progresso
      : curso.materiais?.length > 0
        ? Math.round(((curso.materiaisCompletos?.length || 0) / curso.materiais.length) * 100)
        : 0;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={curso.titulo}
        links={[
          { name: 'Dashboard', href: paths.cliente.dashboard },
          { name: 'Comunidade', href: paths.cliente.comunidade.root },
          { name: 'Cursos', href: paths.cliente.comunidade.cursos.root },
          { name: curso.titulo },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            {cursoThumbnailSrc && !thumbnailError ? (
              <CardMedia
                component="img"
                height="400"
                image={cursoThumbnailSrc}
                alt={curso.titulo}
                onError={() => setThumbnailError(true)}
              />
            ) : null}

            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Label variant="soft" color={getTipoAcessoColor(curso.tipoAcesso)}>
                    {getTipoAcessoLabel(curso.tipoAcesso)}
                  </Label>
                </Stack>

                <Typography variant="h4">{curso.titulo}</Typography>

                {curso.descricao && (
                  <Typography variant="body1" color="text.secondary">
                    {curso.descricao}
                  </Typography>
                )}

                <Divider />

                <Stack direction="row" spacing={3}>
                  {curso.visualizacoes > 0 && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="eva:eye-fill" width={20} />
                      <Typography variant="body2">{curso.visualizacoes} visualizações</Typography>
                    </Stack>
                  )}
                  {curso.inscricoes > 0 && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:user-bold-duotone" width={20} />
                      <Typography variant="body2">{curso.inscricoes} inscrições</Typography>
                    </Stack>
                  )}
                  {curso.duracaoTotal && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="solar:clock-circle-bold-duotone" width={20} />
                      <Typography variant="body2">{curso.duracaoTotal} minutos</Typography>
                    </Stack>
                  )}
                </Stack>

                {temAcesso && (
                  <>
                    <Divider />
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2">Progresso do Curso</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {curso.materiaisCompletos?.length || 0} / {curso.materiais?.length || 0}{' '}
                          materiais
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={progresso} />
                    </Box>
                  </>
                )}

                {curso.materiais && curso.materiais.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Materiais do Curso
                      </Typography>
                      <List>
                        {curso.materiais.map((material, index) => {
                          const isCompleto = Boolean(curso.materiaisCompletos?.includes(material._id));
                          return (
                            <ListItem
                              key={material._id}
                              sx={{
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                mb: 1,
                              }}
                            >
                              <Checkbox
                                checked={isCompleto}
                                onChange={() => handleMarcarCompleto(material._id)}
                                disabled={!!loadingMaterial[material._id]}
                              />
                              <ListItemText
                                primary={
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="subtitle2">
                                      {index + 1}. {material.titulo}
                                    </Typography>
                                    <Label variant="soft" size="small">
                                      {getTipoLabel(material.tipo)}
                                    </Label>
                                  </Stack>
                                }
                                secondary={
                                  material.duracao && (
                                    <Typography variant="caption" color="text.secondary">
                                      {material.duracao} minutos
                                    </Typography>
                                  )
                                }
                              />
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleAcessarMaterial(material._id)}
                                startIcon={<Iconify icon="eva:eye-fill" />}
                              >
                                Acessar
                              </Button>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Stack spacing={3}>
              {curso.tipoAcesso === 'pago' && !temAcesso && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Curso pago
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {fCurrency(curso.preco)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Acesso concedido mediante vínculo. Entre em contato para mais informações.
                  </Typography>
                </Box>
              )}

              {temAcesso && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Você tem acesso a este curso
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Acesse os materiais abaixo para começar
                  </Typography>
                </Box>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
