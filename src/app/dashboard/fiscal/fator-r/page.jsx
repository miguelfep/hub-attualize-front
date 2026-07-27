import { CONFIG } from 'src/config-global';

import { FatorRListView } from 'src/sections/fator-r/view';

export const metadata = { title: `Fator R | Fiscal - ${CONFIG.site.name}` };

export default function Page() {
  return <FatorRListView />;
}
