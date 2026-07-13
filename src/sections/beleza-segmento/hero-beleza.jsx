'use client';

import { useState } from 'react';

import { Box, Link, Stack, Button, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { GradeFotos } from 'src/sections/estetica-home/GradeFotos';

import { whatsappLink } from './dados-compartilhados';
import { AberturaDialogBeleza } from './abertura-dialog-beleza';

// ----------------------------------------------------------------------

export function HeroBeleza({ segmento }) {
  const [openAbertura, setOpenAbertura] = useState(false);
  const { cores, hero } = segmento;

  return (
    <Box
      component="section"
      aria-label="Apresentação"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: cores.papel,
        borderBottom: `1px solid ${cores.suave}`,
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 5, md: 8 }} alignItems="center">
          <Stack spacing={3} sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{ color: cores.destaque, letterSpacing: 2, fontWeight: 700 }}
            >
              {hero.overline}
            </Typography>

            <Typography component="h1" variant="h2" sx={{ color: cores.tinta, lineHeight: 1.15 }}>
              {hero.titulo}
            </Typography>

            <Typography variant="h6" component="p" sx={{ color: cores.grafite, fontWeight: 400 }}>
              {hero.subtitulo}
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                size="large"
                variant="contained"
                onClick={() => setOpenAbertura(true)}
                startIcon={<Iconify icon="solar:buildings-2-bold" />}
                sx={{
                  px: 4,
                  py: 1.5,
                  bgcolor: cores.destaque,
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: cores.destaqueEscuro },
                  '&:focus-visible': { outline: `3px solid ${cores.tinta}`, outlineOffset: 2 },
                }}
              >
                Quero regularizar meu negócio
              </Button>
              <Button
                component="a"
                href="#calculadora-parceria"
                size="large"
                variant="outlined"
                startIcon={<Iconify icon="solar:calculator-linear" />}
                sx={{
                  px: 4,
                  py: 1.5,
                  color: cores.tinta,
                  borderColor: cores.tinta,
                  '&:hover': {
                    borderColor: cores.destaque,
                    color: cores.destaque,
                    bgcolor: 'transparent',
                  },
                  '&:focus-visible': { outline: `3px solid ${cores.destaque}`, outlineOffset: 2 },
                }}
              >
                Calcular minha economia grátis
              </Button>
            </Stack>

            <Typography variant="body2" sx={{ color: cores.grafite }}>
              Atendimento 100% online para todo o Brasil ·{' '}
              <Link
                href={whatsappLink(segmento.whatsappMsgPadrao)}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{
                  color: cores.destaque,
                  fontWeight: 600,
                  '&:focus-visible': { outline: `2px solid ${cores.destaque}`, outlineOffset: 2 },
                }}
              >
                prefere WhatsApp?
              </Link>
            </Typography>
          </Stack>

          {/* Fotos temáticas do segmento */}
          <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 480 } }}>
            <GradeFotos
              srcPrincipal={hero.fotoPrincipal}
              srcSecundaria={hero.fotoSecundaria}
              alt={hero.fotoAlt}
            />
          </Box>
        </Stack>
      </Container>

      <AberturaDialogBeleza
        open={openAbertura}
        onClose={() => setOpenAbertura(false)}
        segmento={segmento}
      />
    </Box>
  );
}
