import { Suspense } from 'react';

import { IrLandingPage } from 'src/sections/ir/landing/IrLandingPage';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export const metadata = {
  title: 'Declaração de Imposto de Renda 2026 - Attualize Contábil',
  description:
    'Declare seu Imposto de Renda 2026 com segurança e sem complicação. A Attualize cuida de tudo: análise, declaração e entrega à Receita Federal. Atendimento digital em todo o Brasil.',
  keywords: [
    'declaração imposto de renda 2026',
    'IRPF 2026',
    'declaração IR pessoa física',
    'contador imposto de renda',
    'declaração IR online',
  ],
  alternates: {
    canonical: `${SITE_URL}/imposto-renda-2026`,
  },
  openGraph: {
    title: 'Declaração de Imposto de Renda 2026 - Attualize Contábil',
    description:
      'Declare seu IR 2026 com a Attualize. Processo simples, digital e com acompanhamento do início ao fim.',
    url: `${SITE_URL}/imposto-renda-2026`,
    type: 'website',
  },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <IrLandingPage />
    </Suspense>
  );
}
