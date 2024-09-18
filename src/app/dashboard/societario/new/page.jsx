import { CONFIG } from 'src/config-global';

import { AberturaCreateView } from 'src/sections/societario/view/abertura-create-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Criar nova abertura | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <AberturaCreateView />;
}
