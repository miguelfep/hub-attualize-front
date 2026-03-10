import { CONFIG } from 'src/config-global';

import { IrColetaView } from 'src/sections/ir/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Envio de documentos IR | ${CONFIG.site.name}`,
  description: 'Portal de envio de documentos para declaração de Imposto de Renda.',
};

export default async function Page({ params }) {
  const { token } = await params;
  return <IrColetaView token={token} />;
}
