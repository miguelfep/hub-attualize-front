import ReactPlayer from 'react-player';
import React, { useState } from 'react';

import { Box, Stack, Button, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';

import { FormWizardAbrirEmpresa } from './FormWizardAbrirEmpresaEstetica';

export function BannerEstetica() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleTrocarContador = async () => {
    try {
      const whatsappUrl = `https://wa.me/5541996982267?text=Olá,%20e%20tenho%20interesse%20em%20trocar%20minha%20contabilidade!`;
      window.location.href = whatsappUrl;
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
    }
  };

  return (
    <Box
      sx={{
        height: { md: 560, xs: 'auto' },
        py: { xs: 5, md: 0 },
        overflow: 'hidden',
        position: 'relative',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${CONFIG.site.basePath}/assets/background/overlay.svg), url(${CONFIG.site.basePath}/assets/images/about/banner-6.png)`,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: { xs: 4, md: 0 },
      }}
    >
      {/* Texto e botões */}
      <Box
        sx={{
          textAlign: 'left',
          ml: { md: 10, xs: 2 },
          maxWidth: 600,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            color: 'white',
            fontSize: { xs: '2rem', md: '3rem' },
            lineHeight: { xs: 1.2, md: 1.5 },
          }}
        >
          Contabilidade para Clínicas de Estética
        </Typography>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            color: 'white',
            fontSize: { xs: '1rem', md: '1.25rem' },
            lineHeight: 1.5,
          }}
        >
          Especialistas em contabilidade digital para o setor de beleza e bem-estar em todo o
          Brasil.
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            mt: 3,
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', md: 'flex-start' },
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleOpen}
            sx={{
              px: 4,
              fontSize: { xs: '0.875rem', md: '1rem' },
            }}
          >
            Abrir Minha Empresa
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={handleTrocarContador}
            sx={{
              px: 4,
              fontSize: { xs: '0.875rem', md: '1rem' },
            }}
          >
            Trocar de Contador
          </Button>
        </Stack>
      </Box>

      {/* Vídeo responsivo */}
      <Box
        sx={{
          width: { xs: '90%', md: '50%' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 2,
          overflow: 'hidden',
          mr: { xs: 0, md: 4 },
          height: { xs: 200, md: 450 }, // Altura ajustada para mobile e desktop
        }}
      >
        <ReactPlayer
          url="https://www.youtube.com/embed/nyUmR7EPPFM?si=HdhhcAFD5G5z7-1F"
          width="100%"
          height="100%"
          controls
          style={{ borderRadius: '10px' }}
        />
      </Box>

      <FormWizardAbrirEmpresa open={open} onClose={handleClose} />
    </Box>
  );
}
