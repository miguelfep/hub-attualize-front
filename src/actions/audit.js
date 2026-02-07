'use client';

import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// ----------------------------------------------------------------------

/**
 * Buscar logs de auditoria com filtros opcionais
 */
export async function getAuditLogs(params = {}) {
  try {
    const response = await axios.get(`${baseUrl}audit`, { params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * Buscar histórico de uma entidade específica
 */
export async function getEntityHistory(entityType, entityId, limite = 50) {
  try {
    const response = await axios.get(
      `${baseUrl}audit/entity/${entityType}/${entityId}`,
      { params: { limite } }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar histórico da entidade:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * Buscar atividade de um usuário específico
 */
export async function getUserActivity(userId, limite = 50) {
  try {
    const response = await axios.get(
      `${baseUrl}audit/user/${userId}`,
      { params: { limite } }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar atividade do usuário:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * Buscar estatísticas de auditoria
 */
export async function getAuditStats(inicio, fim) {
  try {
    const params = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;
    
    const response = await axios.get(`${baseUrl}audit/stats`, { params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas de auditoria:', error);
    throw error;
  }
}
