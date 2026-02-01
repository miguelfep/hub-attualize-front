'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { RecompensasDashboardView } from 'src/sections/recompensas/recompensas-dashboard-view';
import { RecompensasTransacoesView } from 'src/sections/recompensas/recompensas-transacoes-view';

// ----------------------------------------------------------------------

export default function RecompensasPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Recompensas
      </Typography>

      <RecompensasDashboardView />

      <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
        Histórico de Transações
      </Typography>

      <RecompensasTransacoesView />
    </Container>
  );
}
