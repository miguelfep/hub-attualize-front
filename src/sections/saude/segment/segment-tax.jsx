'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function SegmentTax({ segment }) {
  const theme = useTheme();

  const { accent, tax } = segment;

  return (
    <Box
      id="tributacao"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Pague{' '}
              <Box component="span" sx={{ color: accent }}>
                menos impostos
              </Box>
              , dentro da lei
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography sx={{ maxWidth: 760, mx: 'auto', color: 'text.secondary', lineHeight: 1.8 }}>
              {tax.intro}
            </Typography>
          </m.div>
        </Box>

        <Grid container spacing={3}>
          {tax.cards.map((card) => (
            <Grid key={card.title} xs={12} md={4}>
              <m.div variants={varFade().inUp} style={{ height: '100%' }}>
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${alpha(accent, 0.16)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.customShadows.z16,
                      borderColor: alpha(accent, 0.4),
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Iconify icon={card.icon} width={40} sx={{ color: accent, flexShrink: 0 }} />
                    <Chip
                      label={card.badge}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: alpha('#FEC615', 0.16),
                        color: '#8a6d00',
                      }}
                    />
                  </Stack>

                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                    {card.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}
                  >
                    {card.description}
                  </Typography>

                  <Stack spacing={1.5} sx={{ mt: 'auto' }}>
                    {card.bullets.map((bullet) => (
                      <Stack key={bullet} direction="row" spacing={1} alignItems="flex-start">
                        <Iconify
                          icon="solar:check-circle-bold-duotone"
                          width={20}
                          sx={{ color: '#28a745', flexShrink: 0, mt: 0.25 }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {bullet}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              </m.div>
            </Grid>
          ))}
        </Grid>

        <m.div variants={varFade().inUp}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 4,
              color: 'text.disabled',
              maxWidth: 720,
              mx: 'auto',
            }}
          >
            * Os percentuais são ilustrativos e dependem do faturamento, da atividade e do
            enquadramento de cada negócio. A estratégia ideal é definida em análise individual.
          </Typography>
        </m.div>
      </Container>
    </Box>
  );
}
