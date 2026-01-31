
import { AboutView } from 'src/sections/about/view';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export const metadata = {
  title: 'Sobre a Attualize - Nossa História e Missão',
  description:
    'Conheça a Attualize Contábil, uma contabilidade digital especializada em atender empresas de beleza, saúde e bem-estar. Nossa missão é simplificar a gestão contábil do seu negócio.',
  keywords: [
    'sobre attualize',
    'história attualize',
    'contabilidade digital',
    'missão attualize',
    'quem somos',
  ],
  alternates: {
    canonical: `${SITE_URL}/sobre`,
  },
  openGraph: {
    title: 'Sobre a Attualize - Nossa História e Missão',
    description:
      'Conheça a Attualize Contábil, uma contabilidade digital especializada em atender empresas de beleza, saúde e bem-estar.',
    url: `${SITE_URL}/sobre`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sobre a Attualize - Nossa História e Missão',
    description:
      'Conheça a Attualize Contábil, uma contabilidade digital especializada em atender empresas de beleza, saúde e bem-estar.',
  },
};

export default function Page() {
  return <AboutView />;
}
