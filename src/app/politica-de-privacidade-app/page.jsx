import { CONFIG } from 'src/config-global';

import { PoliticaPrivacidadeAppView } from 'src/sections/legal/politica-privacidade-app-view';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export const metadata = {
  title: `Política de Privacidade do app Hub Attualize - ${CONFIG.site.name}`,
  description:
    'Política de Privacidade do aplicativo móvel Hub Attualize para clientes Attualize: dados coletados, bases legais LGPD, direitos do titular e contato.',
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${SITE_URL}/politica-de-privacidade-app`,
  },
  openGraph: {
    title: 'Política de Privacidade do app Hub Attualize',
    description:
      'Como tratamos dados pessoais no aplicativo Hub Attualize, em conformidade com a LGPD e lojas de aplicativos.',
    url: `${SITE_URL}/politica-de-privacidade-app`,
    type: 'article',
  },
};

export default function Page() {
  return <PoliticaPrivacidadeAppView />;
}
