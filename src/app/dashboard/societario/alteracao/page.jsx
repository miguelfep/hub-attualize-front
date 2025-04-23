import { CONFIG } from 'src/config-global';

import AlteracaoListView from 'src/sections/societario/alteracao/view/alteracao-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Alteração | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <AlteracaoListView />  
}
