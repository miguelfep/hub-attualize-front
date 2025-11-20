import { DetalhesApuracaoView } from 'src/sections/apuracao-admin/view';

// ----------------------------------------------------------------------

export const metadata = { title: 'Detalhes da Apuração | Dashboard' };

export default function DetalhesApuracaoPage({ params }) {
  const { clienteId, apuracaoId } = params;
  
  return <DetalhesApuracaoView clienteId={clienteId} apuracaoId={apuracaoId} />;
}

