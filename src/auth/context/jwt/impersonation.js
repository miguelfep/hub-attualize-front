'use client';

import Cookies from 'js-cookie';

import axios, { endpoints } from 'src/utils/axios';

import { STORAGE_KEY } from './constant';
import { getUser, setUser, setSession } from './utils';

// ----------------------------------------------------------------------
// "Logar como cliente" (impersonação).
//
// Fluxo:
//  1. Interno (admin/operacional/gerencial) chama `impersonateCliente`.
//  2. Guardamos a sessão atual do interno (token do cookie + userData do
//     localStorage) em `sessionStorage` — só sobrevive à aba atual, de propósito.
//  3. Trocamos token + userData pelos do cliente retornados pelo backend → o
//     AuthProvider/portal passam a enxergar uma sessão `userType: 'cliente'`.
//  4. `stopImpersonation` restaura a sessão do interno a partir do sessionStorage.
//
// A sessão do interno fica em sessionStorage (e não em cookie/localStorage) para
// não colidir com a sessão "ativa" do cliente, que vive justamente nesses lugares.
// ----------------------------------------------------------------------

// Sessão original do interno, guardada enquanto a impersonação está ativa.
const ADMIN_SESSION_KEY = 'impersonation_admin_session';
// Metadados da impersonação ativa (quem virou quem) — usados pelo banner.
const IMPERSONATION_INFO_KEY = 'impersonation_info';

function readJson(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Há uma impersonação ativa? (sessão do interno preservada) */
export function isImpersonating() {
  if (typeof window === 'undefined') return false;
  return !!sessionStorage.getItem(ADMIN_SESSION_KEY);
}

/** Metadados da impersonação ativa: { clienteLabel, clienteEmail, adminLabel, virtual } | null */
export function getImpersonationInfo() {
  if (typeof window === 'undefined') return null;
  return readJson(sessionStorage, IMPERSONATION_INFO_KEY);
}

/**
 * Extrai a lista de candidatos de um erro 409 (vários usuários do portal para a
 * mesma empresa). O backend pode nomear o array de formas diferentes, então
 * procuramos nas chaves mais prováveis e normalizamos para { userId, email, name }.
 */
export function extractImpersonationCandidates(error) {
  // O interceptor do axios (src/utils/axios.js) NÃO rejeita o erro cru: ele cria
  // um `new Error(message)` com os campos do corpo copiados via Object.assign
  // (err.status, err.data, ...), sem `err.response`. Aceitamos ambos os formatos.
  const data = error?.response?.data || error;
  if (!data) return null;

  // Formato atual do backend: { message, data: { candidates: [{ id, name, email }] } }
  const lista =
    data.data?.candidates ||
    data.candidates ||
    data.usuarios ||
    data.users ||
    data.response?.candidates ||
    data.response?.usuarios ||
    null;

  if (!Array.isArray(lista) || lista.length === 0) return null;

  return lista.map((c) => ({
    userId: c.userId || c._id || c.id,
    email: c.email,
    name: c.name || c.nome || c.razaoSocial,
  }));
}

/** O erro recebido é o 409 de "escolha qual usuário"? */
export function isMultipleUsersError(error) {
  const status = error?.response?.status ?? error?.status;
  return status === 409 && !!extractImpersonationCandidates(error);
}

/**
 * Loga como cliente. Em sucesso troca a sessão e retorna { userData, impersonation }.
 *
 * Sem `userId`/`virtual` o backend escolhe o usuário do portal automaticamente;
 * se houver vários candidatos ele responde 409 — use `isMultipleUsersError` +
 * `extractImpersonationCandidates` para oferecer a escolha e rechamar com `userId`.
 *
 * `virtual: true` não usa nenhum usuário real: o backend cria/reutiliza um
 * usuário sintético da empresa ("Acesso Attualize (virtual)"). Não pode ser
 * combinado com `userId`. `clienteNome` é opcional e só alimenta o banner
 * (útil no acesso virtual, em que o userData traz o nome sintético).
 *
 * @param {{ clienteId: string, userId?: string, virtual?: boolean, clienteNome?: string }} params
 */
export async function impersonateCliente({ clienteId, userId, virtual, clienteNome } = {}) {
  if (!clienteId) {
    throw new Error('clienteId é obrigatório para logar como cliente');
  }
  if (virtual && userId) {
    throw new Error('Acesso virtual não pode ser combinado com a escolha de um usuário');
  }

  const payload = { clienteId };
  if (userId) payload.userId = userId;
  if (virtual) payload.virtual = true;

  const res = await axios.post(endpoints.auth.impersonate, payload);

  const { accessToken, userData, impersonation } = res.data?.response || {};

  if (!accessToken || !userData) {
    throw new Error('Resposta de impersonação inválida (sem accessToken/userData)');
  }

  // Preserva a sessão do interno só na PRIMEIRA impersonação (evita salvar uma
  // sessão de cliente por cima caso já estejamos impersonando).
  if (!isImpersonating()) {
    const adminSession = {
      token: Cookies.get(STORAGE_KEY) || null,
      userData: getUser(),
    };
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminSession));
  }

  // Troca a sessão ativa para o cliente.
  await setSession(accessToken);
  await setUser(userData);

  const isVirtual = !!(impersonation?.virtual || virtual);
  const info = {
    clienteLabel:
      (isVirtual && clienteNome) ||
      userData.name ||
      userData.nome ||
      userData.razaoSocial ||
      userData.email ||
      'Cliente',
    // E-mail do usuário virtual é sintético (@attualize.invalid) — não exibimos.
    clienteEmail: isVirtual ? null : impersonation?.targetEmail || userData.email || null,
    adminLabel: impersonation?.byName || impersonation?.byEmail || null,
    virtual: isVirtual,
  };
  sessionStorage.setItem(IMPERSONATION_INFO_KEY, JSON.stringify(info));

  return { userData, impersonation };
}

/**
 * Sai da visualização e restaura a sessão do interno guardada no sessionStorage.
 * Retorna `true` se restaurou; `false` se não havia sessão preservada (o chamador
 * deve então fazer logout normal).
 */
export async function stopImpersonation() {
  if (typeof window === 'undefined') return false;

  const adminSession = readJson(sessionStorage, ADMIN_SESSION_KEY);

  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem(IMPERSONATION_INFO_KEY);

  if (!adminSession?.token || !adminSession?.userData) {
    return false;
  }

  await setSession(adminSession.token);
  await setUser(adminSession.userData);
  return true;
}
