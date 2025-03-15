'use client';

import { Box, Grid, Container, Typography, Button } from '@mui/material';
import Image from 'next/image';

export function BannerJornada({ title, subtitle, backgroundImage, logoAttualize, logoDefina }) {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 400, md: 500 }, // Banner maior para impacto
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'common.white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        },
      }}
    >
      <Container sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          {/* Logos centralizadas */}
          <Grid item xs={12} sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Image src={logoAttualize} alt="Logo Attualize" width={110} height={60} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                +
              </Typography>
              <Image src={logoDefina} alt="Logo Defina" width={140} height={70} />
            </Box>
          </Grid>

          {/* Texto principal */}
          <Grid item xs={12}>
            <Typography variant="h2" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="h5" sx={{ mt: 2 }}>
                {subtitle}
              </Typography>
            )}
          </Grid>

          {/* Botões de ação */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="contained" color="primary" size="large" onClick={() => scrollToSection('presente')}>
                Quero meu presente
              </Button>
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: 'white', // Fundo branco para contraste
                  color: '#680a87', // Texto roxo para destacar
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#f4e1ff', // Tom de roxo claro ao passar o mouse
                  },
                }}
                onClick={() => scrollToSection('abrir-mei')}
              >
                Abrir MEI grátis
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
