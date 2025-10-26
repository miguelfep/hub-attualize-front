import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function criarNFSeInvoice({invoiceId, ...data}) {
  return axios.post(`${baseUrl}nota-fiscal/invoice/${invoiceId}/emitir`, {invoiceId, ...data});
}   

export async function cancelarNFSeInvoice({ nfseId, motivo }) {
  return axios.post(`${baseUrl}nota-fiscal/${nfseId}/cancelar`, { nfseId, motivo });
}

export async function getNfsesByInvoice(invoiceId) {
  return axios.get(`${baseUrl}nota-fiscal/invoice/${invoiceId}`);
}

// NFSe para Orçamento (Portal Cliente)
export async function criarNFSeOrcamento({ clienteId, orcamentoId, ...data }) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/orcamento/${orcamentoId}/emitir`, { clienteId, orcamentoId, ...data });
}

export async function getNfsesByOrcamento(clienteId, orcamentoId) {
  return axios.get(`${baseUrl}nota-fiscal/${clienteId}/orcamento/${orcamentoId}`);
}

export async function listarNotasFiscaisPorCliente({ clienteId, page = 1, limit = 10, status }) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (status) params.status = status;
  return axios.get(`${baseUrl}nota-fiscal/${clienteId}`, { params });
}
