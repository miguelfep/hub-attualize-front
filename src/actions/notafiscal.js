import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function criarNFSeInvoice({ invoiceId, ...data }) {
  return axios.post(`${baseUrl}nota-fiscal/invoice/${invoiceId}/emitir`, { invoiceId, ...data });
}

export async function cancelarNFSeInvoice({ nfseId, motivo }) {
  return axios.post(`${baseUrl}nota-fiscal/${nfseId}/cancelar`, { nfseId, motivo });
}

export async function gerarNotaCobrancaContratos({ cobrancaId }) {
  return axios.post(`${baseUrl}nota-fiscal/cobranca/${cobrancaId}/emitir`);
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

export async function listarNotasFiscaisPorCliente({
  clienteId,
  page = 1,
  limit = 100,
  status,
  inicio,
  fim,
  numeroNota,
  cpfCnpj,
  tipoNota,
}) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (status) params.status = status;
  if (inicio) params.inicio = inicio;
  if (fim) params.fim = fim;
  if (numeroNota) params.numeroNota = numeroNota;
  if (cpfCnpj) params.cpfCnpj = cpfCnpj;
  if (tipoNota) params.tipoNota = tipoNota;
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

// ----------------------------------------------------------------------
// Emissor Nacional (Sefin/ADN)
// ----------------------------------------------------------------------

export function isNotaNacional(nota) {
  return nota?.origem === 'nacional';
}

/**
 * Status/checklist da configuração do Emissor Nacional do cliente.
 * @param {string} clienteId
 * @param {{ testarConexao?: boolean }} [options] - testarConexao valida mTLS + convênio no Sefin
 */
export async function getNacionalStatus(clienteId, { testarConexao = false } = {}) {
  return axios.get(`${baseUrl}nota-fiscal/${clienteId}/nacional/status`, {
    params: testarConexao ? { testarConexao: true } : {},
  });
}

/** Sincronização incremental ADN (a partir do último NSU salvo). */
export async function sincronizarDfeNacional(clienteId) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/nacional/sincronizar-dfe`);
}

/**
 * Importação de notas históricas por período (ADN).
 * @param {string} clienteId
 * @param {{ competencia?: string, ano?: number, mesInicio?: number, mesFim?: number, desdeNSU?: number }} body
 */
export async function sincronizarPeriodoNacional(clienteId, body) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/nacional/sincronizar-periodo`, body);
}

/** Importação ADN por período para TODOS os clientes (somente admin). */
export async function importarPeriodoNacionalAdmin(body) {
  return axios.post(`${baseUrl}nota-fiscal/nacional/importar-periodo`, body);
}

/**
 * Cancela a nota no provedor (eNotas ou Emissor Nacional — o backend ramifica por `origem`).
 * Para notas nacionais dispara o evento e101101 no Sefin (síncrono).
 */
export async function cancelarNotaNoProvedor(notaFiscalId, motivo) {
  return axios.post(`${baseUrl}nota-fiscal/${notaFiscalId}/cancelar`, { motivo });
}

/**
 * Abre o PDF (DANFSe) da nota. Notas nacionais exigem download autenticado
 * (linkNota é caminho relativo da API), as demais abrem o link externo direto.
 */
export async function abrirPdfNota(nota) {
  if (!isNotaNacional(nota)) {
    if (nota?.linkNota && nota.linkNota !== 'Processando...') {
      window.open(nota.linkNota, '_blank', 'noopener,noreferrer');
    }
    return;
  }
  const id = nota._id || nota.id;
  const res = await axios.get(`${baseUrl}nota-fiscal/${id}/nacional/pdf`, {
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
}

/**
 * Baixa o XML autorizado da nota. Notas nacionais usam a rota autenticada;
 * as demais abrem o linkXml externo.
 */
export async function baixarXmlNota(nota) {
  if (!isNotaNacional(nota)) {
    if (nota?.linkXml) window.open(nota.linkXml, '_blank', 'noopener,noreferrer');
    return;
  }
  const id = nota._id || nota.id;
  const res = await axios.get(`${baseUrl}nota-fiscal/${id}/nacional/xml`, {
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: 'application/xml' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `NFSe-${nota.chaveAcesso || nota.numeroNota || id}.xml`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
