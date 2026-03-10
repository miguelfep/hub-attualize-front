import { CONFIG } from 'src/config-global';

import { IrMeusPedidosView } from 'src/sections/ir/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Meus pedidos IR | Portal do Cliente - ${CONFIG.site.name}`,
};

export default function Page() {
  return <IrMeusPedidosView />;
}
