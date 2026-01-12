'use client';

import { useRouter } from 'src/routes/hooks';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box } from '@mui/material';

import { AulaForm } from '../aula-form';

// ----------------------------------------------------------------------

export function AulaEditView({ aula, error }) {
  const router = useRouter();

  if (error || !aula) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Editar Aula"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Aulas', href: paths.aulas.root },
            { name: 'Editar' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Box sx={{ p: 3, color: 'error.main' }}>
          {error?.message || 'Erro ao carregar aula. Tente novamente mais tarde.'}
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar Aula"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Aulas', href: paths.aulas.root },
          { name: 'Editar' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <AulaForm
        aula={aula}
        onSuccess={() => {
          router.push(paths.aulas.root);
        }}
      />
    </DashboardContent>
  );
}

