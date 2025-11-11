'use client';

import Cookies from 'js-cookie';
import useSWR from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';
import { STORAGE_KEY as JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

const swrOptions = {
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

export function useFatorRTotais(clienteId) {
  const url = clienteId ? endpoints.fatorR.totais12Meses(clienteId) : null;
  return useSWR(url, fetcher, swrOptions);
}

export function useProLaboreIdeal(clienteId) {
  const url = clienteId ? endpoints.fatorR.proLaboreIdeal(clienteId) : null;
  return useSWR(url, fetcher, swrOptions);
}

export async function simularFatorR(clienteId, payload) {
  const response = await axios.post(endpoints.fatorR.simular(clienteId), payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function registrarFolha(clienteId, payload) {
  const response = await axios.post(endpoints.fatorR.registrarFolha(clienteId), payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function importarHistorico(clienteId, file) {
  const formData = new FormData();
  formData.append('arquivo', file);

  const response = await axios.post(endpoints.fatorR.importarHistorico(clienteId), formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}


