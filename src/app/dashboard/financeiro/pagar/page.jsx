import { CONFIG } from 'src/config-global';

import { ContasPagarListView } from 'src/sections/financeiro/pagar/list/pagar-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Contas a pagar | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <ContasPagarListView />;
}
