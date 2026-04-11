import { Suspense } from 'react';

import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';

import { PortalDpApontamentosLancarView } from 'src/sections/departamento-pessoal/view/portal-dp-apontamentos-lancar-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Lançar apontamentos | Portal - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <Suspense fallback={<Typography sx={{ p: 2 }}>Carregando…</Typography>}>
      <PortalDpApontamentosLancarView />
    </Suspense>
  );
}
