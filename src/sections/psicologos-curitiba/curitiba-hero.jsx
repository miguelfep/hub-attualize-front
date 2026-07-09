'use client';

import { useState } from 'react';

import { Box, Link, Stack, Button, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { CORES, whatsappLink, WHATSAPP_MSG_PADRAO } from './dados';
import { CuritibaAberturaDialog } from './curitiba-abertura-dialog';

// ----------------------------------------------------------------------

export function CuritibaHero() {
  const [openAbertura, setOpenAbertura] = useState(false);

  return (
    <Box
      component="section"
      aria-label="Apresentação"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: CORES.papel,
        borderBottom: '1px solid #F0E7E1',
        py: { xs: 8, md: 12 },
        // Mesmo fundo da página /contabilidade-para-psicologos, com lavagem quente da paleta local
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/assets/background/background-3-blur.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.5,
          zIndex: 0,
          filter: 'brightness(1.15)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(250, 246, 243, 0.82) 0%, rgba(251, 233, 240, 0.72) 100%)',
          zIndex: 0,
        },
        '& > .MuiContainer-root': { position: 'relative', zIndex: 1 },
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 5, md: 8 }} alignItems="center">
          <Stack spacing={3} sx={{ flex: 1 }}>
            <Typography
              variant="overline"
              sx={{ color: CORES.rosa, letterSpacing: 2, fontWeight: 700 }}
            >
              Attualize Contábil · Curitiba/PR
            </Typography>

            <Typography component="h1" variant="h2" sx={{ color: CORES.tinta, lineHeight: 1.15 }}>
              Contabilidade para Psicólogos em Curitiba
            </Typography>

            <Typography variant="h6" component="p" sx={{ color: CORES.grafite, fontWeight: 400 }}>
              Pague menos imposto com o Fator R bem planejado e tenha uma contabilidade que entende
              a rotina de quem atende: CRP, NFS-e de Curitiba, pró-labore e Simples Nacional — tudo
              digital, sem você sair do consultório.
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
                  bgcolor: CORES.rosa,
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#9E1245' },
                  '&:focus-visible': { outline: `3px solid ${CORES.tinta}`, outlineOffset: 2 },
                }}
              >
                Quero abrir minha empresa
              </Button>
              <Button
                component="a"
                href="#calculadora-fator-r"
                size="large"
                variant="outlined"
                startIcon={<Iconify icon="solar:calculator-linear" />}
                sx={{
                  px: 4,
                  py: 1.5,
                  color: CORES.tinta,
                  borderColor: CORES.tinta,
                  '&:hover': { borderColor: CORES.rosa, color: CORES.rosa, bgcolor: 'transparent' },
                  '&:focus-visible': { outline: `3px solid ${CORES.rosa}`, outlineOffset: 2 },
                }}
              >
                Calcular meu Fator R grátis
              </Button>
            </Stack>

            <Typography variant="body2" sx={{ color: CORES.grafite }}>
              Sede em Curitiba · atendimento 100% online para todo o Paraná ·{' '}
              <Link
                href={whatsappLink(WHATSAPP_MSG_PADRAO)}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{
                  color: CORES.rosa,
                  fontWeight: 600,
                  '&:focus-visible': { outline: `2px solid ${CORES.rosa}`, outlineOffset: 2 },
                }}
              >
                prefere WhatsApp?
              </Link>
            </Typography>
          </Stack>

          {/* Vinheta decorativa: a linha dos 28% — assinatura visual da página */}
          <Box
            aria-hidden="true"
            sx={{
              flexShrink: 0,
              width: { xs: '100%', md: 360 },
              p: 3.5,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F2E2E9',
              boxShadow: '0 24px 48px -32px rgba(42, 22, 32, 0.35)',
            }}
          >
            <Typography variant="overline" sx={{ color: CORES.grafite, letterSpacing: 1 }}>
              Anexo V → Anexo III
            </Typography>
            <Typography variant="h3" sx={{ color: CORES.tinta, my: 1 }}>
              15,5% <Box component="span" sx={{ color: CORES.rosa }}>→</Box> 6%
            </Typography>
            <Typography variant="body2" sx={{ color: CORES.grafite, mb: 2.5 }}>
              É o que a alíquota inicial do Simples pode cair quando sua folha alcança 28% da
              receita — o Fator R.
            </Typography>
            <Box sx={{ position: 'relative', height: 12, borderRadius: 6, bgcolor: '#EFE6E0' }}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '54%',
                  borderRadius: 6,
                  bgcolor: CORES.verde,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: -6,
                  bottom: -6,
                  left: '50%',
                  width: 2,
                  bgcolor: CORES.tinta,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: CORES.grafite, display: 'block', mt: 1.5 }}>
              A linha dos 28% separa quem paga mais de quem paga menos.
            </Typography>
          </Box>
        </Stack>
      </Container>

      <CuritibaAberturaDialog open={openAbertura} onClose={() => setOpenAbertura(false)} />
    </Box>
  );
}
