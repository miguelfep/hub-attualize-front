import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export function OrcamentoPago() {
  return (
    <Box textAlign="center" sx={{ mt: 5 }}>
      <Card sx={{ maxWidth: 600, margin: 'auto', boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <Iconify icon="mdi:check-circle" width={40} height={40} color="success.main" />
          </Box>
          <Typography variant="h6" color="success.main">
            Seu pedido foi finalizado!
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Ficamos muito felizes em tê-lo como nosso cliente. Nosso objetivo é tornar a sua
            experiência na Attualize um sucesso.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
