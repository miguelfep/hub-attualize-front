'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ClienteNewEditForm } from '../cliente-new-edit-form';

// ----------------------------------------------------------------------

export function ClienteCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Criar novo cliente"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Clientes', href: paths.dashboard.cliente.root },
          { name: 'Novo Cliente' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ClienteNewEditForm />
    </DashboardContent>
  );
}
