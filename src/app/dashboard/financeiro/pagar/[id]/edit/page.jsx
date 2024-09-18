import { CONFIG } from 'src/config-global';
import { buscarContaPagarPorId } from 'src/actions/contas';

import { PagarEditView } from 'src/sections/financeiro/pagar/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar cliente | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;

  const currentConta = await buscarContaPagarPorId(id);

  return <PagarEditView conta={currentConta} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };
