import { CONFIG } from 'src/config-global';

import { GuiaFiscalDetailsView } from 'src/sections/guias-fiscais/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Detalhes do Documento | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <GuiaFiscalDetailsView id={params.id} />;
}
