import { getServerSideSitemap } from 'next-sitemap';

import { getPosts } from 'src/actions/blog-ssr';

const SITE_URL = 'https://attualize.com.br';

// Função para normalizar datas para o formato ISO 8601 válido do sitemap
function normalizeDate(dateString) {
  if (!dateString) {
    return new Date().toISOString();
  }

  try {
    const date = new Date(dateString);
    
    // Verificar se a data é válida
    if (Number.isNaN(date.getTime())) {
      return new Date().toISOString();
    }

    // Retornar no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
    return date.toISOString();
  } catch (error) {
    // Se houver erro ao parsear, retornar data atual
    return new Date().toISOString();
  }
}

export async function GET(request) {
  try {
    // Buscar todos os posts do blog
    const allPosts = [];
    let currentPage = 1;
    let hasMore = true;

    // Buscar todos os posts paginando
    while (hasMore) {
      // eslint-disable-next-line no-await-in-loop
      const { posts, totalPages } = await getPosts(currentPage, 100); // 100 posts por página
      allPosts.push(...posts);

      if (currentPage >= totalPages) {
        hasMore = false;
      } else {
        currentPage += 1;
      }
    }

    // Criar URLs dos posts
    const postFields = allPosts.map((post) => ({
      loc: `${SITE_URL}/blog/${post.slug}`,
      lastmod: normalizeDate(post.modified || post.date),
      changefreq: 'weekly',
      priority: 0.8,
    }));

    // Adicionar outras páginas públicas importantes
    const staticPages = [
      {
        loc: `${SITE_URL}/`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0,
      },
      {
        loc: `${SITE_URL}/blog`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9,
      },
      {
        loc: `${SITE_URL}/sobre`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/fale-conosco`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/faqs`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.6,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-psicologos`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-clinicas-de-estetica`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/abertura`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/abertura-cnpj-psicologo`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/jornada-defina`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.6,
      },
    ];

    const allFields = [...staticPages, ...postFields];

    return getServerSideSitemap(allFields);
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    // Retornar sitemap vazio em caso de erro
    return getServerSideSitemap([]);
  }
}
