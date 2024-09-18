import { CONFIG } from 'src/config-global';

import { ReceberListView } from 'src/sections/financeiro/receber/list/receber-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Contas a receber | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <ReceberListView />;
}
