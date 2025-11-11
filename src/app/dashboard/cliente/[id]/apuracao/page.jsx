import { CONFIG } from 'src/config-global';
import { getClienteById } from 'src/actions/clientes';

import { ApuracaoDashboardView } from 'src/sections/apuracao/view/apuracao-dashboard-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Apuração de impostos | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;
  const cliente = await getClienteById(id);
  return <ApuracaoDashboardView cliente={cliente} />;
}

const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };


