import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Consulta declarações e DAS do PGDAS-D (Serpro CONSDECLARACAO13).
 * Informe periodoApuracao (AAAAMM) ou anoCalendario (AAAA).
 * @param {string} clienteId
 * @param {{ periodoApuracao?: string, anoCalendario?: string }} params
 */
export async function consultarDeclaracoes(clienteId, { periodoApuracao, anoCalendario }) {
  return axios.get(`${baseUrl}serpro/${clienteId}/declaracoes`, {
    params: {
      periodoApuracao: periodoApuracao || undefined,
      anoCalendario: anoCalendario || undefined,
    },
  });
}

/**
 * Preview dos períodos disponíveis no último log CONSDECLARACAO13 (sem Serpro).
 * @param {string} clienteId
 * @param {{ periodoApuracao?: string, anoCalendario?: string }} params
 */
export async function previewSincronizacaoGuias(clienteId, { periodoApuracao, anoCalendario } = {}) {
  return axios.get(`${baseUrl}serpro/${clienteId}/declaracoes/ultimo-log/preview`, {
    params: {
      periodoApuracao: periodoApuracao || undefined,
      anoCalendario: anoCalendario || undefined,
    },
  });
}

/**
 * Sincroniza guias DAS a partir do último log CONSDECLARACAO13 (sem Serpro).
 * @param {string} clienteId
 * @param {{ periodoApuracao?: string, anoCalendario?: string, periodosApuracao?: string[] }} body
 */
export async function sincronizarGuiasFromLog(
  clienteId,
  { periodoApuracao, anoCalendario, periodosApuracao } = {}
) {
  return axios.post(`${baseUrl}serpro/${clienteId}/declaracoes/sincronizar-guias`, {
    periodoApuracao: periodoApuracao || undefined,
    anoCalendario: anoCalendario || undefined,
    periodosApuracao: periodosApuracao?.length ? periodosApuracao : undefined,
  });
}

/**
 * Gera a DAS do Simples Nacional via Serpro / Integra Contador.
 * @param {string} clienteId
 * @param {{ periodoApuracao: string, dataConsolidacao?: string }} data
 */
export async function gerarDas(clienteId, { periodoApuracao, dataConsolidacao }) {
  return axios.post(`${baseUrl}serpro/${clienteId}/gerar-das`, {
    periodoApuracao,
    dataConsolidacao: dataConsolidacao || undefined,
  });
}

/**
 * Extrai itens com PDF da resposta do endpoint gerar-das.
 * @param {object} payload - Campo `dasGerada` ou `data.dasGerada` da API.
 */
export function extractDasPdfItems(payload) {
  const dados = payload?.dados ?? payload;
  if (!dados) return [];
  if (Array.isArray(dados)) return dados.filter((item) => item?.pdf);
  if (dados.pdf) return [dados];
  return [];
}

/**
 * Converte PDF base64 (Serpro) em File para upload.
 * @param {string} base64
 * @param {string} nome
 */
export function base64ToPdfFile(base64, nome = 'DAS.pdf') {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], nome, { type: 'application/pdf' });
}
