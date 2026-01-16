import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Upload de arquivo para conciliação bancária
 * @param {string} clienteId - ID do cliente
 * @param {File} file - Arquivo (.ofx, .pdf ou .xlsx)
 * @param {Function} onUploadProgress - Callback para progresso do upload
 * @returns {Promise}
 */
export async function uploadArquivoConciliacao(clienteId, file, onUploadProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('clienteId', clienteId);

  return axios.post(`${baseUrl}reconciliation/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
}

/**
 * Listar conciliações de um cliente
 * @param {string} clienteId - ID do cliente
 * @param {Object} params - Parâmetros de filtro (page, limit, status, dataInicio, dataFim)
 * @returns {Promise}
 */
export async function listarConciliacoes(clienteId, params = {}) {
  return axios.get(`${baseUrl}reconciliation/cliente/${clienteId}`, { params });
}

/**
 * Obter detalhes de uma conciliação
 * @param {string} conciliacaoId - ID da conciliação
 * @returns {Promise}
 */
export async function obterConciliacao(conciliacaoId) {
  return axios.get(`${baseUrl}reconciliation/${conciliacaoId}`);
}

/**
 * Confirmar transação manualmente
 * @param {string} conciliacaoId - ID da conciliação
 * @param {string} transacaoId - ID da transação
 * @param {Object} data - Dados da confirmação (contaContabil, centroCusto, observacoes)
 * @returns {Promise}
 */
export async function confirmarTransacao(conciliacaoId, transacaoId, data) {
  return axios.post(`${baseUrl}reconciliation/${conciliacaoId}/confirm`, {
    transacaoId,
    ...data,
  });
}

/**
 * Exportar CSV da conciliação
 * @param {string} conciliacaoId - ID da conciliação
 * @returns {Promise}
 */
export async function exportarConciliacaoCSV(conciliacaoId) {
  return axios.post(`${baseUrl}reconciliation/${conciliacaoId}/export`);
}

/**
 * Download do arquivo CSV
 * @param {string} fileName - Nome do arquivo
 * @returns {string} URL para download
 */
export function obterUrlDownloadCSV(fileName) {
  return `${baseUrl}reconciliation/download/${fileName}`;
}

/**
 * Atualizar status da conciliação
 * @param {string} conciliacaoId - ID da conciliação
 * @param {string} status - Novo status (pendente, revisao, concluida, cancelada)
 * @returns {Promise}
 */
export async function atualizarStatusConciliacao(conciliacaoId, status) {
  return axios.patch(`${baseUrl}reconciliation/${conciliacaoId}`, { status });
}

/**
 * Deletar conciliação
 * @param {string} conciliacaoId - ID da conciliação
 * @returns {Promise}
 */
export async function deletarConciliacao(conciliacaoId) {
  return axios.delete(`${baseUrl}reconciliation/${conciliacaoId}`);
}
