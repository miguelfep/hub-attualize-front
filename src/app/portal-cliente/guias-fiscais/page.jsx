import { CONFIG } from 'src/config-global';

import { GuiaFiscalPortalListViewImproved } from 'src/sections/guias-fiscais/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Guias | Portal do Cliente - ${CONFIG.site.name}` };

export default function Page() {
  return <GuiaFiscalPortalListViewImproved />;
}
