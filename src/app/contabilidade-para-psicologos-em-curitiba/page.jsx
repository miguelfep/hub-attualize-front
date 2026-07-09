import { PsicologosCuritibaView } from 'src/sections/psicologos-curitiba/view';
import {
  PAGINA_URL,
  JSONLD_FAQ,
  JSONLD_CALCULADORA,
  JSONLD_ACCOUNTING_SERVICE,
} from 'src/sections/psicologos-curitiba/dados';

// ----------------------------------------------------------------------

const TITULO = 'Contabilidade para Psicólogos em Curitiba | Attualize Contábil';
const DESCRICAO =
  'Pague menos imposto com o Fator R e tenha contabilidade digital especializada em psicólogos em Curitiba. Simule grátis e fale com um especialista.';

export const metadata = {
  title: TITULO,
  description: DESCRICAO,
  keywords: [
    'contabilidade para psicólogos em curitiba',
    'fator r psicólogo',
    'contador para psicólogo curitiba',
    'abrir cnpj psicólogo curitiba',
    'anexo iii psicólogo simples nacional',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_ACCOUNTING_SERVICE) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_FAQ) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_CALCULADORA) }}
      />
      <PsicologosCuritibaView />
    </>
  );
}
