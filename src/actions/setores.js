import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Setores — CRUD (/api/setores).
//
// Setor: { _id, nome, slug, ativo }
// - Tarefas referenciam setores por `slug` (string[]).
// - Usuários internos referenciam setores por `_id` (ObjectId[]).
// - Listagem retorna apenas ativos por padrão; use `{ ativo: false }` p/ incluir inativos.
// - Criar/editar/excluir exigem papel `admin`. DELETE é soft (marca `ativo=false`).
// ----------------------------------------------------------------------

function normalizarLista(data) {
  if (Array.isArray(data)) return data;
  return data?.data ?? data?.setores ?? [];
}

/**
 * Lista setores.
 * @param {{ ativo?: boolean }} [params]
 */
export async function getSetores(params = {}) {
  const res = await axios.get(endpoints.setores.root, { params });
  return normalizarLista(res.data);
}

export async function getSetorById(id) {
  const res = await axios.get(endpoints.setores.details(id));
  return res.data;
}

/**
 * Cria um setor (admin). Campos: nome*, slug?, ativo?.
 */
export async function criarSetor(payload) {
  const res = await axios.post(endpoints.setores.root, payload);
  return res.data;
}

export async function atualizarSetor(id, payload) {
  const res = await axios.put(endpoints.setores.details(id), payload);
  return res.data;
}

/** Soft delete — o backend marca `ativo=false`. Falha (409) se houver usuários vinculados. */
export async function deletarSetor(id) {
  const res = await axios.delete(endpoints.setores.details(id));
  return res.data;
}
