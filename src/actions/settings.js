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

export async function uploadInterCertificates(clienteId, environment, crtFile, keyFile) {
  const interCertificatesEndpoint = endpoints?.settings?.interCertificates;
  const url =
    typeof interCertificatesEndpoint === 'function'
      ? interCertificatesEndpoint(clienteId)
      : `${endpoints.settings.base}/${clienteId}/inter/certificates`;
  const formData = new FormData();
  formData.append('environment', environment);
  formData.append('crt', crtFile);
  formData.append('key', keyFile);
  const res = await axios.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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


