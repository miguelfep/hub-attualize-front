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
        height: { xs: 300, md: 500 },
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'right',
        color: 'common.white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        },
      }}
    >
      <Container sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container alignItems="center">
          {/* Logos */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Image src={logoAttualize} alt="Logo Attualize" width={90} height={60} />
            <Image src={logoDefina} alt="Logo Defina" width={120} height={60} />
          </Grid>
          
          {/* Texto e Botões */}
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Typography variant="h2" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="h5" sx={{ mt: 2 }}>
                {subtitle}
              </Typography>
            )}
            
            {/* Botões */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={() => scrollToSection('presente')}>Pegar Meu Presente</Button>
              <Button variant="contained" color="secondary" onClick={() => scrollToSection('abrir-mei')}>Abrir Meu MEI</Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
