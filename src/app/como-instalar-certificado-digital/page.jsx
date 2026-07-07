import { CERTIFICADO } from 'src/sections/certificado-digital/data';
import { CertificadoDigitalView } from 'src/sections/certificado-digital/view';
import {
  buildCertificadoJsonLd,
  buildCertificadoMetadata,
} from 'src/sections/certificado-digital/certificado-seo';

// ----------------------------------------------------------------------

export const metadata = buildCertificadoMetadata(CERTIFICADO);

/**
 * ISR (Incremental Static Regeneration)
 * Revalida a página a cada 1 hora (3600 segundos)
 */
export const revalidate = 3600;

export default function Page() {
  const jsonLd = buildCertificadoJsonLd(CERTIFICADO);

  return (
    <section>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CertificadoDigitalView data={CERTIFICADO} />
    </section>
  );
}
