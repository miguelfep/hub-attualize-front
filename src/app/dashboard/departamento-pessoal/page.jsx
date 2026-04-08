import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdminDpHubView } from 'src/sections/departamento-pessoal/view/admin-dp-hub-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Departamento Pessoal | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Departamento Pessoal"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Departamento Pessoal' },
        ]}
        sx={{ mb: 3 }}
      />
      <AdminDpHubView />
    </DashboardContent>
  );
}
