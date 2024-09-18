'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PagarNewEditForm } from '../pagar-new-edit-form';

// ----------------------------------------------------------------------

export function PagarEditView({ conta: currentConta }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Contas a Pagar', href: paths.dashboard.financeiro.pagar },
          { name: currentConta?.descricao },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PagarNewEditForm currentConta={currentConta} />
    </DashboardContent>
  );
}
