'use client';

import Image from 'next/image';
import { m } from 'framer-motion';
import { useState, useCallback } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Chip, Stack, Button, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { SegmentFormMigrar } from 'src/sections/saude/segment/segment-form-migrar';
import { SegmentFormAbrirEmpresa } from 'src/sections/saude/segment/segment-form-abrir-empresa';

// ----------------------------------------------------------------------

const ACCENT = '#0096D9';

const HERO_STATS = [
  { icon: 'solar:calendar-bold-duotone', label: '+10 anos de experiência' },
  { icon: 'solar:users-group-rounded-bold-duotone', label: '+200 clientes em todo o Brasil' },
  { icon: 'solar:chat-round-dots-bold-duotone', label: 'Atendimento humanizado' },
];

// ----------------------------------------------------------------------

export default function HomeBanner() {
  const theme = useTheme();

  const [openAbrir, setOpenAbrir] = useState(false);
  const [openMigrar, setOpenMigrar] = useState(false);

  const handleOpenAbrir = useCallback(() => setOpenAbrir(true), []);
  const handleCloseAbrir = useCallback(() => setOpenAbrir(false), []);

  const handleOpenMigrar = useCallback(() => setOpenMigrar(true), []);
  const handleCloseMigrar = useCallback(() => setOpenMigrar(false), []);

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 14, md: 18 },
        pb: { xs: 8, md: 12 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/assets/background/background-3-blur.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.5,
          zIndex: 0,
          filter: 'brightness(1.15)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.75)} 0%, ${alpha(theme.palette.grey[50], 0.65)} 100%)`,
          zIndex: 0,
        },
      }}
    >
      <Container component={MotionViewport} sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
          {/* Conteúdo */}
          <Grid xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <m.div variants={varFade().inUp}>
                <Chip
                  icon={<Iconify icon="solar:verified-check-bold" width={18} />}
                  label="Contabilidade digital especializada"
                  sx={{
                    mb: 3,
                    px: 1,
                    fontWeight: 700,
                    bgcolor: alpha(ACCENT, 0.1),
                    color: ACCENT,
                    '& .MuiChip-icon': { color: ACCENT },
                  }}
                />
              </m.div>

              <m.div variants={varFade().inUp}>
                <Typography
                  variant="h1"
                  sx={{
                    mb: 3,
                    fontSize: { xs: '2.25rem', md: '3.25rem' },
                    fontWeight: 800,
                    lineHeight: 1.15,
                  }}
                >
                  Contabilidade inteligente para{' '}
                  <Box
                    component="span"
                    sx={{
                      color: '#FEC615',
                    }}
                  >
                    Beleza, Saúde e Bem-Estar
                  </Box>
                </Typography>
              </m.div>

              <m.div variants={varFade().inUp}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    color: 'text.secondary',
                    fontWeight: 400,
                    lineHeight: 1.7,
                  }}
                >
                  Se você busca uma contabilidade digital, prática e especializada no seu negócio,
                  encontrou! Você cuida dos seus clientes, nós cuidamos do resto.
                </Typography>
              </m.div>

              <m.div variants={varFade().inUp}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                >
                  <Button
                    size="large"
                    variant="contained"
                    onClick={handleOpenAbrir}
                    aria-label="Abrir minha empresa com a Attualize"
                    startIcon={<Iconify icon="solar:buildings-2-bold-duotone" width={22} />}
                    sx={{
                      bgcolor: ACCENT,
                      color: 'white',
                      px: { xs: 3, md: 5 },
                      py: { xs: 1.5, md: 2 },
                      fontSize: { xs: '0.95rem', md: '1.125rem' },
                      fontWeight: 800,
                      borderRadius: 50,
                      boxShadow: `0 10px 30px 0 ${alpha(ACCENT, 0.5)}`,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        bgcolor: alpha(ACCENT, 0.85),
                        transform: 'scale(1.05)',
                        boxShadow: `0 15px 40px 0 ${alpha(ACCENT, 0.7)}`,
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    Abrir Minha Empresa
                  </Button>

                  <Button
                    size="large"
                    variant="outlined"
                    color="inherit"
                    onClick={handleOpenMigrar}
                    aria-label="Trocar de contador e migrar para Attualize"
                    startIcon={<Iconify icon="solar:rocket-bold-duotone" width={22} />}
                    sx={{
                      px: { xs: 3, md: 4 },
                      py: { xs: 1.5, md: 2 },
                      fontWeight: 700,
                      borderRadius: 50,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        borderColor: ACCENT,
                        backgroundColor: alpha(ACCENT, 0.08),
                        color: ACCENT,
                      },
                    }}
                  >
                    Migrar para Attualize
                  </Button>
                </Stack>
              </m.div>

              <m.div variants={varFade().inUp}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1.5, sm: 3 }}
                  sx={{ mt: 4 }}
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                >
                  {HERO_STATS.map((stat) => (
                    <Stack key={stat.label} direction="row" spacing={1} alignItems="center">
                      <Iconify icon={stat.icon} width={20} sx={{ color: ACCENT }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {stat.label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </m.div>
            </Box>
          </Grid>

          {/* Imagem com cards flutuantes */}
          <Grid xs={12} md={6}>
            <m.div variants={varFade().inRight}>
              <Box sx={{ position: 'relative', maxWidth: 620, mx: 'auto' }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '3 / 2',
                    borderRadius: 6,
                    overflow: 'hidden',
                    boxShadow: theme.customShadows.z24,
                  }}
                >
                  <Image
                    src="/assets/images/home/home-principal.webp"
                    alt="Attualize Contábil - contabilidade digital especializada"
                    fill
                    priority
                    sizes="(min-width: 900px) 620px, 100vw"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                </Box>

                {/* Card flutuante - 100% digital */}
                <Card
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: { xs: -8, md: -24 },
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    borderRadius: 2,
                    boxShadow: theme.customShadows.z16,
                    bgcolor: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <Iconify icon="solar:monitor-bold-duotone" width={26} sx={{ color: ACCENT }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      100% Digital
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Atendemos todo o Brasil
                    </Typography>
                  </Box>
                </Card>

                {/* Card flutuante - atendimento humano */}
                <Card
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: { xs: -8, md: -24 },
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    borderRadius: 2,
                    boxShadow: theme.customShadows.z16,
                    bgcolor: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <Iconify icon="solar:hand-heart-bold-duotone" width={26} sx={{ color: '#FEC615' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      Pessoas de verdade
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Sem robôs, sem tickets infinitos
                    </Typography>
                  </Box>
                </Card>
              </Box>
            </m.div>
          </Grid>
        </Grid>
      </Container>

      <SegmentFormAbrirEmpresa
        open={openAbrir}
        onClose={handleCloseAbrir}
        origem="site-home"
        leadSegment="home"
      />

      <SegmentFormMigrar
        open={openMigrar}
        onClose={handleCloseMigrar}
        origem="site-home"
        leadSegment="home"
      />
    </Box>
  );
}
