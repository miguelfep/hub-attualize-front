'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AberturaEditForm } from '../abertura-edit-form';

// ----------------------------------------------------------------------

export function AberturaEditView({ abertura }) {
  return (
    <DashboardContent maxWidth={false}>
      <CustomBreadcrumbs
        heading="Editar"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Aberturas', href: paths.dashboard.aberturas.root },
          { name: abertura.nomeEmpresarial },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <AberturaEditForm currentAbertura={abertura} />
    </DashboardContent>
  );
}
