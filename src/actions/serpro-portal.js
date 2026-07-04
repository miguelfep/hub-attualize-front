import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Feature Emissão DAS 2ª via (portal do cliente) — camada de acesso à API.
// Rotas do portal exigem JWT de cliente (verificarCliente no backend).
// ----------------------------------------------------------------------

/**
 * Remove chaves vazias/nulas dos filtros antes de enviar como query params.
 * @param {Record<string, any>} [filters]
 * @returns {Record<string, any>}
 */
function limparParams(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );
}

// ----------------------------------------------------------------------

/**
 * Emite a 2ª via da Guia DAS via SerPro (portal do cliente).
 * O backend valida o limite mensal, chama a SerPro, extrai o PDF e grava
 * na pasta do cliente automaticamente.
 * @param {{ periodoApuracao: string, dataConsolidacao?: string }} data
 * @returns {Promise<object>} `{ _id, nomeArquivo, competencia, arquivoUrl, serproId }`
 */
export async function emitirSegundaViaDasPortal({ periodoApuracao, dataConsolidacao }) {
  const res = await axios.post(endpoints.serproEmissao.das2via, {
    periodoApuracao,
    dataConsolidacao: dataConsolidacao || undefined,
  });
  return res.data;
}

/**
 * Verifica se o cliente pode emitir uma 2ª via no mês corrente.
 * Usado para habilitar/desabilitar o botão "Emitir 2ª Via".
 * @returns {Promise<{ permitido: boolean, motivo: string, proximaDisponivel?: string, ultimaEmissao?: string }>}
 */
export async function getStatusEmissaoDas() {
  const res = await axios.get(endpoints.serproEmissao.das2viaStatus);
  return res.data;
}

/**
 * Busca o detalhe completo de um log de emissão SerPro (admin).
 * Usado no dialog de detalhe da página de Logs de Auditoria.
 * @param {string} id - ID do SerproEmissaoLog
 * @returns {Promise<object>}
 */
export async function getSerproEmissaoDetalhe(id) {
  const res = await axios.get(endpoints.serproEmissao.serproDetalhe(id));
  return res.data;
}

/**
 * Busca o detalhe completo de um log de Caixa Postal SerPro (admin).
 * Usado no dialog de detalhe da página de Logs de Auditoria.
 * @param {string} id - ID do CaixaPostalLog
 * @returns {Promise<object>}
 */
export async function getCaixaPostalDetalhe(id) {
  const res = await axios.get(endpoints.serproEmissao.caixaPostalDetalhe(id));
  return res.data;
}

export { limparParams };
