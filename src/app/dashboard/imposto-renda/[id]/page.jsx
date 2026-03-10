import { CONFIG } from 'src/config-global';

import { IrAdminDetalheView } from 'src/sections/ir/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Detalhe Pedido IR | Dashboard - ${CONFIG.site.name}`,
};

export default async function Page({ params }) {
  const { id } = await params;
  return <IrAdminDetalheView id={id} />;
}
