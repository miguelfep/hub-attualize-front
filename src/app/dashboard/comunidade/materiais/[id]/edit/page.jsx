'use client';

import { useParams } from 'src/routes/hooks';

import { MaterialFormView } from 'src/sections/comunidade/material/material-form-view';

// ----------------------------------------------------------------------

export default function MaterialEditPage() {
  const params = useParams();
  const { id } = params;

  return <MaterialFormView id={id} />;
}
