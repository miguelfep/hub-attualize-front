import { CONFIG } from 'src/config-global';

import { TermosUsoAppView } from 'src/sections/legal/termos-uso-app-view';

// ----------------------------------------------------------------------

const SITE_URL = 'https://attualize.com.br';

export const metadata = {
  title: `Licença de uso e termos do app Hub Attualize - ${CONFIG.site.name}`,
  description:
    'Termos de uso e licença do aplicativo móvel Hub Attualize para clientes do portal Attualize. Leia antes de instalar ou usar o app.',
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${SITE_URL}/termos-de-uso-app`,
  },
  openGraph: {
    title: 'Licença de uso e termos do app Hub Attualize',
    description:
      'Termos de uso e licença do aplicativo móvel Hub Attualize para clientes do portal Attualize.',
    url: `${SITE_URL}/termos-de-uso-app`,
    type: 'article',
  },
};

export default function Page() {
  return <TermosUsoAppView />;
}
