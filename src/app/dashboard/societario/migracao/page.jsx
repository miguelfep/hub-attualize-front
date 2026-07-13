import { CONFIG } from 'src/config-global';

import { MigracaoListView } from 'src/sections/societario/migracao/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Migração de contabilidade | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <MigracaoListView />;
}
