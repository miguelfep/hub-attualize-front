import { Suspense } from 'react';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import { CONFIG } from 'src/config-global';

import { FiscalImpostosView } from 'src/sections/fiscal/view/fiscal-impostos-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Impostos | Fiscal - ${CONFIG.site.name}` };

function ViewFallback() {
  return (
    <Box sx={{ width: 1, py: 4 }}>
      <LinearProgress />
    </Box>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ViewFallback />}>
      <FiscalImpostosView />
    </Suspense>
  );
}
