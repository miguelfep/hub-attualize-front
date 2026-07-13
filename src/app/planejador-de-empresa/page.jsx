import { PlanejadorEmpresaView } from 'src/sections/planejador-empresa/view';
import {
  PAGINA_URL,
  JSONLD_FAQ,
  JSONLD_WEBAPP,
  JSONLD_ACCOUNTING_SERVICE,
} from 'src/sections/planejador-empresa/dados';

// ----------------------------------------------------------------------

const TITULO = 'Planejador de Empresa Grátis | MEI ou ME, Impostos e CNPJ | Attualize';
const DESCRICAO =
  'Monte grátis o plano do seu CNPJ em 2 minutos: descubra se você pode ser MEI, quanto vai pagar de imposto no Simples Nacional (Fator R, Lei do Salão Parceiro) e o passo a passo para abrir ou regularizar sua empresa.';

export const metadata = {
  title: TITULO,
  description: DESCRICAO,
  keywords: [
    'planejador de empresa',
    'planejamento empresarial gratuito',
    'simulador de impostos cnpj',
    'mei ou me',
    'quanto custa abrir cnpj',
    'simulador simples nacional',
    'quanto vou pagar de imposto pj',
    'planejamento tributário',
  ],
  alternates: {
    canonical: PAGINA_URL,
  },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: PAGINA_URL,
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Attualize Contábil',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRICAO,
  },
};

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_WEBAPP) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_FAQ) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_ACCOUNTING_SERVICE) }}
      />
      <PlanejadorEmpresaView />
    </>
  );
}
