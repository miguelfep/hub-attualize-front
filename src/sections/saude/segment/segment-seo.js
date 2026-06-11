// ----------------------------------------------------------------------
// Helpers de SEO (metadata + JSON-LD) para as landing pages de segmentos
// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export function buildSegmentMetadata(segment) {
  const url = `${SITE_URL}/${segment.slug}`;

  return {
    title: segment.seo.title,
    description: segment.seo.description,
    keywords: segment.seo.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: segment.seo.title,
      description: segment.seo.description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: segment.seo.title,
      description: segment.seo.description,
    },
  };
}

export function buildSegmentJsonLd(segment) {
  const url = `${SITE_URL}/${segment.slug}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Attualize Contábil',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo/hub-tt.png`,
        },
        sameAs: [
          'https://www.instagram.com/attualizecontabil/',
          'https://www.youtube.com/channel/UCefLgcPyYDLbm98QXVm_LFg',
        ],
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/#localbusiness`,
        name: 'Attualize Contábil',
        image: `${SITE_URL}/logo/hub-tt.png`,
        url: SITE_URL,
        telephone: '+55 41 99698-2267',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Av. Sen. Salgado Filho, 1847 - Sobreloja - Guabirotuba',
          addressLocality: 'Curitiba',
          addressRegion: 'PR',
          postalCode: '81570-001',
          addressCountry: 'BR',
        },
        areaServed: {
          '@type': 'Country',
          name: 'Brazil',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}/#webpage`,
        url: `${url}/`,
        name: segment.seo.title,
        inLanguage: 'pt-BR',
      },
      {
        '@type': 'Service',
        '@id': `${url}/#service`,
        name: `Contabilidade para ${segment.name}`,
        serviceType: `Contabilidade especializada para ${segment.name.toLowerCase()}`,
        provider: {
          '@id': `${SITE_URL}/#localbusiness`,
        },
        description: segment.seo.serviceDescription,
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}/#faq`,
        mainEntity: segment.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };
}
