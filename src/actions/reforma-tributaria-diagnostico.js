'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

function buildQuery(baseUrl, params = {}) {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/** A API pode devolver a lista direto, em `data`, `diagnosticos`, `docs` ou `items`. */
export function normalizarListaDiagnosticos(payload) {
  if (!payload) return { items: [], total: 0 };
  const raw = payload.data ?? payload;
  const items = Array.isArray(raw)
    ? raw
    : raw.diagnosticos ?? raw.docs ?? raw.items ?? raw.results ?? [];
  const total =
    payload.total ?? raw.total ?? raw.totalDocs ?? raw.count ?? (Array.isArray(items) ? items.length : 0);
  return { items: Array.isArray(items) ? items : [], total };
}

export function normalizarDiagnostico(payload) {
  if (!payload) return null;
  return payload.diagnostico ?? payload.data ?? payload;
}

// ----------------------------------------------------------------------
// Backoffice

export function useGetDiagnosticos(params = {}) {
  const url = buildQuery(endpoints.reformaTributariaDiagnostico.admin.list, params);
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(() => {
    const { items, total } = normalizarListaDiagnosticos(data);
    return {
      diagnosticos: items,
      total,
      diagnosticosLoading: isLoading,
      diagnosticosError: error,
      refetchDiagnosticos: mutate,
    };
  }, [data, isLoading, error, mutate]);
}

export function useGetDiagnostico(id) {
  const url = id ? endpoints.reformaTributariaDiagnostico.admin.get(id) : null;
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      diagnostico: normalizarDiagnostico(data),
      diagnosticoLoading: isLoading,
      diagnosticoError: error,
      refetchDiagnostico: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

export async function criarDiagnostico(body) {
  const res = await axios.post(endpoints.reformaTributariaDiagnostico.admin.create, body);
  return res.data;
}

export async function atualizarEntradasDiagnostico(id, body) {
  const res = await axios.patch(endpoints.reformaTributariaDiagnostico.admin.entradas(id), body);
  return res.data;
}

export async function calcularDiagnostico(id) {
  const res = await axios.post(endpoints.reformaTributariaDiagnostico.admin.calcular(id));
  return res.data;
}

export async function alterarStatusDiagnostico(id, status) {
  const res = await axios.patch(endpoints.reformaTributariaDiagnostico.admin.status(id), { status });
  return res.data;
}

export async function deletarDiagnostico(id) {
  const res = await axios.delete(endpoints.reformaTributariaDiagnostico.admin.delete(id));
  return res.data;
}

// ----------------------------------------------------------------------
// Portal do cliente

export function useGetDiagnosticosPortal(params = {}) {
  const url = buildQuery(endpoints.reformaTributariaDiagnostico.portal.list, params);
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(() => {
    const { items, total } = normalizarListaDiagnosticos(data);
    return {
      diagnosticos: items,
      total,
      diagnosticosLoading: isLoading,
      diagnosticosError: error,
      refetchDiagnosticos: mutate,
    };
  }, [data, isLoading, error, mutate]);
}

export function useGetResultadoDiagnosticoPortal(id) {
  const url = id ? endpoints.reformaTributariaDiagnostico.portal.resultado(id) : null;
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      resultado: normalizarDiagnostico(data),
      resultadoLoading: isLoading,
      resultadoError: error,
      refetchResultado: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

export async function atualizarEntradasDiagnosticoPortal(id, body) {
  const res = await axios.patch(endpoints.reformaTributariaDiagnostico.portal.entradas(id), body);
  return res.data;
}

export async function calcularDiagnosticoPortal(id) {
  const res = await axios.post(endpoints.reformaTributariaDiagnostico.portal.calcular(id));
  return res.data;
}
