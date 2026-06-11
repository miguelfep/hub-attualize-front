'use client';

import Image from 'next/image';
import { m } from 'framer-motion';
import { useState, useCallback } from 'react';

import { alpha, useTheme } from '@mui/material/styles';
import { Box, Chip, Stack, Button, Container, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { SegmentFormMigrar } from 'src/sections/saude/segment/segment-form-migrar';
import { SegmentFormAbrirEmpresa } from 'src/sections/saude/segment/segment-form-abrir-empresa';

// ----------------------------------------------------------------------

const ACCENT = '#0096D9';
const YELLOW = '#FEC615';

const HERO_STATS = [
  { icon: 'solar:calendar-bold-duotone', label: '+10 anos de experiência' },
  { icon: 'solar:users-group-rounded-bold-duotone', label: '+200 clientes em todo o Brasil' },
  { icon: 'solar:chat-round-dots-bold-duotone', label: 'Atendimento humanizado' },
];

const BENEFICIOS = [
  {
    text: 'Menos burocracia: abertura de CNPJ e regularização fiscal simplificadas',
    icon: 'solar:document-text-bold-duotone',
  },
  {
    text: 'Você foca nos seus clientes; nós cuidamos da parte contábil e fiscal',
    icon: 'solar:users-group-two-rounded-bold-duotone',
  },
  {
    text: 'Suporte humanizado e especializado em beleza, saúde e bem-estar',
    icon: 'solar:chat-round-dots-bold-duotone',
  },
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

  const bannerImageMobile = `${CONFIG.site.basePath}/assets/images/about/banner-6-mobile.png`;
  const bannerImageDesktop = `${CONFIG.site.basePath}/assets/images/about/banner-6.png`;

  return (
    <Box
      component="section"
      aria-label="Contabilidade digital especializada em beleza, saúde e bem-estar"
      sx={{
        width: '100%',
        minHeight: { xs: 'auto', md: '90vh' },
        py: { xs: 6, md: 10 },
        pt: { xs: 14, md: 18 },
        px: { xs: 2, md: 4 },
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Imagem de fundo - LCP */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      >
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <Image
            src={bannerImageMobile}
            alt="Attualize Contábil - contabilidade digital especializada em beleza, saúde e bem-estar"
            fill
            priority
            fetchPriority="high"
            quality={85}
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </Box>
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <Image
            src={bannerImageDesktop}
            alt="Attualize Contábil - contabilidade digital especializada em beleza, saúde e bem-estar"
            fill
            priority
            fetchPriority="high"
            quality={85}
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: {
              xs: `linear-gradient(to bottom, ${alpha('#000000', 0.72)}, ${alpha('#000000', 0.62)})`,
              md: `linear-gradient(to right, ${alpha('#000000', 0.75)}, ${alpha('#000000', 0.5)})`,
            },
            zIndex: 1,
          }}
        />
      </Box>

      <Container
        component={MotionViewport}
        maxWidth="lg"
        sx={{ position: 'relative', zIndex: 2 }}
      >
        <Stack
          spacing={3}
          sx={{
            maxWidth: 720,
            textAlign: { xs: 'center', md: 'left' },
            alignItems: { xs: 'center', md: 'flex-start' },
          }}
        >
          {/* Chips de autoridade */}
          <m.div variants={varFade().inUp}>
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              sx={{
                justifyContent: { xs: 'center', md: 'flex-start' },
                alignItems: 'center',
              }}
            >
              <Chip
                label="Contabilidade Digital Especializada"
                size="small"
                sx={{
                  py: 1.2,
                  px: 1.5,
                  borderRadius: '20px',
                  backgroundColor: alpha(ACCENT, 0.15),
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: { xs: '0.75rem', md: '0.85rem' },
                }}
              />
              <Chip
                icon={<Iconify icon="solar:verified-check-bold" width={16} />}
                label="Especialistas em beleza, saúde e bem-estar"
                size="small"
                sx={{
                  py: 1.2,
                  borderRadius: '20px',
                  backgroundColor: alpha(theme.palette.common.white, 0.12),
                  color: 'common.white',
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  '& .MuiChip-icon': { color: 'primary.lighter' },
                }}
              />
            </Stack>
          </m.div>

          {/* H1 */}
          <m.div variants={varFade().inUp}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: 'common.white',
                fontWeight: 800,
                textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                fontSize: { xs: '1.85rem', sm: '2.35rem', md: '3rem' },
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              Contabilidade inteligente para{' '}
              <Box component="span" sx={{ color: YELLOW }}>
                Beleza, Saúde e Bem-Estar
              </Box>
            </Typography>
          </m.div>

          {/* Subtítulo */}
          <m.div variants={varFade().inUp}>
            <Typography
              variant="h6"
              component="p"
              sx={{
                color: 'grey.300',
                maxWidth: 520,
                fontWeight: 400,
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                lineHeight: 1.6,
              }}
            >
              Se você busca uma contabilidade digital, prática e especializada no seu negócio,
              encontrou! Você cuida dos seus clientes, nós cuidamos do resto.
            </Typography>
          </m.div>

          {/* Benefícios */}
          <m.div variants={varFade().inUp}>
            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 480 }}>
              {BENEFICIOS.map((item) => (
                <Stack
                  key={item.text}
                  direction="row"
                  alignItems="flex-start"
                  spacing={1.5}
                  sx={{
                    textAlign: 'left',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                  }}
                >
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: alpha(ACCENT, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 0.2,
                    }}
                  >
                    <Iconify icon={item.icon} width={16} sx={{ color: 'primary.main' }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'grey.300',
                      lineHeight: 1.5,
                      fontSize: { xs: '0.8rem', md: '0.9rem' },
                    }}
                  >
                    {item.text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </m.div>

          {/* CTAs */}
          <m.div variants={varFade().inUp}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ pt: 1, width: { xs: '100%', sm: 'auto' } }}
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
                  color: 'common.white',
                  borderColor: 'common.white',
                  fontWeight: 700,
                  borderRadius: 50,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: ACCENT,
                    backgroundColor: alpha(ACCENT, 0.12),
                    color: 'primary.lighter',
                  },
                }}
              >
                Migrar para Attualize
              </Button>
            </Stack>
          </m.div>

          {/* Prova social */}
          <m.div variants={varFade().inUp}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 3 }}
              sx={{ pt: 2 }}
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              alignItems={{ xs: 'center', md: 'flex-start' }}
            >
              {HERO_STATS.map((stat) => (
                <Stack key={stat.label} direction="row" spacing={1} alignItems="center">
                  <Iconify icon={stat.icon} width={20} sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: 'grey.300', fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </m.div>
        </Stack>
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
