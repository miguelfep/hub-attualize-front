import { ApuracoesClienteListView } from 'src/sections/apuracao-admin/view';

// ----------------------------------------------------------------------

export const metadata = { title: 'Apurações do Cliente | Dashboard' };

export default function ApuracoesClientePage({ params }) {
  const { clienteId } = params;
  
  return <ApuracoesClienteListView clienteId={clienteId} />;
}

