'use client';

import { m } from 'framer-motion';

import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Stack, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const ACCENT = '#0096D9';

const SERVICES = [
  {
    icon: 'solar:pallete-2-bold-duotone',
    title: 'Beleza e Estética',
    description:
      'Contabilidade e gestão financeira para seu salão de beleza, clínica de estética e barbearia.',
    href: paths.esteticaHome,
  },
  {
    icon: 'solar:heart-pulse-bold-duotone',
    title: 'Saúde',
    description:
      'Contabilidade especializada para médicos, dentistas, fisioterapeutas, clínicas e consultórios.',
    href: paths.saudeHome,
  },
  {
    icon: 'solar:hand-heart-bold-duotone',
    title: 'Bem-Estar',
    description:
      'Contabilidade para terapeutas, estúdios, academias e profissionais do bem-estar.',
    href: paths.terapeutasHome,
  },
  {
    icon: 'solar:chat-round-bold-duotone',
    title: 'Psicólogos',
    description:
      'Serviços exclusivos para psicólogos: do carnê-leão ao CNPJ, com análise de Fator R.',
    href: paths.psychologistHome,
  },
  {
    icon: 'solar:users-group-rounded-bold-duotone',
    title: 'Profissional Parceiro',
    description:
      'Lei do Salão Parceiro: formalização para cabeleireiros, barbeiros, manicures e esteticistas.',
    href: paths.profissionalParceiroHome,
  },
  {
    icon: 'solar:case-minimalistic-bold-duotone',
    title: 'Prestadores de Serviços',
    description: 'Apoio contábil completo para PJ que presta serviços em qualquer área.',
    href: paths.prestadoresServicosHome,
  },
];

// ----------------------------------------------------------------------

const HomeServicesSection = () => {
  const theme = useTheme();

  return (
    <Box component="section" id="especialidades" sx={{ py: { xs: 10, md: 16 } }}>
      <MotionViewport>
        <Container>
          <Stack spacing={3} alignItems="center" textAlign="center" sx={{ mb: { xs: 6, md: 8 } }}>
            <m.div variants={varFade().inDown}>
              <Typography variant="h2" component="h2">
                Principais áreas de{' '}
                <Box component="span" sx={{ color: ACCENT }}>
                  atuação
                </Box>
              </Typography>
            </m.div>
            <m.div variants={varFade().inDown}>
              <Typography sx={{ color: 'text.secondary', maxWidth: 640, lineHeight: 1.8 }}>
                Não somos uma contabilidade genérica: cada segmento tem uma página, um time e um
                planejamento tributário feitos sob medida. Encontre o seu:
              </Typography>
            </m.div>
          </Stack>

          <Grid container spacing={3}>
            {SERVICES.map((service) => (
              <Grid key={service.title} xs={12} sm={6} md={4}>
                <m.div variants={varFade().inUp} style={{ height: '100%' }}>
                  <Card
                    {...(service.href && { component: RouterLink, href: service.href })}
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
                      border: `1px solid transparent`,
                      transition: 'all 0.3s ease',
                      ...(service.href && {
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.customShadows.z16,
                          borderColor: alpha(ACCENT, 0.4),
                        },
                      }),
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        mb: 2.5,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(ACCENT, 0.1),
                      }}
                    >
                      <Iconify icon={service.icon} width={34} sx={{ color: ACCENT }} />
                    </Box>

                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                      {service.title}
                    </Typography>

                    <Typography variant="body2" sx={{ color: 'text.secondary', flexGrow: 1 }}>
                      {service.description}
                    </Typography>

                    {service.href && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ mt: 2.5, color: ACCENT }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Ver mais
                        </Typography>
                        <Iconify icon="solar:double-alt-arrow-right-bold-duotone" width={18} />
                      </Stack>
                    )}
                  </Card>
                </m.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </MotionViewport>
    </Box>
  );
};

export default HomeServicesSection;
