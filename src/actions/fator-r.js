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

// ─── Monitoramento e cálculo ────────────────────────────────────────────────

export function useGetMonitoramento(params = {}) {
  const url = buildQuery(endpoints.fatorR.monitoramento, params);
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      clientes: data?.data ?? [],
      total: data?.total ?? 0,
      monitoramentoLoading: isLoading,
      monitoramentoError: error,
      refetchMonitoramento: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

export function useGetFatorRCliente(clienteId, params = {}) {
  const url = clienteId ? buildQuery(endpoints.fatorR.calculo(clienteId), params) : null;
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      atual: data?.atual ?? null,
      risco: data?.risco ?? null,
      serie: data?.serie ?? [],
      cliente: data?.cliente ?? null,
      fatorRLoading: isLoading,
      fatorRError: error,
      refetchFatorR: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

/**
 * Recalcula e grava o snapshot do período. É pré-requisito da apuração: sem
 * snapshot, o anexo não está determinado e a apuração fica bloqueada.
 */
export async function recalcularFatorR(clienteId, ano, mes) {
  const res = await axios.post(endpoints.fatorR.recalcular(clienteId), { ano, mes });
  return res.data;
}

export function useGetSimulacao(clienteId, params = {}) {
  const url = clienteId ? buildQuery(endpoints.fatorR.simulacao(clienteId), params) : null;
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      simulacao: data?.simulacao ?? null,
      competencia: data?.competencia ?? null,
      simulacaoLoading: isLoading,
      simulacaoError: error,
      refetchSimulacao: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

/** `params` exige receitaMensal e folhaMensal; sem eles a projeção não é buscada. */
export function useGetProjecao(clienteId, params = {}) {
  const pronto = clienteId && params.receitaMensal != null && params.folhaMensal != null;
  const url = pronto ? buildQuery(endpoints.fatorR.projecao(clienteId), params) : null;
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      projecao: data?.projecao ?? [],
      primeiroMesAbaixo: data?.primeiroMesAbaixo ?? null,
      projecaoLoading: isLoading,
      projecaoError: error,
      refetchProjecao: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

// ─── Auditoria retroativa ───────────────────────────────────────────────────

export function useGetAuditoria(clienteId, params = {}) {
  const url = clienteId ? buildQuery(endpoints.fatorR.auditoria(clienteId), params) : null;
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      achados: data?.achados ?? [],
      inversos: data?.inversos ?? [],
      inconclusivos: data?.inconclusivos ?? [],
      totalRecuperavel: data?.totalRecuperavel ?? 0,
      auditoriaLoading: isLoading,
      auditoriaError: error,
      refetchAuditoria: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

export async function auditarPortfolio(body = {}) {
  const res = await axios.post(endpoints.fatorR.auditoriaPortfolio, body);
  return res.data;
}

// ─── Folha ──────────────────────────────────────────────────────────────────

export function useGetFolhas(clienteId, params = {}) {
  const url = clienteId ? buildQuery(endpoints.fatorR.folha.list(clienteId), params) : null;
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      folhas: data?.folhas ?? [],
      folhasLoading: isLoading,
      folhasError: error,
      refetchFolhas: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

export function useGetAnomaliasFolha(clienteId) {
  const url = clienteId ? endpoints.fatorR.folha.anomalias(clienteId) : null;
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      anomalias: data?.anomalias ?? [],
      anomaliasLoading: isLoading,
      anomaliasError: error,
      refetchAnomalias: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

export async function salvarFolha(clienteId, ano, mes, body) {
  const res = await axios.put(endpoints.fatorR.folha.upsert(clienteId, ano, mes), body);
  return res.data;
}

export async function removerFolha(clienteId, ano, mes) {
  const res = await axios.delete(endpoints.fatorR.folha.remover(clienteId, ano, mes));
  return res.data;
}

export async function sugerirFolha(clienteId, ano, mes) {
  const res = await axios.get(endpoints.fatorR.folha.sugestao(clienteId, ano, mes));
  return res.data;
}

export async function importarFolhaPgdas(clienteId, anoCalendario) {
  const res = await axios.post(endpoints.fatorR.folha.importarPgdas(clienteId), { anoCalendario });
  return res.data;
}

export async function importarFolhaGuias(clienteId, periodo) {
  const res = await axios.post(endpoints.fatorR.folha.importarGuias(clienteId), periodo);
  return res.data;
}

export async function importarFolhaCadastro(clienteId, periodo) {
  const res = await axios.post(endpoints.fatorR.folha.importarCadastro(clienteId), periodo);
  return res.data;
}

export async function importarFolhaDocumento(clienteId, guiaFiscalId) {
  const res = await axios.post(endpoints.fatorR.folha.importarDocumento(clienteId), {
    guiaFiscalId,
  });
  return res.data;
}

/**
 * Upload do Extrato do Simples Nacional (PDF). Preenche folha E faturamento da
 * janela inteira de uma vez — a melhor fonte de backfill disponível.
 */
export async function importarExtratoPgdas(clienteId, arquivo) {
  const formData = new FormData();
  formData.append('file', arquivo);
  const res = await axios.post(endpoints.fatorR.extratoPgdas(clienteId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ─── Faturamento ────────────────────────────────────────────────────────────

export function useGetFaturamentos(clienteId, params = {}) {
  const url = clienteId ? buildQuery(endpoints.fatorR.faturamento.list(clienteId), params) : null;
  const { data, isLoading, error, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      faturamentos: data?.faturamentos ?? [],
      faturamentosLoading: isLoading,
      faturamentosError: error,
      refetchFaturamentos: mutate,
    }),
    [data, isLoading, error, mutate]
  );
}

export async function salvarFaturamento(clienteId, ano, mes, body) {
  const res = await axios.put(endpoints.fatorR.faturamento.upsert(clienteId, ano, mes), body);
  return res.data;
}

export async function sugerirFaturamento(clienteId, ano, mes) {
  const res = await axios.get(endpoints.fatorR.faturamento.sugestao(clienteId, ano, mes));
  return res.data;
}

export async function sincronizarNotas(clienteId, periodo) {
  const res = await axios.post(endpoints.fatorR.faturamento.sincronizarNotas(clienteId), periodo);
  return res.data;
}
