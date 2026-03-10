import { Suspense } from 'react';

import { HomeEstetica } from 'src/sections/estetica-home/homeEstetica';
import { FAQS_ESTETICA } from 'src/sections/estetica-home/estetica-utils';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export const metadata = {
  title: 'Contabilidade para Clínicas de Estética - Attualize Contábil',
  description:
    'Attualize Contábil é especialista em contabilidade para clínicas de estética, beleza e bem-estar. Oferecemos atendimento digital em todo o Brasil, garantindo conformidade fiscal, gestão financeira eficiente e suporte personalizado para o crescimento do seu negócio.',
  keywords: [
    'contabilidade para clínicas de estética',
    'contador clínica estética',
    'gestão financeira estética',
    'contabilidade beleza',
    'abertura cnpj clínica estética',
  ],
  alternates: {
    canonical: `${SITE_URL}/contabilidade-para-clinicas-de-estetica`,
  },
  openGraph: {
    title: 'Contabilidade para Clínicas de Estética - Attualize Contábil',
    description:
      'Attualize Contábil é especialista em contabilidade para clínicas de estética, beleza e bem-estar. Atendimento digital em todo o Brasil.',
    url: `${SITE_URL}/contabilidade-para-clinicas-de-estetica`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contabilidade para Clínicas de Estética - Attualize Contábil',
    description:
      'Attualize Contábil é especialista em contabilidade para clínicas de estética, beleza e bem-estar.',
  },
};

/**
 * ISR (Incremental Static Regeneration)
 * Revalida a página a cada 1 hora (3600 segundos)
 * Isso permite cache estático com atualização periódica
 */
export const revalidate = 3600;

export default function Page() {

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "Attualize Contábil",
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/logo/hub-tt.png`
        },
        "sameAs": [
          "https://www.instagram.com/attualizecontabil/",
          "https://www.youtube.com/channel/UCefLgcPyYDLbm98QXVm_LFg"
        ]
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#localbusiness`,
        "name": "Attualize Contábil",
        "image": `${SITE_URL}/logo/hub-tt.png`,
        "url": SITE_URL,
        "telephone": "+55 41 99698-2267",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Av. Sen. Salgado Filho, 1847 - Sobreloja - Guabirotuba",
          "addressLocality": "Curitiba",
          "addressRegion": "PR",
          "postalCode": "81570-001",
          "addressCountry": "BR"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Brazil"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/contabilidade-para-clinicas-de-estetica/#webpage`,
        "url": `${SITE_URL}/contabilidade-para-clinicas-de-estetica/`,
        "name": "Contabilidade para Clínicas de Estética",
        "inLanguage": "pt-BR"
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/contabilidade-para-clinicas-de-estetica/#service`,
        "name": "Contabilidade para Clínicas de Estética",
        "serviceType": "Contabilidade especializada para clínicas de estética",
        "provider": {
          "@id": `${SITE_URL}/#localbusiness`
        },
        "description": "Serviço de contabilidade especializada para clínicas de estética: enquadramento tributário, CNAE correto, planejamento fiscal, aplicação da Lei do Salão Parceiro e orientação para regularização sanitária."
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/contabilidade-para-clinicas-de-estetica/#faq`,
        "mainEntity": FAQS_ESTETICA.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  return (
    <section>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <HomeEstetica />
      </Suspense>
    </section>
  );
}