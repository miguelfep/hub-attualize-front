import { CONFIG } from 'src/config-global';

import { CentroCustoListView } from 'src/sections/financeiro/centro-custo/centro-custo-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Centro de Custo | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <CentroCustoListView />;
}
