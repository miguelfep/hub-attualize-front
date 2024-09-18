import { CONFIG } from 'src/config-global';

import { PagarCreateView } from 'src/sections/financeiro/pagar/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Criar uma nova conta | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <PagarCreateView />;
}
