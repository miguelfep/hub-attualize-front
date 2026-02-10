import { CONFIG } from 'src/config-global';

import { RecompensasAdminView } from 'src/sections/recompensa/admin/recompensas-admin-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Recompensas - ${CONFIG.site.name}` };

// ----------------------------------------------------------------------

export default function RecompensasAdminPage() {
  return <RecompensasAdminView />;
}
