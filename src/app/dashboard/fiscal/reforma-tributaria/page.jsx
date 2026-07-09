import { CONFIG } from 'src/config-global';

import { DiagnosticoListView } from 'src/sections/reforma-tributaria-diagnostico/view/diagnostico-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Reforma Tributária | Fiscal - ${CONFIG.site.name}` };

export default function Page() {
  return <DiagnosticoListView />;
}
