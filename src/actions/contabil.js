import axios from 'axios';

const API_BASE_URL = 'http://localhost:9443/api/contabilidade'; // Ajuste para o endpoint da sua API

// ----------------------------------------------------------------------
// Extratos
// ----------------------------------------------------------------------

export const salvarExtrato = async (extrato) => {
    console.log('Extrato enviado:', extrato); // Verifique se o objeto está correto
    const response = await axios.post(`${API_BASE_URL}/extratos`, extrato);
    return response.data;
  };

/**
 * Obter todos os extratos de um cliente
 * @param {string} clienteId - ID do cliente
 */
export const obterExtratosPorCliente = async (clienteId) => {
  const response = await axios.get(`${API_BASE_URL}/extratos/cliente/${clienteId}`);
  return response.data;
};

/**
 * Obter extratos de um cliente por mês e ano
 * @param {string} clienteId - ID do cliente
 * @param {number} ano - Ano do período
 * @param {number} mes - Mês do período
 */
export const obterExtratosPorMes = async (clienteId, ano, mes) => {
  const response = await axios.get(`${API_BASE_URL}/extratos/mes/${clienteId}`, {
    params: { ano, mes },
  });
  return response.data;
};

// ----------------------------------------------------------------------
// Lançamentos
// ----------------------------------------------------------------------

/**
 * Conciliar um lançamento
 * @param {string} clienteId - ID do cliente
 * @param {string} lancamentoId - ID do lançamento
 * @param {string} novaConciliacao - Nova categoria de conciliação
 */
export const conciliarLancamento = async (clienteId, lancamentoId, novaConciliacao) => {
  const response = await axios.patch(
    `${API_BASE_URL}/lancamentos/${clienteId}/${lancamentoId}`,
    { novaConciliacao }
  );
  return response.data;
};

// ----------------------------------------------------------------------
// Relatórios
// ----------------------------------------------------------------------

/**
 * Gerar um relatório contábil
 * @param {string} clienteId - ID do cliente
 * @param {Date} periodoInicio - Data inicial do período
 * @param {Date} periodoFim - Data final do período
 */
export const gerarRelatorio = async (clienteId, periodoInicio, periodoFim) => {
  const response = await axios.post(`${API_BASE_URL}/relatorios/${clienteId}`, {
    periodoInicio,
    periodoFim,
  });
  return response.data;
};

// ----------------------------------------------------------------------
// Categorias
// ----------------------------------------------------------------------

/**
 * Criar novas categorias contábeis
 * @param {Array} categorias - Lista de categorias a serem criadas
 */
export const criarCategorias = async (categorias) => {
  const response = await axios.post(`${API_BASE_URL}/categorias`, categorias);
  return response.data;
};

/**
 * Listar todas as categorias contábeis
 */
export const listarCategorias = async () => {
  const response = await axios.get(`${API_BASE_URL}/categorias`);
  return response.data;
};

/**
 * Deletar uma categoria contábil
 * @param {string} id - ID da categoria
 */
export const deletarCategoria = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/categorias/${id}`);
  return response.data;
};

// ----------------------------------------------------------------------
// Plano de Contas
// ----------------------------------------------------------------------

/**
 * Criar um plano de contas para um cliente
 * @param {string} clienteId - ID do cliente
 * @param {Array} categorias - Lista de categorias do plano de contas
 */
export const criarPlanoContas = async (clienteId, categorias) => {
  const response = await axios.post(`${API_BASE_URL}/plano-contas`, {
    clienteId,
    categorias,
  });
  return response.data;
};

/**
 * Obter o plano de contas de um cliente
 * @param {string} clienteId - ID do cliente
 */
export const obterPlanoContasPorCliente = async (clienteId) => {
  const response = await axios.get(`${API_BASE_URL}/planos-contas/${clienteId}`);
  return response.data;
};

/**
 * Editar um plano de contas
 * @param {string} planoId - ID do plano de contas
 * @param {Array} categorias - Lista de categorias atualizadas
 */
export const editarPlanoContas = async (planoId, categorias) => {
  const response = await axios.put(`${API_BASE_URL}/plano-contas/${planoId}`, {
    categorias,
  });
  return response.data;
};

/**
 * Deletar um plano de contas
 * @param {string} planoId - ID do plano de contas
 */
export const deletarPlanoContas = async (planoId) => {
  const response = await axios.delete(`${API_BASE_URL}/plano-contas/${planoId}`);
  return response.data;
};
