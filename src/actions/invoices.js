import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export async function getInvoices() {
  const res = await axios.get(endpoints.invoices.list);
  return res.data;
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

export async function crirarPedidoOrcamento(id, invoiceData) {
  const res = await axios.post(`${endpoints.invoices.checkout}/${id}`, invoiceData);
  return res.data;
}
