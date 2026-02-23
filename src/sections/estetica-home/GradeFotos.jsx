import React from 'react';
import Image from 'next/image';

import { Box } from '@mui/material';

export const GradeFotos = ({ srcPrincipal, srcSecundaria, alt = 'Foto da clínica' }) => (
  <Box
    sx={{
      position: 'relative',
      width: '100%',
      maxWidth: 500,
      aspectRatio: '1 / 1',
      margin: '0 auto',
      pb: { xs: 0, md: 8 },
    }}
  >
    {/* Detalhe verde decorativo */}
    <Box
      sx={{
        position: 'absolute',
        left: -25,
        bottom: 50,
        width: '40%',
        height: '40%',
        borderRadius: 2,
        zIndex: 0,
      }}
    />

    {/* Foto principal */}
    <Box
      sx={{
        position: 'relative',
        width: { xs: '100%', md: '85%' },
        aspectRatio: '1 / 1',
        borderRadius: 4,
        overflow: 'hidden',
        zIndex: 1,
        boxShadow: 3,
        border: '8px solid #fff',
      }}
    >
      <Image
        src={srcPrincipal}
        alt={alt}
        fill
        style={{ objectFit: 'cover' }}
      />
    </Box>

    {/* Foto secundária (sobreposta) */}
    {srcSecundaria && (
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '55%',
          aspectRatio: '1 / 1',
          borderRadius: 4,
          overflow: 'hidden',
          border: '8px solid #fff',
          zIndex: 2,
          boxShadow: 4,
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
