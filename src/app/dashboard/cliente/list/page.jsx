import { CONFIG } from 'src/config-global';

import { ClienteListView } from 'src/sections/cliente/view';
// ----------------------------------------------------------------------

export const metadata = { title: `Lista de Clientes | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <ClienteListView />;
}
