import { CONFIG } from 'src/config-global';
import { getInvoices, getInvoiceById } from 'src/actions/invoices';

import { OrcamentoView } from 'src/sections/orcamento/orcamento-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Orçamento attualize - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;

  try {
    const currentInvoice = await getInvoiceById(id);

    if (!currentInvoice) {
      throw new Error('Invoice not found');
    }

    return <OrcamentoView invoice={currentInvoice} />;
  } catch (error) {
    console.error('Failed to fetch invoice:', error);

    // Handle error appropriately, e.g., return a custom error component
    return <div>Failed to load invoice details. Please try again later.</div>;
  }
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
