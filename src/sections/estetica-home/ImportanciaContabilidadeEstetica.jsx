'use client';

import React from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';

import { alpha, useTheme } from '@mui/material/styles';
import { Box, Chip, Grid, Stack, Container, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { CallToAction } from '../call-to-action/CallToAction';
import { BENEFICIOS_IMPORTANCIA } from './importanciaEsteticaData';

export function ImportanciaContabilidadeEstetica() {
  const theme = useTheme();
  const imagePath = `${CONFIG.site.basePath}/assets/images/estetica/grafico-hub.webp`;
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
              label="CONTABILIDADE PARA CLÍNICAS DE ESTÉTICA"
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
              Como pagar menos imposto, evitar multas e crescer com segurança
            </Typography>
          </m.div>
        </Stack>

        {/* Texto principal logo após o título, antes da imagem */}
        <m.div variants={varFade().inUp}>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.98rem', md: '1.06rem' },
              lineHeight: 1.8, // Mantive um respiro confortável entre linhas
              maxWidth: 720,   // Aumentei levemente para as quebras ficarem mais naturais
              mx: 'auto',
              textAlign: 'center',
              mb: { xs: 5, md: 7 },
            }}
          >
            {/* Bloco 1: Contexto */}
            <Box component="span" sx={{ display: 'block', mb: 2 }}>
              A contabilidade para clínicas de estética envolve escolha correta de CNAE, enquadramento tributário (Simples, Presumido ou Real),
              aplicação da Lei do Salão Parceiro, regularização sanitária e planejamento tributário para reduzir impostos legalmente.
            </Box>

            {/* Bloco 2: Alerta */}
            <Box component="span" sx={{ display: 'block', mb: 3 }}>
              Se esses pontos não forem estruturados corretamente, sua clínica pode{' '}
              <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                pagar imposto a mais ou até sofrer interdição.
              </Box>
            </Box>

            {/* Bloco 3: Solução e Diferencial */}
            <Box component="span" sx={{ display: 'block', mb: 2 }}>
              A Attualize é especialista no setor da estética e saúde, e ajuda clínicas a trabalharem de forma regular, segura e financeiramente estratégica.
            </Box>

            {/* Bloco 4: Tecnologia */}
            <Box component="span" sx={{ display: 'block' }}>
              Além disso, investimos em tecnologia para lhe entregar tudo de maneira fácil e prática. Cliente Attualize acompanha toda
              sua empresa em um{' '}
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                Sistema completo com indicadores, dashboards
              </Box>{' '}
              e informações sempre atualizadas sobre o seu negócio.
            </Box>
          </Typography>
        </m.div>

        <Grid container spacing={{ xs: 6, md: 7 }} justifyContent="center">
          {/* Imagem centralizada em grid 12 */}
          <Grid xs={12} md={10} lg={8}>
            <m.div variants={varFade().inUp}>
              <Box
                sx={{
                  my: { xs: 4, md: 6 },
                }}
              >
                {/* Imagem principal - visão geral dos números da clínica */}
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
                    alt="Dashboard financeiro trazendo clareza para a gestão da clínica de estética"
                    fill
                    priority
                    sizes="(min-width: 1200px) 760px, (min-width: 900px) 80vw, 100vw"
                    style={{ objectFit: 'contain', objectPosition: 'center' }}
                  />
                </Box>
              </Box>
            </m.div>
          </Grid>

          {/* Benefícios e CTA logo abaixo da imagem */}
          <Grid xs={12} md={10} lg={8}>
            <m.div variants={varFade().inUp}>
              <Stack
                spacing={3.5}
                sx={{
                  textAlign: 'center',
                  alignItems: 'center',
                  mx: 'auto',
                }}
              >
                <Stack spacing={2.5} sx={{ py: 1, width: '100%', maxWidth: 620 }}>
                  {BENEFICIOS_IMPORTANCIA.map((item) => (
                    <Stack
                      key={item.title}
                      direction="row"
                      alignItems="flex-start"
                      spacing={2}
                      sx={{
                        justifyContent: { xs: 'center', md: 'flex-start' },
                        textAlign: { xs: 'center', md: 'left' },
                        width: '100%',
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
                      <Stack
                        spacing={0.5}
                        sx={{
                          alignItems: { xs: 'center', md: 'flex-start' },
                          width: '100%',
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={700}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                          {item.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
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
    </Box>
  );
}
