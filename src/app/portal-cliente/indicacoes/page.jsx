import { CONFIG } from 'src/config-global';

import { IndicacoesListView } from 'src/sections/indicacao/cliente/indicacoes-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Indicações - ${CONFIG.site.name}` };

// ----------------------------------------------------------------------

export default function IndicacoesPage() {
  return <IndicacoesListView />;
}
