'use client';

import Cookies from 'js-cookie';
import useSWR from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';
import { STORAGE_KEY as JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------

const swrDefaultOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
};

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

// ----------------------------------------------------------------------
// APURAÇÃO
// ----------------------------------------------------------------------

export function useApuracoes(empresaId, filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const url = empresaId
    ? `${endpoints.apuracao.listar(empresaId)}${params.toString() ? `?${params}` : ''}`
    : null;

  return useSWR(url, fetcher, swrDefaultOptions);
}

export function useApuracao(apuracaoId) {
  const url = apuracaoId ? endpoints.apuracao.detalhes(apuracaoId) : null;
  return useSWR(url, fetcher, swrDefaultOptions);
}

export async function calcularApuracao(empresaId, payload) {
  const response = await axios.post(endpoints.apuracao.calcular(empresaId), payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function recalcularApuracao(apuracaoId, payload) {
  const response = await axios.post(endpoints.apuracao.recalcular(apuracaoId), payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function cancelarApuracao(apuracaoId, motivo) {
  const response = await axios.patch(
    endpoints.apuracao.cancelar(apuracaoId),
    { motivo },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function gerarDasDeApuracao(apuracaoId, params) {
  const response = await axios.post(endpoints.apuracao.gerarDas(apuracaoId), params, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function gerarDasDireto(empresaId, params) {
  const response = await axios.post(endpoints.apuracao.gerarDasDireto(empresaId), params, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

// ----------------------------------------------------------------------
// DAS
// ----------------------------------------------------------------------

export function useDas(empresaId, filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const url = empresaId
    ? `${endpoints.apuracao.listarDas(empresaId)}${params.toString() ? `?${params}` : ''}`
    : null;

  return useSWR(url, fetcher, swrDefaultOptions);
}

export function useDasDetalhes(dasId, incluirPdf = false) {
  const url = dasId
    ? `${endpoints.apuracao.dasDetalhes(dasId)}${incluirPdf ? '?incluirPdf=true' : ''}`
    : null;

  return useSWR(url, fetcher, swrDefaultOptions);
}

export async function baixarDasPdf(dasId) {
  const response = await axios.get(endpoints.apuracao.dasPdf(dasId), {
    headers: getAuthHeaders(),
    responseType: 'blob',
  });

  return response;
}

export async function marcarDasComoPago(dasId, payload) {
  const response = await axios.patch(endpoints.apuracao.dasPagar(dasId), payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function cancelarDas(dasId, motivo) {
  const response = await axios.patch(
    endpoints.apuracao.dasCancelar(dasId),
    { motivo },
    { headers: getAuthHeaders() }
  );
  return response.data;
}


