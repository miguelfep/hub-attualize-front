'use client';

import { useParams } from 'src/routes/hooks';

import { MaterialPortalDetailsView } from 'src/sections/comunidade/material/material-portal-details-view';

// ----------------------------------------------------------------------

export default function MaterialDetailsPage() {
  const params = useParams();
  const { id } = params;

  return <MaterialPortalDetailsView id={id} />;
}
