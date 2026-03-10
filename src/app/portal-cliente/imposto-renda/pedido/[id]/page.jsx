import { CONFIG } from 'src/config-global';

import { IrPedidoDetalheView } from 'src/sections/ir/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Meu pedido IR | Portal do Cliente - ${CONFIG.site.name}`,
};

export default async function Page({ params }) {
  const { id } = await params;
  return <IrPedidoDetalheView id={id} />;
}
