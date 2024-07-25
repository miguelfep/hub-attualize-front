import { CONFIG } from 'src/config-global';
import { getInvoices, getInvoiceById } from 'src/actions/invoices';

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

/**
 * [2] Static exports
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    const invoices = await getInvoices();
    return invoices.map((invoice) => ({ id: invoice.id }));
  }
  return [];
}
