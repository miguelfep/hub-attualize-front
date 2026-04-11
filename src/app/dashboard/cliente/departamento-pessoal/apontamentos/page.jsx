import { Suspense } from 'react';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdminDpApontamentosView } from 'src/sections/departamento-pessoal/view/admin-dp-apontamentos-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Apontamentos (DP) | Dashboard - ${CONFIG.site.name}` };

function ApontamentosFallback() {
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
        heading="Apontamentos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Departamento Pessoal', href: paths.dashboard.cliente.departamentoPessoalHub },
          { name: 'Apontamentos' },
        ]}
        sx={{ mb: 2 }}
      />
      <Suspense fallback={<ApontamentosFallback />}>
        <AdminDpApontamentosView />
      </Suspense>
    </DashboardContent>
  );
}
