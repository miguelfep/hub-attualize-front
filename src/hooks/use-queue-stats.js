import { useState, useEffect, useCallback } from 'react';
import { useGetQueueStats } from 'src/actions/chat';
import { useQueueEvents } from 'src/hooks/use-socket';

/**
 * Hook personalizado para gerenciar estatísticas da fila em tempo real
 * @param {string} sector - Setor da fila
 * @param {string} instanceType - Tipo de instância
 * @returns {Object} Estatísticas e funções de controle
 */
export function useQueueStats(sector, instanceType) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 segundos

  // Hook para buscar estatísticas da API
  const { 
    queueStats, 
    queueStatsLoading, 
    queueStatsError, 
    queueStatsValidating 
  } = useGetQueueStats(sector, instanceType);

  // Hook para eventos WebSocket em tempo real
  const { 
    queueStats: realtimeStats, 
    queueUpdates, 
    newMessagesInQueue 
  } = useQueueEvents(sector, instanceType);

  // Usar estatísticas em tempo real se disponíveis, senão usar as da API
  const currentStats = realtimeStats && Object.keys(realtimeStats).length > 0 
    ? realtimeStats 
    : queueStats;

  // Função para forçar atualização
  const refreshStats = useCallback(() => {
    // O SWR já faz cache invalidation automático
    // Esta função pode ser usada para forçar refresh se necessário
  }, []);

  // Função para alternar auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Função para alterar intervalo de refresh
  const updateRefreshInterval = useCallback((interval) => {
    setRefreshInterval(interval);
  }, []);

  // Calcular métricas derivadas
  const derivedMetrics = {
    totalChats: (currentStats?.naFila || 0) + (currentStats?.emAtendimento || 0),
    queueLoad: currentStats?.naFila > 0 ? 
      Math.round((currentStats.naFila / ((currentStats?.naFila || 0) + (currentStats?.emAtendimento || 0))) * 100) : 0,
    averageWaitTime: currentStats?.tempoMedioEspera || 0,
    isQueueBusy: (currentStats?.naFila || 0) > 5,
    isQueueEmpty: (currentStats?.naFila || 0) === 0,
  };

  // Status da conexão e dados
  const status = {
    isConnected: realtimeStats && Object.keys(realtimeStats).length > 0,
    isLoading: queueStatsLoading,
    hasError: !!queueStatsError,
    isValidating: queueStatsValidating,
    lastUpdate: new Date(),
  };

  return {
    // Dados principais
    stats: currentStats,
    derivedMetrics,
    status,
    
    // Eventos em tempo real
    queueUpdates,
    newMessagesInQueue,
    
    // Controles
    autoRefresh,
    refreshInterval,
    refreshStats,
    toggleAutoRefresh,
    updateRefreshInterval,
    
    // Estados de loading/error
    loading: queueStatsLoading,
    error: queueStatsError,
    validating: queueStatsValidating,
  };
}
