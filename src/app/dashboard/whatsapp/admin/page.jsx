import { CONFIG } from 'src/config-global';

import { WhatsAppAdminView } from 'src/sections/whatsapp/admin/view';

// ----------------------------------------------------------------------

export const metadata = { title: `WhatsApp — Administração | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <WhatsAppAdminView />;
}
