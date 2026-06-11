'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const SEGMENTS = [
  {
    icon: 'solar:stethoscope-bold-duotone',
    title: 'Médicos',
    description: 'Contabilidade e gestão financeira para você e seu consultório',
    href: paths.medicosHome,
  },
  {
    icon: 'mdi:tooth',
    title: 'Dentistas',
    description: 'Contabilidade e gestão financeira para você e sua clínica odontológica',
    href: paths.dentistasHome,
  },
  {
    icon: 'solar:chat-round-bold-duotone',
    title: 'Psicólogos',
    description: 'Contabilidade e gestão financeira para você e seu consultório',
    href: paths.psychologistHome,
  },
  {
    icon: 'solar:body-bold-duotone',
    title: 'Fisioterapeutas',
    description: 'Contabilidade e gestão financeira para você e seu espaço',
    href: paths.fisioterapeutasHome,
  },
  {
    icon: 'solar:leaf-bold-duotone',
    title: 'Nutricionistas',
    description: 'Contabilidade e gestão financeira para consultórios de nutrição',
    href: paths.nutricionistasHome,
  },
  {
    icon: 'solar:user-speak-rounded-bold-duotone',
    title: 'Fonoaudiólogos',
    description: 'Contabilidade e gestão financeira para você e seu consultório',
    href: paths.fonoaudiologosHome,
  },
  {
    icon: 'solar:hand-heart-bold-duotone',
    title: 'Terapeutas e Bem-Estar',
    description: 'Contabilidade para terapeutas e profissionais do bem-estar',
    href: paths.terapeutasHome,
  },
  {
    icon: 'solar:hospital-bold-duotone',
    title: 'Clínicas e Consultórios',
    description: 'Gestão contábil completa para clínicas de todas as especialidades',
  },
];

// ----------------------------------------------------------------------

export function SaudeSegments() {
  const theme = useTheme();

  return (
    <Box
      id="segmentos"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Atendemos diversos negócios e profissionais da{' '}
              <Box component="span" sx={{ color: '#0096D9' }}>
                área da saúde
              </Box>
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography sx={{ maxWidth: 720, mx: 'auto', color: 'text.secondary', lineHeight: 1.8 }}>
              Se você tem um negócio na área da saúde e precisa de uma contabilidade que entenda a
              fundo o seu dia a dia — do conselho de classe à tributação da sua atividade — você
              encontrou!
            </Typography>
          </m.div>
        </Box>

        <Grid container spacing={3}>
          {SEGMENTS.map((segment) => (
            <Grid key={segment.title} xs={12} sm={6} md={3}>
              <m.div variants={varFade().inUp} style={{ height: '100%' }}>
                <Card
                  {...(segment.href && { component: RouterLink, href: segment.href })}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                    bgcolor: alpha(theme.palette.grey[500], 0.04),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.customShadows.z16,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      mb: 2,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha('#0096D9', 0.1),
                    }}
                  >
                    <Iconify icon={segment.icon} width={36} sx={{ color: '#0096D9' }} />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {segment.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'text.secondary', flexGrow: 1 }}>
                    {segment.description}
                  </Typography>

                  {segment.href && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ mt: 2, color: '#0096D9' }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Página exclusiva
                      </Typography>
                      <Iconify icon="solar:double-alt-arrow-right-bold-duotone" width={16} />
                    </Stack>
                  )}
                </Card>
              </m.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
