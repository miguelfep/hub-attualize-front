import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// Obter conta de recompensa do cliente autenticado
export function useContaRecompensa() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(
    endpoints.recompensas.conta,
    fetcher,
    swrOptions
  );
  return useMemo(
    () => ({
      conta: data?.conta || null,
      isLoading,
      error,
      isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

// Solicitar desconto em contrato
export async function solicitarDesconto(payload) {
  const res = await axios.post(endpoints.recompensas.solicitarDesconto, payload);
  return res.data;
}

// Solicitar PIX
export async function solicitarPix(payload) {
  const res = await axios.post(endpoints.recompensas.solicitarPix, payload);
  return res.data;
}

// Listar transações com filtros
export function useTransacoesRecompensa(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.tipo) queryParams.append('tipo', params.tipo);
  if (params.status) queryParams.append('status', params.status);
  if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio);
  if (params.dataFim) queryParams.append('dataFim', params.dataFim);

  const url = `${endpoints.recompensas.transacoes}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);
  return useMemo(
    () => ({
      transacoes: data?.transacoes || [],
      isLoading,
      error,
      isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

// Listar PIX pendentes (admin)
export function usePixPendentes() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(
    endpoints.recompensas.pixPendentes,
    fetcher,
    swrOptions
  );
  return useMemo(
    () => ({
      pixPendentes: data?.pixPendentes || [],
      isLoading,
      error,
      isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

// Aprovar PIX (admin)
export async function aprovarPix(id) {
  const res = await axios.put(endpoints.recompensas.aprovarPix(id));
  return res.data;
}

// Rejeitar PIX (admin)
export async function rejeitarPix(id, motivo) {
  const res = await axios.put(endpoints.recompensas.rejeitarPix(id), { motivo });
  return res.data;
}
