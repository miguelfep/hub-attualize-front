import { CONFIG } from 'src/config-global';
import { InvoiceProvider } from 'src/contexts/InvoiceContext';
import { getInvoices, getInvoiceById } from 'src/actions/invoices';

import { OrcamentoView } from 'src/sections/orcamento/orcamento-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Orçamento attualize - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  // No Next.js 16, params é uma Promise e precisa ser aguardado
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const data = await getInvoiceById(id);
    
    // Garantir que data é um objeto válido
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Resposta inválida da API');
    }

    // Extrair invoice e nfses com valores padrão seguros
    let invoice = data.invoice || data;
    const {nfses} = data;

    // Se invoice ainda não for um objeto válido, usar data diretamente
    if (!invoice || typeof invoice !== 'object' || Array.isArray(invoice)) {
      if (data && typeof data === 'object' && !Array.isArray(data) && ('_id' in data || 'id' in data)) {
        invoice = data;
      } else {
        throw new Error('Invoice não encontrada');
      }
    }

    // Garantir que nfses é um array válido
    const safeNfses = Array.isArray(nfses) 
      ? nfses 
      : (invoice?.nfses && Array.isArray(invoice.nfses) ? invoice.nfses : []);

    // Criar uma cópia serializável do invoice
    let safeInvoice = invoice;
    if (invoice && typeof invoice === 'object' && !Array.isArray(invoice)) {
      try {
        safeInvoice = { ...invoice};
      } catch (e) {
        console.warn('Não foi possível criar cópia do invoice:', e);
        safeInvoice = invoice;
      }
    }

    if (!safeInvoice) {
      throw new Error('Invoice não encontrada');
    }

    return (
      <InvoiceProvider initialInvoice={safeInvoice}>
        <OrcamentoView invoice={safeInvoice} nfses={safeNfses} />
      </InvoiceProvider>
    );
  } catch (error) {
    console.error('Erro ao carregar orçamento:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
export const dynamic = 'force-dynamic';

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
