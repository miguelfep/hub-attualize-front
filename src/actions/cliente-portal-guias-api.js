'use client';

import { useMemo } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';

import { paths } from 'src/routes/paths';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// API do portal (cliente) para guias/documentos.
// ----------------------------------------------------------------------

/** Após upload contábil: redirecionar para guias-fiscais e ler esta chave para o toast. */
export const SESSION_STORAGE_GUIAS_CONTABIL_UPLOAD_TOAST =
  'attualize:portal:guias-contabil-upload-toast';

/**
 * Normaliza competência para o upload contábil (§6.4 / §2.3.1): MM/AAAA.
 * Aceita separador / . -
 */
export function normalizeCompetenciaContabilUpload(competencia) {
  const t = (competencia || '').trim();
  const m = t.match(/^(\d{1,2})\s*[/.-]\s*(\d{4})$/);
  if (!m) return null;
  const mes = parseInt(m[1], 10);
  const ano = parseInt(m[2], 10);
  if (mes < 1 || mes > 12) return null;
  return `${String(mes).padStart(2, '0')}/${ano}`;
}

// ----------------------------------------------------------------------

/**
 * Revalida listagens SWR do portal (guias por pasta + árvore de pastas).
 * Chame após: abrir detalhe (leitura registrada no GET), download concluído, upload, etc.
 */
export function revalidarCachesListagemGuiasPortal() {
  const listBase = endpoints.guiasFiscais.portal.list.split('?')[0];
  return globalMutate(
    (key) =>
      typeof key === 'string' &&
      (key.startsWith(listBase) || key === endpoints.guiasFiscais.portal.pastas)
  );
}

/**
 * GET detalhe no portal — o backend registra leitura (§6.8).
 * Atualiza cache SWR do detalhe e revalida listagens para badge "Novo" / drive.
 */
export async function registrarVisualizacaoPortalAntesDeAbrirDetalhe(documentoId) {
  if (!documentoId) return;
  const res = await axios.get(endpoints.guiasFiscais.portal.get(documentoId));
  const key = endpoints.guiasFiscais.portal.get(documentoId);
  await globalMutate(key, res.data, { revalidate: false });
  await revalidarCachesListagemGuiasPortal();
}

/**
 * Use ao clicar em "Ver": garante registro de visualização mesmo se o detalhe vier de cache no próximo passo.
 * Se o GET falhar, ainda navega — a página de detalhe tentará de novo.
 */
export async function navegarParaDetalheGuiaPortal(router, documentoId) {
  try {
    await registrarVisualizacaoPortalAntesDeAbrirDetalhe(documentoId);
  } catch {
    /* detalhe refaz GET ao montar */
  }
  router.push(paths.cliente.guiasFiscais.details(documentoId));
}

/**
 * Listar guias fiscais do cliente logado (Portal)
 */
export async function getGuiasFiscaisPortal(params = {}) {
  const res = await axios.get(endpoints.guiasFiscais.portal.list, { params });
  return res.data;
}

export function useGetGuiasFiscaisPortal(params = {}) {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  ).toString();

  const url = queryString
    ? `${endpoints.guiasFiscais.portal.list}?${queryString}`
    : endpoints.guiasFiscais.portal.list;

  const { data, isLoading, error, mutate } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

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

export async function getGuiaFiscalPortalById(id) {
  const res = await axios.get(endpoints.guiasFiscais.portal.get(id));
  return res.data;
}

export function useGetGuiaFiscalPortalById(id) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? endpoints.guiasFiscais.portal.get(id) : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (err) => {
        console.error('Erro ao buscar guia (portal):', err);
      },
    }
  );

  return useMemo(
    () => ({
      data: data?.success !== false ? (data?.data || data || null) : null,
      isLoading,
      error:
        error ||
        (data?.success === false ? new Error(data?.message || 'Erro ao carregar documento') : null),
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

export async function solicitarAtualizacaoGuiaPortal(id) {
  const res = await axios.post(endpoints.guiasFiscais.portal.solicitarAtualizacao(id));
  return res.data;
}

/**
 * Árvore de pastas do cliente (Portal) — uma única requisição.
 */
export async function getPastasGuiasPortalTree() {
  const res = await axios.get(endpoints.guiasFiscais.portal.pastas);
  return Array.isArray(res.data?.data) ? res.data.data : [];
}

/**
 * Criar subpasta no portal (§6.2 — JSON: slug + nome; sem clienteId).
 */
export async function createSubpastaGuiasPortal(parentFolderId, payload) {
  const res = await axios.post(endpoints.guiasFiscais.portal.pastasSubpasta(parentFolderId), payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

/**
 * Upload manual no portal — multipart com campo `files` (§6.3).
 */
export async function uploadParaPastaPortal(folderId, files, options = {}) {
  const { competencia, dataVencimento } = options;
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  if (dataVencimento) {
    formData.append('dataVencimento', dataVencimento);
  }
  if (competencia) {
    formData.append('competencia', competencia);
  }

  const res = await axios.post(endpoints.guiasFiscais.portal.pastaUpload(folderId), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
}

/**
 * Upload contábil por competência (§6.4) — `competencia` obrigatória (MM/AAAA após normalização).
 * Servidor resolve/cria `contabil / {ano} / {MM}`.
 *
 * @param {File[]} files
 * @param {{ competencia: string, dataVencimento?: string }} options
 */
export async function uploadContabilCompetenciaPortal(files, options = {}) {
  const { competencia: competenciaRaw, dataVencimento } = options;
  const competencia = normalizeCompetenciaContabilUpload(competenciaRaw);
  if (!competencia) {
    throw new Error(
      'Competência obrigatória e inválida. Use MM/AAAA (ex.: 03/2026), com /, - ou . entre mês e ano.'
    );
  }
  if (!files?.length) {
    throw new Error('Selecione pelo menos um ficheiro.');
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('competencia', competencia);
  if (dataVencimento) {
    formData.append('dataVencimento', dataVencimento);
  }

  const res = await axios.post(endpoints.guiasFiscais.portal.contabilUpload, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
}

/**
 * @deprecated Prefira `uploadContabilCompetenciaPortal`. Mantém nome antigo.
 */
export async function uploadDocumentosContabilPortal(files, { competencia, dataVencimento } = {}) {
  return uploadContabilCompetenciaPortal(files, { competencia, dataVencimento });
}

/**
 * Árvore de pastas do cliente logado (Portal)
 */
export function useGetPastasGuiasPortal() {
  const { data, isLoading, error, mutate } = useSWR(
    endpoints.guiasFiscais.portal.pastas,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

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
