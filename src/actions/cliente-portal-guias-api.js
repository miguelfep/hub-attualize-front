'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// API do portal (cliente) para guias/documentos.
// Nome do arquivo evita colisão com `guias-fiscais.js` no Turbopack/HMR.
// ----------------------------------------------------------------------

/**
 * Listar guias fiscais do cliente logado (Portal)
 */
export async function getGuiasFiscaisPortal(params = {}) {
  const res = await axios.get(endpoints.guiasFiscais.portal.list, { params });
  return res.data;
}

export function useGetGuiasFiscaisPortal(params = {}) {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  ).toString();

  const url = queryString
    ? `${endpoints.guiasFiscais.portal.list}?${queryString}`
    : endpoints.guiasFiscais.portal.list;

  const { data, isLoading, error, mutate } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return useMemo(
    () => ({
      data: data?.data || { guias: [], total: 0 },
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

export async function getGuiaFiscalPortalById(id) {
  const res = await axios.get(endpoints.guiasFiscais.portal.get(id));
  return res.data;
}

export function useGetGuiaFiscalPortalById(id) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? endpoints.guiasFiscais.portal.get(id) : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (err) => {
        console.error('Erro ao buscar guia (portal):', err);
      },
    }
  );

  return useMemo(
    () => ({
      data: data?.success !== false ? (data?.data || data || null) : null,
      isLoading,
      error:
        error ||
        (data?.success === false ? new Error(data?.message || 'Erro ao carregar documento') : null),
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

export async function solicitarAtualizacaoGuiaPortal(id) {
  const res = await axios.post(endpoints.guiasFiscais.portal.solicitarAtualizacao(id));
  return res.data;
}

/**
 * Árvore de pastas do cliente logado (Portal)
 */
export function useGetPastasGuiasPortal() {
  const { data, isLoading, error, mutate } = useSWR(
    endpoints.guiasFiscais.portal.pastas,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return useMemo(
    () => ({
      folders: Array.isArray(data?.data) ? data.data : [],
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}
