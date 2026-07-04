import { CONFIG } from 'src/config-global';

import { IntegraContadorRelatorioView } from 'src/sections/relatorios/integra-contador/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Integra Contador | Relatórios - ${CONFIG.site.name}`,
};

export default function Page() {
  return <IntegraContadorRelatorioView />;
}
