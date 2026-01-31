import { CONFIG } from 'src/config-global';
import { getPosts } from 'src/actions/blog-ssr';

import { StructuredData } from 'src/components/seo/structured-data';

import { PostListHomeView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export const metadata = {
  title: 'Blog - Artigos sobre Contabilidade, Gestão e Negócios',
  description:
    'Acesse nosso blog e fique por dentro de artigos sobre contabilidade, gestão empresarial, dicas para psicólogos, clínicas de estética e muito mais. Conteúdo atualizado e especializado.',
  keywords: [
    'blog contabilidade',
    'artigos contábeis',
    'gestão empresarial',
    'dicas contabilidade',
    'contabilidade para psicólogos',
    'contabilidade para estética',
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'Blog - Artigos sobre Contabilidade, Gestão e Negócios',
    description:
      'Acesse nosso blog e fique por dentro de artigos sobre contabilidade, gestão empresarial, dicas para psicólogos, clínicas de estética e muito mais.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Artigos sobre Contabilidade, Gestão e Negócios',
    description:
      'Acesse nosso blog e fique por dentro de artigos sobre contabilidade, gestão empresarial e muito mais.',
  },
};

export default async function Page() {
  const { posts, totalPages } = await getPosts(1, 15); // Carregar a primeira página com 15 posts

  // Structured data para a página do blog
  const blogStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog Attualize Contábil',
    description:
      'Acesse nosso blog e fique por dentro de artigos sobre contabilidade, gestão empresarial, dicas para psicólogos, clínicas de estética e muito mais.',
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: CONFIG.site.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo/attualize.png`,
      },
    },
    inLanguage: 'pt-BR',
  };

  return (
    <>
      <StructuredData data={blogStructuredData} />
      <PostListHomeView initialPosts={posts} totalPages={totalPages} />
    </>
  );
}
