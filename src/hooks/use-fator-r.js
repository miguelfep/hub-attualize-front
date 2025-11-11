'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  useFatorRTotais,
  useProLaboreIdeal,
  simularFatorR,
  registrarFolha,
} from 'src/actions/fator-r';

export function useFatorR(clienteId) {
  const { data: totaisData, isLoading: loadingTotais, mutate: mutateTotais } = useFatorRTotais(clienteId);
  const {
    data: proLaboreData,
    isLoading: loadingIdeal,
    mutate: mutateIdeal,
  } = useProLaboreIdeal(clienteId);

  const [loadingSimulacao, setLoadingSimulacao] = useState(false);
  const [resultadoSimulacao, setResultadoSimulacao] = useState(null);

  const dados = useMemo(
    () => ({
      totais: totaisData || totaisData?.data || null,
      proLaboreIdeal: proLaboreData || proLaboreData?.data || null,
    }),
    [proLaboreData, totaisData]
  );

  const refetch = useCallback(() => {
    mutateTotais?.();
    mutateIdeal?.();
  }, [mutateIdeal, mutateTotais]);

  const simular = useCallback(
    async (cliente, payload) => {
      setLoadingSimulacao(true);
      try {
        const response = await simularFatorR(cliente, payload);
        setResultadoSimulacao(response);
        return response;
      } finally {
        setLoadingSimulacao(false);
      }
    },
    []
  );

  const registrar = useCallback(async (cliente, payload) => {
    const response = await registrarFolha(cliente, payload);
    refetch();
    return response;
  }, [refetch]);

  return {
    totais: dados.totais,
    proLaboreIdeal: dados.proLaboreIdeal,
    resultadoSimulacao,
    loading: loadingTotais || loadingIdeal,
    loadingSimulacao,
    simular,
    registrar,
    refetch,
  };
}


