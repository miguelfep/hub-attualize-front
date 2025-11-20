import { ClienteApuracaoDetalheView } from 'src/sections/apuracao-admin/view';

// ----------------------------------------------------------------------

export const metadata = { title: 'Detalhes do Cliente - Apuração | Dashboard' };

export default function ClienteApuracaoDetalhesPage({ params }) {
  const { clienteId } = params;
  
  return <ClienteApuracaoDetalheView clienteId={clienteId} />;
}

