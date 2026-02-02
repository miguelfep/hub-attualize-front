import { redirect } from 'next/navigation';

// ----------------------------------------------------------------------

/**
 * Redireciona permanentemente de /post para /blog
 * Redirecionamento 301 para SEO
 */
export default function Page() {
  // Redirecionamento permanente (301) para /blog
  redirect('/blog');
}
