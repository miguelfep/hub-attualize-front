import axios, { endpoints } from 'src/utils/axios';

// Re-exportar a função do portal para usar a rota existente
import { usePortalServicos } from './portal';

/**
 * Hook para buscar serviços de um cliente específico (admin)
 * Usa a rota existente do portal que busca por empresa
 * @param {string} clienteProprietarioId - ID do cliente/empresa (obrigatório)
 * @param {Object} filters - Filtros (status, categoria)
 * @returns {Object} { data, isLoading, error, mutate }
 */
export function useServicosAdmin(clienteProprietarioId, filters = {}) {
  return usePortalServicos(clienteProprietarioId, filters);
}

/**
 * Buscar um serviço específico (admin)
 * @param {string} clienteId - ID do cliente proprietário
 * @param {string} servicoId - ID do serviço
 * @returns {Promise<Object>}
 */
export async function getServicoAdminById(clienteId, servicoId) {
  try {
    const res = await axios.get(endpoints.portal.servicos.get(clienteId, servicoId));
    return res.data;
  } catch (error) {
    console.error('❌ Erro ao buscar serviço:', error);
    throw error;
  }
}

/**
 * Atualizar serviço (admin)
 * @param {string} servicoId - ID do serviço
 * @param {Object} payload - Dados a atualizar
 * @returns {Promise<Object>}
 */
export async function updateServicoAdmin(servicoId, payload) {
  try {
    const res = await axios.put(endpoints.portal.servicos.update(servicoId), payload);
    return res.data;
  } catch (error) {
    console.error('❌ Erro ao atualizar serviço:', error);
    throw error;
  }
}

/**
 * Deletar serviço (admin)
 * @param {string} servicoId - ID do serviço
 * @param {string} clienteProprietarioId - ID do cliente proprietário
 * @returns {Promise<Object>}
 */
export async function deleteServicoAdmin(servicoId, clienteProprietarioId) {
  try {
    const res = await axios.delete(endpoints.portal.servicos.delete(servicoId), {
      data: { clienteProprietarioId },
    });
    return res.data;
  } catch (error) {
    console.error('❌ Erro ao deletar serviço:', error);
    throw error;
  }
}

