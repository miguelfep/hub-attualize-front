'use client';

import { useRouter } from 'src/routes/hooks';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AulaForm } from '../aula-form';

// ----------------------------------------------------------------------

export function AulaNewView() {
  const router = useRouter();

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Nova Aula"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Aulas', href: paths.aulas.root },
          { name: 'Nova' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <AulaForm
        onSuccess={() => {
          router.push(paths.aulas.root);
        }}
      />
    </DashboardContent>
  );
}

