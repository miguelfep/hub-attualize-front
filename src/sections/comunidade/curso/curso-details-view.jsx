'use client';

import {
  Box,
  Card,
  List,
  Stack,
  Button,
  Divider,
  ListItem,
  Typography,
  CardHeader,
  CardContent,
  ListItemText,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import { useCurso } from 'src/actions/comunidade';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

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

export function CursoDetailsView({ id }) {
  const router = useRouter();
  const { data: curso, isLoading, error } = useCurso(id);

  if (isLoading) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Visualizar Curso"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Comunidade', href: paths.dashboard.comunidade.root },
            { name: 'Cursos', href: paths.dashboard.comunidade.cursos.root },
            { name: 'Visualizar' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Typography color="text.secondary">Carregando...</Typography>
      </DashboardContent>
    );
  }

  if (error || !curso) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Curso"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Comunidade', href: paths.dashboard.comunidade.root },
            { name: 'Cursos', href: paths.dashboard.comunidade.cursos.root },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Typography color="error">Curso não encontrado.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => router.push(paths.dashboard.comunidade.cursos.root)}>
          Voltar para Cursos
        </Button>
      </DashboardContent>
    );
  }

  const categorias = curso.categorias?.map((c) => (typeof c === 'object' ? c.nome : c)).filter(Boolean) || [];
  const tags = curso.tags?.map((t) => (typeof t === 'object' ? t.nome : t)).filter(Boolean) || [];
  const materiais = curso.materiais || [];

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={curso.titulo}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Comunidade', href: paths.dashboard.comunidade.root },
          { name: 'Cursos', href: paths.dashboard.comunidade.cursos.root },
          { name: 'Visualizar' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:edit-fill" />}
            onClick={() => router.push(paths.dashboard.comunidade.cursos.edit(id))}
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
            subheader={curso.titulo}
            action={
              <Stack direction="row" spacing={1}>
                <Label color={getStatusColor(curso.status)}>{getStatusLabel(curso.status)}</Label>
                <Label color={getTipoAcessoColor(curso.tipoAcesso)}>{getTipoAcessoLabel(curso.tipoAcesso)}</Label>
              </Stack>
            }
          />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Título</Typography>
                <Typography variant="body1">{curso.titulo}</Typography>
              </Box>
              {curso.descricao && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Descrição</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{curso.descricao}</Typography>
                </Box>
              )}
              <Stack direction="row" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Preço</Typography>
                  <Typography variant="body2">{fCurrency(curso.preco ?? 0)}</Typography>
                </Box>
              </Stack>
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
            </Stack>
          </CardContent>
        </Card>

        {materiais.length > 0 && (
          <Card>
            <CardHeader title="Materiais do curso" subheader={`${materiais.length} material(is)`} />
            <Divider />
            <CardContent>
              <List dense>
                {materiais.map((m, index) => (
                  <ListItem key={typeof m === 'object' ? m._id : m}>
                    <ListItemText primary={`${index + 1}. ${typeof m === 'object' ? m.titulo : m}`} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader title="Estatísticas" />
          <Divider />
          <CardContent>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Visualizações</Typography>
                <Typography variant="h6">{curso.visualizacoes ?? 0}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Inscrições</Typography>
                <Typography variant="h6">{curso.inscricoes ?? 0}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
