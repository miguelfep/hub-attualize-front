import React from 'react';
import { m } from 'framer-motion';

import { alpha, useTheme } from '@mui/material/styles';
import { Box, Grid, Stack, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { CallToAction } from '../call-to-action/CallToAction';

export function ImportanciaContabilidadeEstetica() {
  const theme = useTheme();

  const beneficios = [
    {
      icon: 'solar:chart-line-duotone',
      title: 'Organização Fiscal',
      description: 'Estruture suas finanças e evite surpresas com o fisco.',
    },
    {
      icon: 'solar:shield-check-line-duotone',
      title: 'Otimização de Custos',
      description: 'Identificamos oportunidades para aumentar sua margem de lucro.',
    },
    {
      icon: 'solar:notebook-line-duotone',
      title: 'Decisões Inteligentes',
      description: 'Tenha relatórios claros para guiar o crescimento do seu negócio.',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.neutral', overflow: 'hidden' }}>
      <Container
        component={MotionViewport}
        sx={{ py: { xs: 10, md: 15 } }}
      >
        <m.div variants={varFade().inUp}>
          <Typography
            variant="h3"
            component="h2"
            sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}
          >
            A Contabilidade que Entende a{' '}
            <Box
              component="span"
              sx={{
                color: 'primary.main',
                textDecoration: 'underline',
                textDecorationColor: alpha(theme.palette.primary.main, 0.4),
                textUnderlineOffset: 8,
              }}
            >
              Beleza
            </Box>{' '}
            do seu Negócio
          </Typography>
        </m.div>

        <Grid container spacing={{ xs: 8, md: 4 }} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }}>
          <Grid item xs={12} md={6}>
            <m.div variants={varFade().inLeft}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    filter: 'blur(40px)',
                    zIndex: -1,
                  },
                }}
              >
                <Box
                  component="img"
                  src="/assets/images/estetica/animacao-site.png"
                  alt="Contabilidade para Estética"
                  sx={{
                    width: '100%',
                    maxWidth: 480,
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </m.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <m.div variants={varFade().inRight}>
              <Stack spacing={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Gerir uma clínica de estética exige mais do que um serviço de qualidade, é
                  essencial ter uma gestão financeira estratégica. Nós combinamos praticidade e expertise
                  para que você foque no que realmente importa: <b>o bem-estar dos seus clientes</b>
                </Typography>

                <Stack spacing={2} sx={{ py: 3 }}>
                  {beneficios.map((item, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{
                        justifyContent: { xs: 'center', md: 'flex-start' },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          p: 1.5,
                          borderRadius: '50%',
                          color: 'primary.main',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        }}
                      >
                        <Iconify icon={item.icon} width={28} />
                      </Box>
                      <Stack>
                        <Typography variant="h6" component="p">{item.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {item.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>

                <Box sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                }}>
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
