
import { PsychologistLandingView } from 'src/sections/psychologist/view';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export const metadata = {
  title: 'Contabilidade para Psicólogos - Attualize Contábil',
  description:
    'Contabilidade especializada para psicólogos. Atendimento digital em todo o Brasil com expertise em questões fiscais, tributárias e gestão financeira para profissionais da psicologia.',
  keywords: [
    'contabilidade para psicólogos',
    'contador psicólogo',
    'gestão financeira psicólogo',
    'abertura cnpj psicólogo',
    'contabilidade clínica psicológica',
  ],
  alternates: {
    canonical: `${SITE_URL}/contabilidade-para-psicologos`,
  },
  openGraph: {
    title: 'Contabilidade para Psicólogos - Attualize Contábil',
    description:
      'Contabilidade especializada para psicólogos. Atendimento digital em todo o Brasil com expertise em questões fiscais e tributárias.',
    url: `${SITE_URL}/contabilidade-para-psicologos`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contabilidade para Psicólogos - Attualize Contábil',
    description:
      'Contabilidade especializada para psicólogos. Atendimento digital em todo o Brasil.',
  },
};

export default function Page() {
  return <PsychologistLandingView />;
}

