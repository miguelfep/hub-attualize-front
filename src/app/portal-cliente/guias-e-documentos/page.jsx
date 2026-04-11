import { CONFIG } from 'src/config-global';

import { GuiaFiscalDrivePortalView } from 'src/sections/guias-fiscais/view/guia-fiscal-drive-portal-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Meus Documentos | Portal do Cliente - ${CONFIG.site.name}` };

export default function Page() {
  return <GuiaFiscalDrivePortalView />;
}
