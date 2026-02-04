import { CONFIG } from 'src/config-global';

import { GuiaFiscalListView } from 'src/sections/guias-fiscais/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Guias e Documentos | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <GuiaFiscalListView />;
}
