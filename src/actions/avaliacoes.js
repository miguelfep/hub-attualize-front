'use client';

import useSWR from 'swr';
import Cookies from 'js-cookie';

import axios, { fetcher, endpoints } from 'src/utils/axios';

import { STORAGE_KEY as JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
};

function buildQueryString(params) {
  if (!params || typeof params !== 'object') {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.append(key, value);
  });

  return searchParams.toString();
}

export function useAvaliacoes(params, options = {}) {
  const query = buildQueryString(params);
  const enabled = options.enabled ?? true;

  const url = !enabled
    ? null
    : query
      ? `${endpoints.avaliacoes.root}?${query}`
      : endpoints.avaliacoes.root;

  const response = useSWR(url, fetcher, swrOptions);

  return {
    ...response,
    avaliacoes: response.data?.data || response.data || [],
    pagination: response.data?.pagination,
  };
}

export function useAvaliacao(id) {
  const url = id ? endpoints.avaliacoes.byId(id) : null;
  return useSWR(url, fetcher, swrOptions);
}

export function useAvaliacoesEstatisticas(clienteProprietarioId, feedback) {
  const query = buildQueryString({ feedback });
  const baseUrl = clienteProprietarioId
    ? endpoints.avaliacoes.estatisticas(clienteProprietarioId)
    : null;

  const url = baseUrl ? (query ? `${baseUrl}?${query}` : baseUrl) : null;

  return useSWR(url, fetcher, swrOptions);
}

export function useAvaliacoesTiposFeedback(clienteProprietarioId) {
  const query = buildQueryString({ clienteProprietarioId });
  const url = query
    ? `${endpoints.avaliacoes.tiposFeedback}?${query}`
    : endpoints.avaliacoes.tiposFeedback;

  return useSWR(url, fetcher, swrOptions);
}

export async function createAvaliacao(payload) {
  const response = await axios.post(endpoints.avaliacoes.root, payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function responderAvaliacao(id, payload) {
  const response = await axios.put(endpoints.avaliacoes.responder(id), payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function atualizarStatusAvaliacao(id, payload) {
  const response = await axios.put(endpoints.avaliacoes.status(id), payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function deletarAvaliacao(id) {
  const response = await axios.delete(endpoints.avaliacoes.delete(id), {
    headers: getAuthHeaders(),
  });
  return response.data;
}

// ----------------------------------------------------------------------

function getAuthHeaders() {
  if (typeof window === 'undefined') {
    return {};
  }

  const cookieToken = Cookies.get(JWT_STORAGE_KEY);
  const localToken = window.localStorage?.getItem('accessToken');
  const token = cookieToken || localToken;

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}


