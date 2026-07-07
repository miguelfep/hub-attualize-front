import { CONFIG } from 'src/config-global';

import { PopsListView } from 'src/sections/pops/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `POPs | Dashboard - ${CONFIG.site.name}`,
};

export default function Page() {
  return <PopsListView />;
}
