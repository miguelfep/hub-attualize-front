'use client';

import { useMemo } from 'react';
import NextLink from 'next/link';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Button,
  Container,
  Typography,
  CardContent,
  CardActionArea,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';

const CONTENT_ITEMS = [
  {
    title: 'Aulão Reforma',
    description:
      'Assista ao evento exclusivo para clientes Attualize sobre os impactos da Reforma Tributária e envie seu feedback.',
    href: paths.cliente.conteudos.aulaoReforma,
    icon: 'solar:play-circle-bold-duotone',
    chip: 'Novidade',
    cta: 'Assistir agora',
    gradient: ['#3b82f6', '#9333ea'],
  },
  {
    title: 'Guia IRPF 2026',
    description:
      'Entenda o novo Imposto de Renda Mínimo, o fim da isenção de dividendos e os pontos de atenção para 2026.',
    href: paths.cliente.conteudos.guiaIRPF2026,
    icon: 'solar:pie-chart-2-bold-duotone',
    chip: 'Importante',
    cta: 'Explorar guia',
    gradient: ['#f97316', '#facc15'],
  },
  {
    title: 'Reforma Tributária',
    description:
      'Veja o guia interativo com gráficos, cronograma e checklist para se preparar para a transição até 2033.',
    href: paths.cliente.conteudos.reformaTributaria,
    icon: 'solar:diagram-up-bold-duotone',
    chip: 'Guia',
    cta: 'Ler conteúdo',
    gradient: ['#22c55e', '#0ea5e9'],
  },
];

export default function ConteudosPage() {
  const theme = useTheme();

  const cards = useMemo(
    () =>
      CONTENT_ITEMS.map((item) => {
        const [start, end] = item.gradient;
        return {
          ...item,
          gradientBackground: `linear-gradient(135deg, ${alpha(start, 0.24)} 0%, ${alpha(end, 0.32)} 100%)`,
          iconColor: alpha(end, 0.9),
        };
      }),
    []
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Stack spacing={6}>
        <Card
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            boxShadow: `0 30px 60px ${alpha(theme.palette.common.black, 0.08)}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(120% 120% at 100% 0%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 55%)`,
            }}
          />

          <Stack spacing={3} position="relative">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Logo width={40} height={40} disableLink />
              <Chip
                label="Importante"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}
              />
              <Chip
                label="Novidade"
                color="secondary"
                sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}
              />
            </Stack>

            <Stack spacing={1.5} maxWidth={600}>
              <Typography variant="h3">Aprenda e se prepare com materiais exclusivos</Typography>
              <Typography variant="body1" color="text.secondary">
                Guias, vídeos e timelines pensados para clientes Attualize acompanharem a Reforma Tributária,
                Imposto de Renda e outros temas que impactam o seu negócio.
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component={NextLink}
                href={paths.cliente.conteudos.guiaIRPF2026}
                variant="contained"
                size="large"
                startIcon={<Iconify icon="solar:compass-bold-duotone" />}
              >
                Começar pelo Guia IRPF 2026
              </Button>
              <Button
                component={NextLink}
                href={paths.cliente.conteudos.aulaoReforma}
                variant="outlined"
                size="large"
                startIcon={<Iconify icon="solar:play-circle-bold-duotone" />}
              >
                Assistir ao Aulão Reforma
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={3}>
          {cards.map((item) => (
            <Grid key={item.title} item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  bgcolor: item.gradientBackground,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <CardActionArea
                  component={NextLink}
                  href={item.href}
                  sx={{
                    height: '100%',
                    alignItems: 'stretch',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 3,
                  }}
                >
                  <CardContent sx={{ p: 0, flexGrow: 1 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha('#ffffff', 0.18),
                            color: item.iconColor,
                          }}
                        >
                          <Iconify icon={item.icon} width={24} />
                        </Box>
                        <Chip
                          label={item.chip}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: alpha('#ffffff', 0.24),
                            color: theme.palette.common.white,
                          }}
                        />
                      </Stack>
                      <Typography variant="h5">{item.title}</Typography>
                      <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.9) }}>
                        {item.description}
                      </Typography>
                    </Stack>
                  </CardContent>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="inherit"
                      endIcon={<Iconify icon="solar:arrow-right-up-bold-duotone" />}
                      sx={{
                        fontWeight: 700,
                        px: 2.5,
                        py: 1,
                        bgcolor: alpha('#ffffff', 0.92),
                        color: theme.palette.text.primary,
                        '&:hover': { bgcolor: '#fff' },
                      }}
                    >
                      {item.cta}
                    </Button>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}

