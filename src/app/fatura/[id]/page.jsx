import { CONFIG } from 'src/config-global';
import { getFaturaPorId } from 'src/actions/financeiro';

import FaturaViewPage from 'src/sections/faturas/fatura-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Fatura attualize - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;

  const currenteFature = await getFaturaPorId(id);
  console.log('fatura', currenteFature);

  if (!currenteFature) {
    throw new Error('Fatura Não encontrada');
  }

  return <FaturaViewPage faturaData={currenteFature} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };
