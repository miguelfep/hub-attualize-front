import { CONFIG } from 'src/config-global';

import { ContratoListView } from 'src/sections/financeiro/contrato/list/contrato-list-view';
// ----------------------------------------------------------------------

export const metadata = { title: `Contratos | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <ContratoListView />;
}
