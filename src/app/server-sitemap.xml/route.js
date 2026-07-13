import { getServerSideSitemap } from 'next-sitemap';

import { getBlogPostsSitemapMeta } from 'src/actions/blog-ssr';

const SITE_URL = 'https://www.attualize.com.br';

/** Sitemap precisa de várias chamadas ao WP; planos Vercel Pro+ permitem até 60s. */
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

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

export async function GET() {
  try {
    const perPage = 100;
    const first = await getBlogPostsSitemapMeta(1, perPage);
    const allPosts = [...first.posts];

    if (first.totalPages > 1) {
      const pageNumbers = Array.from(
        { length: first.totalPages - 1 },
        (_, i) => i + 2
      );
      const concurrency = 5;
      for (let i = 0; i < pageNumbers.length; i += concurrency) {
        const slice = pageNumbers.slice(i, i + concurrency);
        // eslint-disable-next-line no-await-in-loop
        const batches = await Promise.all(
          slice.map((p) => getBlogPostsSitemapMeta(p, perPage))
        );
        batches.forEach(({ posts }) => {
          allPosts.push(...posts);
        });
      }
    }

    // Criar URLs dos posts (ignora slugs inválidos para não emitir /blog/undefined).
    const postFields = allPosts
      .filter((post) => {
        const slug = typeof post?.slug === 'string' ? post.slug.trim() : '';
        return slug && slug !== 'undefined' && slug !== 'null';
      })
      .map((post) => ({
        loc: `${SITE_URL}/blog/${post.slug}/`,
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
        loc: `${SITE_URL}/blog/`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9,
      },
      {
        loc: `${SITE_URL}/sobre/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/fale-conosco/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/faqs/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.6,
      },
      {
        loc: `${SITE_URL}/termos-de-uso-app/`,
        lastmod: new Date().toISOString(),
        changefreq: 'yearly',
        priority: 0.4,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-psicologos/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/planejador-de-empresa/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.9,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-psicologos-em-curitiba/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-medicos-em-curitiba/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-negocios-da-area-da-saude/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-medicos/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-dentistas/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-fisioterapeutas/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-nutricionistas/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-fonoaudiologos/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-terapeutas/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-clinicas-de-estetica/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-barbearias/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-salao-de-beleza/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-profissional-parceiro/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/contabilidade-para-prestadores-de-servicos/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: `${SITE_URL}/abertura/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/abertura-cnpj-psicologo/`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${SITE_URL}/jornada-defina/`,
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
