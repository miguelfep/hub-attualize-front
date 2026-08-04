import { CONFIG } from 'src/config-global';
import { getBlogPosts, getBlogCategorias } from 'src/actions/blog-ssr';

import { StructuredData } from 'src/components/seo/structured-data';

import { PostListHomeView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

const SITE_URL = 'https://www.attualize.com.br';

export const metadata = {
  // `absolute` evita o sufixo "| Attualize HUB" do template do layout raiz.
  title: { absolute: 'Blog - Artigos sobre Contabilidade, Gestão e Negócios | Attualize Contábil' },
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
    canonical: `${SITE_URL}/blog/`,
  },
  openGraph: {
    title: 'Blog - Artigos sobre Contabilidade, Gestão e Negócios',
    description:
      'Acesse nosso blog e fique por dentro de artigos sobre contabilidade, gestão empresarial, dicas para psicólogos, clínicas de estética e muito mais.',
    url: `${SITE_URL}/blog/`,
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Artigos sobre Contabilidade, Gestão e Negócios',
    description:
      'Acesse nosso blog e fique por dentro de artigos sobre contabilidade, gestão empresarial e muito mais.',
  },
};

export default async function Page() {
  // Primeira página com 15 posts + categorias reais em uso (em paralelo)
  const [{ posts, totalPages }, categorias] = await Promise.all([
    getBlogPosts(1, 15),
    getBlogCategorias(),
  ]);

  // Structured data para a página do blog
  const blogStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog Attualize Contábil',
    description:
      'Acesse nosso blog e fique por dentro de artigos sobre contabilidade, gestão empresarial, dicas para psicólogos, clínicas de estética e muito mais.',
    url: `${SITE_URL}/blog/`,
    publisher: {
      '@type': 'Organization',
      name: CONFIG.site.publicName,
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
      <PostListHomeView initialPosts={posts} totalPages={totalPages} categorias={categorias} />
    </>
  );
}
