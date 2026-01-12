import { CONFIG } from 'src/config-global';

import { AulaNewView } from 'src/sections/aulas/admin/view/aula-new-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Nova Aula | Dashboard - ${CONFIG.site.name}` };

export default function AulaNewPage() {
  return <AulaNewView />;
}

