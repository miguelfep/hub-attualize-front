import { CursoPortalDetailsView } from 'src/sections/comunidade/curso/curso-portal-details-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Detalhes do Curso - Comunidade',
};

export default async function Page({ params }) {
  const { id } = await params;
  return <CursoPortalDetailsView id={id} />;
}
