import { CONFIG } from 'src/config-global';
import { _invoices } from 'src/_mock/_invoice';
import { getInvoiceById } from 'src/actions/invoices';

import { InvoiceDetailsView } from 'src/sections/invoice/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Detalhes da venda | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;

  const currentInvoice = await getInvoiceById(id);

  return <InvoiceDetailsView invoice={currentInvoice} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };
