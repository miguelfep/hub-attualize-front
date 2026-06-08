import { CONFIG } from 'src/config-global';

import { TemplatesListView } from 'src/sections/tarefas/templates/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Templates Recorrentes | Dashboard - ${CONFIG.site.name}`,
};

export default function Page() {
  return <TemplatesListView />;
}
