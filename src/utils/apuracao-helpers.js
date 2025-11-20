/**
 * Helpers e utilitários para o sistema de apuração
 */

// Constantes
export const FATOR_R_MINIMO = 28;

/**
 * Formata período AAAAMM para exibição (MM/AAAA)
 * @param {string} periodo - Período no formato AAAAMM
 * @returns {string} Período formatado (MM/AAAA)
 */
export function formatarPeriodo(periodo) {
  if (!periodo || periodo.length !== 6) return periodo || '';
  const ano = periodo.substring(0, 4);
  const mes = periodo.substring(4, 6);
  return `${mes}/${ano}`;
}

/**
 * Valida formato de período AAAAMM
 * @param {string} periodo - Período a validar
 * @returns {boolean} True se válido
 */
export function validarPeriodo(periodo) {
  if (!periodo || periodo.length !== 6) return false;
  const ano = parseInt(periodo.substring(0, 4), 10);
  const mes = parseInt(periodo.substring(4, 6), 10);
  return ano >= 2000 && ano <= 2100 && mes >= 1 && mes <= 12;
}

/**
 * Calcula a alíquota efetiva baseada na receita bruta
 * @param {number} receitaBruta12Meses - Receita bruta dos últimos 12 meses
 * @param {Array} tabela - Tabela de alíquotas (Anexo III ou V)
 * @returns {number} Alíquota efetiva em percentual
 */
export function calcularAliquotaEfetiva(receitaBruta12Meses, tabela) {
  const faixa = tabela.find(
    (f) => receitaBruta12Meses >= f.limiteInferior && receitaBruta12Meses <= f.limiteSuperior
  );

  if (!faixa) return 0;

  // Para Anexo V, a alíquota é fixa por faixa
  if (faixa.deducao === 0) {
    return faixa.aliquota;
  }

  // Para Anexo III, usa a fórmula com dedução
  return ((receitaBruta12Meses * (faixa.aliquota / 100) - faixa.deducao) / receitaBruta12Meses) * 100;
}

// Tabelas de alíquotas
export const TABELA_ANEXO_III = [
  { limiteInferior: 0, limiteSuperior: 180000, aliquota: 6.0, deducao: 0 },
  { limiteInferior: 180000.01, limiteSuperior: 360000, aliquota: 11.2, deducao: 9360 },
  { limiteInferior: 360000.01, limiteSuperior: 720000, aliquota: 13.5, deducao: 17640 },
  { limiteInferior: 720000.01, limiteSuperior: 1800000, aliquota: 16.0, deducao: 35640 },
  { limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquota: 21.0, deducao: 125640 },
  { limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquota: 33.0, deducao: 648000 },
];

export const TABELA_ANEXO_V = [
  { limiteInferior: 0, limiteSuperior: 180000, aliquota: 15.5, deducao: 0 },
  { limiteInferior: 180000.01, limiteSuperior: 360000, aliquota: 18.0, deducao: 0 },
  { limiteInferior: 360000.01, limiteSuperior: 720000, aliquota: 19.5, deducao: 0 },
  { limiteInferior: 720000.01, limiteSuperior: 1800000, aliquota: 20.5, deducao: 0 },
  { limiteInferior: 1800000.01, limiteSuperior: 3600000, aliquota: 23.0, deducao: 0 },
  { limiteInferior: 3600000.01, limiteSuperior: 4800000, aliquota: 30.5, deducao: 0 },
];

