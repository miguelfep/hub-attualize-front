import { LeadDetailsView } from 'src/sections/lead/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Detalhes do Lead | Dashboard` };

export default function LeadDetailsPage({ params }) {
  const { id } = params;

  return <LeadDetailsView id={id} />;
}

