'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

import { suggestSlugFromNome } from 'src/sections/guias-fiscais/utils';

// ----------------------------------------------------------------------
// API do portal (cliente) para guias/documentos.
// Nome do arquivo evita colisão com `guias-fiscais.js` no Turbopack/HMR.
//
// Contábil → ano → mês: se faltar nível na árvore, criamos via
// POST portal/guias-fiscais/pastas/:parentId/subpastas (JSON: slug, nome; sem clienteId).
// ----------------------------------------------------------------------

const NOMES_MES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function findFolderBySlugDeep(nodes, slug) {
  if (!nodes?.length || !slug) return null;
  const target = slug.toLowerCase();
  const stack = [...nodes];
  while (stack.length) {
    const n = stack.shift();
    if ((n.slug || '').toLowerCase() === target) {
      return n;
    }
    if (n.children?.length) {
      stack.push(...n.children);
    }
  }
  return null;
}

function findChildBySlug(parent, slug) {
  if (!parent?.children?.length || !slug) return null;
  const target = slug.toLowerCase();
  return parent.children.find((c) => (c.slug || '').toLowerCase() === target) || null;
}

function extractNewFolderId(res) {
  if (!res || typeof res !== 'object') return null;
  if (res.success === false) return null;
  const d = res.data !== undefined ? res.data : res;
  if (d && typeof d === 'object') {
    return d._id || d.id || d.folder?._id || d.folder?.id || d.data?._id || d.data?.id || null;
  }
  return null;
}

function apiMessageFromError(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (typeof err?.response?.data === 'string' ? err.response.data : null) ||
    err?.message ||
    null
  );
}

// ----------------------------------------------------------------------

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
 * Criar subpasta no portal (corpo típico: slug + nome; empresa inferida pelo token).
 */
export async function createSubpastaGuiasPortal(parentFolderId, payload) {
  const res = await axios.post(endpoints.guiasFiscais.portal.pastasSubpasta(parentFolderId), payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

/**
 * Upload manual no portal — multipart com campo `files` (§6.2).
 * `competencia` / `dataVencimento` opcionais, como no admin.
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
 * Garante contabil → {ano} → {mês}: reutiliza pastas existentes ou cria subpastas no portal.
 * Slugs: ano string numérica; mês em PT sem acento (`marco`, `abril` — como no lote §2.3).
 *
 * @param {number} mes 1–12
 * @param {number} ano ex. 2026
 * @returns {Promise<string>} folderId folha (mês)
 */
export async function ensurePortalContabilCompetenciaFolderId(mes, ano) {
  const mesLabel = NOMES_MES_PT[mes - 1];
  if (!mesLabel) {
    throw new Error('Mês de competência inválido.');
  }
  const mesSlug = suggestSlugFromNome(mesLabel);
  const yearSlug = String(ano);

  let folders = await getPastasGuiasPortalTree();
  let contabil = findFolderBySlugDeep(folders, 'contabil');
  if (!contabil) {
    throw new Error(
      'Pasta contábil (slug "contabil") não encontrada. As pastas padrão podem ainda não ter sido geradas — contacte o suporte.'
    );
  }

  let yearNode = findChildBySlug(contabil, yearSlug);
  if (!yearNode) {
    try {
      const res = await createSubpastaGuiasPortal(contabil._id, { slug: yearSlug, nome: yearSlug });
      if (res?.success === false) {
        throw new Error(res.message || 'Não foi possível criar a pasta do ano.');
      }
      const newYearId = extractNewFolderId(res);
      if (newYearId) {
        yearNode = { _id: newYearId, children: [] };
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        folders = await getPastasGuiasPortalTree();
        contabil = findFolderBySlugDeep(folders, 'contabil');
        yearNode = contabil ? findChildBySlug(contabil, yearSlug) : null;
      } else if (err?.response?.status === 404) {
        throw new Error(
          'O servidor não expõe criação de subpastas no portal (404). É necessário implementar POST /api/portal/guias-fiscais/pastas/:folderId/subpastas no backend.'
        );
      } else {
        throw new Error(apiMessageFromError(err) || 'Não foi possível criar a pasta do ano.');
      }
    }
    if (!yearNode) {
      folders = await getPastasGuiasPortalTree();
      contabil = findFolderBySlugDeep(folders, 'contabil');
      yearNode = contabil ? findChildBySlug(contabil, yearSlug) : null;
    }
  }

  if (!yearNode?._id) {
    throw new Error('Não foi possível obter a pasta do ano em Contábil.');
  }

  let monthNode = findChildBySlug(yearNode, mesSlug);
  if (!monthNode) {
    try {
      const res = await createSubpastaGuiasPortal(yearNode._id, { slug: mesSlug, nome: mesLabel });
      if (res?.success === false) {
        throw new Error(res.message || 'Não foi possível criar a pasta do mês.');
      }
      const newMonthId = extractNewFolderId(res);
      if (newMonthId) {
        return newMonthId;
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        folders = await getPastasGuiasPortalTree();
        contabil = findFolderBySlugDeep(folders, 'contabil');
        const y = contabil ? findChildBySlug(contabil, yearSlug) : null;
        monthNode = y ? findChildBySlug(y, mesSlug) : null;
        if (monthNode?._id) {
          return monthNode._id;
        }
      } else if (err?.response?.status === 404) {
        throw new Error(
          'O servidor não expõe criação de subpastas no portal (404). É necessário implementar POST /api/portal/guias-fiscais/pastas/:folderId/subpastas no backend.'
        );
      } else {
        throw new Error(apiMessageFromError(err) || 'Não foi possível criar a pasta do mês.');
      }
    }
    folders = await getPastasGuiasPortalTree();
    contabil = findFolderBySlugDeep(folders, 'contabil');
    const yAfter = contabil ? findChildBySlug(contabil, yearSlug) : null;
    monthNode = yAfter ? findChildBySlug(yAfter, mesSlug) : null;
  }

  if (!monthNode?._id) {
    throw new Error('Não foi possível obter a pasta do mês em Contábil.');
  }

  return monthNode._id;
}

/**
 * Envio de documentos contábeis a partir da competência MM/AAAA (resolve pastas + upload).
 *
 * @param {File[]} files
 * @param {{ competencia: string }} options - MM/AAAA
 */
export async function uploadDocumentosContabilPortal(files, { competencia }) {
  const trimmed = (competencia || '').trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
  if (!match) {
    throw new Error('Competência inválida. Use o formato MM/AAAA.');
  }
  const mes = parseInt(match[1], 10);
  const ano = parseInt(match[2], 10);
  if (mes < 1 || mes > 12) {
    throw new Error('Mês inválido na competência.');
  }
  const folderId = await ensurePortalContabilCompetenciaFolderId(mes, ano);
  return uploadParaPastaPortal(folderId, files, { competencia: trimmed });
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
