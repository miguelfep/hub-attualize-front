'use client';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useMaterial } from 'src/actions/comunidade';

import { MaterialNewEditForm } from './material-new-edit-form';

// ----------------------------------------------------------------------

export function MaterialFormView({ id }) {
  const router = useRouter();
  const { data: currentMaterial, isLoading } = useMaterial(id);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={id ? 'Editar Material' : 'Novo Material'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Comunidade', href: paths.dashboard.comunidade.root },
          { name: 'Materiais', href: paths.dashboard.comunidade.materiais.root },
          { name: id ? 'Editar' : 'Novo' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <MaterialNewEditForm currentMaterial={currentMaterial} />
      )}
    </DashboardContent>
  );
}
