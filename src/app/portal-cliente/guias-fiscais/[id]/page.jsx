import { CONFIG } from 'src/config-global';

import { GuiaFiscalPortalDetailsView } from 'src/sections/guias-fiscais/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Detalhes da Guia Fiscal | Portal do Cliente - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = await params;
  return <GuiaFiscalPortalDetailsView id={id} />;
}
