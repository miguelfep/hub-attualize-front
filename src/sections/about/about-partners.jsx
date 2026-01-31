'use client';

import { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const PARTNERS = [
  {
    name: 'VR e VA Benefícios',
    logo: 'https://www.vr.com.br/sites/default/files/VR%20Benef%C3%ADcios.png',
    website: 'https://www.vr.com.br',
  },
  {
    name: 'VR Ponto',
    logo: 'https://www.vr.com.br/sites/default/files/VR%20Benef%C3%ADcios.png',
    website: 'https://www.vr.com.br/lp/controle-de-ponto/?utm_source=google&utm_medium=cpc&utm_campaign=23350972229&utm_content=787764819547&utm_term=pontomais&gad_source=1&gad_campaignid=23350972229&gbraid=0AAAAADc_OTmY1cWbPejdf_bC0cPazOzKC&gclid=Cj0KCQiA7fbLBhDJARIsAOAqhsf5YiODvvCx1h3q5CsUSR1gQuhj52MMcMyQq3lLQGhKBIoyVrKOjmAaAnDTEALw_wcB',
  },
  {
    name: 'TotalPass',
    logo: 'https://totalpass.com/_next/static/media/totalpass-desktop-white.b37000c7.svg',
    website: 'https://www.totalpass.com.br',
  },
  {
    name: 'MedPass',
    logo: 'https://www.medpassbeneficios.com.br/lovable-uploads/6063e8a5-a834-41f5-8331-f30fbef51860.png',
    website: 'https://www.medpassbeneficios.com.br',
  },
];

// Duplicar os parceiros para criar efeito infinito
const DUPLICATED_PARTNERS = [...PARTNERS, ...PARTNERS, ...PARTNERS];

// ----------------------------------------------------------------------

export function AboutPartners() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) {
      return undefined;
    }

    let scrollPosition = 0;
    let animationId = null;
    let isPaused = false;
    const scrollSpeed = 0.8; // Velocidade do scroll (pixels por frame)

    const scroll = () => {
      if (isPaused) {
        animationId = requestAnimationFrame(scroll);
        return undefined;
      }

      scrollPosition += scrollSpeed;
      
      // Calcular largura de um conjunto de parceiros
      // Cada item tem ~180px + gap de 48px = ~228px
      const itemWidth = 228;
      const totalWidth = PARTNERS.length * itemWidth;
      
      // Reset quando chegar ao final de um conjunto
      if (scrollPosition >= totalWidth) {
        scrollPosition = 0;
      }
      
      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`;
      animationId = requestAnimationFrame(scroll);
      return undefined;
    };

    // Pausar scroll ao hover
    const handleMouseEnter = () => {
      isPaused = true;
    };
    
    const handleMouseLeave = () => {
      isPaused = false;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    // Iniciar animação
    animationId = requestAnimationFrame(scroll);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.neutral',
        overflow: 'hidden',
      }}
    >
      <Container component={MotionViewport}>
        <Typography
          variant="h2"
          sx={{
            mb: 1,
            textAlign: 'center',
          }}
        >
          Nossos Parceiros
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 6,
            textAlign: 'center',
            color: 'text.secondary',
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Trabalhamos com as melhores empresas para oferecer soluções completas aos nossos clientes
        </Typography>
      </Container>

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          bgcolor: 'background.neutral',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            width: 150,
            height: '100%',
            zIndex: 2,
            pointerEvents: 'none',
          },
          '&::before': {
            left: 0,
            background: (theme) => 
              `linear-gradient(to right, ${theme.vars.palette.background.neutral}, transparent)`,
          },
          '&::after': {
            right: 0,
            background: (theme) => 
              `linear-gradient(to left, ${theme.vars.palette.background.neutral}, transparent)`,
          },
        }}
      >
        <Stack
          ref={scrollRef}
          direction="row"
          alignItems="center"
          spacing={6}
          sx={{
            display: 'inline-flex',
            willChange: 'transform',
            py: 4,
          }}
        >
          {DUPLICATED_PARTNERS.map((partner, index) => (
            <Box
              key={`${partner.name}-${index}`}
              component="a"
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 140, sm: 160, md: 180 },
                minHeight: { xs: 100, sm: 120, md: 140 },
                p: 2.5,
                borderRadius: 2,
                bgcolor: 'grey.400',
                border: (theme) => `2px solid ${theme.vars.palette.grey[500]}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                flexShrink: 0,
                position: 'relative',
                textDecoration: 'none',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.05)',
                  boxShadow: (theme) => theme.customShadows.z8,
                  borderColor: 'primary.main',
                  bgcolor: 'grey.300',
                },
              }}
            >
              <Box
                component="img"
                src={partner.logo}
                alt={partner.name}
                loading="lazy"
                sx={{
                  maxWidth: '100%',
                  maxHeight: { xs: 50, sm: 60, md: 70 },
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                  opacity: 1,
                  transition: 'all 0.3s ease',
                  mb: 1.5,
                  '&:hover': {
                    filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))',
                    transform: 'scale(1.05)',
                  },
                }}
                onError={(e) => {
                  // Fallback se a imagem não existir
                  e.target.style.display = 'none';
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'text.primary',
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8125rem' },
                  fontWeight: 600,
                  textAlign: 'center',
                  mt: 0.5,
                  lineHeight: 1.2,
                  maxWidth: '100%',
                }}
              >
                {partner.name}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
