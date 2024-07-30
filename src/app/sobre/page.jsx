import { CONFIG } from 'src/config-global';

import { AboutView } from 'src/sections/about/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Sobre a - ${CONFIG.site.name}` };

export default function Page() {
  return <AboutView />;
}
