import { CONFIG } from 'src/config-global';

import { InvoiceCreateView } from 'src/sections/invoice/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Criar nova venda | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <InvoiceCreateView />;
}
