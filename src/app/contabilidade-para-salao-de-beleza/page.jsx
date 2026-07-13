import { BelezaSegmentoView } from 'src/sections/beleza-segmento/view';
import { SALAO_DE_BELEZA } from 'src/sections/beleza-segmento/dados-salao-de-beleza';
import {
  buildJsonldFaq,
  buildJsonldCalculadora,
  buildJsonldAccountingService,
} from 'src/sections/beleza-segmento/dados-compartilhados';

// ----------------------------------------------------------------------

export const metadata = {
  title: SALAO_DE_BELEZA.seo.titulo,
  description: SALAO_DE_BELEZA.seo.descricao,
  keywords: SALAO_DE_BELEZA.seo.keywords,
  alternates: {
    canonical: SALAO_DE_BELEZA.paginaUrl,
  },
  openGraph: {
    title: SALAO_DE_BELEZA.seo.titulo,
    description: SALAO_DE_BELEZA.seo.descricao,
    url: SALAO_DE_BELEZA.paginaUrl,
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Attualize Contábil',
  },
  twitter: {
    card: 'summary_large_image',
    title: SALAO_DE_BELEZA.seo.titulo,
    description: SALAO_DE_BELEZA.seo.descricao,
  },
};

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonldAccountingService()) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonldFaq(SALAO_DE_BELEZA.faq)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonldCalculadora(SALAO_DE_BELEZA)),
        }}
      />
      <BelezaSegmentoView segmento={SALAO_DE_BELEZA} />
    </>
  );
}
