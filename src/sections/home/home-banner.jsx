import 'swiper/css';
import React from 'react';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useTheme } from '@mui/material/styles';

import { Box, Stack, Button, Container, Typography } from '@mui/material';
import styles from './HomeBanner.module.css';

const slides = [
  {
    background: '/assets/background/Banner-pagina-principal-anne-monteiro-optimized.webp', // Substitua pela imagem real
    title: 'Contabilidade Especializada',
    text: 'Se você busca uma contabilidade inteligente,digital prática e especializada no seu negócio, Encontrou!.',
    buttons: [
      { text: 'Abrir Empresa', link: '/abertura', color: 'success', textColor: 'white' },
      { text: 'Trocar de Contador', link: 'https://wa.me/554196982267', color: 'info', textColor: 'white' }
    ]
  },
  // {
  //   background: '/assets/background/Banner-pagina-principal-anne-monteiro-1005-x-950-px-3.png', // Substitua pela imagem real
  //   title: 'Especialistas em Beleza, Saúde e Bem-Estar',
  //   text: 'Contabilidade digital especializada para o seu negócio prosperar.',
  //   buttons: [
  //     { text: 'Conheça nossos Serviços', link: '/servicos', color: 'primary', textColor: 'white' },
  //     { text: 'Fale Conosco', link: '/contato', color: 'secondary', textColor: 'white' }
  //   ]
  // }
];

export default function HomeBanner() {
  const theme = useTheme();

  return (
    <Box component="section" sx={{ position: 'relative', overflow: 'hidden' }}>
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop
        autoplay={{ delay: 5000 }}
        effect="fade"
        className={styles.swiperContainer}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <Box
              sx={{
                backgroundImage: `url(${slide.background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: { xs: '75vh', md: '100vh' }, // Ajustar altura para mobile e desktop
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
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
                    marginTop: { xs: '10vh', md: '1vh' } // Ajustar margem superior para mobile e desktop
                  }}
                >
                  <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '2rem', md: '5rem' } }}>
                    {slide.title}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}>
                    {slide.text}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {slide.buttons.map((button, btnIndex) => (
                      <Button
                        key={btnIndex}
                        href={button.link}
                        variant="contained"
                        size="large"  // Aumentar o tamanho dos botões
                        sx={{ 
                          backgroundColor: theme.palette[button.color]?.main || 'white', 
                          color: button.textColor 
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
