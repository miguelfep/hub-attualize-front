import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Upload de arquivo para conciliação bancária
 * @param {string} clienteId - ID do cliente
 * @param {string} bancoId - ID do banco ⚠️ OBRIGATÓRIO
 * @param {File} file - Arquivo (.ofx, .pdf ou .xlsx)
 * @param {Function} onUploadProgress - Callback para progresso do upload
 * @returns {Promise}
 */
export async function uploadArquivoConciliacao(clienteId, bancoId, mesAno, file, onUploadProgress) {
  const formData = new FormData();
  formData.append('file', file); // Backend espera 'file'
  formData.append('clienteId', clienteId);
  formData.append('bancoId', bancoId);
  formData.append('mesAno', mesAno); // 🔥 OBRIGATÓRIO - formato YYYY-MM

  return axios.post(`${baseUrl}conciliacao/upload`, formData, {
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
  return axios.get(`${baseUrl}conciliacao/cliente/${clienteId}`, { params });
}

/**
 * Obter detalhes de uma conciliação
 * 🔥 USA API ANTIGA (reconciliation) - Endpoint documentado
 * @param {string} conciliacaoId - ID da conciliação
 * @returns {Promise}
 */
export async function obterConciliacao(conciliacaoId) {
  return axios.get(`${baseUrl}reconciliation/${conciliacaoId}`);
}

/**
 * Confirmar transação manualmente
 * 🔥 ATUALIZADO: Agora usa /confirmar e recebe apenas IDs
 * @param {string} transacaoId - ID da transação (string)
 * @param {string} contaContabilId - ID da conta contábil (string)
 * @returns {Promise}
 */
export async function confirmarTransacao(transacaoId, contaContabilId) {
  return axios.post(`${baseUrl}conciliacao/confirmar`, {
    transacaoId,      // String: "696e491cb29efaf4c9c8b9b5"
    contaContabilId,  // String: "696e32777cc39fc7974653b0"
  });
}

/**
 * Confirmar múltiplas transações em lote
 * 🔥 NOVO: Endpoint aceita formato lote { transacoes: [...] }
 * @param {Array<{transacaoId: string, contaContabilId: string, isPrevisao?: boolean}>} transacoes - Array de transações para confirmar
 * @returns {Promise<{success: boolean, message: string, data: {total: number, sucessos: number, erros: number, detalhes: Array}}>}
 */
export async function confirmarTransacoesEmLote(transacoes) {
  return axios.post(`${baseUrl}conciliacao/confirmar`, {
    transacoes: transacoes.map(t => ({
      transacaoId: t.transacaoId,
      contaContabilId: t.contaContabilId,
      isPrevisao: t.isPrevisao || false,
    })),
  });
}

/**
 * 🔥 NOVO: Buscar transações pendentes de uma conciliação
 * @param {string} conciliacaoId - ID da conciliação
 * @returns {Promise}
 */
export async function buscarTransacoesPendentes(conciliacaoId) {
  return axios.get(`${baseUrl}conciliacao/${conciliacaoId}/pendentes`);
}

/**
 * 🔥 NOVO: Obter status do processamento de uma conciliação (para fluxo assíncrono)
 * @param {string} conciliacaoId - ID da conciliação
 * @returns {Promise} Retorna status, progresso e informações do processamento
 */
export async function obterStatusConciliacao(conciliacaoId) {
  return axios.get(`${baseUrl}conciliacao/${conciliacaoId}/status`);
}

/**
 * 🔥 NOVO: Buscar todas as transações de uma conciliação (após processamento)
 * @param {string} conciliacaoId - ID da conciliação
 * @returns {Promise} Retorna todas as transações (pendentes, confirmadas, etc.) com resumo
 */
export async function buscarTransacoesConciliacao(conciliacaoId) {
  return axios.get(`${baseUrl}conciliacao/${conciliacaoId}/transacoes`);
}

/**
 * 🔥 NOVO: Finalizar conciliação
 * @param {string} conciliacaoId - ID da conciliação
 * @returns {Promise}
 */
export async function finalizarConciliacao(conciliacaoId) {
  return axios.post(`${baseUrl}conciliacao/${conciliacaoId}/finalizar`);
}

/**
 * Atualizar status da conciliação
 * @param {string} conciliacaoId - ID da conciliação
 * @param {string} status - Novo status (pendente, revisao, concluida, cancelada)
 * @returns {Promise}
 */
export async function atualizarStatusConciliacao(conciliacaoId, status) {
  return axios.patch(`${baseUrl}conciliacao/${conciliacaoId}`, { status });
}

/**
 * Deletar conciliação
 * @param {string} conciliacaoId - ID da conciliação
 * @returns {Promise}
 */
export async function deletarConciliacao(conciliacaoId) {
  return axios.delete(`${baseUrl}conciliacao/${conciliacaoId}`);
}

// ========== NOVAS APIs ==========

/**
 * Gerar CSV de lançamentos por período
 * @param {string} clienteId - ID do cliente
 * @param {string} bancoId - ID do banco
 * @param {string} dataInicio - Data inicial (YYYY-MM-DD)
 * @param {string} dataFim - Data final (YYYY-MM-DD)
 * @param {string} layout - Tipo de layout (padrao ou customizado)
 * @returns {Promise}
 */
export async function gerarCSVLancamentos(clienteId, bancoId, dataInicio, dataFim, layout = 'padrao') {
  return axios.get(
    `${baseUrl}conciliacao/csv-lancamentos/${clienteId}/${bancoId}`,
    {
      params: { dataInicio, dataFim, layout },
    }
  );
}

/**
 * Verificar status de conciliação por mês
 * @param {string} clienteId - ID do cliente
 * @param {string} bancoId - ID do banco (opcional)
 * @returns {Promise}
 */
export async function obterStatusConciliacaoPorMes(clienteId, bancoId = null) {
  const params = bancoId ? { bancoId } : {};
  return axios.get(`${baseUrl}conciliacao/status/${clienteId}`, { params });
}

/**
 * Verificar se um mês específico foi conciliado
 * @param {string} clienteId - ID do cliente
 * @param {string} bancoId - ID do banco
 * @param {string} mesAno - Mês/ano (YYYY-MM)
 * @returns {Promise}
 */
export async function verificarMesConciliado(clienteId, bancoId, mesAno) {
  return axios.get(`${baseUrl}conciliacao/mes/${clienteId}/${bancoId}/${mesAno}`);
}

/**
 * Listar meses conciliados
 * 🔥 USA API ANTIGA (reconciliation/meses-conciliados) - Endpoint documentado
 * @param {string} clienteId - ID do cliente
 * @param {string} bancoId - ID do banco (opcional)
 * @returns {Promise}
 */
export async function listarMesesDisponiveis(clienteId, bancoId = null) {
  const params = bancoId ? { bancoId } : {};
  return axios.get(`${baseUrl}reconciliation/meses-conciliados/${clienteId}`, { params });
}

/**
 * Exportar CSV de um mês específico
 * Helper que calcula as datas do mês automaticamente
 * @param {string} clienteId - ID do cliente
 * @param {string} bancoId - ID do banco
 * @param {string} mesAno - Mês/ano (YYYY-MM)
 * @returns {Promise}
 */
export async function exportarCSVMes(clienteId, bancoId, mesAno) {
  const [ano, mes] = mesAno.split('-');
  const dataInicio = `${ano}-${mes}-01`;
  const ultimoDia = new Date(parseInt(ano, 10), parseInt(mes, 10), 0).getDate();
  const dataFim = `${ano}-${mes}-${String(ultimoDia).padStart(2, '0')}`;

  return gerarCSVLancamentos(clienteId, bancoId, dataInicio, dataFim);
}

/**
 * Download do arquivo CSV
 * @param {string} downloadUrl - URL relativa retornada pela API
 * @returns {string} URL completa para download
 */
export function obterUrlDownloadCSV(downloadUrl) {
  return `${baseUrl}conciliacao${downloadUrl}`;
}
