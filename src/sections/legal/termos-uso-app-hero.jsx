'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';

import { varFade, AnimateText, MotionContainer, animateTextClasses } from 'src/components/animate';

// ----------------------------------------------------------------------

export function TermosUsoAppHero({ dataAtualizacao }) {
  return (
    <Box
      sx={{
        height: { md: 480 },
        py: { xs: 10, md: 0 },
        overflow: 'hidden',
        position: 'relative',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${CONFIG.site.basePath}/assets/background/overlay.svg), url(${CONFIG.site.basePath}/assets/images/about/banner-6.png)`,
      }}
    >
      <Container component={MotionContainer}>
        <Box
          sx={{
            bottom: { md: 72 },
            position: { md: 'absolute' },
            textAlign: { xs: 'center', md: 'unset' },
            maxWidth: { md: 720 },
          }}
        >
          <AnimateText
            component="h1"
            variant="h1"
            text={['Termos', 'do app']}
            variants={varFade({ distance: 24 }).inRight}
            sx={{
              color: 'common.white',
              [`& .${animateTextClasses.line}[data-index="0"]`]: {
                [`& .${animateTextClasses.word}[data-index="0"]`]: { color: 'primary.main' },
              },
            }}
          />

          <m.div variants={varFade({ distance: 24 }).inUp}>
            <Typography
              variant="h4"
              sx={{
                mt: 3,
                color: 'common.white',
                fontWeight: 'fontWeightSemiBold',
                fontSize: { xs: '1.15rem', sm: '1.35rem' },
                lineHeight: 1.45,
              }}
            >
              Licença de uso do aplicativo <Box component="span" sx={{ color: 'primary.main' }}>Hub Attualize</Box>
            </Typography>
          </m.div>

          <m.div variants={varFade({ distance: 24 }).inUp}>
            <Typography
              variant="body1"
              sx={{
                mt: 2,
                color: 'common.white',
                opacity: 0.9,
                fontWeight: 500,
              }}
            >
              Versão 1.0 · Última atualização: {dataAtualizacao}
            </Typography>
          </m.div>
        </Box>
      </Container>
    </Box>
  );
}
