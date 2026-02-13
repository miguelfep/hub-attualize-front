import { CONFIG } from 'src/config-global';

import { GuiaFiscalEditView } from 'src/sections/guias-fiscais/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar Documento | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  return <GuiaFiscalEditView id={id} />;
}
