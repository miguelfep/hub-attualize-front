import { CONFIG } from 'src/config-global';

import { TarefasListView } from 'src/sections/tarefas/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Minhas Tarefas | Dashboard - ${CONFIG.site.name}`,
};

export default function Page() {
  return <TarefasListView minhas />;
}
