import { CONFIG } from 'src/config-global';
import { getBlogPosts, getBlogPostBySlug, getBlogLatestPosts } from 'src/actions/blog-ssr';

import { StructuredData } from 'src/components/seo/structured-data';

import { PostDetailsHomeView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export async function generateMetadata({ params }) {
  try {
    const { title } = await params;

    if (!title) {
      return {
        title: `Blog - ${CONFIG.site.name}`,
        description: 'Blog da Attualize Contábil',
      };
    }

    const post = await getBlogPostBySlug(title);

    if (post) {
      const postUrl = post.canonicalUrl || `${SITE_URL}/blog/${post.slug}`;
      const postTitle = post.seoTitle || post.title;
      const postDescription = post.metaDescription || post.excerpt || 'Descrição da postagem';
      const postImage = post.ogImage || post.imageUrl || `${SITE_URL}/logo/attualize.png`;
      const keywords = post.keywords?.length ? post.keywords : undefined;
      const publishedTime = post.date;
      const modifiedTime = post.modified || post.date;

      return {
        title: postTitle,
        description: postDescription,
        keywords,
        authors: post.author ? [{ name: post.author }] : undefined,
        alternates: { canonical: postUrl },
        openGraph: {
          type: 'article',
          title: postTitle,
          description: postDescription,
          url: postUrl,
          siteName: CONFIG.site.name,
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
      title: `Postagem não encontrada - ${CONFIG.site.name}`,
      description: 'A postagem solicitada não foi encontrada.',
      robots: { index: false, follow: false },
    };
  } catch (error) {
    console.error('Erro ao gerar metadata:', error);
    return {
      title: `Blog - ${CONFIG.site.name}`,
      description: 'Blog da Attualize Contábil',
    };
  }
}

export default async function Page({ params }) {
  const { title } = await params;

  if (!title) {
    return <PostDetailsHomeView post={null} latestPosts={[]} />;
  }

  try {
    // Em paralelo (antes eram sequenciais → somavam a latência das duas).
    const [post, latestPosts] = await Promise.all([
      getBlogPostBySlug(title),
      getBlogLatestPosts(8),
    ]);

    if (!post) {
      return <PostDetailsHomeView post={null} latestPosts={[]} />;
    }

    // JSON-LD: a API já entrega `jsonLd` pronto (Article + FAQPage). Usamos quando disponível;
    // caso contrário, montamos BlogPosting + BreadcrumbList como fallback.
    const postUrl = post.canonicalUrl || `${SITE_URL}/blog/${post.slug}`;

    let structuredData = [];

    if (post.jsonLd) {
      try {
        const parsed = JSON.parse(post.jsonLd);
        structuredData = Array.isArray(parsed) ? parsed : [parsed];
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
          image: [post.ogImage || post.imageUrl || `${SITE_URL}/logo/attualize.png`],
          datePublished: post.date,
          dateModified: post.modified || post.date,
          author: { '@type': 'Organization', name: post.author, url: SITE_URL },
          publisher: {
            '@type': 'Organization',
            name: CONFIG.site.name,
            logo: {
              '@type': 'ImageObject',
              url: `${SITE_URL}/logo/attualize.png`,
              width: 1200,
              height: 630,
            },
          },
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
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
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
