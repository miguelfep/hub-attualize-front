'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

/**
 * Upload de guias fiscais e documentos
 * O sistema identifica automaticamente o cliente pelo CNPJ extraído do PDF
 * @param {File[]} files - Array de arquivos PDF (máximo 10)
 * @returns {Promise}
 */
export async function uploadGuiasFiscais(files) {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });
  // NÃO precisa de clienteId - o sistema identifica automaticamente pelo CNPJ

  const res = await axios.post(endpoints.guiasFiscais.upload, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Listar guias fiscais
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise}
 */
export async function getGuiasFiscais(params = {}) {
  const res = await axios.get(endpoints.guiasFiscais.list, { params });
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Hook para listar guias fiscais com SWR
 * @param {Object} params - Parâmetros de filtro
 * @returns {Object}
 */
export function useGetGuiasFiscais(params = {}) {
  // Filtrar valores vazios, null, undefined e strings vazias
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );

  const queryString = new URLSearchParams(cleanParams).toString();

  const url = queryString ? `${endpoints.guiasFiscais.list}?${queryString}` : endpoints.guiasFiscais.list;

  const { data, isLoading, error, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

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

// ----------------------------------------------------------------------

/**
 * Obter guia fiscal por ID
 * @param {string} id - ID da guia
 * @returns {Promise}
 */
export async function getGuiaFiscalById(id) {
  const res = await axios.get(endpoints.guiasFiscais.get(id));
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Hook para obter guia fiscal por ID
 * @param {string} id - ID da guia
 * @returns {Object}
 */
export function useGetGuiaFiscalById(id) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? endpoints.guiasFiscais.get(id) : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (err) => {
        console.error('Erro ao buscar guia fiscal:', err);
      },
    }
  );

  return useMemo(
    () => ({
      data: data?.success !== false ? (data?.data || data || null) : null,
      isLoading,
      error: error || (data?.success === false ? new Error(data?.message || 'Erro ao carregar documento') : null),
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

// ----------------------------------------------------------------------

/**
 * Atualizar guia fiscal
 * @param {string} id - ID da guia
 * @param {Object} data - Dados para atualizar
 * @returns {Promise}
 */
export async function updateGuiaFiscal(id, data) {
  const res = await axios.put(endpoints.guiasFiscais.update(id), data);
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Deletar guia fiscal
 * @param {string} id - ID da guia
 * @returns {Promise}
 */
export async function deleteGuiaFiscal(id) {
  const res = await axios.delete(endpoints.guiasFiscais.delete(id));
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Deletar múltiplas guias fiscais em massa
 * @param {string[]} ids - Array de IDs das guias
 * @returns {Promise}
 */
export async function deleteGuiasFiscaisBatch(ids) {
  const res = await axios.delete(endpoints.guiasFiscais.batch, {
    data: { ids },
  });
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Download de guia fiscal
 * @param {string} id - ID da guia
 * @param {string} nomeArquivo - Nome do arquivo para download
 * @returns {Promise}
 */
export async function downloadGuiaFiscal(id, nomeArquivo) {
  const res = await axios.get(endpoints.guiasFiscais.download(id), {
    responseType: 'blob',
  });

  // Criar link para download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nomeArquivo || 'guia-fiscal.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return res.data;
}

// ----------------------------------------------------------------------
// ENDPOINTS DO PORTAL DO CLIENTE
// ----------------------------------------------------------------------

/**
 * Listar guias fiscais do cliente logado (Portal)
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise}
 */
export async function getGuiasFiscaisPortal(params = {}) {
  const res = await axios.get(endpoints.guiasFiscais.portal.list, { params });
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Hook para listar guias fiscais do portal
 * @param {Object} params - Parâmetros de filtro
 * @returns {Object}
 */
export function useGetGuiasFiscaisPortal(params = {}) {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  ).toString();

  const url = queryString 
    ? `${endpoints.guiasFiscais.portal.list}?${queryString}` 
    : endpoints.guiasFiscais.portal.list;

  const { data, isLoading, error, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

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

// ----------------------------------------------------------------------

/**
 * Obter guia fiscal do portal por ID
 * @param {string} id - ID da guia
 * @returns {Promise}
 */
export async function getGuiaFiscalPortalById(id) {
  const res = await axios.get(endpoints.guiasFiscais.portal.get(id));
  return res.data;
}

// ----------------------------------------------------------------------

/**
 * Hook para obter guia fiscal do portal por ID
 * @param {string} id - ID da guia
 * @returns {Object}
 */
export function useGetGuiaFiscalPortalById(id) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? endpoints.guiasFiscais.portal.get(id) : null,
    fetcher
  );

  return useMemo(
    () => ({
      data: data?.data || null,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

// ----------------------------------------------------------------------

/**
 * Download de guia fiscal do portal
 * @param {string} id - ID da guia
 * @param {string} nomeArquivo - Nome do arquivo para download
 * @returns {Promise}
 */
export async function downloadGuiaFiscalPortal(id, nomeArquivo) {
  const res = await axios.get(endpoints.guiasFiscais.portal.download(id), {
    responseType: 'blob',
  });

  // Criar link para download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nomeArquivo || 'guia-fiscal.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return res.data;
}
