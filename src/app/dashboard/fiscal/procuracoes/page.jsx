import { CONFIG } from 'src/config-global';

import { VinculosListView } from 'src/sections/procuracoes/view';

export const metadata = { title: `Vínculos e procurações | Fiscal - ${CONFIG.site.name}` };

export default function Page() {
  return <VinculosListView />;
}
