'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PagarNewEditForm } from '../pagar-new-edit-form';

// ----------------------------------------------------------------------

export function PagarCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Criar despesa"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Contas a pagar', href: paths.dashboard.financeiro.pagar },
          { name: 'Nova Despesa' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PagarNewEditForm />
    </DashboardContent>
  );
}
