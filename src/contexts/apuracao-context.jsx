'use client';

import { createContext, useContext, useMemo, useState, useCallback } from 'react';

import { useApuracaoActions } from 'src/hooks/use-apuracao';

const ApuracaoContext = createContext(null);

export function ApuracaoProvider({ children }) {
  const [apuracaoAtual, setApuracaoAtual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const {
    calcular,
    gerarDasDeApuracao,
    gerarDasDireto,
    cancelarApuracao,
    cancelarDas,
    marcarDasPago,
    baixarDasPdf,
  } = useApuracaoActions();

  const executar = useCallback(async (fn) => {
    setLoading(true);
    setErro(null);
    try {
      const result = await fn();
      return result;
    } catch (error) {
      setErro(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      apuracaoAtual,
      setApuracaoAtual,
      loading,
      erro,
      calcular: (empresaId, payload) =>
        executar(async () => {
          const result = await calcular(empresaId, payload);
          setApuracaoAtual(result?.data || result);
          return result?.data || result;
        }),
      gerarDasDeApuracao: (apuracaoId, payload) => executar(() => gerarDasDeApuracao(apuracaoId, payload)),
      gerarDasDireto: (empresaId, payload) => executar(() => gerarDasDireto(empresaId, payload)),
      cancelarApuracao: (apuracaoId, motivo) => executar(() => cancelarApuracao(apuracaoId, motivo)),
      cancelarDas: (dasId, motivo) => executar(() => cancelarDas(dasId, motivo)),
      marcarDasPago: (dasId, payload) => executar(() => marcarDasPago(dasId, payload)),
      baixarDasPdf,
      limparErro: () => setErro(null),
    }),
    [
      apuracaoAtual,
      cancelarApuracao,
      cancelarDas,
      calcular,
      executar,
      gerarDasDeApuracao,
      gerarDasDireto,
      loading,
      erro,
      marcarDasPago,
      baixarDasPdf,
    ]
  );

  return <ApuracaoContext.Provider value={value}>{children}</ApuracaoContext.Provider>;
}

export function useApuracaoContext() {
  const context = useContext(ApuracaoContext);
  if (!context) {
    throw new Error('useApuracaoContext deve ser usado dentro de ApuracaoProvider');
  }
  return context;
}


