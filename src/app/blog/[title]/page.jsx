import axios from 'src/utils/axios';

import { CONFIG } from 'src/config-global';
import { getPostBySlug, getLatestPosts, getPostComments } from 'src/actions/blog-ssr';

import { StructuredData } from 'src/components/seo/structured-data';

import { PostDetailsHomeView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export async function generateMetadata({ params }) {
  try {
    // No Next.js 15, params pode ser uma Promise
    const resolvedParams = await params;
    const { title } = resolvedParams;

    // Validar se o title existe
    if (!title) {
      return {
        title: `Blog - ${CONFIG.site.name}`,
        description: 'Blog da Attualize Contábil',
      };
    }

    // Fetch the post based on the slug
    const post = await getPostBySlug(title);

    const SITE_URL = 'https://attualize.com.br';
    const postUrl = `${SITE_URL}/blog/${title}`;

    // If the post is found, set the title for SEO
    if (post) {
      const postTitle = post?.yoast_head_json?.title || post?.title?.rendered || 'Postagem';
      const postDescription =
        post?.yoast_head_json?.description ||
        post?.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160) ||
        'Descrição da postagem';
      const postImage =
        post?.jetpack_featured_media_url ||
        post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        `${SITE_URL}/logo/attualize.png`;
      const keywords = post?.yoast_head_json?.keywords || [];
      const publishedTime = post?.date || new Date().toISOString();
      const modifiedTime = post?.modified || publishedTime;

      return {
        title: postTitle,
        description: postDescription,
        keywords: keywords.length > 0 ? keywords : undefined,
        authors: post?._embedded?.author?.[0]?.name
          ? [{ name: post._embedded.author[0].name }]
          : undefined,
        publishedTime,
        modifiedTime,
        alternates: {
          canonical: postUrl,
        },
        openGraph: {
          type: 'article',
          title: postTitle,
          description: postDescription,
          url: postUrl,
          siteName: CONFIG.site.name,
          publishedTime,
          modifiedTime,
          authors: post?._embedded?.author?.[0]?.name
            ? [post._embedded.author[0].name]
            : undefined,
          images: [
            {
              url: postImage,
              width: 1200,
              height: 630,
              alt: postTitle,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: postTitle,
          description: postDescription,
          images: [postImage],
        },
      };
    }

    // Fallback metadata if the post is not found
    return {
      title: `Postagem não encontrada - ${CONFIG.site.name}`,
      description: 'A postagem solicitada não foi encontrada.',
      robots: {
        index: false,
        follow: false,
      },
    };
  } catch (error) {
    console.error('Erro ao gerar metadata:', error);
    // Retornar metadata padrão em caso de erro
    return {
      title: `Blog - ${CONFIG.site.name}`,
      description: 'Blog da Attualize Contábil',
    };
  }
}

export default async function Page({ params }) {
  // No Next.js 15, params pode ser uma Promise
  const resolvedParams = await params;
  const { title } = resolvedParams;

  // Validar se o title existe
  if (!title) {
    console.error('Title não fornecido nos parâmetros da rota');
    return (
      <PostDetailsHomeView 
        post={null} 
        latestPosts={[]} 
        initialComments={[]}
        initialTotalComments={0}
      />
    );
  }

  try {
    // Buscar o post primeiro para obter o ID
    const post = await getPostBySlug(title);

    // Se o post não existir, retornar null para o componente tratar
    if (!post) {
      return (
        <PostDetailsHomeView 
          post={null} 
          latestPosts={[]} 
          initialComments={[]}
          initialTotalComments={0}
        />
      );
    }

    // Paralelizar chamadas independentes para reduzir TTFB
    const [latestPosts, commentsData] = await Promise.all([
      getLatestPosts(),
      post?.id ? getPostComments(post.id) : Promise.resolve({ comments: [], totalComments: 0 }),
    ]);

    // Criar structured data JSON-LD para o post
    const SITE_URL = 'https://attualize.com.br';
    const postUrl = `${SITE_URL}/blog/${title}`;
    const postTitle = post?.yoast_head_json?.title || post?.title?.rendered || '';
    const postDescription =
      post?.yoast_head_json?.description ||
      post?.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160) ||
      '';
    const postImage =
      post?.jetpack_featured_media_url ||
      post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
      `${SITE_URL}/logo/attualize.png`;
    const authorName = post?._embedded?.author?.[0]?.name || 'Attualize Contábil';
    const publishedTime = post?.date || new Date().toISOString();
    const modifiedTime = post?.modified || publishedTime;

    // Structured data melhorado para SEO e IA
    const structuredData = [
      // BlogPosting schema
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: postTitle,
        description: postDescription,
        image: Array.isArray(postImage) ? postImage : [postImage],
        datePublished: publishedTime,
        dateModified: modifiedTime,
        author: {
          '@type': 'Organization',
          name: authorName,
          url: SITE_URL,
        },
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
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': postUrl,
        },
        url: postUrl,
        articleSection: 'Contabilidade',
        keywords: post?.yoast_head_json?.keywords?.join(', ') || '',
        inLanguage: 'pt-BR',
      },
      // BreadcrumbList schema
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Início',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${SITE_URL}/blog`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: postTitle,
            item: postUrl,
          },
        ],
      },
      // Organization schema (para melhor descoberta)
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: CONFIG.site.name,
        url: SITE_URL,
        logo: `${SITE_URL}/logo/attualize.png`,
        sameAs: [
          // Adicione suas redes sociais aqui quando disponíveis
          // 'https://www.facebook.com/attualize',
          // 'https://www.instagram.com/attualize',
          // 'https://www.linkedin.com/company/attualize',
        ],
      },
    ];

    return (
      <>
        {structuredData.map((data, index) => (
          <StructuredData key={index} data={data} />
        ))}
        <PostDetailsHomeView 
          post={post} 
          latestPosts={latestPosts || []} 
          initialComments={commentsData?.comments || []}
          initialTotalComments={commentsData?.totalComments || 0}
        />
      </>
    );
  } catch (error) {
    console.error('Erro ao carregar post:', error);
    // Retornar página de erro amigável
    return (
      <PostDetailsHomeView 
        post={null} 
        latestPosts={[]} 
        initialComments={[]}
        initialTotalComments={0}
      />
    );
  }
}

// ----------------------------------------------------------------------

/**
 * Configuração dinâmica
 * Como o layout usa cookies() e outras APIs dinâmicas,
 * precisamos marcar a página como dinâmica
 * O cache ainda funciona através do fetch com next: { revalidate }
 */
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

/**
 * [2] Static exports
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    const res = await axios.get('https://attualizecontabil.com.br/wp-json/wp/v2/posts');
    return res.data.map((post) => ({ title: post.slug })); // Usa o slug para gerar os caminhos estáticos
  }
  return [];
}
