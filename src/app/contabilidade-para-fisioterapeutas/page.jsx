import { SegmentLandingView } from 'src/sections/saude/segment/view';
import { FISIOTERAPEUTAS } from 'src/sections/saude/segment/data/fisioterapeutas';
import { buildSegmentJsonLd, buildSegmentMetadata } from 'src/sections/saude/segment/segment-seo';

// ----------------------------------------------------------------------

export const metadata = buildSegmentMetadata(FISIOTERAPEUTAS);

/**
 * ISR (Incremental Static Regeneration)
 * Revalida a página a cada 1 hora (3600 segundos)
 */
export const revalidate = 3600;

export default function Page() {
  const jsonLd = buildSegmentJsonLd(FISIOTERAPEUTAS);

  return (
    <section>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SegmentLandingView segment={FISIOTERAPEUTAS} />
    </section>
  );
}
