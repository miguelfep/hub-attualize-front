import { CONFIG } from 'src/config-global';
import { getInvoiceById } from 'src/actions/invoices';

import { InvoiceEditView } from 'src/sections/invoice/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar Venda | Dashboard - ${CONFIG.site.name}` };

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

    // Extrair invoice com valores padrão seguros
    let invoice = data.invoice || data;

    // Se invoice ainda não for um objeto válido, usar data diretamente
    if (!invoice || typeof invoice !== 'object' || Array.isArray(invoice)) {
      if (data && typeof data === 'object' && !Array.isArray(data) && ('_id' in data || 'id' in data)) {
        invoice = data;
      } else {
        throw new Error('Invoice não encontrada');
      }
    }

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

    return <InvoiceEditView invoice={safeInvoice} />;
  } catch (error) {
    console.error('Erro ao carregar invoice:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
export const dynamic = 'force-dynamic';
