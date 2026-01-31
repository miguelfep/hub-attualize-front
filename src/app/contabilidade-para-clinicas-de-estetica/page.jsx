
import { HomeEstetica } from 'src/sections/estetica-home/homeEstetica';

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

export default function Page() {
  return <HomeEstetica />;
}
