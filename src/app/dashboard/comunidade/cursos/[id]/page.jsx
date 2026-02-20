'use client';

import { useParams } from 'src/routes/hooks';

import { CursoDetailsView } from 'src/sections/comunidade/curso/curso-details-view';

// ----------------------------------------------------------------------

export default function CursoDetailsPage() {
  const params = useParams();
  const { id } = params;

  return <CursoDetailsView id={id} />;
}
