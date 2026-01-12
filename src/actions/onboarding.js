import Cookies from 'js-cookie';

import axios from 'src/utils/axios';

import { STORAGE_KEY as JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// ----------------------------------------------------------------------

/**
 * Obtém os headers de autenticação
 * Funciona tanto no cliente quanto no servidor
 */
async function getAuthHeaders() {
  let token = null;

  if (typeof window === 'undefined') {
    // No servidor, usa cookies do Next.js
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = cookies();
      token = cookieStore.get(JWT_STORAGE_KEY)?.value;
    } catch (error) {
      // Se não conseguir importar cookies (pode acontecer em alguns contextos)
      console.warn('Não foi possível acessar cookies no servidor:', error);
      return {};
    }
  } else {
    // No cliente, usa Cookies ou localStorage
    const cookieToken = Cookies.get(JWT_STORAGE_KEY);
    const localToken = window.localStorage?.getItem('accessToken');
    token = cookieToken || localToken;
  }

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

// ----------------------------------------------------------------------
// ENDPOINTS CLIENTE
// ----------------------------------------------------------------------

/**
 * Obter próximo onboarding pendente
 * GET /api/onboarding/cliente/meu-onboarding
 * Retorna o próximo onboarding pendente do usuário (seguindo a ordem).
 * Se não houver onboarding pendente, retorna null.
 * @deprecated Use getAulasOnboarding() que retorna aulas com status
 */
export async function getMeuOnboarding() {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}onboarding/cliente/meu-onboarding`, {
    headers,
  });
}

/**
 * Listar todas as aulas do onboarding atual com status
 * GET /api/onboarding/cliente/aulas
 * Retorna lista de aulas com status de conclusão, progresso e informações do onboarding
 */
export async function getAulasOnboarding() {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}onboarding/cliente/aulas`, {
    headers,
  });
}

/**
 * Obter todos os onboardings pendentes
 * GET /api/onboarding/cliente/todos-onboardings
 * Retorna todos os onboardings pendentes do usuário com seus respectivos progressos.
 */
export async function getTodosOnboardings() {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}onboarding/cliente/todos-onboardings`, {
    headers,
  });
}

/**
 * Verificar conclusão de todos os onboardings
 * GET /api/onboarding/cliente/verificar-conclusao
 * Verifica se todos os onboardings foram concluídos.
 */
export async function verificarConclusaoOnboarding() {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}onboarding/cliente/verificar-conclusao`, {
    headers,
  });
}

/**
 * Atualizar progresso de uma aula
 * PUT /api/onboarding/cliente/aula/:aulaId/progresso
 */
export async function atualizarProgressoAula(aulaId, dadosProgresso) {
  const headers = await getAuthHeaders();
  return axios.put(`${baseUrl}onboarding/cliente/aula/${aulaId}/progresso`, dadosProgresso, {
    headers,
  });
}

/**
 * Listar empresas com status de onboarding
 * GET /api/onboarding/cliente/empresas
 * Retorna todas as empresas do usuário com status de onboarding de cada uma
 */
export async function listarEmpresasComOnboarding() {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}onboarding/cliente/empresas`, {
    headers,
  });
}

/**
 * Obter histórico de conclusão (cliente)
 * GET /api/onboarding/cliente/historico
 * Retorna histórico de onboardings concluídos pelo usuário
 */
export async function obterHistoricoOnboarding() {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}onboarding/cliente/historico`, {
    headers,
  });
}

// ----------------------------------------------------------------------
// ENDPOINTS ADMIN
// ----------------------------------------------------------------------

/**
 * Listar onboardings
 * GET /api/onboarding/admin/onboardings?ativo=true
 */
export async function listarOnboardings(params = {}) {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}onboarding/admin/onboardings`, {
    params,
    headers,
  });
}

/**
 * Obter onboarding específico
 * GET /api/onboarding/admin/onboardings/:id
 */
export async function getOnboardingById(id) {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}onboarding/admin/onboardings/${id}`, {
    headers,
  });
}

/**
 * Criar onboarding
 * POST /api/onboarding/admin/onboardings
 */
export async function criarOnboarding(dadosOnboarding) {
  const headers = await getAuthHeaders();
  return axios.post(`${baseUrl}onboarding/admin/onboardings`, dadosOnboarding, {
    headers,
  });
}

/**
 * Atualizar onboarding
 * PUT /api/onboarding/admin/onboardings/:id
 */
export async function atualizarOnboarding(id, dadosOnboarding) {
  const headers = await getAuthHeaders();
  return axios.put(`${baseUrl}onboarding/admin/onboardings/${id}`, dadosOnboarding, {
    headers,
  });
}

/**
 * Deletar onboarding
 * DELETE /api/onboarding/admin/onboardings/:id
 */
export async function deletarOnboarding(id) {
  const headers = await getAuthHeaders();
  return axios.delete(`${baseUrl}onboarding/admin/onboardings/${id}`, {
    headers,
  });
}

/**
 * Adicionar onboardings a um usuário
 * POST /api/onboarding/admin/usuarios/:userId/onboardings
 * Adiciona onboardings a um usuário existente.
 * @param {string} userId - ID do usuário
 * @param {string} empresaId - ID da empresa (obrigatório)
 * @param {string[]} onboardingIds - Array de IDs dos onboardings
 */
export async function adicionarOnboardingsUsuario(userId, empresaId, onboardingIds) {
  const headers = await getAuthHeaders();
  return axios.post(`${baseUrl}onboarding/admin/usuarios/${userId}/onboardings`, {
    empresaId,
    onboardingIds,
  }, {
    headers,
  });
}

/**
 * Remover onboardings de um usuário
 * DELETE /api/onboarding/admin/usuarios/:userId/onboardings
 * Remove onboardings de um usuário.
 * @param {string} userId - ID do usuário
 * @param {string} empresaId - ID da empresa (obrigatório)
 * @param {string[]} onboardingIds - Array de IDs dos onboardings a remover
 */
export async function removerOnboardingsUsuario(userId, empresaId, onboardingIds) {
  const headers = await getAuthHeaders();
  return axios.delete(`${baseUrl}onboarding/admin/usuarios/${userId}/onboardings`, {
    data: { empresaId, onboardingIds },
    headers,
  });
}

/**
 * Listar progressos de onboarding (admin)
 * GET /api/onboarding/admin/progressos?clienteId=xxx&onboardingId=xxx
 */
export async function listarProgressosOnboarding(params = {}) {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}onboarding/admin/progressos`, {
    params,
    headers,
  });
}

/**
 * Listar todas as vinculações com progresso
 * GET /api/onboarding/admin/vinculacoes
 * @param {Object} params - Parâmetros de filtro e paginação
 * @param {string} params.userId - Filtrar por usuário específico
 * @param {string} params.empresaId - Filtrar por empresa específica
 * @param {string} params.onboardingId - Filtrar por onboarding específico
 * @param {boolean} params.concluido - Filtrar por status (true/false)
 * @param {number} params.page - Número da página (padrão: 1)
 * @param {number} params.limit - Itens por página (padrão: 50)
 */
export async function listarVinculacoesOnboarding(params = {}) {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}onboarding/admin/vinculacoes`, {
    params,
    headers,
  });
}

/**
 * Desvincular aula de onboarding
 * DELETE /api/onboarding/admin/onboardings/:onboardingId/aulas
 * @param {string} onboardingId - ID do onboarding
 * @param {string} aulaId - ID da aula a desvincular
 */
export async function desvincularAulaOnboarding(onboardingId, aulaId) {
  const headers = await getAuthHeaders();
  return axios.delete(`${baseUrl}onboarding/admin/onboardings/${onboardingId}/aulas`, {
    data: { aulaId },
    headers,
  });
}

/**
 * Obter histórico de conclusão (admin)
 * GET /api/onboarding/admin/historico
 * @param {Object} params - Parâmetros de filtro
 * @param {string} params.userId - ID do usuário (obrigatório)
 * @param {string} params.empresaId - ID da empresa (opcional)
 */
export async function obterHistoricoOnboardingAdmin(params = {}) {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}onboarding/admin/historico`, {
    params,
    headers,
  });
}

// ----------------------------------------------------------------------
// ENDPOINTS ADMIN - AULAS
// ----------------------------------------------------------------------

/**
 * Listar aulas
 * GET /api/admin/aulas?ativo=true&tipo=video&tags=mei
 */
export async function listarAulas(params = {}) {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}admin/aulas`, {
    params,
    headers,
  });
}

/**
 * Obter aula específica
 * GET /api/admin/aulas/:id
 */
export async function getAulaById(id) {
  const headers = await getAuthHeaders();
  return axios.get(`${baseUrl}admin/aulas/${id}`, {
    headers,
  });
}

/**
 * Criar aula
 * POST /api/admin/aulas
 */
export async function criarAula(dadosAula) {
  const headers = await getAuthHeaders();
  return axios.post(`${baseUrl}admin/aulas`, dadosAula, {
    headers,
  });
}

/**
 * Atualizar aula
 * PUT /api/admin/aulas/:id
 */
export async function atualizarAula(id, dadosAula) {
  const headers = await getAuthHeaders();
  return axios.put(`${baseUrl}admin/aulas/${id}`, dadosAula, {
    headers,
  });
}

/**
 * Deletar aula
 * DELETE /api/admin/aulas/:id
 */
export async function deletarAula(id) {
  const headers = await getAuthHeaders();
  return axios.delete(`${baseUrl}admin/aulas/${id}`, {
    headers,
  });
}

