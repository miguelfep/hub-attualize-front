import { DetalhesDasView } from 'src/sections/apuracao-admin/view';

// ----------------------------------------------------------------------

export const metadata = { title: 'Detalhes do DAS | Dashboard' };

export default function DetalhesDasPage({ params }) {
  const { dasId } = params;
  
  return <DetalhesDasView dasId={dasId} />;
}

