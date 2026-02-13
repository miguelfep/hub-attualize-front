'use client';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { RecompensasAdminView } from 'src/sections/recompensa/admin/recompensas-admin-view';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function RecompensasAdminPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  // Verificar se o usuário é admin ou financeiro
  if (user?.role !== 'admin' && user?.role !== 'financeiro') {
    router.replace(paths.dashboard.permission);
    return null;
  }

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Gestão de Recompensas"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Recompensas' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <RecompensasAdminView />
    </DashboardContent>
  );
}
