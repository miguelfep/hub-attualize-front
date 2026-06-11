'use client';

import { m } from 'framer-motion';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { SegmentFormMigrar } from './segment/segment-form-migrar';
import { SegmentFormAbrirEmpresa } from './segment/segment-form-abrir-empresa';

// ----------------------------------------------------------------------

const STATS = [
  {
    icon: 'solar:calendar-bold-duotone',
    value: '+10 anos',
    label: 'de experiência com saúde',
  },
  {
    icon: 'solar:users-group-rounded-bold-duotone',
    value: '+200',
    label: 'clientes atendidos',
  },
  {
    icon: 'solar:map-point-bold-duotone',
    value: 'Todo o Brasil',
    label: 'atendimento 100% digital',
  },
  {
    icon: 'solar:chat-round-dots-bold-duotone',
    value: 'WhatsApp',
    label: 'atendimento humanizado',
  },
];

// ----------------------------------------------------------------------

export function SaudeHero() {
  const theme = useTheme();
  const [openWizard, setOpenWizard] = useState(false);
  const [openMigrar, setOpenMigrar] = useState(false);

  const handleOpenWizard = useCallback(() => setOpenWizard(true), []);
  const handleCloseWizard = useCallback(() => setOpenWizard(false), []);

  const handleOpenMigrar = useCallback(() => setOpenMigrar(true), []);
  const handleCloseMigrar = useCallback(() => setOpenMigrar(false), []);

  return (
    <Box
      sx={{
        position: 'relative',
        pt: { xs: 12, md: 16 },
        pb: { xs: 8, md: 12 },
        overflow: 'hidden',
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
          backgroundRepeat: 'no-repeat',
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
          background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.7)} 0%, ${alpha(theme.palette.grey[50], 0.65)} 100%)`,
          zIndex: 0,
        },
      }}
    >
      <Container component={MotionViewport} sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Conteúdo Esquerdo */}
          <Grid xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <m.div variants={varFade().inUp}>
                <Chip
                  icon={<Iconify icon="solar:heart-pulse-bold-duotone" width={18} />}
                  label="Especialistas na área da saúde"
                  sx={{
                    mb: 3,
                    px: 1,
                    fontWeight: 700,
                    bgcolor: alpha('#0096D9', 0.1),
                    color: '#0096D9',
                    '& .MuiChip-icon': { color: '#0096D9' },
                  }}
                />
              </m.div>

              <m.div variants={varFade().inUp}>
                <Typography
                  variant="h1"
                  sx={{
                    mb: 3,
                    fontSize: { xs: '2rem', md: '3rem' },
                    fontWeight: 800,
                    lineHeight: 1.2,
                  }}
                >
                  Contabilidade Especializada no seu Negócio da{' '}
                  <Box
                    component="span"
                    sx={{ color: '#0096D9', position: 'relative', display: 'inline-block' }}
                  >
                    Área da Saúde
                  </Box>
                </Typography>
              </m.div>

              <m.div variants={varFade().inUp}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    color: 'text.secondary',
                    fontWeight: 400,
                    fontSize: { xs: '1.125rem', md: '1.25rem' },
                  }}
                >
                  Menos Impostos, Menos Burocracia e Mais Tempo para Cuidar dos Seus Pacientes
                </Typography>
              </m.div>

              <m.div variants={varFade().inUp}>
                <Typography sx={{ mb: 5, color: 'text.secondary', lineHeight: 1.8 }}>
                  Médico, dentista, psicólogo, fisioterapeuta ou dono de clínica? Entendemos a
                  fundo o seu negócio: do <strong>Fator R</strong> à{' '}
                  <strong>equiparação hospitalar</strong>, cuidamos da sua contabilidade para você
                  pagar o mínimo de impostos dentro da lei.
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
                    onClick={handleOpenWizard}
                    aria-label="Abrir minha empresa com a Attualize"
                    startIcon={<Iconify icon="solar:buildings-2-bold-duotone" width={22} />}
                    sx={{
                      bgcolor: '#0096D9',
                      color: 'white',
                      px: { xs: 3, md: 5 },
                      py: { xs: 1.5, md: 2 },
                      fontSize: { xs: '0.95rem', md: '1.125rem' },
                      fontWeight: 800,
                      borderRadius: 50,
                      boxShadow: `0 10px 30px 0 ${alpha('#0096D9', 0.5)}`,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        bgcolor: alpha('#0096D9', 0.85),
                        transform: 'scale(1.05)',
                        boxShadow: `0 15px 40px 0 ${alpha('#0096D9', 0.7)}`,
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
                        borderColor: '#0096D9',
                        backgroundColor: alpha('#0096D9', 0.08),
                        color: '#0096D9',
                      },
                    }}
                  >
                    Migrar para Attualize
                  </Button>
                </Stack>
              </m.div>
            </Box>
          </Grid>

          {/* Stats */}
          <Grid xs={12} md={6}>
            <m.div variants={varFade().inRight}>
              <Grid container spacing={3}>
                {STATS.map((stat) => (
                  <Grid key={stat.label} xs={6}>
                    <Card
                      sx={{
                        p: 3,
                        height: '100%',
                        textAlign: 'center',
                        bgcolor: alpha(theme.palette.common.white, 0.8),
                        backdropFilter: 'blur(6px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.customShadows.z16,
                        },
                      }}
                    >
                      <Iconify icon={stat.icon} width={40} sx={{ color: '#0096D9', mb: 1.5 }} />
                      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {stat.label}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </m.div>
          </Grid>
        </Grid>
      </Container>

      <SegmentFormAbrirEmpresa
        open={openWizard}
        onClose={handleCloseWizard}
        origem="site-contabilidade-para-negocios-da-area-da-saude"
      />

      <SegmentFormMigrar
        open={openMigrar}
        onClose={handleCloseMigrar}
        origem="site-contabilidade-para-negocios-da-area-da-saude"
      />
    </Box>
  );
}
