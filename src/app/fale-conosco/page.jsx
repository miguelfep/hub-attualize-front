
import { ContactView } from 'src/sections/contact/view';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export const metadata = {
  title: 'Fale Conosco - Entre em Contato com a Attualize',
  description:
    'Entre em contato com a Attualize Contábil. Estamos prontos para ajudar sua empresa com serviços contábeis especializados. Fale conosco e tire suas dúvidas.',
  keywords: [
    'contato attualize',
    'fale conosco',
    'atendimento contábil',
    'suporte contábil',
    'contato contabilidade',
  ],
  alternates: {
    canonical: `${SITE_URL}/fale-conosco`,
  },
  openGraph: {
    title: 'Fale Conosco - Entre em Contato com a Attualize',
    description:
      'Entre em contato com a Attualize Contábil. Estamos prontos para ajudar sua empresa com serviços contábeis especializados.',
    url: `${SITE_URL}/fale-conosco`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Fale Conosco - Entre em Contato com a Attualize',
    description:
      'Entre em contato com a Attualize Contábil. Estamos prontos para ajudar sua empresa com serviços contábeis especializados.',
  },
};

export default function Page() {
  return <ContactView />;
}
