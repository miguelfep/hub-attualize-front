import { CONFIG } from 'src/config-global';

import { ApuracaoFilaView } from 'src/sections/fator-r/view';

export const metadata = { title: `Apuração do Simples | Fiscal - ${CONFIG.site.name}` };

export default function Page() {
  return <ApuracaoFilaView />;
}
