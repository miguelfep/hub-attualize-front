import { CONFIG } from 'src/config-global';

import { PortalDpNovoView } from 'src/sections/departamento-pessoal/view/portal-dp-novo-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Novo funcionário | Portal - ${CONFIG.site.name}` };

export default function Page() {
  return <PortalDpNovoView />;
}
