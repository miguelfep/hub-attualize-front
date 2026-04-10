import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdminDpNovoView } from 'src/sections/departamento-pessoal/view/admin-dp-novo-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Novo funcionário (DP) | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = await params;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Novo funcionário"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Clientes', href: paths.dashboard.cliente.root },
          { name: 'Departamento Pessoal', href: paths.dashboard.cliente.departamentoPessoal(id) },
          { name: 'Novo' },
        ]}
        sx={{ mb: 2 }}
      />
      <AdminDpNovoView clienteId={id} />
    </DashboardContent>
  );
}
