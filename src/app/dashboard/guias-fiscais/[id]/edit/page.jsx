import { CONFIG } from 'src/config-global';

import { GuiaFiscalEditView } from 'src/sections/guias-fiscais/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar Documento | Dashboard - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <GuiaFiscalEditView id={params.id} />;
}
