'use client';

import { m } from 'framer-motion';
import React, { useState } from 'react';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Container,
  Typography,
} from '@mui/material';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { GradeFotos } from './GradeFotos';
import { CallToAction } from '../call-to-action/CallToAction';
import { BENEFICIOS_IMPORTANCIA } from './importanciaEsteticaData';

export function ImportanciaContabilidadeEstetica() {
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);
  const imagePath = `${CONFIG.site.basePath}/assets/images/estetica/clinica.webp`;
  const imagePathSecundaria = `${CONFIG.site.basePath}/assets/images/about/time-operacao.webp`;

  return (
    <Box
      component="section"
      aria-label="Importância da contabilidade para clínicas de estética"
      sx={{
        bgcolor: 'background.neutral',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Container
        component={MotionViewport}
        sx={{ py: { xs: 10, md: 16 }, position: 'relative', zIndex: 1 }}
      >
        {/* Título e badge */}
        <Stack spacing={2} sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
          <m.div variants={varFade().inUp}>
            <Chip
              icon={<Iconify icon="solar:document-text-bold-duotone" width={18} />}
              label="Por que a contabilidade importa"
              size="large"
              sx={{
                py: 1.2,
                px: 2,
                borderRadius: '20px',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '0.8rem',
                '& .MuiChip-icon': { color: 'primary.main' },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                  opacity: 0.85,
                },
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
              Sua clínica de estética livre de burocracia e dos sustos fiscais
            </Typography>
          </m.div>
        </Stack>

        <Grid
          container
          spacing={{ xs: 6, md: 6 }}
          alignItems="center"
          direction={{ xs: 'column-reverse', md: 'row' }}
        >
          <Grid xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <m.div
              variants={varFade().inLeft}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '550px',
                aspectRatio: '1/1'
              }}
            >

              <GradeFotos srcPrincipal={imagePath} srcSecundaria={imagePathSecundaria} alt="Gestão financeira" />
            </m.div>
          </Grid>

          {/* Coluna direita: texto + benefícios + CTA */}
          <Grid xs={12} md={6}>
            <m.div variants={varFade().inRight}>
              <Stack
                spacing={3}
                sx={{ textAlign: { xs: 'center', md: 'left' }, alignItems: { xs: 'center', md: 'flex-start' } }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    lineHeight: 1.75,
                    maxWidth: 540,
                  }}
                >
                  Gerir uma clínica de estética exige mais do que um serviço de qualidade — é
                  essencial ter uma <strong>gestão financeira estratégica</strong>. Nós combinamos
                  praticidade e expertise para que você foque no que realmente importa:{' '}
                  <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    o bem-estar dos seus clientes
                  </Box>
                  .
                </Typography>

                <Stack spacing={2.5} sx={{ py: 2, width: '100%', maxWidth: 520 }}>
                  {BENEFICIOS_IMPORTANCIA.map((item) => (
                    <Stack
                      key={item.title}
                      direction="row"
                      alignItems="flex-start"
                      spacing={2}
                      sx={{
                        justifyContent: { xs: 'center', md: 'flex-start' },
                        textAlign: { xs: 'center', md: 'left' },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexShrink: 0,
                          p: 1.25,
                          borderRadius: '50%',
                          color: 'primary.main',
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                        }}
                      >
                        <Iconify icon={item.icon} width={26} />
                      </Box>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                          {item.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    width: '100%',
                  }}
                >
                  <CallToAction pageSource="paginaEstetica" />
                </Box>
              </Stack>
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </Box >
  );
}
