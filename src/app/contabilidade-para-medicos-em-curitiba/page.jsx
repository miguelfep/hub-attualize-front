import { MedicosCuritibaView } from 'src/sections/medicos-curitiba/view';
import {
  PAGINA_URL,
  JSONLD_FAQ,
  JSONLD_CALCULADORA,
  JSONLD_ACCOUNTING_SERVICE,
} from 'src/sections/medicos-curitiba/dados';

// ----------------------------------------------------------------------

const TITULO = 'Contabilidade para Médicos em Curitiba | Attualize Contábil';
const DESCRICAO =
  'Pague menos imposto com Fator R e equiparação hospitalar e tenha contabilidade digital especializada em médicos em Curitiba. Simule grátis e fale com um especialista.';

export const metadata = {
  title: TITULO,
  description: DESCRICAO,
  keywords: [
    'contabilidade para médicos em curitiba',
    'contador para médico curitiba',
    'abrir cnpj médico curitiba',
    'fator r médico',
    'equiparação hospitalar',
    'médico pessoa jurídica curitiba',
    'plantão médico pj',
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
      <MedicosCuritibaView />
    </>
  );
}
