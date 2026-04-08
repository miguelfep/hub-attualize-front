import { CONFIG } from 'src/config-global';

import { PortalDpDetalheView } from 'src/sections/departamento-pessoal/view/portal-dp-detalhe-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Funcionário | Portal - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { funcionarioId } = await params;
  return <PortalDpDetalheView funcionarioId={funcionarioId} />;
}
