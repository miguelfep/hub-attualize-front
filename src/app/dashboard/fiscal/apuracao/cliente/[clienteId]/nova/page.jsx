import { NovaApuracaoView } from 'src/sections/apuracao-admin/view';

// ----------------------------------------------------------------------

export const metadata = { title: 'Nova Apuração | Dashboard' };

export default function NovaApuracaoPage({ params }) {
  const { clienteId } = params;
  
  return <NovaApuracaoView clienteId={clienteId} />;
}

