import { useRef, useState, useEffect, useCallback } from 'react';

import { buscarTransacoesPorConta } from 'src/actions/conciliacao';

// 🔥 Cache para evitar múltiplas chamadas
const cache = new Map();
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos

/**
 * Hook para buscar transações de uma conta contábil específica
 * @param {string} clienteId - ID do cliente
 * @param {string} contaContabilId - ID da conta contábil (null para não buscar)
 * @param {string|null} bancoId - ID do banco (null ou "Todos" para todos)
 * @param {string} mesAno - Mês/ano no formato YYYY-MM
 * @returns {Object} { transacoes, loading, error, refetch }
 */
export function useTransacoesConta(clienteId, contaContabilId, bancoId, mesAno) {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const carregandoRef = useRef(false);

  const cacheKey = `transacoes-${clienteId}-${contaContabilId || 'null'}-${bancoId || 'todos'}-${mesAno}`;

  const buscarTransacoes = useCallback(async (forceRefresh = false) => {
    // Se não há conta contábil selecionada, limpar dados
    if (!contaContabilId || !clienteId || !mesAno) {
      setTransacoes([]);
      return;
    }

    // 🔥 Verificar cache
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TIMEOUT)) {
      console.log(`✅ Usando cache de transações por conta: ${cacheKey}`);
      setTransacoes(cached.data);
      return;
    }

    // 🔥 Prevenir múltiplas chamadas simultâneas
    if (carregandoRef.current) {
      console.log(`⏳ Já carregando transações por conta: ${cacheKey}`);
      return;
    }

    carregandoRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await buscarTransacoesPorConta(clienteId, contaContabilId, bancoId, mesAno);

      if (response.data?.success) {
        const data = response.data.data || [];

        // 🔥 Atualizar cache
        cache.set(cacheKey, {
          data,
          timestamp: now,
        });

        setTransacoes(data);
        console.log(`✅ ${data.length} transações carregadas e cacheadas`);
      } else {
        throw new Error(response.data?.error || 'Erro ao buscar transações');
      }
    } catch (err) {
      console.error('Erro ao buscar transações por conta:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao buscar transações';
      setError(errorMessage);
      setTransacoes([]);
    } finally {
      setLoading(false);
      carregandoRef.current = false;
    }
  }, [clienteId, contaContabilId, bancoId, mesAno, cacheKey]);

  // Buscar transações quando parâmetros mudarem
  useEffect(() => {
    buscarTransacoes();
  }, [buscarTransacoes]);

  // Função para invalidar cache
  const invalidarCache = useCallback(() => {
    cache.delete(cacheKey);
  }, [cacheKey]);

  return {
    transacoes,
    loading,
    error,
    refetch: () => buscarTransacoes(true),
    invalidarCache,
  };
}
