import { CONFIG } from 'src/config-global';

import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export const metadata = {
  title: 'Attualize Contábil: Especializada em Beleza, Saúde e Bem-Estar',
  description:
    'Attualize Contábil é a contabilidade digital especializada em atender empresas nas áreas de beleza, saúde e bem-estar. Atendemos todo o Brasil com serviços personalizados e expertise no setor.',
  keywords: [
    'contabilidade digital',
    'contabilidade online',
    'contabilidade para psicólogos',
    'contabilidade para clínicas de estética',
    'abertura de empresa',
    'gestão contábil',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Attualize Contábil: Especializada em Beleza, Saúde e Bem-Estar',
    description:
      'Attualize Contábil é a contabilidade digital especializada em atender empresas nas áreas de beleza, saúde e bem-estar.',
    url: SITE_URL,
    type: 'website',
    siteName: CONFIG.site.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Attualize Contábil: Especializada em Beleza, Saúde e Bem-Estar',
    description:
      'Attualize Contábil é a contabilidade digital especializada em atender empresas nas áreas de beleza, saúde e bem-estar.',
  },
};

export default function Page() {
  return <HomeView />;
}
