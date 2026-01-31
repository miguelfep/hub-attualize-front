
import { FaqsView } from 'src/sections/faqs/view';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export const metadata = {
  title: 'Perguntas Frequentes (FAQ) - Attualize Contábil',
  description:
    'Encontre respostas para as principais dúvidas sobre contabilidade, abertura de empresa, gestão fiscal e serviços da Attualize Contábil. FAQ completo e atualizado.',
  keywords: [
    'perguntas frequentes',
    'faq contabilidade',
    'dúvidas contábeis',
    'perguntas sobre contabilidade',
    'faq attualize',
  ],
  alternates: {
    canonical: `${SITE_URL}/faqs`,
  },
  openGraph: {
    title: 'Perguntas Frequentes (FAQ) - Attualize Contábil',
    description:
      'Encontre respostas para as principais dúvidas sobre contabilidade, abertura de empresa, gestão fiscal e serviços da Attualize Contábil.',
    url: `${SITE_URL}/faqs`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Perguntas Frequentes (FAQ) - Attualize Contábil',
    description:
      'Encontre respostas para as principais dúvidas sobre contabilidade, abertura de empresa e gestão fiscal.',
  },
};

export default function Page() {
  return <FaqsView />;
}
