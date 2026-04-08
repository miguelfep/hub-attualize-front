import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdminDpFuncionarioView } from 'src/sections/departamento-pessoal/view/admin-dp-funcionario-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Funcionário (DP) | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = await params;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Funcionário"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Clientes', href: paths.dashboard.cliente.root },
          { name: 'Detalhe' },
        ]}
        sx={{ mb: 2 }}
      />
      <AdminDpFuncionarioView funcionarioId={id} />
    </DashboardContent>
  );
}
