import { PsychologistLandingView } from 'src/sections/psychologist/view';
import { PSYCHOLOGIST_FAQS } from 'src/sections/psychologist/psychologist-faq-data';

// ----------------------------------------------------------------------

const SITE_URL = 'https://www.attualize.com.br';
const PAGINA_URL = `${SITE_URL}/contabilidade-para-psicologos`;

const TITULO = 'Contabilidade para Psicólogos | Fator R e CNPJ | Attualize Contábil';
const DESCRICAO =
  'Contabilidade digital especializada em psicólogos em todo o Brasil: pague menos imposto com o Fator R, abra seu CNPJ sem burocracia e emita NFS-e pelo nosso portal. Fale com um especialista.';

export const metadata = {
  title: TITULO,
  description: DESCRICAO,
  keywords: [
    'contabilidade para psicólogos',
    'contador psicólogo',
    'fator r psicólogo',
    'psicólogo pode ser mei',
    'quanto psicólogo paga de imposto',
    'abertura cnpj psicólogo',
    'anexo iii psicólogo simples nacional',
    'contabilidade clínica psicológica',
  ],
  alternates: {
    canonical: PAGINA_URL,
  },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: PAGINA_URL,
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Attualize Contábil',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRICAO,
  },
};

// ----------------------------------------------------------------------
// JSON-LD — serviço nacional (areaServed Brasil) + FAQ da página

const JSONLD_ACCOUNTING_SERVICE = {
  '@context': 'https://schema.org',
  '@type': 'AccountingService',
  name: 'Attualize Contábil',
  description:
    'Contabilidade digital especializada em psicólogos e profissionais de saúde. Atendimento 100% online em todo o Brasil.',
  url: SITE_URL,
  telephone: '+55 41 9698-2267',
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
  sameAs: [
    'https://www.instagram.com/attualizecontabil/',
    'https://www.facebook.com/attualizecontabil/',
    'https://www.linkedin.com/company/attualize-contabil',
  ],
};

const JSONLD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PSYCHOLOGIST_FAQS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_ACCOUNTING_SERVICE) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_FAQ) }}
      />
      <PsychologistLandingView />
    </>
  );
}
