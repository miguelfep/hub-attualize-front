import { CONFIG } from 'src/config-global';

import { AttualizeConfigView } from 'src/sections/attualize-config/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Emissão Attualize | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <AttualizeConfigView />;
}
