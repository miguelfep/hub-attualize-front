import { CONFIG } from 'src/config-global';

import { NotificacoesListView } from 'src/sections/notificacoes/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Notificações | Dashboard - ${CONFIG.site.name}`,
};

export default function Page() {
  return <NotificacoesListView />;
}
