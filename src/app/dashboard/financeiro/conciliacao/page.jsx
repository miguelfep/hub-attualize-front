import { CONFIG } from 'src/config-global';

import { ConciliacaoBancariaView } from 'src/sections/financeiro/conciliacao/conciliacao-view';

export const metadata = {
  title: `Conciliação bancária | Dashboard - ${CONFIG.site.name}`,
};

export default function Page() {
  return <ConciliacaoBancariaView />;
}
