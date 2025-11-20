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

export async function listarNotasFiscaisPorCliente({ clienteId, page = 1, limit = 100, status, inicio, fim }) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (status) params.status = status;
  if (inicio) params.inicio = inicio;
  if (fim) params.fim = fim;
  return axios.get(`${baseUrl}nota-fiscal/${clienteId}`, { params });
}

/**
 * Cancelar nota fiscal
 * @param {string} notaFiscalId - ID da nota fiscal
 * @param {string} motivoCancelamento - Motivo do cancelamento
 * @param {string} dataCancelamento - Data do cancelamento (ISO string)
 * @returns {Promise}
 */
export async function cancelarNotaFiscal(notaFiscalId, motivoCancelamento, dataCancelamento) {
  return axios.put(`${baseUrl}nota-fiscal/${notaFiscalId}/status`, {
    status: 'cancelada',
    motivoCancelamento,
    dataCancelamento,
  });
}

/**
 * Importar nota fiscal via XML
 * @param {string} clienteId - ID do cliente
 * @param {File} xmlFile - Arquivo XML da nota fiscal
 * @returns {Promise<{sucesso: boolean, mensagem: string, criado: boolean, atualizado: boolean, notaFiscalId?: string, arquivo?: string}>}
 */
export async function importarXmlNotaFiscal(clienteId, xmlFile) {
  if (!xmlFile) {
    throw new Error('Arquivo XML é obrigatório');
  }

  if (!xmlFile.type.includes('xml') && !xmlFile.name.endsWith('.xml')) {
    throw new Error('Arquivo deve ser um XML (.xml)');
  }

  const formData = new FormData();
  formData.append('xml', xmlFile);

  const response = await axios.post(`${baseUrl}nota-fiscal/${clienteId}/importar-xml`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
