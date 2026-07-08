const SITE_URL = 'https://www.attualize.com.br';

const normalizeSlug = (value) => {
  const slug = typeof value === 'string' ? value.trim() : '';
  if (!slug || slug === 'undefined' || slug === 'null') return '';
  return slug;
};

export default async function Head({ params }) {
  const { title } = await params;
  const slug = normalizeSlug(title);
  const canonicalUrl = slug ? `${SITE_URL}/blog/${slug}/` : `${SITE_URL}/blog/`;

  return (
    <>
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
    </>
  );
}
