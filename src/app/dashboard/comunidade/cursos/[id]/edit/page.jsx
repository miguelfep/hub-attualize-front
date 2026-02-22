'use client';

import { useParams } from 'src/routes/hooks';

import { CursoFormView } from 'src/sections/comunidade/curso/curso-form-view';

// ----------------------------------------------------------------------

export default function CursoEditPage() {
  const params = useParams();
  const { id } = params;

  return <CursoFormView id={id} />;
}
