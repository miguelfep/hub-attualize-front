import { useState, useEffect, useCallback } from 'react';

import { listarMesesDisponiveis } from 'src/actions/conciliacao';

/**
 * Hook para gerenciar o estado de conciliação
 * @param {string} clienteId - ID do cliente
 * @param {string} bancoId - ID do banco (opcional)
 */
export function useConciliacao(clienteId, bancoId = null) {
  const [meses, setMeses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregarMeses = useCallback(async () => {
    if (!clienteId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await listarMesesDisponiveis(clienteId, bancoId);
      
      if (response.data?.success) {
        setMeses(response.data.data || []);
      } else {
        setError('Erro ao carregar meses');
      }
    } catch (err) {
      console.error('Erro ao carregar meses:', err);
      setError(err.message || 'Erro ao carregar meses');
    } finally {
      setLoading(false);
    }
  }, [clienteId, bancoId]);

  useEffect(() => {
    carregarMeses();
  }, [carregarMeses]);

  return { 
    meses, 
    loading, 
    error,
    recarregar: carregarMeses 
  };
}
