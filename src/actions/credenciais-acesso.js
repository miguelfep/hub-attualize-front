import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Credenciais de acesso por empresa (backoffice).
//
// CRUD usa as rotas INTERNAS `/api/credenciais-acesso`, escopadas por `clienteId`
// (o _id do cliente sendo editado no dashboard). A senha NUNCA vem na listagem;
// só pode ser obtida na rota interna de senha, disponível para perfis autorizados
// (admin, operacional, financeiro, contabil_externo).
// ----------------------------------------------------------------------

/** Normaliza a resposta `{ success, data }` para sempre retornar um array. */
function normalizarLista(res) {
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export async function getCredenciaisAcesso(clienteId) {
  if (!clienteId) return [];
  const res = await axios.get(endpoints.credenciaisAcesso.listByCliente(clienteId));
  return normalizarLista(res);
}

export async function createCredencialAcesso(clienteId, payload) {
  const res = await axios.post(endpoints.credenciaisAcesso.create, { ...payload, clienteId });
  return res.data;
}

export async function updateCredencialAcesso(clienteId, credencialId, payload) {
  const res = await axios.put(endpoints.credenciaisAcesso.update(credencialId), {
    ...payload,
    clienteId,
  });
  return res.data;
}

export async function deleteCredencialAcesso(clienteId, credencialId) {
  const res = await axios.delete(endpoints.credenciaisAcesso.delete(credencialId));
  return res.data;
}

/**
 * Visualização de senha (rota interna do backoffice).
 * Retorna a senha em texto puro — NÃO persistir em localStorage/sessionStorage.
 */
export async function getSenhaCredencial(credencialId) {
  const res = await axios.get(endpoints.credenciaisAcesso.senha(credencialId), {
    headers: { 'Cache-Control': 'no-store' },
  });
  return res.data?.password ?? '';
}
