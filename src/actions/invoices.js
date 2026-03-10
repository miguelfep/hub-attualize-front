import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export async function getInvoices() {
  const res = await axios.get(endpoints.invoices.list);
  return res.data.invoices;
}

// ----------------------------------------------------------------------

export async function getInvoiceById(id) {
  const res = await axios.get(`${endpoints.invoices.list}/${id}`);
  return res.data;
}

// ----------------------------------------------------------------------

export async function deleteInvoiceById(id) {
  const res = await axios.delete(`${endpoints.invoices.list}/${id}/delete`);
  return res.data;
}

// ----------------------------------------------------------------------

export async function createInvoice(invoiceData) {
  const res = await axios.post(endpoints.invoices.create, invoiceData);
  return res;
}

// ----------------------------------------------------------------------

export async function updateInvoice(id, invoiceData) {
  const res = await axios.put(`${endpoints.invoices.update}/${id}`, invoiceData);
  return res.data;
}

// ----------------------------------------------------------------------
// Checkout Orçamentos / Invoices — API ms-me
// ----------------------------------------------------------------------

/**
 * Nova API ms-me: POST /api/checkout/:invoiceId/pedido
 * Body: paymentMethod 'boleto' | 'pix' | 'credit_card', cpfCnpj, nome, email;
 * PIX: forcarNovoPix opcional; Cartão: cardToken, installments (SDK Mercado Pago).
 * @param {string} invoiceId
 * @param {{
 *   paymentMethod: 'boleto'|'pix'|'credit_card',
 *   cpfCnpj: string,
 *   nome: string,
 *   email: string,
 *   forcarNovoPix?: boolean,
 *   cardToken?: string,
 *   installments?: number
 * }} body
 */
export async function criarPedidoCheckout(invoiceId, body) {
  const res = await axios.post(endpoints.invoices.checkoutPedido(invoiceId), body);
  return res.data;
}

/**
 * Legado: checkout orçamento. Usa nova API ms-me (POST /api/checkout/:id/pedido) quando disponível.
 * Repassa todos os campos; obrigatórios: paymentMethod, cpfCnpj, nome, email.
 */
export async function crirarPedidoOrcamento(id, invoiceData) {
  const paymentMethod = invoiceData?.paymentMethod || 'boleto';
  const useNewApi = typeof endpoints.invoices.checkoutPedido === 'function';
  if (useNewApi) {
    const body = {
      paymentMethod,
      cpfCnpj: invoiceData.cpfCnpj ?? String(invoiceData.cpf || '').replace(/\D/g, '') ?? '',
      nome: invoiceData.nome ?? '',
      email: invoiceData.email ?? '',
    };
    if (paymentMethod === 'pix') body.forcarNovoPix = !!invoiceData.forcarNovoPix;
    if (paymentMethod === 'credit_card') {
      body.cardToken = invoiceData.cardToken;
      body.installments = invoiceData.installments ?? 1;
    }
    const res = await axios.post(endpoints.invoices.checkoutPedido(id), { ...invoiceData, ...body });
    return res.data;
  }
  const res = await axios.post(`${endpoints.invoices.checkout}/${id}`, invoiceData);
  return res.data;
}

export async function enviarPedidoOrcamento(id) {
  return axios.post(`${endpoints.invoices.checkout}/enviar/${id}`);
}

// ----------------------------------------------------------------------

export async function getInvoicesByLeadId(leadId) {
  const res = await axios.get(`${endpoints.invoices.list}/lead/${leadId}`);
  return res.data;
}
