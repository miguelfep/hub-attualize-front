import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

/**
 * Obter código de indicação do cliente autenticado
 */
export async function obterCodigoIndicacao() {
  try {
    const res = await axios.get(endpoints.indicacao.codigo);
    return res.data;
  } catch (error) {
    console.error('Erro ao obter código de indicação:', error);
    throw error;
  }
}

/**
 * Obter link de indicação do cliente autenticado
 */
export async function obterLinkIndicacao() {
  try {
    const res = await axios.get(endpoints.indicacao.link);
    return res.data;
  } catch (error) {
    console.error('Erro ao obter link de indicação:', error);
    throw error;
  }
}

/**
 * Criar uma nova indicação (rota pública)
 * @param {Object} data - Dados da indicação
 * @param {string} data.codigoIndicacao - Código de indicação
 * @param {string} data.nome - Nome do indicado
 * @param {string} data.email - Email do indicado
 * @param {string} data.telefone - Telefone do indicado
 * @param {string} [data.cpf] - CPF do indicado (opcional)
 * @param {string} [data.estado] - Estado do indicado (opcional)
 * @param {string} [data.cidade] - Cidade do indicado (opcional)
 * @param {string} [data.observacoes] - Observações (opcional)
 */
export async function criarIndicacao(data) {
  try {
    const res = await axios.post(endpoints.indicacao.criar, data);
    return res.data;
  } catch (error) {
    console.error('Erro ao criar indicação:', error);
    throw error;
  }
}

/**
 * Listar todas as indicações do cliente autenticado
 */
export async function listarMinhasIndicacoes() {
  try {
    const res = await axios.get(endpoints.indicacao.minhas);
    return res.data;
  } catch (error) {
    console.error('Erro ao listar indicações:', error);
    throw error;
  }
}

/**
 * Obter detalhes de uma indicação específica
 * @param {string} id - ID da indicação
 */
export async function obterDetalhesIndicacao(id) {
  try {
    const res = await axios.get(endpoints.indicacao.detalhes(id));
    return res.data;
  } catch (error) {
    console.error('Erro ao obter detalhes da indicação:', error);
    throw error;
  }
}
