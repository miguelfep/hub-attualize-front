import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

const swrOptions = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
};

// Util: monta query string ignorando valores vazios
function buildQuery(params) {
  if (!params) return '';
  const cleaned = Object.entries(params).reduce((acc, [k, v]) => {
    if (v !== '' && v !== undefined && v !== null) acc[k] = v;
    return acc;
  }, {});
  const qs = new URLSearchParams(cleaned).toString();
  return qs ? `?${qs}` : '';
}

/**
 * Hook para buscar serviços de um cliente específico (admin)
 * Usa a rota /clientes/servicos/admin/all com query params
 * @param {string} clienteId - ID do cliente/empresa
 * @param {Object} filters - Filtros (status, categoria)
 * @returns {Object} { data, isLoading, error, mutate }
 */
export function useServicosAdmin(clienteId, filters = {}) {
  const params = {
    ...(clienteId && { clienteId }),
    ...filters,
  };
  
  const qs = buildQuery(params);
  const url = clienteId ? `${endpoints.clientes.servicos.admin}${qs}` : null;
  
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);
  
  return useMemo(
    () => ({ 
      data: data || [], 
      isLoading, 
      error, 
      isValidating, 
      mutate 
    }),
    [data, error, isLoading, isValidating, mutate]
  );
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

