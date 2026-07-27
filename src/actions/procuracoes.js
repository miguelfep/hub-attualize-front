'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

function buildQuery(url, params = {}) {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return queryString ? `${url}?${queryString}` : url;
}

/** Último resultado salvo — não chama a Serpro. */
export function useGetProcuracaoCliente(clienteId) {
  const url = clienteId ? endpoints.procuracoes.doCliente(clienteId) : null;
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      procuracao: data?.procuracao ?? null,
      procuracaoLoading: isLoading,
      procuracaoError: error,
      refetchProcuracao: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

/** Consulta na Serpro e persiste. É chamada explícita: a operação é cobrada. */
export async function consultarProcuracao(clienteId) {
  const res = await axios.post(endpoints.procuracoes.consultar(clienteId));
  return res.data;
}

export function useGetVinculos(params = {}) {
  const url = buildQuery(endpoints.procuracoes.vinculos, params);
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      vinculos: data?.vinculos ?? [],
      total: data?.total ?? 0,
      lastCnpj: data?.lastCnpj,
      vinculosLoading: isLoading,
      vinculosError: error,
      refetchVinculos: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

export async function solicitarRenuncia(body) {
  const res = await axios.post(endpoints.procuracoes.renuncias, body);
  return res.data;
}

export async function consultarSituacaoRenuncia(idSolicitacao) {
  const res = await axios.get(endpoints.procuracoes.situacaoRenuncia(idSolicitacao));
  return res.data;
}

export async function emitirComprovanteRenuncia(idRenuncia) {
  const res = await axios.get(endpoints.procuracoes.comprovanteRenuncia(idRenuncia));
  return res.data;
}
