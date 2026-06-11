'use client';

import Image from 'next/image';
import { m } from 'framer-motion';

import { alpha, useTheme } from '@mui/material/styles';
import { Box, Chip, Grid, Stack, Container, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const SISTEMA_BENEFICIOS = [
  {
    icon: 'solar:chart-2-bold-duotone',
    text: 'Indicadores e dashboards do seu negócio sempre atualizados',
  },
  {
    icon: 'solar:bill-list-bold-duotone',
    text: 'Notas fiscais, guias e documentos centralizados em um só lugar',
  },
  {
    icon: 'solar:smartphone-bold-duotone',
    text: 'Acesso de onde estiver, no computador ou no celular',
  },
];

// ----------------------------------------------------------------------

export function SegmentSistema({ segment }) {
  const theme = useTheme();

  const { accent } = segment;

  const imagePath = `${CONFIG.site.basePath}/assets/images/estetica/grafico-hub.webp`;

  return (
    <Box
      component="section"
      id="sistema"
      aria-label="Sistema de gestão para clientes Attualize"
      sx={{
        bgcolor: 'background.neutral',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Container
        component={MotionViewport}
        sx={{ py: { xs: 10, md: 14 }, position: 'relative', zIndex: 1 }}
      >
        <Stack spacing={2} sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <m.div variants={varFade().inUp}>
            <Chip
              icon={<Iconify icon="solar:monitor-bold-duotone" width={18} />}
              label="TECNOLOGIA"
              sx={{
                py: 1.2,
                px: 2,
                borderRadius: '20px',
                backgroundColor: alpha(accent, 0.1),
                color: accent,
                fontWeight: 700,
                fontSize: '0.8rem',
                '& .MuiChip-icon': { color: accent },
              }}
            />
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                lineHeight: 1.25,
                maxWidth: 720,
                mx: 'auto',
              }}
            >
              Acompanhe sua empresa em tempo real
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.98rem', md: '1.06rem' },
                lineHeight: 1.8,
                maxWidth: 720,
                mx: 'auto',
              }}
            >
              Além disso, investimos em tecnologia para lhe entregar tudo de maneira fácil e
              prática. Cliente Attualize acompanha toda sua empresa em um{' '}
              <Box component="span" sx={{ color: accent, fontWeight: 700 }}>
                Sistema completo com indicadores, dashboards
              </Box>{' '}
              e informações sempre atualizadas sobre o seu negócio.
            </Typography>
          </m.div>
        </Stack>

        <Grid container spacing={{ xs: 5, md: 6 }} justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            <m.div variants={varFade().inUp}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 760,
                  mx: 'auto',
                  aspectRatio: '16 / 10',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow:
                    theme.customShadows?.z24 ||
                    `0 24px 60px ${alpha(theme.palette.common.black, 0.16)}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  bgcolor: 'background.paper',
                }}
              >
                <Image
                  src={imagePath}
                  alt="Sistema da Attualize com indicadores e dashboards do seu negócio"
                  fill
                  sizes="(min-width: 1200px) 760px, (min-width: 900px) 80vw, 100vw"
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
                />
              </Box>
            </m.div>
          </Grid>

          <Grid item xs={12} md={10} lg={8}>
            <m.div variants={varFade().inUp}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 2, md: 4 }}
                justifyContent="center"
              >
                {SISTEMA_BENEFICIOS.map((item) => (
                  <Stack
                    key={item.text}
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    sx={{ flex: 1 }}
                  >
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: alpha(accent, 0.12),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon={item.icon} width={20} sx={{ color: accent }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {item.text}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
