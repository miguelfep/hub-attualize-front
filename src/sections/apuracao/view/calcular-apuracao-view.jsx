'use client';

import { useState } from 'react';
import { Container, Typography } from '@mui/material';

export function CalcularApuracaoView() {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4">Calcular Apuração</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Esta página permite calcular a apuração de impostos para um período específico.
      </Typography>
    </Container>
  );
}

