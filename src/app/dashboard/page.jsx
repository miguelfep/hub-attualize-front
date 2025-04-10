import { CONFIG } from 'src/config-global';

import { DashboardRouterView } from 'src/sections/overview/app/view/DashboardRouterView';

// ----------------------------------------------------------------------

export const metadata = { title: `Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <DashboardRouterView />;
}
