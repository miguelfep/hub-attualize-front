'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ContratoNewEditForm } from '../contrato-new-edit-form';
// ----------------------------------------------------------------------

export function ContratoCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Criar um novo contrato"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Contratos', href: paths.dashboard.contratos.root },
          { name: 'Novo contrato' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ContratoNewEditForm />
    </DashboardContent>
  );
}
