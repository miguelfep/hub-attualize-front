'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InvoiceNewEditForm } from 'src/sections/invoice/invoice-new-edit-form';

// ----------------------------------------------------------------------

export function AberturaCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Criar uma nova abertura"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Aberturas', href: paths.dashboard.aberturas.root },
          { name: 'Editar Abertura' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceNewEditForm />
    </DashboardContent>
  );
}
