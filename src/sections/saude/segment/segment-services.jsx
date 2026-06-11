'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function SegmentServices({ segment }) {
  const theme = useTheme();

  const { accent, services } = segment;

  return (
    <Box
      id="servicos"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container component={MotionViewport}>
        <Grid container spacing={6} alignItems="center">
          <Grid xs={12} md={5}>
            <m.div variants={varFade().inLeft}>
              <Typography variant="h2" sx={{ mb: 3 }}>
                Tudo o que seu negócio precisa em{' '}
                <Box component="span" sx={{ color: accent }}>
                  um só lugar
                </Box>
              </Typography>

              <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
                {segment.servicesIntro ||
                  'Da abertura do CNPJ ao planejamento tributário avançado: cuidamos de toda a rotina contábil, fiscal e trabalhista do seu consultório ou clínica.'}
              </Typography>

              <Card
                sx={{
                  p: 3,
                  bgcolor: alpha(accent, 0.06),
                  border: `1px dashed ${alpha(accent, 0.3)}`,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Iconify
                    icon="solar:shield-check-bold-duotone"
                    width={40}
                    sx={{ color: accent, flexShrink: 0 }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <strong>Sem fidelidade nos planos mensais.</strong> Acreditamos que você fica
                    pelo atendimento, não por contrato.
                  </Typography>
                </Stack>
              </Card>
            </m.div>
          </Grid>

          <Grid xs={12} md={7}>
            <Grid container spacing={2}>
              {services.map((service) => (
                <Grid key={service} xs={12} sm={6}>
                  <m.div variants={varFade().inUp}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.grey[500], 0.04),
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: alpha(accent, 0.08),
                        },
                      }}
                    >
                      <Iconify
                        icon="solar:check-circle-bold-duotone"
                        width={22}
                        sx={{ color: '#28a745', flexShrink: 0, mt: 0.1 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {service}
                      </Typography>
                    </Stack>
                  </m.div>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
