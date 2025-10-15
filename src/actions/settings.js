import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useGetSettings(clienteId) {
  const url = clienteId ? endpoints.settings.byClienteId(clienteId) : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      settings: data || null,
      settingsLoading: isLoading,
      settingsError: error,
      settingsValidating: isValidating,
      refetchSettings: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

export async function updateSettings(clienteId, payload) {
  const url = endpoints.settings.byClienteId(clienteId);
  const res = await axios.put(url, payload);
  return res.data;
}

export function useCheckFuncionalidade(clienteId, funcionalidade) {
  const url = clienteId && funcionalidade
    ? endpoints.settings.check(clienteId, funcionalidade)
    : null;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      funcionalidadeAtiva: Boolean(data?.ativa ?? data?.active ?? false),
      checkLoading: isLoading,
      checkError: error,
      checkValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}


