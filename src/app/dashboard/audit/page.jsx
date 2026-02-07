'use client';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AuditLogsView } from 'src/sections/audit/view/audit-logs-view';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function AuditLogsPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  // Verificar se o usuário é admin
  if (user?.role !== 'admin') {
    router.replace(paths.dashboard.permission);
    return null;
  }

  return (
    <DashboardContent maxWidth={false}>
      <CustomBreadcrumbs
        heading="Logs de Auditoria"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Logs de Auditoria' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <AuditLogsView />
    </DashboardContent>
  );
}
