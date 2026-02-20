'use client';

import {
  Box,
  Card,
  Stack,
  Button,
  Divider,
  Typography,
  CardHeader,
  CardContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import { useMaterial } from 'src/actions/comunidade';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const getTipoLabel = (tipo) => {
  const m = { ebook: 'E-book', videoaula: 'Videoaula', documento: 'Documento', link: 'Link', outro: 'Outro' };
  return m[tipo] || tipo;
};

const getTipoAcessoLabel = (tipoAcesso) => {
  const m = { gratuito: 'Gratuito', exclusivo_cliente: 'Exclusivo Cliente', pago: 'Pago' };
  return m[tipoAcesso] || tipoAcesso;
};

const getTipoAcessoColor = (tipoAcesso) => {
  const m = { gratuito: 'success', exclusivo_cliente: 'info', pago: 'warning' };
  return m[tipoAcesso] || 'default';
};

const getStatusLabel = (status) => {
  const m = { ativo: 'Ativo', inativo: 'Inativo', rascunho: 'Rascunho' };
  return m[status] || status;
};

const getStatusColor = (status) => {
  const m = { ativo: 'success', inativo: 'error', rascunho: 'warning' };
  return m[status] || 'default';
};

// ----------------------------------------------------------------------

export function MaterialDetailsView({ id }) {
  const router = useRouter();
  const { data: material, isLoading, error } = useMaterial(id);

  if (isLoading) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Visualizar Material"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Comunidade', href: paths.dashboard.comunidade.root },
            { name: 'Materiais', href: paths.dashboard.comunidade.materiais.root },
            { name: 'Visualizar' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Typography color="text.secondary">Carregando...</Typography>
      </DashboardContent>
    );
  }

  if (error || !material) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Material"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Comunidade', href: paths.dashboard.comunidade.root },
            { name: 'Materiais', href: paths.dashboard.comunidade.materiais.root },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Typography color="error">Material não encontrado.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => router.push(paths.dashboard.comunidade.materiais.root)}>
          Voltar para Materiais
        </Button>
      </DashboardContent>
    );
  }

  const categorias = material.categorias?.map((c) => (typeof c === 'object' ? c.nome : c)).filter(Boolean) || [];
  const tags = material.tags?.map((t) => (typeof t === 'object' ? t.nome : t)).filter(Boolean) || [];

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={material.titulo}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Comunidade', href: paths.dashboard.comunidade.root },
          { name: 'Materiais', href: paths.dashboard.comunidade.materiais.root },
          { name: 'Visualizar' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:edit-fill" />}
            onClick={() => router.push(paths.dashboard.comunidade.materiais.edit(id))}
          >
            Editar
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <Card>
          <CardHeader
            title="Informações básicas"
            subheader={material.titulo}
            action={
              <Stack direction="row" spacing={1}>
                <Label color={getStatusColor(material.status)}>{getStatusLabel(material.status)}</Label>
                <Label color={getTipoAcessoColor(material.tipoAcesso)}>{getTipoAcessoLabel(material.tipoAcesso)}</Label>
              </Stack>
            }
          />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Título</Typography>
                <Typography variant="body1">{material.titulo}</Typography>
              </Box>
              {material.descricao && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Descrição</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{material.descricao}</Typography>
                </Box>
              )}
              <Stack direction="row" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Tipo</Typography>
                  <Typography variant="body2">{getTipoLabel(material.tipo)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Preço</Typography>
                  <Typography variant="body2">{fCurrency(material.preco ?? 0)}</Typography>
                </Box>
                {material.duracao != null && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Duração (min)</Typography>
                    <Typography variant="body2">{material.duracao}</Typography>
                  </Box>
                )}
              </Stack>
              {material.linkExterno && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Link externo</Typography>
                  <Typography variant="body2" component="a" href={material.linkExterno} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-all' }}>
                    {material.linkExterno}
                  </Typography>
                </Box>
              )}
              {categorias.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Categorias</Typography>
                  <Typography variant="body2">{categorias.join(', ')}</Typography>
                </Box>
              )}
              {tags.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Tags</Typography>
                  <Typography variant="body2">{tags.join(', ')}</Typography>
                </Box>
              )}
              {material.visivelSomenteNoCurso && (
                <Typography variant="caption" color="text.secondary">
                  Visível somente dentro de cursos
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Estatísticas" />
          <Divider />
          <CardContent>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Visualizações</Typography>
                <Typography variant="h6">{material.visualizacoes ?? 0}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Downloads</Typography>
                <Typography variant="h6">{material.downloads ?? 0}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
