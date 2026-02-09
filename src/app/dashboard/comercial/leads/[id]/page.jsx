import { LeadDetailsView } from 'src/sections/lead/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Detalhes do Lead | Dashboard` };

export default async function LeadDetailsPage({ params }) {
  // No Next.js 16, params é uma Promise e precisa ser aguardado
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return <LeadDetailsView id={id} />;
}

export const dynamic = 'force-dynamic';
