import { Suspense } from 'react';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdminDpApontamentosHubView } from 'src/sections/departamento-pessoal/view/admin-dp-apontamentos-hub-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Apontamentos · Conferência HUB | Dashboard - ${CONFIG.site.name}` };

function HubFallback() {
  return (
    <Box sx={{ width: 1 }}>
      <LinearProgress />
    </Box>
  );
}

export default function Page() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Conferência / lançamentos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Departamento Pessoal', href: paths.dashboard.cliente.departamentoPessoalHub },
          { name: 'Apontamentos', href: paths.dashboard.cliente.departamentoPessoalApontamentos },
          { name: 'HUB' },
        ]}
        sx={{ mb: 2 }}
      />
      <Suspense fallback={<HubFallback />}>
        <AdminDpApontamentosHubView />
      </Suspense>
    </DashboardContent>
  );
}
