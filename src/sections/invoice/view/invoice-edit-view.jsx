'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InvoiceNewEditForm } from '../invoice-new-edit-form';

// ----------------------------------------------------------------------

export function InvoiceEditView({ invoice }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Venda', href: paths.dashboard.invoice.root },
          { name: invoice?.invoiceNumber },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceNewEditForm currentInvoice={invoice} />
    </DashboardContent>
  );
}
