import { CONFIG } from 'src/config-global';

import { ContratoCreateView } from 'src/sections/financeiro/contrato/view/contrato-create.view';

// ----------------------------------------------------------------------

export const metadata = { title: `Criar novo Contrato | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <ContratoCreateView />;
}
