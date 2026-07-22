import { CONFIG } from 'src/config-global';

import { WhatsAppView } from 'src/sections/whatsapp/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Atendimento WhatsApp | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <WhatsAppView />;
}
