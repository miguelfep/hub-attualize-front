import { CONFIG } from 'src/config-global';

import { FinanceiroListView } from 'src/sections/financeiro/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Lista de vendas | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <FinanceiroListView />;
}
