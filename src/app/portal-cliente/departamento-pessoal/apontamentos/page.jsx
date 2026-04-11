import { Suspense } from 'react';

import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';

import { PortalDpApontamentosHubView } from 'src/sections/departamento-pessoal/view/portal-dp-apontamentos-hub-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Apontamentos | Portal - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <Suspense fallback={<Typography sx={{ p: 2 }}>Carregando…</Typography>}>
      <PortalDpApontamentosHubView />
    </Suspense>
  );
}
