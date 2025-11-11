'use client';

import { useCallback, useMemo } from 'react';

import {
  useApuracoes as swrUseApuracoes,
  useApuracao as swrUseApuracao,
  useDas as swrUseDas,
  useDasDetalhes as swrUseDasDetalhes,
  calcularApuracao,
  gerarDasDeApuracao,
  gerarDasDireto,
  cancelarApuracao,
  cancelarDas,
  marcarDasComoPago,
  baixarDasPdf,
  recalcularApuracao,
} from 'src/actions/apuracao';

export function useApuracoes(empresaId, filtros) {
  const { data, error, isLoading, mutate } = swrUseApuracoes(empresaId, filtros);

  return useMemo(
    () => ({
      data: data?.apuracoes || data?.data || [],
      total: data?.total ?? 0,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

export function useApuracao(apuracaoId) {
  return swrUseApuracao(apuracaoId);
}

export function useDas(empresaId, filtros) {
  const { data, error, isLoading, mutate } = swrUseDas(empresaId, filtros);

  return useMemo(
    () => ({
      data: data?.das || data?.data || [],
      total: data?.total ?? 0,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

export function useDasDetalhes(dasId, incluirPdf) {
  return swrUseDasDetalhes(dasId, incluirPdf);
}

export function useApuracaoActions() {
  const handleCalcularApuracao = useCallback(
    (empresaId, payload) => calcularApuracao(empresaId, payload),
    []
  );

  const handleGerarDasDeApuracao = useCallback(
    (apuracaoId, payload) => gerarDasDeApuracao(apuracaoId, payload),
    []
  );

  const handleGerarDasDireto = useCallback(
    (empresaId, payload) => gerarDasDireto(empresaId, payload),
    []
  );

  const handleCancelarApuracao = useCallback(
    (apuracaoId, motivo) => cancelarApuracao(apuracaoId, motivo),
    []
  );

  const handleRecalcularApuracao = useCallback(
    (apuracaoId, payload) => recalcularApuracao(apuracaoId, payload),
    []
  );

  const handleCancelarDas = useCallback(
    (dasId, motivo) => cancelarDas(dasId, motivo),
    []
  );

  const handleMarcarDasPago = useCallback(
    (dasId, payload) => marcarDasComoPago(dasId, payload),
    []
  );

  const handleBaixarDasPdf = useCallback((dasId) => baixarDasPdf(dasId), []);

  return {
    calcular: handleCalcularApuracao,
    gerarDasDeApuracao: handleGerarDasDeApuracao,
    gerarDasDireto: handleGerarDasDireto,
    cancelarApuracao: handleCancelarApuracao,
    recalcularApuracao: handleRecalcularApuracao,
    cancelarDas: handleCancelarDas,
    marcarDasPago: handleMarcarDasPago,
    baixarDasPdf: handleBaixarDasPdf,
  };
}


