'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InvoiceNewEditForm } from '../invoice-new-edit-form';

// ----------------------------------------------------------------------

export function InvoiceCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Criar uma nova venda"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vendas', href: paths.dashboard.invoice.root },
          { name: 'Nova Venda' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceNewEditForm />
    </DashboardContent>
  );
}
