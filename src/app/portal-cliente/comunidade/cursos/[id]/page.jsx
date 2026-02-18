import { CursoPortalDetailsView } from 'src/sections/comunidade/curso/curso-portal-details-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Detalhes do Curso - Comunidade',
};

export default function Page({ params }) {
  const { id } = params;
  return <CursoPortalDetailsView id={id} />;
}
