'use client';

import { m } from 'framer-motion';

import { alpha, useTheme } from '@mui/material/styles';
import { Box, Chip, Grid, Paper, Stack, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { SectionGradientBackground } from './SectionGradientBackground';

// ----------------------------------------------------------------------

const CHECKLIST_CNAE = [
  { text: '9602-5/02: Atividades de estética e outros serviços de beleza' },
  { text: '8690-9/01: Atividades de práticas integrativas e complementares' },
  { text: 'Outros CNAEs secundários conforme os serviços oferecidos' },
];

const CHECKLIST_VIGILANCIA = [
  { text: 'Alvará de Licença e Funcionamento' },
  { text: 'Manual de Boas Práticas e POPs' },
  { text: 'Registro de manutenção de equipamentos' },
  { text: 'Controle de esterilização de materiais' },
  { text: 'Estrutura física adequada (pias, ventilação, etc.)' },
];

// ----------------------------------------------------------------------

export function ChecklistRegularizacao() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const yellow = theme.palette.yellow ?? {};
  const blue = theme.palette.blue ?? {};
  const brown = theme.palette.brown ?? {};

  const YELLOW_MAIN = yellow.main ?? theme.palette.primary.main;
  const BLUE_MAIN = blue.main ?? '#0096D9';
  const BLUE_LIGHTER = blue.lighter ?? '#D9E3F5';
  const BROWN_MAIN = brown.main ?? '#645658';
  const BROWN_LIGHTER = brown.lighter ?? '#F5F3F2';

  const getCardSx = (mainColor, lighterColor) => ({
    p: { xs: 3, sm: 4, md: 5 },
    height: 1,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.35s ease',
    border: '1px solid',
    borderColor: isLight ? alpha(mainColor, 0.2) : alpha(mainColor, 0.35),
    bgcolor: isLight ? theme.palette.background.paper : alpha(theme.palette.background.paper, 0.4),
    boxShadow: isLight
      ? `0 4px 24px ${alpha(mainColor, 0.08)}, 0 1px 0 ${alpha(mainColor, 0.06)}`
      : `0 4px 24px ${alpha(theme.palette.common.black, 0.25)}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: 4,
      height: '100%',
      background: `linear-gradient(180deg, ${mainColor}, ${alpha(mainColor, 0.5)})`,
    },
    '&:hover': {
      borderColor: mainColor,
      transform: 'translateY(-6px)',
      boxShadow: (t) => t.customShadows?.z24 ?? `0 20px 40px ${alpha(mainColor, 0.18)}`,
    },
  });

  const blueCardSx = getCardSx(BLUE_MAIN, BLUE_LIGHTER);
  const brownCardSx = getCardSx(BROWN_MAIN, BROWN_LIGHTER);

  return (
    <SectionGradientBackground aria-labelledby="checklist-regularizacao-title">
      <Container component={MotionViewport}>
        <Stack spacing={3} sx={{ textAlign: 'center', mb: { xs: 8, md: 11 } }}>
          <m.div variants={varFade().inDown}>
            <Chip
              icon={<Iconify icon="solar:clipboard-list-bold" width={18} />}
              label="Checklist de regularização"
              size="medium"
              sx={{
                fontWeight: 700,
                bgcolor: alpha(YELLOW_MAIN, isLight ? 0.14 : 0.22),
                color: yellow.dark ?? YELLOW_MAIN,
                border: `1px solid ${alpha(YELLOW_MAIN, 0.35)}`,
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography
              id="checklist-regularizacao-title"
              component="h2"
              variant="h2"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Sua clínica de estética{' '}
              <Box component="span" sx={{ color: YELLOW_MAIN, position: 'relative' }}>
                100% em conformidade
              </Box>
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: 560,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.0625rem' },
              }}
            >
              Documentação obrigatória para clínicas de estética: CNAE e Vigilância Sanitária em dia. Evite multas e interdições — cuidamos da burocracia para você focar nos procedimentos.
            </Typography>
          </m.div>
        </Stack>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid item xs={12} md={6}>
            <m.div variants={varFade().inLeft}>
              <Paper component="article" sx={blueCardSx}>
                <Stack spacing={3} sx={{ pl: 0.5 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(BLUE_MAIN, 0.12),
                        color: BLUE_MAIN,
                      }}
                    >
                      <Iconify icon="solar:card-2-bold-duotone" width={28} />
                    </Box>
                    <Box>
                      <Typography component="h3" variant="h5" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                        CNAEs para clínica de estética
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Classificação Nacional de Atividades Econômicas
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={2} component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                    {CHECKLIST_CNAE.map((item) => (
                      <Stack
                        key={item.text}
                        component="li"
                        direction="row"
                        spacing={2}
                        alignItems="flex-start"
                        sx={{
                          py: 1,
                          px: 2,
                          borderRadius: 1.5,
                          bgcolor: alpha(BLUE_MAIN, 0.05),
                          transition: 'background 0.2s',
                          '&:hover': { bgcolor: alpha(BLUE_MAIN, 0.1) },
                        }}
                      >
                        <Iconify
                          icon="solar:check-circle-bold"
                          width={22}
                          sx={{ color: BLUE_MAIN, mt: 0.25, flexShrink: 0 }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {item.text}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </m.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <m.div variants={varFade().inRight}>
              <Paper component="article" sx={brownCardSx}>
                <Stack spacing={3} sx={{ pl: 0.5 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(BROWN_MAIN, 0.12),
                        color: BROWN_MAIN,
                      }}
                    >
                      <Iconify icon="solar:shield-check-bold-duotone" width={28} />
                    </Box>
                    <Box>
                      <Typography component="h3" variant="h5" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                        Vigilância Sanitária
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Exigências e documentação obrigatória
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={2} component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                    {CHECKLIST_VIGILANCIA.map((item) => (
                      <Stack
                        key={item.text}
                        component="li"
                        direction="row"
                        spacing={2}
                        alignItems="flex-start"
                        sx={{
                          py: 1,
                          px: 2,
                          borderRadius: 1.5,
                          bgcolor: alpha(BROWN_MAIN, 0.06),
                          transition: 'background 0.2s',
                          '&:hover': { bgcolor: alpha(BROWN_MAIN, 0.12) },
                        }}
                      >
                        <Iconify
                          icon="solar:check-circle-bold"
                          width={22}
                          sx={{ color: BROWN_MAIN, mt: 0.25, flexShrink: 0 }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {item.text}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </SectionGradientBackground>
  );
}
