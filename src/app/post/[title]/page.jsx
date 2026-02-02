import { redirect } from 'next/navigation';

// ----------------------------------------------------------------------

/**
 * Redireciona permanentemente de /post/[title] para /blog/[title]
 * Redirecionamento 301 para SEO
 */
export default async function Page({ params }) {
  const { title } = params;
  
  // Redirecionamento permanente (301) para /blog/[title]
  redirect(`/blog/${title}`);
}
