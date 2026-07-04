'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export async function sincronizarCaixaPostal(clienteId) {
  const res = await axios.post(endpoints.caixaPostal.sincronizar(clienteId));
  return res.data;
}

// ----------------------------------------------------------------------

export function useGetCaixaPostalMensagens(clienteId, filtros = {}) {
  const statusLeitura = filtros.statusLeitura ?? '';
  const params = new URLSearchParams();
  if (statusLeitura !== '' && statusLeitura != null) {
    params.set('statusLeitura', String(statusLeitura));
  }
  if (filtros.ponteiroPagina) {
    params.set('ponteiroPagina', filtros.ponteiroPagina);
  }
  const qs = params.toString();
  const base = clienteId ? endpoints.caixaPostal.mensagens(clienteId) : null;
  const url = base ? (qs ? `${base}?${qs}` : base) : null;

  const { data, isLoading, error, mutate } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return useMemo(
    () => ({
      mensagens: data?.mensagens || data?.data?.mensagens || [],
      meta: data?.meta || data?.data?.meta || null,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

export function useGetCaixaPostalDetalhe(clienteId, isn) {
  const url = clienteId && isn ? endpoints.caixaPostal.mensagem(clienteId, isn) : null;

  const { data, isLoading, error, mutate } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return useMemo(
    () => ({
      mensagem: data?.mensagem || data?.data?.mensagem || data?.data || null,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}
