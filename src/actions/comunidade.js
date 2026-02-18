'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// Util: monta query string ignorando valores vazios
function buildQuery(params) {
  if (!params) return '';
  const cleaned = Object.entries(params).reduce((acc, [k, v]) => {
    if (v !== '' && v !== undefined && v !== null) acc[k] = v;
    return acc;
  }, {});
  const qs = new URLSearchParams(cleaned).toString();
  return qs ? `?${qs}` : '';
}

// ----------------------------------------------------------------------
// MATERIAIS
// ----------------------------------------------------------------------

/**
 * Hook para listar materiais
 * @param {Object} params - Parâmetros de filtro
 * @returns {Object}
 */
export function useMateriais(params = {}) {
  const qs = buildQuery(params);
  const url = `${endpoints.comunidade.materiais.list}${qs}`;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);
  
  return useMemo(
    () => ({
      data: data?.materiais || [],
      total: data?.total || 0,
      page: data?.page || 1,
      limit: data?.limit || 50,
      isLoading,
      error,
      isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

/**
 * Hook para obter material por ID
 * @param {string} id - ID do material
 * @returns {Object}
 */
export function useMaterial(id) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? endpoints.comunidade.materiais.get(id) : null,
    fetcher,
    swrOptions
  );

  return useMemo(
    () => ({
      data: data?.material || null,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

/**
 * Criar material
 * @param {Object} payload - Dados do material
 * @returns {Promise}
 */
export async function createMaterial(payload) {
  const res = await axios.post(endpoints.comunidade.materiais.create, payload);
  return res.data;
}

/**
 * Atualizar material
 * @param {string} id - ID do material
 * @param {Object} payload - Dados para atualizar
 * @returns {Promise}
 */
export async function updateMaterial(id, payload) {
  const res = await axios.put(endpoints.comunidade.materiais.update(id), payload);
  return res.data;
}

/**
 * Deletar material
 * @param {string} id - ID do material
 * @returns {Promise}
 */
export async function deleteMaterial(id) {
  const res = await axios.delete(endpoints.comunidade.materiais.delete(id));
  return res.data;
}

/**
 * Upload de arquivo do material
 * @param {string} id - ID do material
 * @param {File} file - Arquivo para upload
 * @param {Function} onProgress - Callback de progresso
 * @returns {Promise}
 */
export async function uploadMaterialArquivo(id, file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post(endpoints.comunidade.materiais.upload(id), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });

  return res.data;
}

/**
 * Upload de thumbnail do material
 * @param {string} id - ID do material
 * @param {File} file - Arquivo de imagem
 * @returns {Promise}
 */
export async function uploadMaterialThumbnail(id, file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post(endpoints.comunidade.materiais.thumbnail(id), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
}

/**
 * Registrar acesso ao material (visualização/download)
 * @param {string} id - ID do material
 * @param {string} tipo - 'visualizacao' | 'download'
 * @returns {Promise}
 */
export async function registrarAcessoMaterial(id, tipo) {
  const res = await axios.post(endpoints.comunidade.materiais.acesso(id), { tipo });
  return res.data;
}

/**
 * Comprar material
 * @param {string} id - ID do material
 * @returns {Promise}
 */
export async function comprarMaterial(id) {
  const res = await axios.post(endpoints.comunidade.materiais.comprar(id));
  return res.data;
}

/**
 * Download de arquivo do material
 * @param {string} id - ID do material
 * @returns {Promise}
 */
export async function downloadMaterial(id) {
  const res = await axios.get(endpoints.comunidade.materiais.download(id));
  return res.data;
}

// ----------------------------------------------------------------------
// CATEGORIAS
// ----------------------------------------------------------------------

/**
 * Hook para listar categorias
 * @param {Object} params - Parâmetros de filtro
 * @returns {Object}
 */
export function useCategorias(params = {}) {
  const qs = buildQuery(params);
  const url = `${endpoints.comunidade.categorias.list}${qs}`;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);
  
  return useMemo(
    () => ({
      data: data?.categorias || [],
      isLoading,
      error,
      isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

/**
 * Hook para obter categoria por ID
 * @param {string} id - ID da categoria
 * @returns {Object}
 */
export function useCategoria(id) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? endpoints.comunidade.categorias.get(id) : null,
    fetcher,
    swrOptions
  );

  return useMemo(
    () => ({
      data: data?.categoria || null,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

/**
 * Criar categoria
 * @param {Object} payload - Dados da categoria
 * @returns {Promise}
 */
export async function createCategoria(payload) {
  const res = await axios.post(endpoints.comunidade.categorias.create, payload);
  return res.data;
}

/**
 * Atualizar categoria
 * @param {string} id - ID da categoria
 * @param {Object} payload - Dados para atualizar
 * @returns {Promise}
 */
export async function updateCategoria(id, payload) {
  const res = await axios.put(endpoints.comunidade.categorias.update(id), payload);
  return res.data;
}

/**
 * Deletar categoria
 * @param {string} id - ID da categoria
 * @returns {Promise}
 */
export async function deleteCategoria(id) {
  const res = await axios.delete(endpoints.comunidade.categorias.delete(id));
  return res.data;
}

// ----------------------------------------------------------------------
// TAGS
// ----------------------------------------------------------------------

/**
 * Hook para listar tags
 * @param {Object} params - Parâmetros de filtro
 * @returns {Object}
 */
export function useTags(params = {}) {
  const qs = buildQuery(params);
  const url = `${endpoints.comunidade.tags.list}${qs}`;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);
  
  return useMemo(
    () => ({
      data: data?.tags || [],
      isLoading,
      error,
      isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

/**
 * Hook para obter tag por ID
 * @param {string} id - ID da tag
 * @returns {Object}
 */
export function useTag(id) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? endpoints.comunidade.tags.get(id) : null,
    fetcher,
    swrOptions
  );

  return useMemo(
    () => ({
      data: data?.tag || null,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

/**
 * Criar tag
 * @param {Object} payload - Dados da tag
 * @returns {Promise}
 */
export async function createTag(payload) {
  const res = await axios.post(endpoints.comunidade.tags.create, payload);
  return res.data;
}

/**
 * Atualizar tag
 * @param {string} id - ID da tag
 * @param {Object} payload - Dados para atualizar
 * @returns {Promise}
 */
export async function updateTag(id, payload) {
  const res = await axios.put(endpoints.comunidade.tags.update(id), payload);
  return res.data;
}

/**
 * Deletar tag
 * @param {string} id - ID da tag
 * @returns {Promise}
 */
export async function deleteTag(id) {
  const res = await axios.delete(endpoints.comunidade.tags.delete(id));
  return res.data;
}

// ----------------------------------------------------------------------
// CURSOS
// ----------------------------------------------------------------------

/**
 * Hook para listar cursos
 * @param {Object} params - Parâmetros de filtro
 * @returns {Object}
 */
export function useCursos(params = {}) {
  const qs = buildQuery(params);
  const url = `${endpoints.comunidade.cursos.list}${qs}`;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);
  
  return useMemo(
    () => ({
      data: data?.cursos || [],
      total: data?.total || 0,
      page: data?.page || 1,
      limit: data?.limit || 50,
      isLoading,
      error,
      isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

/**
 * Hook para obter curso por ID
 * @param {string} id - ID do curso
 * @returns {Object}
 */
export function useCurso(id) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? endpoints.comunidade.cursos.get(id) : null,
    fetcher,
    swrOptions
  );

  return useMemo(
    () => ({
      data: data?.curso || null,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

/**
 * Criar curso
 * @param {Object} payload - Dados do curso
 * @returns {Promise}
 */
export async function createCurso(payload) {
  const res = await axios.post(endpoints.comunidade.cursos.create, payload);
  return res.data;
}

/**
 * Atualizar curso
 * @param {string} id - ID do curso
 * @param {Object} payload - Dados para atualizar
 * @returns {Promise}
 */
export async function updateCurso(id, payload) {
  const res = await axios.put(endpoints.comunidade.cursos.update(id), payload);
  return res.data;
}

/**
 * Deletar curso
 * @param {string} id - ID do curso
 * @returns {Promise}
 */
export async function deleteCurso(id) {
  const res = await axios.delete(endpoints.comunidade.cursos.delete(id));
  return res.data;
}

/**
 * Upload de thumbnail do curso
 * @param {string} id - ID do curso
 * @param {File} file - Arquivo de imagem
 * @returns {Promise}
 */
export async function uploadCursoThumbnail(id, file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post(endpoints.comunidade.cursos.thumbnail(id), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
}

/**
 * Adicionar material ao curso
 * @param {string} id - ID do curso
 * @param {string} materialId - ID do material
 * @returns {Promise}
 */
export async function addMaterialToCurso(id, materialId) {
  const res = await axios.post(endpoints.comunidade.cursos.materiais.add(id), { materialId });
  return res.data;
}

/**
 * Remover material do curso
 * @param {string} id - ID do curso
 * @param {string} materialId - ID do material
 * @returns {Promise}
 */
export async function removeMaterialFromCurso(id, materialId) {
  const res = await axios.delete(endpoints.comunidade.cursos.materiais.remove(id, materialId));
  return res.data;
}

/**
 * Marcar material como completo no curso
 * @param {string} id - ID do curso
 * @param {string} materialId - ID do material
 * @returns {Promise}
 */
export async function marcarMaterialCompleto(id, materialId) {
  const res = await axios.post(endpoints.comunidade.cursos.materiais.completo(id, materialId));
  return res.data;
}

/**
 * Comprar curso
 * @param {string} id - ID do curso
 * @returns {Promise}
 */
export async function comprarCurso(id) {
  const res = await axios.post(endpoints.comunidade.cursos.comprar(id));
  return res.data;
}

/**
 * Registrar visualização do curso
 * @param {string} id - ID do curso
 * @returns {Promise}
 */
export async function registrarVisualizacaoCurso(id) {
  const res = await axios.post(endpoints.comunidade.cursos.visualizacao(id));
  return res.data;
}
