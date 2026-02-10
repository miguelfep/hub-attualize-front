import { CONFIG } from 'src/config-global';

import { RecompensasDashboardView } from 'src/sections/recompensa/cliente/recompensas-dashboard-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Recompensas - ${CONFIG.site.name}` };

// ----------------------------------------------------------------------

export default function RecompensasPage() {
  return <RecompensasDashboardView />;
}
