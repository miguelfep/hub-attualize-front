import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { AdminDpFuncionarioView } from 'src/sections/departamento-pessoal/view/admin-dp-funcionario-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Funcionário (DP) | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = await params;

  return (
    <DashboardContent>
      <AdminDpFuncionarioView funcionarioId={id} />
    </DashboardContent>
  );
}
