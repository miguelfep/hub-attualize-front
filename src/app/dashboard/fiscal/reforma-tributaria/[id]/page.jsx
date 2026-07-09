import { CONFIG } from 'src/config-global';

import { DiagnosticoDetailView } from 'src/sections/reforma-tributaria-diagnostico/view/diagnostico-detail-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Diagnóstico | Reforma Tributária - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = await params;
  return <DiagnosticoDetailView id={id} />;
}
