'use client';

import { Container, Typography } from '@mui/material';

export function ApuracaoDetalhesView() {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4">Detalhes da Apuração</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Esta página mostra os detalhes completos de uma apuração específica.
      </Typography>
    </Container>
  );
}
