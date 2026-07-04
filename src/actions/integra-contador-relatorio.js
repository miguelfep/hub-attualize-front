import axios, { endpoints } from 'src/utils/axios';

function limparParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );
}

/**
 * Estatísticas agregadas das requisições SerPro (Integra Contador + Caixa Postal).
 */
export async function getIntegraContadorStats(params) {
  const res = await axios.get(endpoints.integraContadorRelatorio.stats, {
    params: limparParams(params),
  });
  return res.data;
}

/**
 * Lista paginada de logs unificados SerPro.
 */
export async function getIntegraContadorLogs(params) {
  const res = await axios.get(endpoints.integraContadorRelatorio.logs, {
    params: limparParams(params),
  });
  return res.data;
}

export { limparParams };
