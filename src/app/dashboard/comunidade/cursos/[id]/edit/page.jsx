import { CursoFormView } from 'src/sections/comunidade/curso/curso-form-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Editar Curso - Comunidade',
};

export default function Page({ params }) {
  const { id } = params;
  return <CursoFormView id={id} />;
}
