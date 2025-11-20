import { UploadDasAdminView } from 'src/sections/apuracao-admin/view';

// ----------------------------------------------------------------------

export const metadata = { title: 'Upload de DAS | Dashboard' };

export default function UploadDasPage({ params }) {
  const { clienteId, apuracaoId } = params;
  
  return <UploadDasAdminView clienteId={clienteId} apuracaoId={apuracaoId} />;
}

