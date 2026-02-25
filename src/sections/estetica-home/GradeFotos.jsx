import React from 'react';
import Image from 'next/image';

import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

export const GradeFotos = ({ srcPrincipal, srcSecundaria, alt = 'Dashboard' }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%', // Ocupa 100% da largura da coluna do Grid
        display: 'flex',
        flexDirection: 'column',
        py: { xs: 4, md: 8 }, // Espaço para as sombras e a foto sobreposta não cortarem
      }}
    >
      {/* Foto Principal */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 10', // Mantém a proporção de tela de sistema
          borderRadius: 2,
          overflow: 'hidden',
          zIndex: 1,
          boxShadow: theme.customShadows?.z24 || `0 20px 40px ${alpha(theme.palette.common.black, 0.12)}`,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Image
          src={srcPrincipal}
          alt={alt}
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
      </Box>

      {/* Foto Secundária (Sobreposta) */}
      {srcSecundaria && (
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            bottom: 0,    // Colado no fundo do container pai
          right: 0, // Mantém dentro da coluna para não invadir o conteúdo ao lado
            width: '55%',
            aspectRatio: '16 / 11',
            borderRadius: 2,
            overflow: 'hidden',
            border: `6px solid #fff`,
            zIndex: 2,
            boxShadow: theme.customShadows?.z24 || `0 24px 48px ${alpha(theme.palette.common.black, 0.2)}`,
            bgcolor: 'background.paper',
          }}
        >
          <Image
            src={srcSecundaria}
            alt={`${alt} detalhe`}
            fill
            style={{ objectFit: 'cover' }}
          />
        </Box>
      )}
    </Box>
  );
};