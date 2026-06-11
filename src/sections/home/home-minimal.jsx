'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
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

const YELLOW = '#FEC615';
const BLUE = '#0096D9';

const ITEMS = [
  {
    icon: 'solar:like-bold-duotone',
    title: 'Prático',
    description:
      'Tudo o que você menos precisa é de mais burocracia na hora de cuidar da sua contabilidade. Deixe essa parte com a gente e foque no seu negócio!',
  },
  {
    icon: 'solar:monitor-bold-duotone',
    title: 'Digital',
    description:
      'Tudo o que você precisa na palma da sua mão e na tela do seu computador, onde você estiver. Chega de papel: seu bolso e o meio ambiente agradecem!',
  },
  {
    icon: 'solar:rocket-bold-duotone',
    title: 'Ágil',
    description:
      'Aqui você é atendido de forma rápida e por pessoas de verdade. Robôs e tickets infinitos não fazem parte da nossa comunicação e cultura.',
  },
];

// ----------------------------------------------------------------------

export function HomeMinimal({ sx, ...other }) {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 10, md: 16 },
        ...sx,
      }}
      {...other}
    >
      {/* Brilhos decorativos de fundo */}
      <Box
        sx={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 360,
          height: 360,
          borderRadius: '50%',
          bgcolor: alpha(YELLOW, 0.12),
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -120,
          left: -120,
          width: 360,
          height: 360,
          borderRadius: '50%',
          bgcolor: alpha(BLUE, 0.1),
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />

      <Container component={MotionViewport} sx={{ position: 'relative' }}>
        <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ mb: { xs: 6, md: 9 } }}>
          <m.div variants={varFade().inDown}>
            <Chip
              icon={<Iconify icon="solar:verified-check-bold" width={18} />}
              label="CONTABILIDADE DIGITAL"
              sx={{
                px: 1,
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: alpha(YELLOW, 0.16),
                color: '#8a6d00',
                '& .MuiChip-icon': { color: '#8a6d00' },
              }}
            />
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography variant="h2">
              O que é ser{' '}
              <Box component="span" sx={{ color: YELLOW }}>
                Attualize?
              </Box>
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography sx={{ color: 'text.secondary', maxWidth: 640, lineHeight: 1.8 }}>
              Mais do que entregar guias e balancetes: é cuidar do seu negócio com tecnologia,
              agilidade e gente de verdade do outro lado.
            </Typography>
          </m.div>
        </Stack>

        <Grid container spacing={3}>
          {ITEMS.map((item, index) => (
            <Grid key={item.title} xs={12} md={4}>
              <m.div variants={varFade().inUp} style={{ height: '100%' }}>
                <Card
                  sx={{
                    p: { xs: 4, md: 5 },
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    textAlign: { xs: 'center', md: 'left' },
                    bgcolor: alpha(theme.palette.grey[500], 0.04),
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.customShadows.z20,
                      borderColor: alpha(YELLOW, 0.5),
                      '& .minimal-icon': {
                        bgcolor: YELLOW,
                        '& svg': { color: '#333' },
                      },
                    },
                  }}
                >
                  {/* Número decorativo */}
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 20,
                      fontSize: '5rem',
                      fontWeight: 900,
                      lineHeight: 1,
                      color: alpha(YELLOW, 0.14),
                      userSelect: 'none',
                    }}
                  >
                    {`0${index + 1}`}
                  </Typography>

                  <Box
                    className="minimal-icon"
                    sx={{
                      width: 64,
                      height: 64,
                      mb: 3,
                      mx: { xs: 'auto', md: 0 },
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(YELLOW, 0.16),
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Iconify icon={item.icon} width={34} sx={{ color: '#b08a00' }} />
                  </Box>

                  <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 800 }}>
                    {item.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    {item.description}
                  </Typography>
                </Card>
              </m.div>
            </Grid>
          ))}
        </Grid>

        <m.div variants={varFade().inUp}>
          <Stack alignItems="center" sx={{ mt: { xs: 5, md: 7 } }}>
            <Button
              component={RouterLink}
              href={paths.about}
              size="large"
              color="inherit"
              endIcon={<Iconify icon="solar:double-alt-arrow-right-bold-duotone" width={20} />}
              sx={{
                fontWeight: 700,
                '&:hover': { color: '#b08a00', bgcolor: alpha(YELLOW, 0.08) },
              }}
            >
              Conheça nossa história
            </Button>
          </Stack>
        </m.div>
      </Container>
    </Box>
  );
}
