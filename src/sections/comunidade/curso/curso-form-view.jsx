'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useCurso } from 'src/actions/comunidade';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CursoNewEditForm } from './curso-new-edit-form';

// ----------------------------------------------------------------------

export function CursoFormView({ id }) {
  const router = useRouter();
  const { data: currentCurso, isLoading, error } = useCurso(id);

  const isEdit = Boolean(id);
  const showForm = !isEdit || currentCurso != null;
  const notFound = isEdit && !isLoading && !currentCurso;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={id ? 'Editar Curso' : 'Novo Curso'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Comunidade', href: paths.dashboard.comunidade.root },
          { name: 'Cursos', href: paths.dashboard.comunidade.cursos.root },
          { name: id ? 'Editar' : 'Novo' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && isEdit ? (
        <Typography color="text.secondary">Carregando...</Typography>
      ) : notFound ? (
        <Box>
          <Typography color="error">Curso não encontrado.</Typography>
          <Button sx={{ mt: 2 }} onClick={() => router.push(paths.dashboard.comunidade.cursos.root)}>
            Voltar para Cursos
          </Button>
        </Box>
      ) : showForm ? (
        <CursoNewEditForm currentCurso={currentCurso} key={currentCurso?._id ?? 'new'} />
      ) : null}
    </DashboardContent>
  );
}
