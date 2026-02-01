'use client';

import { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

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
    website: 'https://www.vr.com.br/lp/controle-de-ponto/',
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

export function IndicacaoPartners({ indicador }) {
  const theme = useTheme();
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) {
      return undefined;
    }

    let scrollPosition = 0;
    let animationId = null;
    let isPaused = false;
    const scrollSpeed = 0.8;

    const scroll = () => {
      if (isPaused) {
        animationId = requestAnimationFrame(scroll);
        return undefined;
      }

      scrollPosition += scrollSpeed;
      
      const itemWidth = 228;
      const totalWidth = PARTNERS.length * itemWidth;
      
      if (scrollPosition >= totalWidth) {
        scrollPosition = 0;
      }
      
      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`;
      animationId = requestAnimationFrame(scroll);
      return undefined;
    };

    const handleMouseEnter = () => {
      isPaused = true;
    };
    
    const handleMouseLeave = () => {
      isPaused = false;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    animationId = requestAnimationFrame(scroll);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const indicadorNome = indicador?.nome || indicador?.razaoSocial || 'nosso cliente';

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: alpha(theme.palette.primary.main, 0.02),
        overflow: 'hidden',
      }}
    >
      <Container component={MotionViewport}>
        <Stack spacing={2} sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
            }}
          >
            Parceiros que {indicadorNome} confia
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            {indicadorNome} trabalha com a Attualize e confia em nossos parceiros estratégicos. 
            Conheça as empresas que fazem parte do ecossistema de soluções que oferecemos.
          </Typography>
        </Stack>
      </Container>

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
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
              `linear-gradient(to right, ${alpha(theme.palette.background.default, 1)}, transparent)`,
          },
          '&::after': {
            right: 0,
            background: (theme) => 
              `linear-gradient(to left, ${alpha(theme.palette.background.default, 1)}, transparent)`,
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
                bgcolor: 'background.paper',
                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                flexShrink: 0,
                position: 'relative',
                textDecoration: 'none',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.05)',
                  boxShadow: theme.shadows[8],
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
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
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
                  opacity: 1,
                  transition: 'all 0.3s ease',
                  mb: 1.5,
                  '&:hover': {
                    filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))',
                    transform: 'scale(1.05)',
                  },
                }}
                onError={(e) => {
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
