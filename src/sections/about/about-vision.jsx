import { m } from 'framer-motion';
import ReactPlayer from 'react-player';
import React, { useState } from 'react';

import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';

import { CONFIG } from 'src/config-global';
import { varAlpha } from 'src/theme/styles';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function AboutVision() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const renderImg = (
    <Image
      src={`${CONFIG.site.basePath}/assets/images/about/vision.webp`}
      alt="about-vision"
      ratio={{ xs: '4/3', sm: '16/9' }}
      slotProps={{
        overlay: { background: varAlpha(theme.vars.palette.grey['900Channel'], 0.48) },
      }}
    />
  );

  const renderLogos = (
    <Stack
      direction="row"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="center"
      sx={{
        width: 1,
        zIndex: 9,
        bottom: 0,
        opacity: 0.48,
        position: 'absolute',
        py: { xs: 1.5, md: 2.5 },
      }}
    >
      {['att', 'spotify', 'netflix', 'hbo', 'amazon'].map((logo) => (
        <Box
          component={m.img}
          key={logo}
          variants={varFade().in}
          alt={logo}
          src={`${CONFIG.site.basePath}/assets/icons/brands/ic-brand-${logo}.svg`}
          sx={{ m: { xs: 1.5, md: 2.5 }, height: { xs: 20, md: 32 } }}
        />
      ))}
    </Stack>
  );

  return (
    <Box
      sx={{
        pb: 10,
        position: 'relative',
        bgcolor: 'background.neutral',
        '&::before': {
          top: 0,
          left: 0,
          width: 1,
          content: "''",
          position: 'absolute',
          height: { xs: 80, md: 120 },
          bgcolor: 'background.default',
        },
      }}
    >
      <Container component={MotionViewport}>
        <Box
          sx={{
            mb: 10,
            borderRadius: 2,
            display: 'flex',
            overflow: 'hidden',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {renderImg}
          {renderLogos}
          <Fab sx={{ position: 'absolute', zIndex: 9 }} onClick={handleClickOpen}>
            <Iconify icon="solar:play-broken" width={24} />
          </Fab>
        </Box>

        <m.div variants={varFade().inUp}>
          <Typography variant="h3" sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            Um pouco mais sobre a Attualize
          </Typography>
        </m.div>
      </Container>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xl" // Ajuste o valor para tornar o modal maior
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: theme.palette.background.default,
            width: '90%', // Ajuste a largura conforme necessário
            height: '90%', // Ajuste a altura conforme necessário
            maxWidth: 'none', // Desabilita o maxWidth padrão
          },
        }}
      >
        <DialogContent>
          <Box
            sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}
          >
            <ReactPlayer
              url="https://www.youtube.com/embed/gfee734lGcs?si=quv_ZsDF74PXR-BW"
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              controls
              playing
            />
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (localTheme) => localTheme.palette.grey[500],
            }}
          >
            <Iconify icon="solar:close-square-bold-duotone" />
          </IconButton>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
