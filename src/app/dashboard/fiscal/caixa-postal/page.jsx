import { Suspense } from 'react';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import { CONFIG } from 'src/config-global';

import { FiscalCaixaPostalView } from 'src/sections/fiscal/view/fiscal-caixa-postal-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Caixa Postal | Fiscal - ${CONFIG.site.name}` };

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
      <FiscalCaixaPostalView />
    </Suspense>
  );
}
