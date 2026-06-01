import { endpoints, getStorageAssetUrl } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Blog Attualize (ms-me) — leitura pública consumida em SSR/SSG.
// Endpoints: /api/blog/posts, /api/blog/posts/:slug
// ----------------------------------------------------------------------

const DEFAULT_IMAGE = '/default-image.png';

// Autor "rosto" do blog (foto em public/assets/images/about/anne.jpg)
export const BLOG_AUTHOR = {
  name: 'Anne Monteiro',
  avatar: '/assets/images/about/anne.jpg',
  role: 'Contadora Especialista',
};

// Categorias fixas usadas no filtro da listagem (mesma lista do formulário)
export const BLOG_CATEGORIAS = ['Saúde', 'Beleza', 'Bem-estar', 'Contabilidade', 'Gestão', 'Geral'];

/**
 * Reescreve URLs de imagens relativas do storage (/storage/...) dentro do
 * markdown/HTML para URLs absolutas no host da API.
 */
function absolutizeContentImages(conteudo) {
  if (!conteudo || typeof conteudo !== 'string') return conteudo || '';
  return conteudo
    .replace(/(\]\()(\/storage\/[^)\s]+)/g, (_, prefix, url) => `${prefix}${getStorageAssetUrl(url)}`)
    .replace(/(src=["'])(\/storage\/[^"']+)/g, (_, prefix, url) => `${prefix}${getStorageAssetUrl(url)}`);
}

/**
 * Normaliza um post da nova API para o shape usado pelos componentes do front.
 * @param {object} p - Post bruto retornado por /api/blog
 */
export function normalizeBlogPost(p) {
  if (!p) return null;

  // Capa e og:image com fallback (coverImage -> ogImage) e URL absoluta.
  const cover = getStorageAssetUrl(p.coverImage || p.ogImage || '');
  const og = getStorageAssetUrl(p.ogImage || p.coverImage || '');

  const comentarios = Array.isArray(p.comentarios) ? p.comentarios : [];

  return {
    id: p._id,
    _id: p._id,
    slug: p.slug,
    title: p.titulo,
    excerpt: p.resumo || '',
    description: p.resumo || '',
    content: absolutizeContentImages(p.conteudoMarkdown || ''),
    date: p.publishedAt || p.createdAt,
    publishedAt: p.publishedAt,
    modified: p.updatedAt || p.publishedAt || p.createdAt,
    imageUrl: cover || og || DEFAULT_IMAGE,
    coverImage: cover || og,
    category: p.categoria || '',
    tags: Array.isArray(p.tags) ? p.tags : [],
    keywords: Array.isArray(p.keywords) ? p.keywords : [],
    author: BLOG_AUTHOR.name,
    authorAvatar: BLOG_AUTHOR.avatar,
    authorRole: BLOG_AUTHOR.role,
    status: p.status,
    readingTime: p.readingTimeMin,
    seoTitle: p.seoTitle || p.titulo,
    metaDescription: p.metaDescription || p.resumo || '',
    canonicalUrl: p.canonicalUrl || '',
    ogImage: og || cover,
    faq: Array.isArray(p.faq) ? p.faq : [],
    comentarios,
    // Apenas comentários aprovados contam para o público (aprovado !== false).
    commentsCount: comentarios.filter((c) => c.aprovado !== false).length,
    jsonLd: p.jsonLd || null,
    nicho: p.nicho,
  };
}

// Monta query string ignorando valores vazios/nulos.
function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) return;
    usp.append(key, String(value));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

// ----------------------------------------------------------------------

/**
 * Lista posts publicados (paginado).
 * @returns {{ posts: object[], total: number, page: number, limit: number, totalPages: number }}
 */
export async function getBlogPosts(page = 1, limit = 12, extra = {}) {
  try {
    const url = `${endpoints.blog.posts}${buildQuery({ page, limit, ...extra })}`;

    const res = await fetch(url, {
      // Cache do Next.js: revalida a cada 30 minutos
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch posts (${res.status})`);
    }

    const data = await res.json();
    const rawPosts = data.posts || data.data || [];
    const total = Number(data.total ?? rawPosts.length ?? 0);
    const currentLimit = Number(data.limit ?? limit);
    const totalPages = currentLimit > 0 ? Math.ceil(total / currentLimit) : 1;

    return {
      posts: rawPosts.map(normalizeBlogPost),
      total,
      page: Number(data.page ?? page),
      limit: currentLimit,
      totalPages,
    };
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return { posts: [], total: 0, page: 1, limit, totalPages: 0 };
  }
}

// ----------------------------------------------------------------------

/**
 * Busca um post publicado pelo slug. Retorna o post normalizado (com jsonLd) ou null.
 */
export async function getBlogPostBySlug(slug) {
  try {
    if (!slug || typeof slug !== 'string') return null;

    const decodedSlug = decodeURIComponent(slug.trim());
    const url = endpoints.blog.post(decodedSlug);

    const res = await fetch(url, {
      // Cache do Next.js: revalida a cada 1 hora
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      if (res.status !== 404) {
        console.warn(`getBlogPostBySlug: resposta ${res.status} para slug "${decodedSlug}"`);
      }
      return null;
    }

    const data = await res.json();
    const post = data.post || data.data || data;

    return post && post.slug ? normalizeBlogPost(post) : null;
  } catch (error) {
    console.error('Erro ao buscar post do blog:', error);
    return null;
  }
}

// ----------------------------------------------------------------------

/**
 * Posts mais recentes (para "Postagens recentes" e relacionados).
 */
export async function getBlogLatestPosts(limit = 8) {
  const { posts } = await getBlogPosts(1, limit);
  return posts;
}

// ----------------------------------------------------------------------

/**
 * Busca posts por termo (usado no campo de busca da listagem).
 */
export async function searchBlogPosts(query, page = 1, limit = 12) {
  if (!query || !query.trim()) {
    return { posts: [], total: 0, totalPages: 0 };
  }
  return getBlogPosts(page, limit, { busca: query.trim() });
}

// ----------------------------------------------------------------------

/**
 * Metadados mínimos (slug/datas) para o sitemap. Sem cache para refletir publicações recentes.
 */
export async function getBlogPostsSitemapMeta(page = 1, limit = 100) {
  try {
    const url = `${endpoints.blog.posts}${buildQuery({ page, limit })}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) throw new Error(`Failed to fetch sitemap posts (${res.status})`);

    const data = await res.json();
    const rawPosts = data.posts || data.data || [];
    const total = Number(data.total ?? rawPosts.length ?? 0);
    const currentLimit = Number(data.limit ?? limit);

    return {
      posts: rawPosts.map((p) => ({
        slug: p.slug,
        modified: p.updatedAt || p.publishedAt || p.createdAt,
        date: p.publishedAt || p.createdAt,
      })),
      total,
      totalPages: currentLimit > 0 ? Math.ceil(total / currentLimit) : 1,
    };
  } catch (error) {
    console.error('Failed to fetch blog sitemap meta:', error);
    return { posts: [], total: 0, totalPages: 0 };
  }
}
