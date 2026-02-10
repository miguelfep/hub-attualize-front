import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

/**
 * Obter conta de recompensa do cliente autenticado
 */
export async function obterContaRecompensa() {
  try {
    const res = await axios.get(endpoints.recompensa.conta);
    return res.data;
  } catch (error) {
    console.error('Erro ao obter conta de recompensa:', error);
    throw error;
  }
}

/**
 * Solicitar desconto em um contrato
 * @param {Object} data - Dados da solicitação
 * @param {string} data.contratoId - ID do contrato
 * @param {number} data.valor - Valor do desconto
 */
export async function solicitarDesconto(data) {
  try {
    const res = await axios.post(endpoints.recompensa.solicitarDesconto, data);
    return res.data;
  } catch (error) {
    console.error('Erro ao solicitar desconto:', error);
    throw error;
  }
}

/**
 * Solicitar PIX
 * @param {Object} data - Dados da solicitação
 * @param {number} data.valor - Valor do PIX
 * @param {string} data.chavePix - Chave PIX
 */
export async function solicitarPix(data) {
  try {
    const res = await axios.post(endpoints.recompensa.solicitarPix, data);
    return res.data;
  } catch (error) {
    console.error('Erro ao solicitar PIX:', error);
    throw error;
  }
}

/**
 * Listar transações da conta de recompensa
 * @param {Object} [params] - Parâmetros de filtro
 * @param {string} [params.tipo] - Tipo da transação (recompensa, desconto, pix, estorno)
 * @param {string} [params.status] - Status da transação (pendente, aprovado, rejeitado, processado)
 * @param {string} [params.dataInicio] - Data inicial (YYYY-MM-DD)
 * @param {string} [params.dataFim] - Data final (YYYY-MM-DD)
 */
export async function listarTransacoes(params = {}) {
  try {
    const res = await axios.get(endpoints.recompensa.transacoes, { params });
    return res.data;
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    throw error;
  }
}

/**
 * Listar PIX pendentes (Admin)
 */
export async function listarPixPendentes() {
  try {
    const res = await axios.get(endpoints.recompensa.pixPendentes);
    return res.data;
  } catch (error) {
    console.error('Erro ao listar PIX pendentes:', error);
    throw error;
  }
}

/**
 * Aprovar uma transação de PIX (Admin)
 * @param {string} id - ID da transação
 */
export async function aprovarTransacao(id) {
  try {
    const res = await axios.put(endpoints.recompensa.aprovarTransacao(id));
    return res.data;
  } catch (error) {
    console.error('Erro ao aprovar transação:', error);
    throw error;
  }
}

/**
 * Rejeitar uma transação de PIX (Admin)
 * @param {string} id - ID da transação
 * @param {Object} [data] - Dados da rejeição
 * @param {string} [data.motivo] - Motivo da rejeição
 */
export async function rejeitarTransacao(id, data = {}) {
  try {
    const res = await axios.put(endpoints.recompensa.rejeitarTransacao(id), data);
    return res.data;
  } catch (error) {
    console.error('Erro ao rejeitar transação:', error);
    throw error;
  }
}
