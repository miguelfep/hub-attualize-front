import { CONFIG } from 'src/config-global';

import { GuiaFiscalUploadView } from 'src/sections/guias-fiscais/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Upload de Guias e Documentos | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <GuiaFiscalUploadView />;
}
