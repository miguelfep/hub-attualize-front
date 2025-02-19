import { CONFIG } from 'src/config-global';

import { ClienteCreateView } from 'src/sections/cliente/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Criar novo usuário | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <ClienteCreateView />;
}
