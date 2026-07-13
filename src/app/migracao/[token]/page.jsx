import { MigracaoColetaView } from 'src/sections/migracao-coleta/migracao-coleta-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Envio de documentos da migração | Attualize Contábil',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  const { token } = await params;

  return <MigracaoColetaView token={token} />;
}
