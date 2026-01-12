'use client';

import { useState } from 'react';

import { Box, Button, Typography, Link } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AulaArquivo({ aula, progressoAula, onConcluir }) {
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

      {aula.descricao && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {aula.descricao}
        </Typography>
      )}

      {aula.conteudo?.urlArquivo && (
        <Box
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
            textAlign: 'center',
            mb: 3,
          }}
        >
          <Iconify icon="eva:file-download-fill" width={48} sx={{ color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Arquivo Disponível
          </Typography>
          <Link
            href={aula.conteudo.urlArquivo}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
            }}
          >
            <Iconify icon="eva:external-link-fill" width={20} />
            Abrir Arquivo
          </Link>
        </Box>
      )}

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

