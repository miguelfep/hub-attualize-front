'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ClienteNewEditForm } from '../cliente-new-edit-form';

// ----------------------------------------------------------------------

export function ClienteEditView({ cliente: currentCliente }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Cliente', href: paths.dashboard.cliente.root },
          { name: currentCliente?.nome },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ClienteNewEditForm currentCliente={currentCliente} />
    </DashboardContent>
  );
}
