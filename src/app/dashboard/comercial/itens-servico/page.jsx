import { CONFIG } from 'src/config-global';

import { ServiceItensListView } from 'src/sections/comercial/service-itens/service-itens-list-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Itens de Serviço | Dashboard - ${CONFIG.site.name}`,
};

export default function Page() {
  return <ServiceItensListView />;
}
