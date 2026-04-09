import { CONFIG } from 'src/config-global';

import { GuiaFiscalListView } from 'src/sections/guias-fiscais/view/guia-fiscal-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Gerenciador de Arquivos | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <GuiaFiscalListView />;
}
