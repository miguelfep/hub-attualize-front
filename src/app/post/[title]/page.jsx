import { permanentRedirect } from 'next/navigation';

// ----------------------------------------------------------------------

/**
 * Redireciona permanentemente de /post/[title] para /blog/[title]
 * Redirecionamento 301 para SEO
 */
export default async function Page({ params }) {
  const { title } = await params;
  const normalizedTitle = typeof title === 'string' ? title.trim() : '';

  if (!normalizedTitle || normalizedTitle === 'undefined' || normalizedTitle === 'null') {
    permanentRedirect('/blog/');
  }

  // Redirecionamento permanente (301) para /blog/[title]
  permanentRedirect(`/blog/${normalizedTitle}/`);
}
