import { toast } from 'sonner';
import { useRef, useState, useEffect, useCallback, } from 'react';

import { buscarGastosPorContaContabil } from 'src/actions/conciliacao';

// 🔥 Cache para evitar múltiplas chamadas
const cache = new Map();
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos

/**
 * Hook para buscar gastos agrupados por conta contábil
 * @param {string} clienteId - ID do cliente
 * @param {string|null} bancoId - ID do banco (null ou "Todos" para todos)
 * @param {string} mesAno - Mês/ano no formato YYYY-MM
 * @returns {Object} { expenseData, loading, error, refetch }
 */
export function useExpenseData(clienteId, bancoId, mesAno) {
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const carregandoRef = useRef(false);

  const cacheKey = `${clienteId}-${bancoId || 'todos'}-${mesAno}`;

  const buscarDados = useCallback(async (forceRefresh = false) => {
    if (!clienteId || !mesAno) {
      setExpenseData([]);
      return;
    }

    // 🔥 Verificar cache
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TIMEOUT)) {
      console.log(`✅ Usando cache de gastos por conta contábil: ${cacheKey}`);
      setExpenseData(cached.data);
      return;
    }

    // 🔥 Prevenir múltiplas chamadas simultâneas
    if (carregandoRef.current) {
      console.log(`⏳ Já carregando gastos por conta contábil: ${cacheKey}`);
      return;
    }

    carregandoRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await buscarGastosPorContaContabil(clienteId, bancoId, mesAno);

      if (response.data?.success) {
        const data = response.data.data || [];

        // 🔥 Atualizar cache
        cache.set(cacheKey, {
          data,
          timestamp: now,
        });

        setExpenseData(data);
        console.log(`✅ ${data.length} contas contábeis carregadas e cacheadas`);
      } else {
        throw new Error(response.data?.error || 'Erro ao buscar gastos por conta contábil');
      }
    } catch (err) {
      console.error('Erro ao buscar gastos por conta contábil:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao buscar gastos';
      setError(errorMessage);
      setExpenseData([]);

      // Não mostrar toast para evitar spam em mudanças rápidas de filtro
      if (forceRefresh) {
        toast.error('Erro ao buscar gastos por conta contábil');
      }
    } finally {
      setLoading(false);
      carregandoRef.current = false;
    }
  }, [clienteId, bancoId, mesAno, cacheKey]);

  // Buscar dados quando clienteId, bancoId ou mesAno mudarem
  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  // Função para invalidar cache
  const invalidarCache = useCallback(() => {
    cache.delete(cacheKey);
  }, [cacheKey]);

  return {
    expenseData,
    loading,
    error,
    refetch: () => buscarDados(true),
    invalidarCache,
  };
}
