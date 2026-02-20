'use client';

import { useParams } from 'src/routes/hooks';

import { MaterialDetailsView } from 'src/sections/comunidade/material/material-details-view';

// ----------------------------------------------------------------------

export default function MaterialDetailsPage() {
  const params = useParams();
  const { id } = params;

  return <MaterialDetailsView id={id} />;
}
