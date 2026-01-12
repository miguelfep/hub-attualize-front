'use client';

import { useState } from 'react';

import { Box, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AulaTexto({ aula, progressoAula, onConcluir }) {
  const [concluida, setConcluida] = useState(progressoAula?.concluida || false);

  const handleMarcarConcluida = () => {
    setConcluida(true);
    if (onConcluir) {
      onConcluir({ concluida: true });
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {aula.titulo}
      </Typography>

      <Box
        sx={{
          p: 3,
          borderRadius: 1,
          bgcolor: 'background.neutral',
          mb: 3,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            lineHeight: 1.8,
          }}
        >
          {aula.conteudo?.texto || 'Conteúdo não disponível'}
        </Typography>
      </Box>

      {!concluida && (
        <Button
          variant="contained"
          onClick={handleMarcarConcluida}
          startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
        >
          Marcar como Concluída
        </Button>
      )}

      {concluida && (
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: 'success.lighter',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Iconify icon="eva:checkmark-circle-2-fill" width={24} sx={{ color: 'success.main' }} />
          <Typography variant="body2" sx={{ color: 'success.darker' }}>
            Aula concluída
          </Typography>
        </Box>
      )}
    </Box>
  );
}

