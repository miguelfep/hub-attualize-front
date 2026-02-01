'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { IndicacoesAdminView } from 'src/sections/indicacoes-admin/indicacoes-admin-view';

// ----------------------------------------------------------------------

export default function IndicacoesAdminPage() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Indicações"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Indicações' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <IndicacoesAdminView />
    </DashboardContent>
  );
}
