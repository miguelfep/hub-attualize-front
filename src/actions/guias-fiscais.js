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

// ----------------------------------------------------------------------

const MIME_POR_EXT = {
  pdf: 'application/pdf',
  ofx: 'application/x-ofx',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
};

function mimeFromFileName(nomeArquivo) {
  const ext = String(nomeArquivo || '')
    .split('.')
    .pop()
    ?.toLowerCase();
  return (ext && MIME_POR_EXT[ext]) || 'application/octet-stream';
}

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

  const fileName = nomeArquivo || 'guia-fiscal.pdf';
  const url = window.URL.createObjectURL(new Blob([res.data], { type: mimeFromFileName(fileName) }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return res.data;
}

// ----------------------------------------------------------------------
// Portal do cliente: use src/actions/cliente-portal-guias-api.js
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// Pastas (admin) — requer clienteId na query / body conforme API
// ----------------------------------------------------------------------

export async function getPastasGuiasAdmin(clienteId) {
  const res = await axios.get(endpoints.guiasFiscais.pastas, {
    params: { clienteId },
  });
  return res.data;
}

export function useGetPastasGuiasAdmin(clienteId) {
  const qs = clienteId ? new URLSearchParams({ clienteId }).toString() : '';
  const url = clienteId ? `${endpoints.guiasFiscais.pastas}?${qs}` : null;

  const { data, isLoading, error, mutate } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

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

export async function createSubpastaGuiasAdmin(parentFolderId, payload) {
  const res = await axios.post(endpoints.guiasFiscais.pastasSubpasta(parentFolderId), payload);
  return res.data;
}

export async function deletePastaGuiasAdmin(folderId, clienteId) {
  const res = await axios.delete(endpoints.guiasFiscais.pastaDelete(folderId), {
    params: { clienteId },
  });
  return res.data;
}

export async function uploadManualPastaAdmin(folderId, files, { clienteId, dataVencimento, competencia }) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('clienteId', clienteId);
  if (dataVencimento) {
    formData.append('dataVencimento', dataVencimento);
  }
  if (competencia) {
    formData.append('competencia', competencia);
  }

  const res = await axios.post(endpoints.guiasFiscais.pastaUpload(folderId), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
}

export async function moveGuiaParaPastaAdmin(guiaId, folderId) {
  const res = await axios.patch(endpoints.guiasFiscais.moveToPasta(guiaId), { folderId });
  return res.data;
}

// ----------------------------------------------------------------------
// Serpro — DAS emitida
// ----------------------------------------------------------------------

/**
 * Detecta DAS existente no slot (cliente + pasta + competência).
 * @returns {{ existe: boolean, guia: Object|null }}
 */
export async function getDasExistenteNoSlot(clienteId, folderId, competencia) {
  const res = await axios.get(endpoints.guiasFiscais.list, {
    params: {
      clienteId,
      folderId,
      categoria: 'GUIA_FISCAL',
      tipoGuia: 'DAS',
      limit: 100,
    },
  });
  const guias = res?.data?.data?.guias || [];
  const encontrada = guias.find(
    (g) => g.competencia === competencia || g?.dadosExtraidos?.competencia === competencia
  );
  return { existe: !!encontrada, guia: encontrada || null };
}

/**
 * Substitui arquivo de uma DAS existente (preserva _id).
 */
export async function substituirArquivoGuia(id, file, { serproId, dataVencimento } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (serproId) formData.append('serproId', serproId);
  if (dataVencimento) formData.append('dataVencimento', dataVencimento);

  const res = await axios.put(endpoints.guiasFiscais.substituirArquivo(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/**
 * Cria nova GuiaFiscal via modal DAS (com metadados SerPro preenchidos).
 */
export async function criarGuiaSerpro(
  file,
  { clienteId, folderId, serproId, dataVencimento, competencia } = {}
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('clienteId', clienteId);
  formData.append('folderId', folderId);
  if (serproId) formData.append('serproId', serproId);
  if (dataVencimento) formData.append('dataVencimento', dataVencimento);
  if (competencia) formData.append('competencia', competencia);

  const res = await axios.post(endpoints.guiasFiscais.criarSerpro, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
