import Image from 'next/image';
import ReactPlayer from 'react-player/lazy';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  Fade,
  Stack,
  Button,
  Container,
  Typography,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

import { FormWizardAbrirEmpresa } from './FormWizardAbrirEmpresaEstetica';

const STATS = [
  {
    value: '+300',
    label: 'Clínicas de estética atendidas',
    icon: 'solar:buildings-2-bold-duotone',
  },
  {
    value: '98%',
    label: 'Satisfação dos clientes',
    icon: 'solar:heart-bold-duotone',
  },
  {
    value: '10+',
    label: 'Anos de experiência',
    icon: 'solar:medal-ribbons-bold-duotone',
  },
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
    text: 'Suporte humanizado e especializado em clínicas de estética',
    icon: 'solar:chat-round-dots-bold-duotone',
  },
];

// ----------------------------------------------------------------------

export function BannerEstetica() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [isVideoLoading, setVideoLoading] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const videoRef = useRef(null);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleTrocarContador = () => {
    try {
      const message = encodeURIComponent('Olá, tenho interesse em trocar minha contabilidade!');
      const whatsappUrl = `https://wa.me/5541996982267?text=${message}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Erro ao abrir o WhatsApp:', error);
    }
  };

  const bannerImageMobile = `${CONFIG.site.basePath}/assets/images/about/banner-6-mobile.png`;
  const bannerImageDesktop = `${CONFIG.site.basePath}/assets/images/about/banner-6.png`;

  return (
    <Box
      component="section"
      aria-label="Contabilidade especializada para clínicas de estética - Abra ou regularize sua clínica"
      sx={{
        width: '100%',
        minHeight: { xs: 'auto', md: '90vh' },
        py: { xs: 6, md: 10 },
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
            alt="Contabilidade para clínicas de estética: profissionais de beleza e gestão fiscal"
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
            alt="Contabilidade para clínicas de estética: profissionais de beleza e gestão fiscal"
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
        maxWidth="lg"
        sx={{ position: 'relative', zIndex: 2 }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { md: '1.15fr 1fr', xs: '1fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'center',
          }}
        >
          {/* Coluna de conteúdo */}
          <Stack
            spacing={3}
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              alignItems: { xs: 'center', md: 'flex-start' },
            }}
          >
            {/* Badge de autoridade + chip de oferta (viés cognitivo: escassez/valor) */}
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
                label="Contabilidade Especializada"
                size="small"
                sx={{
                  py: 1.2,
                  px: 1.5,
                  borderRadius: '20px',
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: { xs: '0.75rem', md: '0.85rem' },
                }}
              />
              <Chip
                icon={<Iconify icon="solar:verified-check-bold" width={16} />}
                label="Especialistas em clínicas de estética"
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

            {/* H1 - SEO e hierarquia */}
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
              Contabilidade para Clínicas de{' '}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(to top, ${alpha(theme.palette.primary.main, 0.5)} 50%, transparent 50%)`,
                  padding: '0 4px',
                  borderRadius: '4px',
                }}
              >
                Estética
              </Box>
            </Typography>

            {/* Subtítulo com proposta de valor e SEO */}
            <Typography
              variant="h6"
              component="p"
              sx={{
                color: 'grey.300',
                maxWidth: 520,
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                lineHeight: 1.6,
              }}
            >
              Chega de burocracia! Você cuida dos seus clientes, nós cuidamos da parte contábil e
              fiscal da sua clínica. Contabilidade especializada para estética: abertura de CNPJ,
              regularização e impostos em dia.
            </Typography>

            {/* Benefícios com ícones (clareza e escaneabilidade) */}
            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 480 }}>
              {BENEFICIOS.map((item) => (
                <Stack
                  key={item.text}
                  direction="row"
                  alignItems="flex-start"
                  spacing={1.5}
                  sx={{
                    textAlign: { xs: 'left', md: 'left' },
                    justifyContent: { xs: 'center', md: 'flex-start' },
                  }}
                >
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 0.2,
                    }}
                  >
                    <Iconify
                      icon={item.icon}
                      width={16}
                      sx={{ color: 'primary.main' }}
                    />
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

            {/* CTAs */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                pt: 1,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleOpen}
                aria-label="Abrir minha clínica de estética com a Attualize"
                startIcon={<Iconify icon="solar:buildings-2-bold-duotone" width={22} />}
                sx={{
                  py: 1.5,
                  px: 3,
                  fontWeight: 700,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                  },
                }}
              >
                Abrir Minha Clínica
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={handleTrocarContador}
                aria-label="Trocar de contador e migrar para Attualize"
                sx={{
                  py: 1.5,
                  px: 3,
                  color: 'common.white',
                  borderColor: 'common.white',
                  fontWeight: 600,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    color: 'primary.lighter',
                  },
                }}
              >
                Migrar para Attualize
              </Button>
            </Stack>

            {/* Prova social numérica (stats) - viés de consenso e números concretos */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 4 }}
              divider={
                <Box
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    width: 1,
                    height: 32,
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                    borderRadius: 1,
                  }}
                />
              }
              sx={{
                pt: 2,
                width: '100%',
                maxWidth: 520,
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              {STATS.map((stat) => (
                <Stack
                  key={stat.label}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ flexShrink: 0 }}
                >
                  <Iconify
                    icon={stat.icon}
                    width={24}
                    sx={{ color: alpha(theme.palette.primary.main, 0.9) }}
                  />
                  <Box>
                    <Typography
                      component="span"
                      sx={{
                        color: 'common.white',
                        fontWeight: 800,
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        display: 'block',
                        lineHeight: 1.2,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'grey.400',
                        fontSize: '0.7rem',
                        lineHeight: 1.2,
                        display: 'block',
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Stack>

          {/* Vídeo - prova social em conteúdo */}
          <Box
            ref={videoRef}
            sx={{
              position: 'relative',
              width: '100%',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              aspectRatio: '16/9',
              transition: 'transform 0.3s ease-in-out',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': { transform: 'scale(1.02)' },
            }}
          >
            {isVideoLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <CircularProgress color="primary" />
              </Box>
            )}
            <Fade in={!isVideoLoading} timeout={800}>
              <Box sx={{ height: '100%', opacity: isVideoLoading ? 0 : 1 }}>
                {isIntersecting && (
                  <ReactPlayer
                    url="https://www.youtube.com/watch?v=6XxCtzt1uBE&t"
                    width="100%"
                    height="100%"
                    controls
                    playing={!isMobile}
                    onReady={() => setVideoLoading(false)}
                    onError={() => setVideoLoading(false)}
                    style={{
                      opacity: isVideoLoading ? 0 : 1,
                      transition: 'opacity 0.5s ease-in',
                    }}
                  />
                )}
              </Box>
            </Fade>
          </Box>
        </Box>
      </Container>

      <FormWizardAbrirEmpresa open={open} onClose={handleClose} />
    </Box>
  );
}
