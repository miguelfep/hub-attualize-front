'use client';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useCurso } from 'src/actions/comunidade';

import { CursoNewEditForm } from './curso-new-edit-form';

// ----------------------------------------------------------------------

export function CursoFormView({ id }) {
  const router = useRouter();
  const { data: currentCurso, isLoading } = useCurso(id);

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

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <CursoNewEditForm currentCurso={currentCurso} />
      )}
    </DashboardContent>
  );
}
