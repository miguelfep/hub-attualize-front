'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules'; // Importar apenas os módulos necessários
import 'swiper/css'; // Swiper CSS base
import 'swiper/css/autoplay'; // Swiper CSS para autoplay
import 'swiper/css/effect-fade'; // Swiper CSS para fade

import Image from 'next/image'; // Usando next/image para otimização de imagem































import { useTheme } from '@mui/material/styles';
import { Box, Stack, Button, Container, Typography } from '@mui/material';
import styles from './HomeBanner.module.css';

// Define os slides do banner
const slides = [
  {
    background: '/assets/background/Banner-pagina-principal-anne-monteiro-optimized.webp',
    title: 'Contabilidade Especializada',
    text: 'Se você busca uma contabilidade inteligente, digital prática e especializada no seu negócio, encontrou!',
    buttons: [
      { text: 'Abrir Empresa', link: '/abertura', color: 'success', textColor: 'white' },
      {
        text: 'Trocar de Contador',
        link: 'https://wa.me/5541996982267',
        color: 'info',
        textColor: 'white',
      },
    ],
  },
];

export default function HomeBanner() {
  const theme = useTheme();

  return (
    <Box component="section" sx={{ position: 'relative', overflow: 'hidden' }}>
      <Swiper
        modules={[Autoplay, EffectFade]} // Importar módulos específicos do Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }} // Continuar autoplay mesmo após interação
        effect="fade"
        className={styles.swiperContainer}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`slide-${index}`}>
            {' '}
            {/* Chave única */}
            <Box
              sx={{
                position: 'relative',
                height: { xs: '75vh', md: '100vh' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src={slide.background}
                alt={slide.title}
                fill // Substitui layout="fill"
                priority={index === 0} // Priorizar o carregamento do primeiro slide
                style={{ objectFit: 'cover', zIndex: -1 }} // Substitui objectFit via style
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1,
                }}
              />
              <Container sx={{ zIndex: 2 }}>
                <Stack
                  spacing={7}
                  sx={{
                    textAlign: 'left',
                    color: 'white',
                    maxWidth: 680,
                    marginTop: { xs: '10vh', md: '1vh' },
                  }}
                >
                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{ fontSize: { xs: '2rem', md: '5rem' } }}
                  >
                    {slide.title}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}>
                    {slide.text}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {slide.buttons.map((button, btnIndex) => (
                      <Button
                        key={`button-${btnIndex}`} // Chave única para os botões
                        href={button.link}
                        variant="contained"
                        size="large"
                        sx={{
                          backgroundColor: theme.palette[button.color]?.main || 'white',
                          color: button.textColor,
                        }}
                      >
                        {button.text}
                      </Button>
                    ))}
                  </Stack>
                </Stack>
              </Container>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
