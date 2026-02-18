import { useRef, useState, useEffect, useCallback } from 'react';

import { buscarResumoMesBanco } from 'src/actions/conciliacao';

// 🔥 Cache para evitar múltiplas chamadas
const cache = new Map();
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos

/**
 * Hook para verificar status de conciliação de um mês/banco
 * @param {string} clienteId - ID do cliente
 * @param {string|null} bancoId - ID do banco (null ou "Todos" para todos)
 * @param {string} mesAno - Mês/ano no formato YYYY-MM
 * @returns {Object} { status, loading, error, refetch }
 */
export function useReconciliationStatus(clienteId, bancoId, mesAno) {
  const [status, setStatus] = useState({
    temExtrato: false,
    temConciliacao: false,
    conciliacaoId: null,
    statusConciliacao: null,
    totalCreditos: 0,
    totalDebitos: 0,
    totalCreditosExtrato: 0,
    totalDebitosExtrato: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const carregandoRef = useRef(false);

  const cacheKey = `status-${clienteId}-${bancoId || 'todos'}-${mesAno}`;

  const buscarStatus = useCallback(async (forceRefresh = false) => {
    if (!clienteId || !mesAno) {
      setStatus({
        temExtrato: false,
        temConciliacao: false,
        conciliacaoId: null,
        statusConciliacao: null,
        totalCreditos: 0,
        totalDebitos: 0,
        totalCreditosExtrato: 0,
        totalDebitosExtrato: 0,
      });
      return;
    }

    // 🔥 Verificar cache
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TIMEOUT)) {
      console.log(`✅ Usando cache de status de conciliação: ${cacheKey}`);
      setStatus(cached.data);
      return;
    }

    // 🔥 Prevenir múltiplas chamadas simultâneas
    if (carregandoRef.current) {
      console.log(`⏳ Já carregando status de conciliação: ${cacheKey}`);
      return;
    }

    carregandoRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await buscarResumoMesBanco(clienteId, bancoId, mesAno);

      if (response.data?.success) {
        const data = response.data.data || {};

        // 🔥 Atualizar cache
        cache.set(cacheKey, {
          data,
          timestamp: now,
        });

        setStatus({
          temExtrato: data.temExtrato || false,
          temConciliacao: data.temConciliacao || false,
          conciliacaoId: data.conciliacaoId || null,
          statusConciliacao: data.statusConciliacao || null,
          totalCreditos: data.totalCreditos || 0,
          totalDebitos: data.totalDebitos || 0,
          totalCreditosExtrato: data.totalCreditosExtrato || 0,
          totalDebitosExtrato: data.totalDebitosExtrato || 0,
        });
        console.log(`✅ Status de conciliação carregado e cacheado`);
      } else {
        throw new Error(response.data?.error || 'Erro ao buscar status de conciliação');
      }
    } catch (err) {
      console.error('Erro ao buscar status de conciliação:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao buscar status';
      setError(errorMessage);

      // Status padrão em caso de erro
      setStatus({
        temExtrato: false,
        temConciliacao: false,
        conciliacaoId: null,
        statusConciliacao: null,
        totalCreditos: 0,
        totalDebitos: 0,
        totalCreditosExtrato: 0,
        totalDebitosExtrato: 0,
      });
    } finally {
      setLoading(false);
      carregandoRef.current = false;
    }
  }, [clienteId, bancoId, mesAno, cacheKey]);

  // Buscar status quando clienteId, bancoId ou mesAno mudarem
  useEffect(() => {
    buscarStatus();
  }, [buscarStatus]);

  // Função para invalidar cache
  const invalidarCache = useCallback(() => {
    cache.delete(cacheKey);
  }, [cacheKey]);

  return {
    status,
    loading,
    error,
    refetch: () => buscarStatus(true),
    invalidarCache,
  };
}
