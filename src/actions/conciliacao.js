import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Monta o objeto de contexto da conciliação a partir de GET /conciliacao/:id/status
 * (substitui o uso legado de GET /reconciliation/:id no portal).
 */
export function mapearContextoConciliacao(statusData, conciliacaoIdFallback) {
  const d = statusData && typeof statusData === 'object' ? statusData : {};
  const mesAno = d.mesAno || d.periodo;
  let mes;
  let ano;
  if (mesAno && /^\d{4}-\d{2}$/.test(String(mesAno))) {
    const [y, m] = String(mesAno).split('-');
    ano = parseInt(y, 10);
    mes = parseInt(m, 10);
  }
  const bancoRaw = d.bancoId ?? d.banco ?? null;
  const clienteRaw = d.clienteId ?? d.cliente ?? null;

  return {
    _id: d.conciliacaoId || d._id || conciliacaoIdFallback,
    status: d.status || 'pendente',
    mes,
    ano,
    mesAno: mesAno || (mes && ano ? `${ano}-${String(mes).padStart(2, '0')}` : undefined),
    bancoId: bancoRaw,
    clienteId: clienteRaw,
    dataProcessamento: d.dataProcessamento || d.updatedAt || d.processadoEm || null,
    resumo: d.resumo || null,
  };
}

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
 * Obter detalhes/resumo de uma conciliação (via rota única de status)
 * @param {string} conciliacaoId - ID da conciliação
 * @returns {Promise} Mesmo formato axios; `data.data` é o contexto mapeado para telas
 */
export async function obterConciliacao(conciliacaoId) {
  const res = await obterStatusConciliacao(conciliacaoId);
  const statusData = res.data?.data;
  const mapped = mapearContextoConciliacao(statusData, conciliacaoId);
  return {
    ...res,
    data: {
      ...res.data,
      data: mapped,
    },
  };
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
 * Status do modelo ML de sugestão de contas (por cliente)
 */
export async function obterMlStatusCliente(clienteId) {
  return axios.get(`${baseUrl}conciliacao/ml/status/${clienteId}`);
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

// ========== NOVAS APIs PARA DASHBOARD ==========

/**
 * 🎯 Buscar gastos agrupados por conta contábil
 * @param {string} clienteId - ID do cliente
 * @param {string|null} bancoId - ID do banco (opcional, null ou "Todos" para todos)
 * @param {string} mesAno - Mês/ano no formato YYYY-MM (ex: 2025-01)
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export async function buscarGastosPorContaContabil(clienteId, bancoId, mesAno) {
  const params = {};
  if (bancoId && bancoId !== 'null' && bancoId !== 'Todos') {
    params.bancoId = bancoId;
  }
  params.mesAno = mesAno;

  return axios.get(`${baseUrl}conciliacao/gastos-por-conta-contabil/${clienteId}`, { params });
}

/**
 * 🎯 Buscar resumo de mês/banco (KPIs)
 * @param {string} clienteId - ID do cliente
 * @param {string|null} bancoId - ID do banco (opcional, null ou "Todos" para todos)
 * @param {string} mesAno - Mês/ano no formato YYYY-MM (ex: 2025-01)
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function buscarResumoMesBanco(clienteId, bancoId, mesAno) {
  const params = {};
  if (bancoId && bancoId !== 'null' && bancoId !== 'Todos') {
    params.bancoId = bancoId;
  }
  params.mesAno = mesAno;

  return axios.get(`${baseUrl}conciliacao/resumo-mes-banco/${clienteId}`, { params });
}

/**
 * 🎯 Buscar transações de uma conta contábil específica
 * @param {string} clienteId - ID do cliente
 * @param {string} contaContabilId - ID da conta contábil
 * @param {string|null} bancoId - ID do banco (opcional, null ou "Todos" para todos)
 * @param {string} mesAno - Mês/ano no formato YYYY-MM (ex: 2025-01)
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export async function buscarTransacoesPorConta(clienteId, contaContabilId, bancoId, mesAno) {
  const params = {};
  if (bancoId && bancoId !== 'null' && bancoId !== 'Todos') {
    params.bancoId = bancoId;
  }
  params.mesAno = mesAno;

  return axios.get(`${baseUrl}conciliacao/transacoes-por-conta/${clienteId}/${contaContabilId}`, { params });
}
