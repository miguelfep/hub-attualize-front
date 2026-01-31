import { m } from 'framer-motion';

import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { varAlpha } from 'src/theme/styles';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const YOUTUBE_VIDEO_ID = 'gfee734lGcs';
const YOUTUBE_URL = `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}&autoplay=1&rel=0&modestbranding=1`;

export function AboutVision() {
  const theme = useTheme();

  const handlePlayVideo = () => {
    // Abre o YouTube diretamente na melhor qualidade disponível
    window.open(YOUTUBE_URL, '_blank', 'noopener,noreferrer');
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
      {['att'].map((logo) => (
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
          <Fab 
            sx={{ 
              position: 'absolute', 
              zIndex: 9,
              '&:hover': {
                transform: 'scale(1.1)',
              },
              transition: 'transform 0.2s ease-in-out',
            }} 
            onClick={handlePlayVideo}
            color="primary"
            size="large"
          >
            <Iconify icon="solar:play-broken" width={32} />
          </Fab>
        </Box>

        <m.div variants={varFade().inUp}>
          <Typography variant="h3" sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            Um pouco mais sobre a Attualize
          </Typography>
        </m.div>
      </Container>
    </Box>
  );
}
