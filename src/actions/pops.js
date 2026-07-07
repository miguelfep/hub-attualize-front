import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// POPs (Procedimento Operacional Padrão) — camada de acesso à API (/api/pops).
// Todas as rotas exigem JWT (injetado pelo interceptor do axios).
// Leitura: qualquer interno. Mutações: apenas Gestores (admin/gerencial).
//
// Pop: { _id, titulo, descricao?, conteudo?, setores: [slug], versao, ativo,
//        criadoPor, atualizadoPor?, createdAt, updatedAt }
// A listagem NÃO retorna `conteudo` — use `getPopById` para o texto completo.
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
 * Lista POPs. Filtros: `ativo` ('true'/'false'), `setor` (slug), `q` (busca no título).
 * @returns {Promise<Array>} lista (sem `conteudo`)
 */
export async function getPops(filtros = {}) {
  const res = await axios.get(endpoints.pops.root, { params: limparParams(filtros) });
  return res.data?.data ?? [];
}

/**
 * Busca um POP por id (inclui `conteudo` em HTML).
 */
export async function getPopById(id) {
  const res = await axios.get(endpoints.pops.details(id));
  return res.data?.data;
}

// ----------------------------------------------------------------------
// Mutações — apenas Gestores (admin/gerencial)
// ----------------------------------------------------------------------

/**
 * Cria um POP. Campos: titulo*, conteudo* (HTML), descricao?, setores? [slug], ativo?.
 */
export async function criarPop(payload) {
  const res = await axios.post(endpoints.pops.root, payload);
  return res.data;
}

/**
 * Edita um POP (todos os campos opcionais). O backend incrementa `versao`
 * quando `conteudo` muda.
 */
export async function atualizarPop(id, payload) {
  const res = await axios.patch(endpoints.pops.details(id), payload);
  return res.data;
}

/**
 * Soft delete — o backend marca `ativo=false`.
 */
export async function removerPop(id) {
  const res = await axios.delete(endpoints.pops.details(id));
  return res.data;
}
