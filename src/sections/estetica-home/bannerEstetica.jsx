import Image from 'next/image';
import ReactPlayer from 'react-player/lazy';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Fade,
  Stack,
  Button,
  Container,
  Typography,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';

import { CONFIG } from 'src/config-global';

import { FormWizardAbrirEmpresa } from './FormWizardAbrirEmpresaEstetica';

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
      aria-label="Banner de contabilidade para clínicas de estética"
      sx={{
        width: '100%',
        height: { md: '85vh' },
        minHeight: '600px',
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 4 },
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Imagem de fundo otimizada com next/image */}
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
        {/* Imagem mobile - LCP element crítico */}
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
            alt="Banner contabilidade clínicas de estética"
            fill
            priority
            fetchPriority="high"
            quality={85}
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        </Box>
        {/* Imagem desktop */}
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
            alt="Banner contabilidade clínicas de estética"
            fill
            priority
            fetchPriority="high"
            quality={85}
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        </Box>
        {/* Overlay gradiente */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: {
              xs: `linear-gradient(to bottom, ${alpha('#000000', 0.7)}, ${alpha('#000000', 0.6)})`,
              md: `linear-gradient(to right, ${alpha('#000000', 0.7)}, ${alpha('#000000', 0.6)})`,
            },
            zIndex: 1,
          }}
        />
      </Box>
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { md: '1.2fr 1fr', xs: '1fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'center',
          }}
        >
          <Stack
            spacing={3}
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              alignItems: { xs: 'center', md: 'flex-start' },
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                py: 1,
                px: 2,
                mb: 1,
                borderRadius: '20px',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                fontWeight: 'fontWeightMedium',
                fontSize: { xs: '0.8rem', md: '0.9rem' },
              }}
            >
              Sucesso e Beleza
            </Box>

            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: 'common.white',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                fontSize: {
                  xs: '2rem',
                  sm: '2.5rem',
                  md: '3rem'
                },
                lineHeight: 1.2,
              }}
            >
              Contabilidade para Clínicas de{' '}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(to top, ${alpha(theme.palette.primary.main, 0.4)} 50%, transparent 50%)`,
                  padding: '0 2px',
                  }}
              >
                Estética
              </Box>
            </Typography>

            <Typography
              variant="h6"
              component="p"
              sx={{
                color: 'grey.300',
                maxWidth: 520,
                fontSize: {
                  xs: '1rem',
                  md: '1.1rem'
                },
              }}
            >
              Chega de burocracia! Você cuida dos seus clientes, nós cuidamos da parte contábil e fiscal da sua clínica!
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                pt: 2,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleOpen}
                aria-label="Abrir minha empresa de estética"
                sx={{
                  py: 1.5,
                  px: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
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
                aria-label="Trocar de contador"
                sx={{
                  py: 1.5,
                  px: 3,
                  color: 'common.white',
                  borderColor: 'common.white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                  },
                }}
              >
                Migrar para Attualize
              </Button>
            </Stack>
          </Stack>

          <Box
            ref={videoRef}
            sx={{
              position: 'relative',
              width: '100%',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              aspectRatio: '16/9',
              transition: 'transform 0.3s ease-in-out',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                transform: 'scale(1.03)',
              },
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
