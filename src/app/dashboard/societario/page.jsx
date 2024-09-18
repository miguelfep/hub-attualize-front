import { CONFIG } from 'src/config-global';

import { AberturasListView } from 'src/sections/societario/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Aberturas de empresa | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <AberturasListView />;
}
