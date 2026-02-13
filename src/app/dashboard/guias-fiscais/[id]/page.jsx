import { CONFIG } from 'src/config-global';

import { GuiaFiscalDetailsView } from 'src/sections/guias-fiscais/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Detalhes do Documento | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  return <GuiaFiscalDetailsView id={id} />;
}
