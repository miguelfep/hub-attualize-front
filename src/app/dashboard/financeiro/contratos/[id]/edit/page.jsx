import { CONFIG } from 'src/config-global';
import { getContratoPorId } from 'src/actions/financeiro';

import { ContratoEditView } from 'src/sections/financeiro/contrato/view/crontrato-edit-vew';
// ----------------------------------------------------------------------

export const metadata = { title: `Editar Venda | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;

  const currentContrato = await getContratoPorId(id);
  console.log(currentContrato);

  return <ContratoEditView contrato={currentContrato} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };
