import { SegmentLandingView } from 'src/sections/saude/segment/view';
import { NUTRICIONISTAS } from 'src/sections/saude/segment/data/nutricionistas';
import { buildSegmentJsonLd, buildSegmentMetadata } from 'src/sections/saude/segment/segment-seo';

// ----------------------------------------------------------------------

export const metadata = buildSegmentMetadata(NUTRICIONISTAS);

/**
 * ISR (Incremental Static Regeneration)
 * Revalida a página a cada 1 hora (3600 segundos)
 */
export const revalidate = 3600;

export default function Page() {
  const jsonLd = buildSegmentJsonLd(NUTRICIONISTAS);

  return (
    <section>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SegmentLandingView segment={NUTRICIONISTAS} />
    </section>
  );
}
