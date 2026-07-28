import { CONFIG } from 'src/config-global';

import { ApuracaoFilaView } from 'src/sections/apuracao/view';

export const metadata = { title: `Apuração de impostos | Fiscal - ${CONFIG.site.name}` };

export default function Page() {
  return <ApuracaoFilaView />;
}
