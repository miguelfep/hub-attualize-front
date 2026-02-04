import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';

export function PartnerBanners({ compact = false }) {
  const banners = [
    {
      id: 'medpass',
      image: '/assets/images/banners/medpass.png',
      link: '/medpass/solicitar',
      alt: 'MedPass - Multi Benefícios',
    },
    {
      id: 'vr-va',
      image: '/assets/images/banners/vr-va.webp',
      link: '/vr-va/solicitar',
      alt: 'VR e VA - Vale Refeição e Vale Alimentação',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (compact && banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, 4000); // Alterna a cada 4 segundos

      return () => clearInterval(interval);
    }
    return undefined;
  }, [compact, banners.length]);

  if (compact) {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: 280,
          maxHeight: 320,
          overflow: 'hidden',
          borderRadius: 1.5,
        }}
      >
        {banners.map((banner, index) => (
          <Box
            key={banner.id}
            component="a"
            href={banner.link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'block',
              textDecoration: 'none',
              overflow: 'hidden',
              borderRadius: 1.5,
              cursor: 'pointer',
              opacity: index === currentIndex ? 1 : 0,
              transform: index === currentIndex ? 'translateX(0)' : 'translateX(20px)',
              transition: 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out',
              zIndex: index === currentIndex ? 2 : 1,
              '&:hover': {
                transform: index === currentIndex ? 'scale(1.02)' : 'translateX(20px)',
                opacity: index === currentIndex ? 0.95 : 0,
              },
            }}
          >
            <Box
              component="img"
              src={banner.image}
              alt={banner.alt}
              sx={{
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'contain',
                objectPosition: 'center',
              }}
            />
          </Box>
        ))}
        
        {/* Indicadores de posição */}
        {banners.length > 1 && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 3,
            }}
          >
            {banners.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: index === currentIndex
                    ? 'primary.main'
                    : alpha('#000', 0.3),
                  transition: 'background-color 0.3s ease-in-out',
                }}
              />
            ))}
          </Stack>
        )}
      </Box>
    );
  }

  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
      {banners.map((banner) => (
        <Box
          key={banner.id}
          component="a"
          href={banner.link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'block',
            textDecoration: 'none',
            overflow: 'hidden',
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            flex: 1,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }}
        >
          <Box
            component="img"
            src={banner.image}
            alt={banner.alt}
            sx={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </Box>
      ))}
    </Stack>
  );
}
