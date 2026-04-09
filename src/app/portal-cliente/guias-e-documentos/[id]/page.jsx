import { CONFIG } from 'src/config-global';

import { GuiaFiscalPortalDetailsView } from 'src/sections/guias-fiscais/view/guia-fiscal-portal-details-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Detalhes do documento | Portal do Cliente - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = await params;
  return <GuiaFiscalPortalDetailsView id={id} />;
}
