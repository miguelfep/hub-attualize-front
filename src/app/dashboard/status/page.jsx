'use client';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { StatusView } from 'src/sections/status/view/status-view';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function StatusPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  // Página restrita a administradores
  if (user?.role !== 'admin') {
    router.replace(paths.dashboard.permission);
    return null;
  }

  return (
    <DashboardContent maxWidth={false}>
      <CustomBreadcrumbs
        heading="Status do Sistema"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Status do Sistema' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <StatusView />
    </DashboardContent>
  );
}
