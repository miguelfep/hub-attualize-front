import { FolhaIdealView } from 'src/sections/apuracao-admin/view';

// ----------------------------------------------------------------------

export const metadata = { title: 'Calcular Folha Ideal para Fator R | Dashboard' };

export default function FolhaIdealPage({ params }) {
  const { clienteId } = params;
  
  return <FolhaIdealView clienteId={clienteId} />;
}

