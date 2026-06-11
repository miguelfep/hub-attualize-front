import { SaudeLandingView } from 'src/sections/saude/view';
import { FAQS_SAUDE } from 'src/sections/saude/saude-utils';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

const PAGE_PATH = '/contabilidade-para-negocios-da-area-da-saude';

export const metadata = {
  title: 'Contabilidade para Negócios da Área da Saúde - Attualize Contábil',
  description:
    'Contabilidade especializada para médicos, dentistas, psicólogos, fisioterapeutas, nutricionistas e clínicas. Planejamento tributário com Fator R e equiparação hospitalar, abertura de CNPJ e atendimento humanizado 100% digital em todo o Brasil.',
  keywords: [
    'contabilidade para área da saúde',
    'contabilidade para médicos',
    'contabilidade para dentistas',
    'contabilidade para clínicas',
    'contador para médicos',
    'equiparação hospitalar',
    'fator r saúde',
    'abertura cnpj médico',
  ],
  alternates: {
    canonical: `${SITE_URL}${PAGE_PATH}`,
  },
  openGraph: {
    title: 'Contabilidade para Negócios da Área da Saúde - Attualize Contábil',
    description:
      'Contabilidade especializada para médicos, dentistas, psicólogos, fisioterapeutas e clínicas. Planejamento tributário, abertura de CNPJ e atendimento humanizado em todo o Brasil.',
    url: `${SITE_URL}${PAGE_PATH}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contabilidade para Negócios da Área da Saúde - Attualize Contábil',
    description:
      'Contabilidade especializada para médicos, dentistas, psicólogos, fisioterapeutas e clínicas. Atendimento digital em todo o Brasil.',
  },
};

/**
 * ISR (Incremental Static Regeneration)
 * Revalida a página a cada 1 hora (3600 segundos)
 */
export const revalidate = 3600;

export default function Page() {
  const jsonLd = {
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
        '@id': `${SITE_URL}${PAGE_PATH}/#webpage`,
        url: `${SITE_URL}${PAGE_PATH}/`,
        name: 'Contabilidade para Negócios da Área da Saúde',
        inLanguage: 'pt-BR',
      },
      {
        '@type': 'Service',
        '@id': `${SITE_URL}${PAGE_PATH}/#service`,
        name: 'Contabilidade para a Área da Saúde',
        serviceType: 'Contabilidade especializada para profissionais e negócios da área da saúde',
        provider: {
          '@id': `${SITE_URL}/#localbusiness`,
        },
        description:
          'Serviço de contabilidade especializada para médicos, dentistas, psicólogos, fisioterapeutas, nutricionistas e clínicas: abertura de CNPJ, planejamento tributário com Fator R e equiparação hospitalar, folha de pagamento e obrigações fiscais.',
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}${PAGE_PATH}/#faq`,
        mainEntity: FAQS_SAUDE.map((faq) => ({
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

  return (
    <section>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SaudeLandingView />
    </section>
  );
}
