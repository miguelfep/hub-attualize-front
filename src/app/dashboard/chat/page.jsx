import { CONFIG } from 'src/config-global';

import { ChatInternoView } from 'src/sections/chat-interno/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Chat interno | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <ChatInternoView />;
}
