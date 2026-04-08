import { CONFIG } from 'src/config-global';

import { PortalDpListView } from 'src/sections/departamento-pessoal/view/portal-dp-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Departamento Pessoal | Portal - ${CONFIG.site.name}` };

export default function Page() {
  return <PortalDpListView />;
}
