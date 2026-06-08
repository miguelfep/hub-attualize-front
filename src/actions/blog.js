'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints, getStorageAssetUrl } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Blog Attualize (ms-me) — dashboard.
// Leitura via SWR; escrita exige Bearer token (injetado automaticamente após login).
// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// Monta query string ignorando valores vazios.
function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) return;
    usp.append(key, String(value));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Adapta um post bruto da API para o shape usado pelas telas do dashboard.
 */
function adaptPost(p) {
  if (!p) return null;
  const comentarios = Array.isArray(p.comentarios) ? p.comentarios : [];
  const commentsPending = comentarios.filter((c) => c.aprovado === false).length;
  return {
    ...p,
    id: p._id,
    title: p.titulo,
    slug: p.slug,
    description: p.resumo || '',
    content: p.conteudoMarkdown || '',
    coverUrl: getStorageAssetUrl(p.coverImage || p.ogImage || ''),
    createdAt: p.createdAt,
    publishedAt: p.publishedAt,
    status: p.status,
    // mapeia status -> "publish" (compat com componentes do template)
    publish: p.status === 'publicado' ? 'published' : 'draft',
    author: { name: p.autor || 'Equipe Attualize Contabil', avatarUrl: '' },
    categoria: p.categoria || '',
    tags: Array.isArray(p.tags) ? p.tags : [],
    // contagem de comentários (total e pendentes = "novos")
    commentsTotal: comentarios.length,
    commentsPending,
    totalViews: 0,
    totalShares: 0,
    totalComments: comentarios.length,
  };
}

// ----------------------------------------------------------------------
// LEITURA (hooks)
// ----------------------------------------------------------------------

const POSTS_PER_PAGE = 100; // teto por página da API
const MAX_PAGES = 100; // trava de segurança (até 10k posts)

/**
 * Busca TODOS os posts que casam com os filtros, paginando a API (que limita a
 * 100 por página) e acumulando o resultado. Antes a tela travava no teto de 100.
 */
async function fetchAllBlogPosts(baseParams) {
  const first = await fetcher(
    `${endpoints.blog.posts}${buildQuery({ ...baseParams, page: 1, limit: POSTS_PER_PAGE })}`
  );
  const firstPosts = first?.posts || first?.data || [];
  const total = Number(first?.total ?? firstPosts.length);
  const perPage = Number(first?.limit) || POSTS_PER_PAGE;
  const totalPages = Math.min(MAX_PAGES, Math.max(1, Math.ceil(total / perPage)));

  if (totalPages <= 1) return { posts: firstPosts, total };

  const requests = [];
  for (let p = 2; p <= totalPages; p += 1) {
    requests.push(
      fetcher(`${endpoints.blog.posts}${buildQuery({ ...baseParams, page: p, limit: perPage })}`)
    );
  }
  const rest = await Promise.all(requests);
  const restPosts = rest.flatMap((r) => r?.posts || r?.data || []);
  return { posts: [...firstPosts, ...restPosts], total };
}

/**
 * Lista posts para o painel. Com token, pode listar qualquer status.
 * Pagina internamente e devolve TODOS os posts (não só os 100 da 1ª página).
 * @param {{ status?: string, categoria?: string, busca?: string }} params
 */
export function useGetBlogPosts(params = {}) {
  // Chave estável p/ o cache do SWR (o fetcher pagina por conta própria).
  const key = `${endpoints.blog.posts}${buildQuery(params)}::all`;

  const { data, isLoading, error, isValidating, mutate } = useSWR(
    key,
    () => fetchAllBlogPosts(params),
    swrOptions
  );

  return useMemo(() => {
    const rawPosts = data?.posts || [];
    const posts = rawPosts.map(adaptPost);
    return {
      posts,
      postsTotal: Number(data?.total ?? posts.length),
      postsLoading: isLoading,
      postsError: error,
      postsValidating: isValidating,
      postsEmpty: !isLoading && posts.length === 0,
      postsMutate: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);
}

/**
 * Busca um post pelo slug (inclui rascunhos quando autenticado).
 */
export function useGetBlogPost(slug) {
  const url = slug ? endpoints.blog.post(slug) : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(() => {
    const raw = data?.post || data?.data || data;
    return {
      post: raw && raw.slug ? adaptPost(raw) : null,
      postLoading: isLoading,
      postError: error,
      postValidating: isValidating,
      postMutate: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);
}

// ----------------------------------------------------------------------
// ESCRITA (mutações)
// ----------------------------------------------------------------------

/**
 * Cria um post. Por padrão como rascunho (envie status: 'publicado' para já publicar).
 * @param {object} payload - { titulo, conteudoMarkdown, resumo, categoria, tags, keywords, coverImage, seoTitle, metaDescription, faq, autor, status }
 */
export async function createBlogPost(payload) {
  const res = await axios.post(endpoints.blog.create, payload);
  return res.data?.post || res.data;
}

/**
 * Atualiza um post (envie apenas os campos alterados).
 */
export async function updateBlogPost(id, payload) {
  const res = await axios.put(endpoints.blog.update(id), payload);
  return res.data?.post || res.data;
}

/**
 * Publica um post (gera/atualiza o .md, sitemap e RSS).
 */
export async function publishBlogPost(id) {
  const res = await axios.post(endpoints.blog.publicar(id));
  return res.data?.post || res.data;
}

/**
 * Arquiva um post (remove o .md público, mantém no banco).
 */
export async function archiveBlogPost(id) {
  const res = await axios.post(endpoints.blog.arquivar(id));
  return res.data?.post || res.data;
}

/**
 * Remove definitivamente um post (post + .md).
 */
export async function deleteBlogPost(id) {
  const res = await axios.delete(endpoints.blog.delete(id));
  return res.data;
}

/**
 * Importa e reescreve posts do WordPress com IA.
 * @param {{ limite?: number, publicar?: boolean }} options - limite=0 importa todos
 */
export async function importWordpressPosts({ limite = 5, publicar = true } = {}) {
  const res = await axios.post(endpoints.blog.importWordpress, { limite, publicar });
  return res.data;
}

// ----------------------------------------------------------------------
// IMAGENS (capa)
// ----------------------------------------------------------------------

/**
 * Faz upload de uma imagem do blog. Retorna { path, url }.
 * @param {File} file
 */
export async function uploadBlogImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(endpoints.blog.upload, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/**
 * Lista as imagens já armazenadas (upload + importadas) para a galeria.
 */
export function useGetBlogImages(enabled = true) {
  const { data, isLoading, error, mutate } = useSWR(
    enabled ? endpoints.blog.images : null,
    fetcher,
    swrOptions
  );

  return useMemo(
    () => ({
      imagens: data?.imagens || [],
      imagensLoading: isLoading,
      imagensError: error,
      imagensMutate: mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

// ----------------------------------------------------------------------
// COMENTÁRIOS
// ----------------------------------------------------------------------

/**
 * Envia um comentário pelo site público (entra como pendente até aprovação).
 * @param {string} slug
 * @param {{ authorName: string, authorEmail?: string, authorUrl?: string, contentMarkdown: string }} payload
 */
export async function createBlogComment(slug, payload) {
  const res = await axios.post(endpoints.blog.comentarios(slug), payload);
  return res.data;
}

/**
 * Lista todos os comentários de um post (admin — inclui pendentes).
 * @param {string} postId
 */
export function useGetBlogComments(postId) {
  const url = postId ? endpoints.blog.comentariosAdmin(postId) : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(() => {
    const comentarios = data?.comentarios || [];
    return {
      comentarios,
      comentariosLoading: isLoading,
      comentariosError: error,
      comentariosValidating: isValidating,
      comentariosMutate: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);
}

/**
 * Caixa global de comentários (admin) — comentários de todos os posts.
 * @param {{ status?: 'pendente' | 'aprovado', limit?: number }} params
 */
export function useGetAllBlogComments(params = {}) {
  const qs = buildQuery({ status: params.status, limit: params.limit });
  const url = `${endpoints.blog.comentariosGlobais}${qs}`;

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);

  return useMemo(() => {
    const comentarios = data?.comentarios || [];
    return {
      comentarios,
      comentariosLoading: isLoading,
      comentariosError: error,
      comentariosValidating: isValidating,
      comentariosMutate: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);
}

/** Adiciona um comentário pelo painel (admin) — já aprovado por padrão. */
export async function createBlogCommentAdmin(postId, payload) {
  const res = await axios.post(endpoints.blog.comentarioNovoAdmin(postId), payload);
  return res.data?.comentario || res.data;
}

/** Aprova um comentário (admin). */
export async function approveBlogComment(postId, comentarioId) {
  const res = await axios.post(endpoints.blog.aprovarComentario(postId, comentarioId));
  return res.data?.comentario || res.data;
}

/** Reprova um comentário — volta para pendente (admin). */
export async function rejectBlogComment(postId, comentarioId) {
  const res = await axios.post(endpoints.blog.reprovarComentario(postId, comentarioId));
  return res.data?.comentario || res.data;
}

/** Remove um comentário (admin). */
export async function deleteBlogComment(postId, comentarioId) {
  const res = await axios.delete(endpoints.blog.deletarComentario(postId, comentarioId));
  return res.data;
}
