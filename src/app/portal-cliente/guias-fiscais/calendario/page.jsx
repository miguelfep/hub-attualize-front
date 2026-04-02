import { CONFIG } from 'src/config-global';

import { GuiaFiscalCalendarView } from 'src/sections/guias-fiscais/view/guia-fiscal-calendar-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Calendário de Guias Fiscais | Portal do Cliente - ${CONFIG.site.name}` };

export default function Page() {
  return <GuiaFiscalCalendarView />;
}
