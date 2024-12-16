import { CONFIG } from 'src/config-global';

import { RelatorioComercialView } from 'src/sections/relatorios/comercial/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Relatorios Comercial | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <RelatorioComercialView/> ;
}
