
import { CONFIG } from 'src/config-global';
import { getInvoiceById } from 'src/actions/invoices';

import { OrcamentoView } from 'src/sections/orcamento/orcamento-view';
// ----------------------------------------------------------------------

export const metadata = { title: `Orçamento attualize - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;

  const currentInvoice = await getInvoiceById(id);

  return <OrcamentoView invoice={currentInvoice} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };
