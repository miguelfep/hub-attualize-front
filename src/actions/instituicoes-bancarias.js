import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/** Máximo permitido pelo servidor na listagem `gerenciar` (ms-me). */
export const INSTITUICOES_PAGE_LIMIT_MAX = 200;

/** Tipos permitidos pelo backend (InstituicaoBancaria). */
export const TIPOS_INSTITUICAO_BANCARIA = [
  { value: 'comercial', label: 'Comercial' },
  { value: 'investimento', label: 'Investimento' },
  { value: 'digital', label: 'Digital' },
  { value: 'cooperativa', label: 'Cooperativa' },
];

/**
 * Lista pública (portal / autocomplete).
 * Sem `incluirInativos=true` o backend devolve só `ativo: true`.
 * @param {{ incluirInativos?: boolean }} [params]
 */
export async function listarInstituicoesBancarias(params = {}) {
  return axios.get(`${baseUrl}bancos/instituicoes`, { params });
}

/**
 * Normaliza o array de instituições do GET público `bancos/instituicoes`.
 * @param {import('axios').AxiosResponse} response
 * @returns {object[]}
 */
export function extrairListaInstituicoesPublicas(response) {
  const root = response?.data;
  if (!root || typeof root !== 'object') return [];
  if (root.success === false) return [];
  if (Array.isArray(root.data)) return root.data;
  if (Array.isArray(root)) return root;
  return [];
}

/**
 * Catálogo completo (ativos + inativos) num único GET público.
 * Evita colisão no servidor em que `GET .../instituicoes/gerenciar` é tratado como `.../:codigo`.
 * @returns {Promise<object[]>}
 */
export async function listarCatalogoInstituicoesCompleto() {
  const res = await listarInstituicoesBancarias({ incluirInativos: true });
  return extrairListaInstituicoesPublicas(res);
}

/**
 * Pública: busca por código COMPE (ex.: `077`).
 * GET `/api/bancos/instituicoes/:codigo`
 */
export async function obterInstituicaoPorCodigo(codigo) {
  return axios.get(`${baseUrl}bancos/instituicoes/${encodeURIComponent(codigo)}`, {
    validateStatus: (status) => (status >= 200 && status < 300) || status === 404,
  });
}

/**
 * Admin: uma página da listagem (JWT). GET `/api/bancos/instituicoes/gerenciar`
 * `limit` no servidor é no máximo 200.
 *
 * **Nota:** se o router do ms-me registar `GET .../instituicoes/:codigo` antes de `.../gerenciar`,
 * o segmento `gerenciar` é interpretado como COMPE e devolve 404. Nesse caso use
 * {@link listarCatalogoInstituicoesCompleto} (`GET .../instituicoes?incluirInativos=true`) para listar.
 * @param {{ page?: number, limit?: number, incluirInativos?: boolean }} params
 */
export async function listarInstituicoesGerenciar(params = {}) {
  const limit = Math.min(
    INSTITUICOES_PAGE_LIMIT_MAX,
    Math.max(1, Number(params.limit) || 50)
  );
  return axios.get(`${baseUrl}bancos/instituicoes/gerenciar`, {
    params: { ...params, limit },
  });
}

/**
 * Extrai uma página da resposta `{ success, data: { dados, total, pagina, totalPaginas } }`.
 */
export function extrairPaginaInstituicoesGerenciar(response) {
  const block = response?.data?.data;
  if (!block || typeof block !== 'object') {
    return { dados: [], totalPaginas: 1, pagina: 1, total: 0 };
  }
  const dados = Array.isArray(block.dados) ? block.dados : [];
  const totalPaginas = Math.max(1, Number(block.totalPaginas) || 1);
  const pagina = Math.max(1, Number(block.pagina) || 1);
  const total = Number(block.total) || dados.length;
  return { dados, totalPaginas, pagina, total };
}

/**
 * Admin: percorre todas as páginas até `totalPaginas` (limite 200 por pedido).
 * @param {{ incluirInativos?: boolean }} [options]
 * @param {number} [maxPages] — segurança contra loop (default 50)
 */
export async function listarTodasInstituicoesGerenciar(options = {}, maxPages = 50) {
  const { incluirInativos = true } = options;
  const all = [];
  let page = 1;

  for (;;) {
    if (page > maxPages) {
      console.warn('[instituicoes] listarTodasInstituicoesGerenciar: atingiu maxPages', maxPages);
      break;
    }
    const res = await listarInstituicoesGerenciar({
      page,
      limit: INSTITUICOES_PAGE_LIMIT_MAX,
      ...(incluirInativos ? { incluirInativos: true } : {}),
    });
    const { dados, totalPaginas } = extrairPaginaInstituicoesGerenciar(res);
    all.push(...dados);
    if (page >= totalPaginas || dados.length === 0) break;
    page += 1;
  }

  return all;
}

/**
 * Admin: busca por ID (MongoDB). GET `/api/bancos/instituicoes/gerenciar/:id`
 */
export async function obterInstituicaoGerenciar(instituicaoId) {
  return axios.get(`${baseUrl}bancos/instituicoes/gerenciar/${instituicaoId}`);
}

/**
 * Admin: cria (role **admin**). POST `/api/bancos/instituicoes` (equivalente a `.../gerenciar`).
 * Resposta pode ser **201 Created**.
 */
export async function criarInstituicaoBancaria(dados) {
  return axios.post(`${baseUrl}bancos/instituicoes`, dados, {
    validateStatus: (status) => status >= 200 && status < 300,
  });
}

/**
 * Admin: atualiza. PUT `/api/bancos/instituicoes/gerenciar/:id`
 */
export async function atualizarInstituicaoBancaria(instituicaoId, dados) {
  return axios.put(`${baseUrl}bancos/instituicoes/gerenciar/${instituicaoId}`, dados);
}

/**
 * Admin: soft delete (`ativo: false`). DELETE `/api/bancos/instituicoes/gerenciar/:id` (role **admin**)
 */
export async function excluirInstituicaoBancaria(instituicaoId) {
  return axios.delete(`${baseUrl}bancos/instituicoes/gerenciar/${instituicaoId}`);
}
