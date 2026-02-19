import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { buscarResumoMesBanco } from 'src/actions/conciliacao';

/**
 * Hook para buscar KPIs de entrada e saída de um mês/banco
 * @param {string} clienteId - ID do cliente
 * @param {string|null} bancoId - ID do banco (null ou "Todos" para todos)
 * @param {string|null} mesAno - Mês/ano no formato YYYY-MM (null usa mês anterior)
 * @returns {Object} { entrada, saida, loading, error, mesExibicao, refetch }
 */
export function useKPIMetrics(clienteId, bancoId, mesAno = null) {
  const [kpiData, setKpiData] = useState({
    entrada: 0,
    saida: 0,
    temExtrato: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const carregandoRef = useRef(false);

  // Calcular mês anterior se mesAno não fornecido
  const mesAnterior = useMemo(() => dayjs().subtract(1, 'month').format('YYYY-MM'), []);

  // Usar mês anterior se mesAno não fornecido
  const mesAnoAtual = mesAno || mesAnterior;

  // Função helper para obter nome completo do mês em maiúsculo (ex: "Janeiro/2026")
  const getNomeMesCurto = useCallback((mesAnoStr) => {
    if (!mesAnoStr) return '';
    const [ano, mes] = mesAnoStr.split('-');
    const date = dayjs(`${ano}-${mes}-01`);
    const mesFormatado = date.locale('pt-br').format('MMMM/YYYY');
    // Capitalizar primeira letra do mês
    return mesFormatado.charAt(0).toUpperCase() + mesFormatado.slice(1);
  }, []);

  const buscarKPIs = useCallback(async () => {
    if (!clienteId || !mesAnoAtual) {
      setKpiData({
        entrada: 0,
        saida: 0,
        temExtrato: false,
      });
      return;
    }

    if (carregandoRef.current) return;

    carregandoRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await buscarResumoMesBanco(clienteId, bancoId, mesAnoAtual);

      if (response.data?.success) {
        const data = response.data.data || {};

        // Sempre usar valores do extrato (total do mês), independente de conciliação
        const entrada = data.totalCreditosExtrato ?? data.totalCreditos ?? 0;
        const saida = data.totalDebitosExtrato ?? data.totalDebitos ?? 0;

        setKpiData({
          entrada,
          saida,
          temExtrato: data.temExtrato || false,
        });
      } else {
        throw new Error(response.data?.error || 'Erro ao buscar KPIs');
      }
    } catch (err) {
      console.error('Erro ao buscar KPIs:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao buscar KPIs';
      setError(errorMessage);

      // Valores padrão em caso de erro
      setKpiData({
        entrada: 0,
        saida: 0,
        temExtrato: false,
      });
    } finally {
      setLoading(false);
      carregandoRef.current = false;
    }
  }, [clienteId, bancoId, mesAnoAtual]);

  // Buscar KPIs quando clienteId, bancoId ou mesAno mudarem
  useEffect(() => {
    buscarKPIs();
  }, [buscarKPIs]);

  // Nome do mês para exibição no chip
  const mesExibicao = useMemo(() => getNomeMesCurto(mesAnoAtual), [mesAnoAtual, getNomeMesCurto]);

  return {
    entrada: kpiData.entrada,
    saida: kpiData.saida,
    temExtrato: kpiData.temExtrato,
    loading,
    error,
    mesExibicao,
    mesAno: mesAnoAtual,
    refetch: buscarKPIs,
  };
}
