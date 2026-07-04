import { CONFIG } from 'src/config-global';

import { BannersListView } from 'src/sections/banners/view';

export const metadata = { title: `Banners | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <BannersListView />;
}
