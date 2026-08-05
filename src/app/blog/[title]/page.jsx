import { permanentRedirect } from 'next/navigation';

import { getStorageAssetUrl } from 'src/utils/axios';

import { CONFIG } from 'src/config-global';
import { getBlogPosts, getBlogPostBySlug, getBlogLatestPosts } from 'src/actions/blog-ssr';

import { StructuredData } from 'src/components/seo/structured-data';

// NB: import direto, NÃO pelo barril 'src/sections/blog/view'. O barril
// reexporta as views de criação/edição do post, que arrastam o editor
// (@tiptap + prosemirror), o lightbox e os providers de auth (firebase/
// amplify/supabase/auth0) para o bundle desta página pública de leitura.
import { PostDetailsHomeView } from 'src/sections/blog/view/post-details-home-view';

// ----------------------------------------------------------------------

const SITE_URL = 'https://www.attualize.com.br';

const getBlogPostUrl = (slug) => `${SITE_URL}/blog/${slug}/`;
const normalizeSlug = (value) => {
  const slug = typeof value === 'string' ? value.trim() : '';
  if (!slug || slug === 'undefined' || slug === 'null') return '';
  return slug;
};

const normalizePathname = (pathname = '') => {
  if (!pathname) return '/';
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

const isInternalCanonical = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl, SITE_URL);
    const siteOrigin = new URL(SITE_URL).origin;
    return parsed.origin === siteOrigin;
  } catch (_error) {
    return false;
  }
};

// Identidade única da marca nos schemas (mesma string do og:site_name).
const PUBLISHER = {
  '@type': 'Organization',
  name: CONFIG.site.publicName,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo/attualize.png`,
    width: 1200,
    height: 630,
  },
};

const ARTICLE_TYPES = ['Article', 'BlogPosting', 'NewsArticle'];

const toAbsoluteImageUrl = (value, fallback) => {
  if (Array.isArray(value)) {
    const urls = value.map((v) => toAbsoluteImageUrl(v, '')).filter(Boolean);
    return urls.length ? urls : [fallback];
  }
  if (typeof value === 'string' && value.trim()) {
    // Assets do storage vivem no host da API, não em attualize.com.br.
    if (value.startsWith('/storage/')) return getStorageAssetUrl(value);
    try {
      return new URL(value, SITE_URL).toString();
    } catch (_error) {
      return fallback;
    }
  }
  return fallback;
};

/**
 * O `jsonLd` vem pronto da API, mas com defeitos que divergem do que a página
 * exibe (autor como Organization, image relativa, dateModified replicando o
 * datePublished, publisher sem logo, url/canonicalUrl no domínio antigo).
 * Sobrescrevemos esses campos com os dados normalizados do post para schema,
 * meta tags e canonical contarem a mesma história.
 *
 * A API embrulha os nós em `{"@context", "@graph": [Article, FAQPage]}` —
 * por isso a recursão no `@graph` (checar só o nó de topo nunca casa).
 */
const sanitizeArticleJsonLd = (node, post, postUrl, postImage) => {
  if (!node || typeof node !== 'object') return node;

  if (Array.isArray(node['@graph'])) {
    return {
      ...node,
      '@graph': node['@graph'].map((n) => sanitizeArticleJsonLd(n, post, postUrl, postImage)),
    };
  }

  const type = node['@type'];
  const isArticle = Array.isArray(type)
    ? type.some((t) => ARTICLE_TYPES.includes(t))
    : ARTICLE_TYPES.includes(type);
  if (!isArticle) return node;

  return {
    ...node,
    author: { '@type': 'Person', name: post.author, url: `${SITE_URL}/sobre/` },
    image: toAbsoluteImageUrl(node.image, postImage),
    datePublished: post.date || node.datePublished,
    dateModified: post.modified || post.date || node.dateModified,
    publisher: PUBLISHER,
    url: postUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  };
};

const resolvePostCanonicalUrl = (post) => {
  const fallback = getBlogPostUrl(post.slug);

  if (!post?.canonicalUrl || !isInternalCanonical(post.canonicalUrl)) {
    return fallback;
  }

  try {
    const parsed = new URL(post.canonicalUrl, SITE_URL);
    const normalizedPath = normalizePathname(parsed.pathname);

    // Só aceitamos canônicos internos de páginas de blog para evitar conflitos.
    if (!normalizedPath.startsWith('/blog/')) return fallback;

    return `${parsed.origin}${normalizedPath}`;
  } catch (_error) {
    return fallback;
  }
};

export async function generateMetadata({ params }) {
  const { title } = await params;
  const normalizedTitle = normalizeSlug(title);

  try {

    if (!normalizedTitle) {
      return {
        title: `Blog - ${CONFIG.site.publicName}`,
        description: 'Blog da Attualize Contábil',
        robots: { index: false, follow: false },
      };
    }

    const post = await getBlogPostBySlug(normalizedTitle);
    if (post) {
      const postUrl = resolvePostCanonicalUrl(post);
      const postTitle = post.seoTitle || post.title;
      const postDescription = post.metaDescription || post.excerpt || 'Descrição da postagem';
      const postImage = post.ogImage || post.imageUrl || `${SITE_URL}/logo/attualize.png`;
      const keywords = post.keywords?.length ? post.keywords : undefined;
      const publishedTime = post.date;
      const modifiedTime = post.modified || post.date;

      return {
        // `absolute` impede o template do layout raiz de anexar "| Attualize HUB"
        // ao seoTitle salvo no post (evita título duplo/estourado nos resultados).
        title: { absolute: postTitle },
        description: postDescription,
        keywords,
        authors: post.author ? [{ name: post.author }] : undefined,
        alternates: { canonical: postUrl },
        openGraph: {
          type: 'article',
          locale: 'pt_BR',
          title: postTitle,
          description: postDescription,
          url: postUrl,
          siteName: CONFIG.site.publicName,
          publishedTime,
          modifiedTime,
          authors: post.author ? [post.author] : undefined,
          images: [{ url: postImage, width: 1200, height: 630, alt: postTitle }],
        },
        twitter: {
          card: 'summary_large_image',
          title: postTitle,
          description: postDescription,
          images: [postImage],
        },
      };
    }

    return {
      title: `Postagem não encontrada - ${CONFIG.site.publicName}`,
      description: 'A postagem solicitada não foi encontrada.',
      robots: { index: false, follow: false },
    };
  } catch (error) {
    console.error('Erro ao gerar metadata:', error);
    // Mesmo com a API fora, a página precisa declarar canonical — sem ele o
    // Google classifica como "cópia sem página canônica selecionada pelo usuário".
    return {
      title: `Blog - ${CONFIG.site.publicName}`,
      description: 'Blog da Attualize Contábil',
      ...(normalizedTitle && {
        alternates: { canonical: getBlogPostUrl(normalizedTitle) },
      }),
    };
  }
}

export default async function Page({ params }) {
  const { title } = await params;
  const normalizedTitle = normalizeSlug(title);

  if (!normalizedTitle) {
    permanentRedirect('/blog/');
  }

  try {
    // Em paralelo (antes eram sequenciais → somavam a latência das duas).
    const [post, latestPosts] = await Promise.all([
      getBlogPostBySlug(normalizedTitle),
      getBlogLatestPosts(8),
    ]);

    if (!post) {
      return <PostDetailsHomeView post={null} latestPosts={[]} />;
    }

    // JSON-LD: a API já entrega `jsonLd` pronto (Article + FAQPage). Usamos quando disponível;
    // caso contrário, montamos BlogPosting + BreadcrumbList como fallback.
    const postUrl = resolvePostCanonicalUrl(post);
    const canonicalPathname = normalizePathname(new URL(postUrl).pathname);
    const currentPathname = normalizePathname(`/blog/${normalizedTitle}/`);

    // Consolidar qualquer variação para a URL canônica única.
    if (canonicalPathname !== currentPathname) {
      permanentRedirect(canonicalPathname);
    }

    const postImage = post.ogImage || post.imageUrl || `${SITE_URL}/logo/attualize.png`;

    let structuredData = [];

    if (post.jsonLd) {
      try {
        const parsed = JSON.parse(post.jsonLd);
        structuredData = (Array.isArray(parsed) ? parsed : [parsed]).map((node) =>
          sanitizeArticleJsonLd(node, post, postUrl, postImage)
        );
      } catch (e) {
        console.warn('jsonLd inválido, usando fallback:', e);
      }
    }

    if (structuredData.length === 0) {
      structuredData = [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.seoTitle || post.title,
          description: post.metaDescription || post.excerpt,
          image: [postImage],
          datePublished: post.date,
          dateModified: post.modified || post.date,
          author: { '@type': 'Person', name: post.author, url: `${SITE_URL}/sobre/` },
          publisher: PUBLISHER,
          mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
          url: postUrl,
          articleSection: post.category || 'Contabilidade',
          keywords: post.keywords?.join(', ') || '',
          inLanguage: 'pt-BR',
        },
      ];
    }

    // Breadcrumb sempre presente
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog/` },
        { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
      ],
    });

    return (
      <>
        {structuredData.map((data, index) => (
          <StructuredData key={index} data={data} />
        ))}
        <PostDetailsHomeView post={post} latestPosts={latestPosts} />
      </>
    );
  } catch (error) {
    console.error('Erro ao carregar post:', error);
    return <PostDetailsHomeView post={null} latestPosts={[]} />;
  }
}

// ----------------------------------------------------------------------

// Dinâmica por necessidade: o layout raiz lê as configurações/tema via
// `cookies()` (`detectSettings`), o que torna TODA rota dinâmica. Tentar ISR
// aqui gera `DYNAMIC_SERVER_USAGE` no build. Os `fetch` do blog continuam
// cacheados (Data Cache via `revalidate`), e as duas chamadas rodam em
// paralelo — então o custo por request é só o render (sem round-trip à API
// quando o cache está quente).
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    const { posts } = await getBlogPosts(1, 100);
    return posts.map((post) => ({ title: post.slug }));
  }
  return [];
}
