'use client';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InvoiceDetails } from '../invoice-details';

// ----------------------------------------------------------------------

export function InvoiceDetailsView({ invoice, nfses }) {
  // Garantir que invoice existe antes de renderizar
  if (!invoice || typeof invoice !== 'object') {
    return (
      <DashboardContent>
        <Typography variant="h6" color="error">
          Invoice não encontrada ou dados inválidos
        </Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={invoice?.invoiceNumber || 'Invoice'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vendas', href: paths.dashboard.invoice.root },
          { name: invoice?.invoiceNumber || 'Detalhes' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceDetails invoice={invoice} nfses={nfses || invoice?.nfses || []} />
    </DashboardContent>
  );
}
