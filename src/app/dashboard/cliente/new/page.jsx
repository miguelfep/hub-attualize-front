import { CONFIG } from 'src/config-global';

import { ClienteCreateView } from 'src/sections/cliente/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Create a new user | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <ClienteCreateView />;
}
