import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// Obter código de indicação do cliente autenticado
export async function obterCodigoIndicacao() {
  const res = await axios.get(endpoints.indicacoes.codigo);
  return res.data;
}

// Obter link de indicação do cliente autenticado
export async function obterLinkIndicacao() {
  const res = await axios.get(endpoints.indicacoes.link);
  return res.data;
}

// Criar indicação (público - não requer autenticação)
export async function criarIndicacao(payload) {
  const res = await axios.post(endpoints.indicacoes.criar, payload);
  return res.data;
}

// Listar minhas indicações (cliente autenticado)
export function useMinhasIndicacoes() {
  const { data, isLoading, error, isValidating, mutate } = useSWR(
    endpoints.indicacoes.minhas,
    fetcher,
    swrOptions
  );
  return useMemo(
    () => ({
      data: data?.indicacoes || [],
      isLoading,
      error,
      isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

// Obter detalhes de uma indicação
export async function obterDetalhesIndicacao(id) {
  const res = await axios.get(endpoints.indicacoes.detalhes(id));
  return res.data;
}

// Obter dados do indicador por código (público)
export async function obterIndicadorPorCodigo(codigo) {
  try {
    const res = await axios.get(endpoints.indicacoes.indicadorPorCodigo(codigo));
    return res.data;
  } catch (error) {
    // Se o endpoint não existir, retorna null (não quebra a página)
    console.warn('Endpoint de indicador não disponível:', error);
    return null;
  }
}

// Listar todas as indicações (admin)
export function useTodasIndicacoes(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio);
  if (params.dataFim) queryParams.append('dataFim', params.dataFim);

  const url = `${endpoints.indicacoes.todas}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);
  return useMemo(
    () => ({
      indicacoes: data?.indicacoes || [],
      isLoading,
      error,
      isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

// Aprovar indicação (admin)
export async function aprovarIndicacao(id) {
  const res = await axios.put(endpoints.indicacoes.aprovar(id));
  return res.data;
}

// Rejeitar indicação (admin)
export async function rejeitarIndicacao(id, motivo) {
  const res = await axios.put(endpoints.indicacoes.rejeitar(id), { motivo });
  return res.data;
}

// Atualizar status da indicação (admin)
export async function atualizarStatusIndicacao(id, status) {
  const res = await axios.put(endpoints.indicacoes.atualizarStatus(id), { status });
  return res.data;
}
