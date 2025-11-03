'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function PsychologistHero() {
  const theme = useTheme();

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
                <Typography
                  variant="h1"
                  sx={{
                    mb: 3,
                    fontSize: { xs: '2rem', md: '3rem' },
                    fontWeight: 800,
                    lineHeight: 1.2,
                  }}
                >
                  Contabilidade Especializada para{' '}
                  <Box
                    component="span"
                    sx={{
                      color: '#FEC615',
                      position: 'relative',
                      display: 'inline-block',
                    }}
                  >
                    Psicólogos
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
                  Menos Burocracia, Menos Impostos, Mais Tempo para Cuidar dos Seus Pacientes
                </Typography>
              </m.div>

              <m.div variants={varFade().inUp}>
                <Typography
                  sx={{
                    mb: 5,
                    color: 'text.secondary',
                    lineHeight: 1.8,
                  }}
                >
                  Somos especialistas em <strong>psicólogos</strong>! Entendemos sua rotina, do{' '}
                  <strong>Carnê-Leão</strong> ao <strong>Fator R</strong>. Deixe a complexidade
                  fiscal conosco e foque no que realmente importa: seus pacientes!
                </Typography>
              </m.div>

              <m.div variants={varFade().inUp}>
                <Box>
                  {/* Badge de urgência pulsante - ACIMA DO BOTÃO */}
                  <Chip
                    label="🔥 Últimas 3 vagas"
                    size="small"
                    sx={{
                      bgcolor: '#ff4757',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      mb: 2,
                      px: 2,
                      height: 28,
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 71, 87, 0.7)' },
                        '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(255, 71, 87, 0)' },
                      },
                    }}
                  />

                  {/* Botão único com destaque máximo */}
                  <Button
                    component={RouterLink}
                    href={paths.aberturaCnpjPsicologo}
                    size="large"
                    variant="contained"
                    endIcon={<Iconify icon="solar:arrow-right-bold" width={24} />}
                    sx={{
                      bgcolor: '#28a745',
                      color: 'white',
                      px: 6,
                      py: 3,
                      fontSize: { xs: '1.125rem', md: '1.25rem' },
                      fontWeight: 900,
                      borderRadius: 50,
                      boxShadow: '0 10px 30px 0 rgba(40, 167, 69, 0.5)',
                      textTransform: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      minWidth: { xs: '100%', sm: 340 },
                      '&:hover': {
                        bgcolor: '#218838',
                        transform: 'scale(1.1)',
                        boxShadow: '0 15px 40px 0 rgba(40, 167, 69, 0.7)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        animation: 'shine 2.5s ease-in-out infinite',
                      },
                      '@keyframes shine': {
                        '0%': { left: '-100%' },
                        '50%, 100%': { left: '100%' },
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    🎁 Abra seu CNPJ Grátis Agora!
                  </Button>
                </Box>
              </m.div>
            </Box>
          </Grid>

          {/* Vídeo YouTube */}
          <Grid xs={12} md={6}>
            <m.div variants={varFade().inRight}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%', // 16:9 Aspect Ratio
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: theme.customShadows.z24,
                }}
              >
                <Box
                  component="iframe"
                  src="https://www.youtube.com/embed/FPk04lV6yuw"
                  title="Contabilidade para Psicólogos - Quanto você pode economizar?"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              </Box>
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
