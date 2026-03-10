import { CONFIG } from 'src/config-global';

import { IrAdminListView } from 'src/sections/ir/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Imposto de Renda | Dashboard - ${CONFIG.site.name}`,
};

export default function Page() {
  return <IrAdminListView />;
}
