// ----------------------------------------------------------------------
// SEO (metadata + JSON-LD) da página "Como instalar o certificado digital"
// ----------------------------------------------------------------------

const SITE_URL = 'https://www.attualize.com.br';

export function buildCertificadoMetadata(data) {
  const url = `${SITE_URL}/${data.slug}`;

  return {
    title: data.seo.title,
    description: data.seo.description,
    keywords: data.seo.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: data.seo.title,
      description: data.seo.description,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.seo.title,
      description: data.seo.description,
    },
  };
}

export function buildCertificadoJsonLd(data) {
  const url = `${SITE_URL}/${data.slug}`;

  // Usa o passo a passo do A1 no Windows (cenário mais comum) para o HowTo
  const mainTab = data.passos.tabs.find((tab) => tab.value === 'a1-windows') || data.passos.tabs[0];

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
        '@type': 'WebPage',
        '@id': `${url}/#webpage`,
        url: `${url}/`,
        name: data.seo.title,
        description: data.seo.description,
        inLanguage: 'pt-BR',
      },
      {
        '@type': 'HowTo',
        '@id': `${url}/#howto`,
        name: 'Como instalar o certificado digital A1 no Windows',
        description:
          'Passo a passo para importar e instalar o certificado digital A1 (arquivo .pfx/.p12) no Windows.',
        totalTime: 'PT5M',
        step: mainTab.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.title,
          text: step.description,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}/#faq`,
        mainEntity: data.faqs.map((faq) => ({
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
