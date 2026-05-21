import { CONFIG } from 'src/config-global';

import { GuiaFiscalDriveAdminView } from 'src/sections/guias-fiscais/view/guia-fiscal-drive-admin-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Documentos e Guias | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <GuiaFiscalDriveAdminView />;
}
