'use client';

// ----------------------------------------------------------------------

export function StructuredData({ data }) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      // JSON-LD precisa de script inline; conteúdo vem de JSON.stringify (seguro)
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
