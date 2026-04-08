import { CONFIG } from 'src/config-global';

import { PortalDpRubricasView } from 'src/sections/departamento-pessoal/view/portal-dp-rubricas-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Rubricas | Portal - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { funcionarioId } = await params;
  return <PortalDpRubricasView funcionarioId={funcionarioId} />;
}
