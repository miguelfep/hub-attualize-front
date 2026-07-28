'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

/**
 * Apuração de tributos. Módulo separado do Fator R: o Fator R controla e
 * projeta o enquadramento; a apuração calcula e transmite, para qualquer
 * empresa — hoje todos os anexos do Simples.
 */
const swrOptions = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

function buildQuery(url, params = {}) {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return queryString ? `${url}?${queryString}` : url;
}

export function useGetFilaApuracao(params = {}) {
  const url = buildQuery(endpoints.apuracao.fila, params);
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      itens: data?.itens ?? [],
      totais: data?.totais ?? {},
      filaLoading: isLoading,
      filaError: error,
      refetchFila: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

/** Clientes com o estado atual da habilitação — habilitados e não habilitados. */
export function useGetClientesHabilitacao(params = {}) {
  const url = buildQuery(endpoints.apuracao.clientes, params);
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      clientes: data?.clientes ?? [],
      total: data?.total ?? 0,
      clientesLoading: isLoading,
      clientesError: error,
      refetchClientes: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

export async function definirHabilitacao(body) {
  const res = await axios.post(endpoints.apuracao.habilitacao, body);
  return res.data;
}

export function useGetApuracao(clienteId, ano, mes, params = {}) {
  const pronto = clienteId && ano && mes;
  const url = pronto ? buildQuery(endpoints.apuracao.get(clienteId, ano, mes), params) : null;
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      apuracao: data?.apuracao ?? null,
      apuracaoLoading: isLoading,
      apuracaoError: error,
      refetchApuracao: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

/**
 * Remontagem explícita. Distinta do GET de propósito: derruba a simulação e a
 * aprovação, então não pode acontecer como efeito colateral de carregar a tela.
 */
export async function montarApuracao(clienteId, ano, mes, params = {}) {
  const res = await axios.post(buildQuery(endpoints.apuracao.montar(clienteId, ano, mes), params));
  return res.data;
}

export async function simularApuracao(clienteId, ano, mes) {
  const res = await axios.post(endpoints.apuracao.simular(clienteId, ano, mes));
  return res.data;
}

export async function revisarApuracao(clienteId, ano, mes) {
  const res = await axios.post(endpoints.apuracao.revisar(clienteId, ano, mes));
  return res.data;
}

export async function transmitirApuracao(clienteId, ano, mes) {
  const res = await axios.post(endpoints.apuracao.transmitir(clienteId, ano, mes));
  return res.data;
}
