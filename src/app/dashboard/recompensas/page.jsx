'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PixPendentesView } from 'src/sections/recompensas-admin/pix-pendentes-view';

// ----------------------------------------------------------------------

export default function RecompensasPage() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Recompensas - PIX Pendentes"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Recompensas' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PixPendentesView />
    </DashboardContent>
  );
}
