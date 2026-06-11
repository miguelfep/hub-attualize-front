'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { DEFAULT_STEPS } from './segment-defaults';

// ----------------------------------------------------------------------

export function SegmentSteps({ segment }) {
  const theme = useTheme();

  const { accent } = segment;

  const steps = segment.steps || DEFAULT_STEPS;

  return (
    <Box
      id="como-funciona"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Como{' '}
              <Box component="span" sx={{ color: accent }}>
                funciona
              </Box>
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography sx={{ maxWidth: 680, mx: 'auto', color: 'text.secondary', lineHeight: 1.8 }}>
              Deixe seu contato que cuidamos do resto! Em 4 passos simples sua contabilidade fica em
              dia.
            </Typography>
          </m.div>
        </Box>

        <Grid container spacing={3}>
          {steps.map((step, index) => (
            <Grid key={step.title} xs={12} sm={6} md={3}>
              <m.div variants={varFade().inUp} style={{ height: '100%' }}>
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    position: 'relative',
                    bgcolor: 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.customShadows.z16,
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontSize: '3rem',
                      fontWeight: 900,
                      lineHeight: 1,
                      color: alpha(accent, 0.12),
                    }}
                  >
                    {index + 1}
                  </Box>

                  <Iconify icon={step.icon} width={40} sx={{ color: accent, mb: 2 }} />

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {step.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {step.description}
                  </Typography>
                </Card>
              </m.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
