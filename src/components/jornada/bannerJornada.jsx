'use client';

import { Box, Grid, Container, Typography } from '@mui/material';

export function BannerJornada({ title, subtitle, backgroundImage }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 300, md: 500 }, // Responsivo
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'right', // Alinhamento do texto
        color: 'common.white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // Efeito de overlay
        },
      }}
    >
      <Container sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container alignItems="center">
          {/* Coluna vazia para empurrar o texto para a direita */}
          <Grid item xs={12} md={6} />

          {/* Coluna com o conteúdo alinhado à direita */}
          <Grid item xs={12} md={6}>
            <Typography variant="h2" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="h5" sx={{ mt: 2 }}>
                {subtitle}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
