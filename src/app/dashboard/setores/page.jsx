import { CONFIG } from 'src/config-global';

import { SetoresListView } from 'src/sections/setores/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Setores | Dashboard - ${CONFIG.site.name}`,
};

export default function Page() {
  return <SetoresListView />;
}
