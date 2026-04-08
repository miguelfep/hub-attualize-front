import { CONFIG } from 'src/config-global';

import { PortalDpDemissaoView } from 'src/sections/departamento-pessoal/view/portal-dp-demissao-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Solicitar demissão | Portal - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { funcionarioId } = await params;
  return <PortalDpDemissaoView funcionarioId={funcionarioId} />;
}
