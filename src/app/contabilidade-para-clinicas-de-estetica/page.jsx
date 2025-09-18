import { HomeEstetica } from 'src/sections/estetica-home/homeEstetica';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Contabilidade para Clínicas de Estética | Attualize Contábil',
  description: 'Contabilidade especializada para clínicas de estética, beleza e bem-estar. Atendimento digital em todo o Brasil. Conformidade fiscal, gestão financeira e suporte personalizado para o crescimento do seu negócio.',
  keywords: 'contabilidade clínicas estética, contabilidade beleza, contabilidade bem-estar, Lei Salão-Parceiro, CNAE estética, regularização clínica estética, impostos clínica estética',
  openGraph: {
    title: 'Contabilidade para Clínicas de Estética | Attualize Contábil',
    description: 'Contabilidade especializada para clínicas de estética, beleza e bem-estar. Atendimento digital em todo o Brasil.',
    url: 'https://attualize.com.br/contabilidade-para-clinicas-de-estetica',
    siteName: 'Attualize Contábil',
    images: [
      {
        url: 'https://attualize.com.br/assets/images/estetica/contabilidade-estetica-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Contabilidade para Clínicas de Estética - Attualize Contábil',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contabilidade para Clínicas de Estética | Attualize Contábil',
    description: 'Contabilidade especializada para clínicas de estética, beleza e bem-estar.',
    images: ['https://attualize.com.br/assets/images/estetica/contabilidade-estetica-og.jpg'],
  },
  alternates: {
    canonical: 'https://attualize.com.br/contabilidade-para-clinicas-de-estetica',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function Page() {
  return <HomeEstetica />;
}
