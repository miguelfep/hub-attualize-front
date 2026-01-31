
import { FormWizardViewAbertura } from 'src/sections/abertura/form-wizard-abertura-view';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export const metadata = {
  title: 'Abertura de Empresa Online - Attualize Contábil',
  description:
    'Abra sua empresa de forma rápida e descomplicada com a Attualize Contábil. Especializados em abertura de empresas para psicólogos, clínicas de estética e profissionais de saúde e bem-estar. Atendimento digital em todo o Brasil.',
  keywords: [
    'abertura de empresa',
    'abrir empresa online',
    'abertura cnpj',
    'abertura empresa psicólogo',
    'abertura empresa clínica estética',
    'abrir empresa rápido',
  ],
  alternates: {
    canonical: `${SITE_URL}/abertura`,
  },
  openGraph: {
    title: 'Abertura de Empresa Online - Attualize Contábil',
    description:
      'Abra sua empresa de forma rápida e descomplicada com a Attualize Contábil. Especializados em abertura de empresas para psicólogos, clínicas de estética e profissionais de saúde.',
    url: `${SITE_URL}/abertura`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abertura de Empresa Online - Attualize Contábil',
    description:
      'Abra sua empresa de forma rápida e descomplicada com a Attualize Contábil.',
  },
};

export default function Page() {
  return <FormWizardViewAbertura />;
}
