import { BelezaSegmentoView } from 'src/sections/beleza-segmento/view';
import { BARBEARIAS } from 'src/sections/beleza-segmento/dados-barbearias';
import {
  buildJsonldFaq,
  buildJsonldCalculadora,
  buildJsonldAccountingService,
} from 'src/sections/beleza-segmento/dados-compartilhados';

// ----------------------------------------------------------------------

export const metadata = {
  title: BARBEARIAS.seo.titulo,
  description: BARBEARIAS.seo.descricao,
  keywords: BARBEARIAS.seo.keywords,
  alternates: {
    canonical: BARBEARIAS.paginaUrl,
  },
  openGraph: {
    title: BARBEARIAS.seo.titulo,
    description: BARBEARIAS.seo.descricao,
    url: BARBEARIAS.paginaUrl,
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Attualize Contábil',
  },
  twitter: {
    card: 'summary_large_image',
    title: BARBEARIAS.seo.titulo,
    description: BARBEARIAS.seo.descricao,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonldFaq(BARBEARIAS.faq)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonldCalculadora(BARBEARIAS)) }}
      />
      <BelezaSegmentoView segmento={BARBEARIAS} />
    </>
  );
}
