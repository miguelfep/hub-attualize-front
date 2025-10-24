import { CONFIG } from 'src/config-global';
import { getInvoices, getInvoiceById } from 'src/actions/invoices';

import { OrcamentoView } from 'src/sections/orcamento/orcamento-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Orçamento attualize - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;

  const {invoice, nfses} = await getInvoiceById(id);

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return <OrcamentoView invoice={invoice} nfses={nfses} />;
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
    try {
      const invoices = await getInvoices(); // Assumindo que há uma função para obter todas as invoices
      console.log('invoices', invoices);
      return invoices.map((invoice) => ({ id: invoice.id }));
    } catch (error) {
      console.error('Failed to generate static params:', error);
      return [];
    }
  }
  return [];
}
