import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Gera QR Code PIX
 * @param {Object} pixData - Dados do PIX (chave, valor, solicitacaoPagador, calendario, cobrancaId)
 * @returns {Promise} Resposta com QR Code
 */
export async function gerarQrCodePix(pixData) {
  const res = await axios.post(`${baseUrl}pix/qrcode`, pixData);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Consulta QR Code PIX por txid
 * @param {string} txid - Transaction ID
 * @returns {Promise} Dados do QR Code
 */
export async function consultarQrCodePix(txid) {
  const res = await axios.get(`${baseUrl}pix/qrcode/${txid}`);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Consulta cobrança PIX por txid
 * @param {string} txid - Transaction ID
 * @returns {Promise} Dados da cobrança
 */
export async function consultarCobrancaPix(txid) {
  const res = await axios.get(`${baseUrl}pix/cob/${txid}`);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Lista cobranças PIX com filtros
 * @param {Object} filtros - Filtros (inicio, fim, cpf, cnpj, status, paginaAtual, itensPorPagina)
 * @returns {Promise} Lista de cobranças
 */
export async function listarCobrancasPix(filtros = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const url = queryString ? `${baseUrl}pix/cob?${queryString}` : `${baseUrl}pix/cob`;
  
  const res = await axios.get(url);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Gera PIX para Invoice (checkout)
 * @param {string} invoiceId - ID da invoice
 * @param {boolean} forcarNovoPix - Se true, força gerar novo PIX mesmo se já existir um válido
 * @returns {Promise} Dados do PIX gerado
 */
export async function gerarPixParaInvoice(invoiceId, forcarNovoPix = false) {
  const res = await axios.post(`${baseUrl}checkout/orcamento/${invoiceId}`, {
    paymentMethod: 'pix',
    forcarNovoPix,
  });
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Lista PIX recebidos com filtros
 * @param {Object} filtros - Filtros (inicio, fim, txid, cpf, cnpj, paginaAtual, itensPorPagina)
 * @returns {Promise} Lista de PIX recebidos
 */
export async function listarPixRecebidos(filtros = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const url = queryString ? `${baseUrl}pix/recebidos?${queryString}` : `${baseUrl}pix/recebidos`;
  
  const res = await axios.get(url);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Consulta PIX recebido por e2eid
 * @param {string} e2eid - End-to-end ID
 * @returns {Promise} Dados do PIX recebido
 */
export async function consultarPixRecebido(e2eid) {
  const res = await axios.get(`${baseUrl}pix/recebidos/${e2eid}`);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Devolve um PIX recebido
 * @param {string} e2eid - End-to-end ID
 * @param {string} idDevolucao - ID da devolução
 * @param {Object} dadosDevolucao - Dados da devolução (valor, natureza, descricao)
 * @returns {Promise} Resultado da devolução
 */
export async function devolverPix(e2eid, idDevolucao, dadosDevolucao) {
  const res = await axios.post(`${baseUrl}pix/recebidos/${e2eid}/devolucao/${idDevolucao}`, dadosDevolucao);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Lista logs de auditoria PIX
 * @param {Object} filtros - Filtros (tipoOperacao, status, txid, e2eid, cobrancaId, inicio, fim, pagina, limite)
 * @returns {Promise} Lista de logs
 */
export async function listarLogsPix(filtros = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const url = queryString ? `${baseUrl}pix/logs?${queryString}` : `${baseUrl}pix/logs`;
  
  const res = await axios.get(url);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Obtém estatísticas dos logs PIX
 * @param {string} inicio - Data inicial (YYYY-MM-DD)
 * @param {string} fim - Data final (YYYY-MM-DD)
 * @returns {Promise} Estatísticas
 */
export async function obterEstatisticasLogsPix(inicio, fim) {
  const params = new URLSearchParams();
  if (inicio) params.append('inicio', inicio);
  if (fim) params.append('fim', fim);

  const queryString = params.toString();
  const url = queryString ? `${baseUrl}pix/logs/estatisticas?${queryString}` : `${baseUrl}pix/logs/estatisticas`;
  
  const res = await axios.get(url);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Gera relatório de PIX recebidos
 * @param {string} inicio - Data inicial (YYYY-MM-DD)
 * @param {string} fim - Data final (YYYY-MM-DD)
 * @param {string} agruparPor - "dia" ou "mes"
 * @returns {Promise} Relatório
 */
export async function gerarRelatorioPixRecebidos(inicio, fim, agruparPor = 'dia') {
  const params = new URLSearchParams();
  params.append('inicio', inicio);
  params.append('fim', fim);
  if (agruparPor) params.append('agruparPor', agruparPor);

  const res = await axios.get(`${baseUrl}pix/relatorios/recebidos?${params.toString()}`);
  return res.data;
}
