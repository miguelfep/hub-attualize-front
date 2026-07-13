'use client';

import Grid from '@mui/material/Unstable_Grid2';
import { Box, Stack, Button, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { whatsappLink, PARCEIRO_ID_URL, SISTEMA_PARCEIROS } from './dados-compartilhados';

// ----------------------------------------------------------------------
// Sistema de gestão de parceria (ParceiroID) — diferencial das landings de beleza.

export function SecaoSistemaParceiros({ segmento }) {
  const { cores } = segmento;

  return (
    <Box
      component="section"
      id="sistema-de-gestao"
      aria-labelledby="titulo-sistema"
      sx={{ py: { xs: 6, md: 10 }, bgcolor: '#FFFFFF', scrollMarginTop: 96 }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1.5} sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="overline"
            sx={{ color: cores.destaque, letterSpacing: 1.5, fontWeight: 700 }}
          >
            Tecnologia + contabilidade
          </Typography>
          <Typography id="titulo-sistema" component="h2" variant="h3" sx={{ color: cores.tinta }}>
            {SISTEMA_PARCEIROS.titulo}
          </Typography>
          <Typography variant="body1" sx={{ color: cores.grafite, maxWidth: 720, mx: 'auto' }}>
            {SISTEMA_PARCEIROS.subtitulo}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {SISTEMA_PARCEIROS.features.map((feature) => (
            <Grid key={feature.titulo} xs={12} sm={6} md={4}>
              <Stack
                spacing={1.5}
                sx={{
                  p: 3,
                  height: 1,
                  borderRadius: 3,
                  bgcolor: cores.papel,
                  border: `1px solid ${cores.suave}`,
                }}
              >
                <Iconify icon={feature.icone} width={36} sx={{ color: cores.destaque }} />
                <Typography component="h3" variant="h6" sx={{ color: cores.tinta }}>
                  {feature.titulo}
                </Typography>
                <Typography variant="body2" sx={{ color: cores.grafite }}>
                  {feature.texto}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mt: { xs: 4, md: 6 } }}
        >
          <Button
            component="a"
            href={whatsappLink(
              `${segmento.whatsappMsgPadrao} Quero conhecer o sistema de gestão de parceiros.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            size="large"
            variant="contained"
            startIcon={<Iconify icon="ic:baseline-whatsapp" />}
            sx={{
              px: 4,
              bgcolor: cores.destaque,
              color: '#FFFFFF',
              '&:hover': { bgcolor: cores.destaqueEscuro },
              '&:focus-visible': { outline: `3px solid ${cores.tinta}`, outlineOffset: 2 },
            }}
          >
            Quero ver o sistema funcionando
          </Button>
          <Button
            component="a"
            href={PARCEIRO_ID_URL}
            target="_blank"
            rel="noopener noreferrer"
            size="large"
            variant="outlined"
            endIcon={<Iconify icon="solar:arrow-right-up-bold" />}
            sx={{
              px: 4,
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
            Conhecer a plataforma
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
