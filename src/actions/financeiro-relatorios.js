import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Relatórios Financeiros (contabilidade) — NRR / MRR
// Doc: GET /api/financeiro/relatorios/nrr
// Roles: admin, financeiro, gerencial
// ----------------------------------------------------------------------

/**
 * Buscar relatório de NRR (Net Revenue Retention).
 *
 * Informe `mes` (YYYY-MM) OU o par `dataInicio` + `dataFim`.
 *
 * @param {Object} params
 * @param {string} [params.mes] - Mês de referência no formato YYYY-MM (ex.: '2026-05').
 * @param {string} [params.dataInicio] - Início de um intervalo arbitrário (ISO/data).
 * @param {string} [params.dataFim] - Fim do intervalo (deve ser > dataInicio).
 * @param {boolean} [params.detalhado] - Se true, inclui o array `detalhes` por contrato.
 * @returns {Promise<import('./financeiro-relatorios').RelatorioNrr>}
 */
export async function buscarRelatorioNrr(params = {}) {
  const query = {};

  if (params.mes) {
    query.mes = params.mes;
  } else {
    if (params.dataInicio) query.dataInicio = params.dataInicio;
    if (params.dataFim) query.dataFim = params.dataFim;
  }

  if (params.detalhado) query.detalhado = 'true';

  const res = await axios.get(endpoints.financeiroRelatorios.nrr, { params: query });
  return res.data;
}
