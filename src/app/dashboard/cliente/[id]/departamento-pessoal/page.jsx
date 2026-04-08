import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdminDpListView } from 'src/sections/departamento-pessoal/view/admin-dp-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Departamento Pessoal | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = await params;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Departamento Pessoal"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Clientes', href: paths.dashboard.cliente.root },
          { name: 'Funcionários' },
        ]}
        sx={{ mb: 2 }}
      />
      <AdminDpListView clienteId={id} />
    </DashboardContent>
  );
}
