'use client';

import { Container, Typography } from '@mui/material';

export function DasDetalhesView() {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4">Detalhes do DAS</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Esta página mostra os detalhes completos de um DAS, incluindo composição de tributos e
        opção de download em PDF.
      </Typography>
    </Container>
  );
}

