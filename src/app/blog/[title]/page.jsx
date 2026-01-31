import axios from 'src/utils/axios';

import { CONFIG } from 'src/config-global';
import { getPostBySlug, getLatestPosts, getPostComments } from 'src/actions/blog-ssr';

import { StructuredData } from 'src/components/seo/structured-data';

import { PostDetailsHomeView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export async function generateMetadata({ params }) {
  const { title } = params;

  // Fetch the post based on the slug
  const post = await getPostBySlug(title);

  const SITE_URL = 'https://attualize.com.br';
  const postUrl = `${SITE_URL}/blog/${title}`;
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

  // If the post is found, set the title for SEO
  if (post) {
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
}

export default async function Page({ params }) {
  const { title } = params;

  const post = await getPostBySlug(title);
  const latestPosts = await getLatestPosts();
  
  // Buscar comentários do post
  const commentsData = post ? await getPostComments(post.id) : { comments: [], totalComments: 0 };

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
  const structuredData = post
    ? [
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
      ]
    : null;

  return (
    <>
      {structuredData && Array.isArray(structuredData) ? (
        structuredData.map((data, index) => (
          <StructuredData key={index} data={data} />
        ))
      ) : structuredData ? (
        <StructuredData data={structuredData} />
      ) : null}
      <PostDetailsHomeView 
        post={post} 
        latestPosts={latestPosts} 
        initialComments={commentsData.comments}
        initialTotalComments={commentsData.totalComments}
      />
    </>
  );
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };

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
