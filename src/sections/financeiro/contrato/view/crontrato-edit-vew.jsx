'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ContratoNewEditForm } from '../contrato-new-edit-form';

// ----------------------------------------------------------------------

export function ContratoEditView({ contrato }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Contrato', href: paths.dashboard.contratos.root },
          { name: contrato?.titulo },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ContratoNewEditForm currentContrato={contrato} />
    </DashboardContent>
  );
}
