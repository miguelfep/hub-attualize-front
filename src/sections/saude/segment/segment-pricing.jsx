'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { DEFAULT_PLANS } from './segment-defaults';

// ----------------------------------------------------------------------

export function SegmentPricing({ segment }) {
  const theme = useTheme();

  const { accent, whatsappLink } = segment;

  return (
    <Box
      id="planos"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Planos Sob Medida Para o{' '}
              <Box component="span" sx={{ color: accent }}>
                Seu Sucesso
              </Box>
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography sx={{ maxWidth: 720, mx: 'auto', color: 'text.secondary', lineHeight: 1.8 }}>
              Do essencial para começar regularizado ao acompanhamento estratégico para crescer:
              escolha o plano que combina com o momento do seu negócio.
            </Typography>
          </m.div>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' },
            maxWidth: 1400,
            mx: 'auto',
            alignItems: 'stretch',
          }}
        >
          {DEFAULT_PLANS.map((plan) => (
            <m.div key={plan.title} variants={varFade().inUp} style={{ height: '100%' }}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  bgcolor: plan.isPopular
                    ? 'background.paper'
                    : alpha(theme.palette.grey[500], 0.04),
                  border: plan.isPopular
                    ? `2px solid ${accent}`
                    : `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  boxShadow: plan.isPopular ? theme.customShadows.z24 : theme.customShadows.card,
                  transform: plan.isPopular ? { md: 'scale(1.05)' } : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: plan.isPopular ? { md: 'scale(1.08)' } : 'translateY(-8px)',
                    boxShadow: theme.customShadows.z24,
                  },
                }}
              >
                {plan.isPopular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bgcolor: accent,
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: '0 0 0 8px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                    }}
                  >
                    {plan.badge}
                  </Box>
                )}

                <Box sx={{ textAlign: 'center', mb: 3, mt: plan.isPopular ? 3 : 0 }}>
                  {!plan.isPopular && (
                    <Chip
                      label={plan.badge}
                      color={plan.badgeColor}
                      size="small"
                      sx={{ mb: 2, fontWeight: 600 }}
                    />
                  )}

                  <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                    {plan.title}
                  </Typography>

                  <Chip
                    label={plan.subtitle}
                    size="small"
                    sx={{
                      mb: 1,
                      bgcolor: alpha(accent, 0.12),
                      color: accent,
                      fontWeight: 600,
                    }}
                  />

                  <Typography
                    variant="caption"
                    sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.6, px: 2 }}
                  >
                    {plan.description}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'text.disabled',
                      mt: 2,
                      fontSize: '0.75rem',
                    }}
                  >
                    {plan.limit}
                  </Typography>
                </Box>

                <Stack spacing={2} sx={{ flex: 1, mb: 4 }}>
                  {plan.features.map((feature) => (
                    <Stack key={feature.title} direction="row" spacing={1} alignItems="flex-start">
                      <Iconify
                        icon="solar:check-circle-bold"
                        width={20}
                        sx={{ color: '#28a745', flexShrink: 0, mt: 0.25 }}
                      />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        <strong style={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {feature.title}
                        </strong>{' '}
                        <Box component="span" sx={{ color: 'text.secondary' }}>
                          {feature.description}
                        </Box>
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  component="a"
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth
                  size="large"
                  variant="contained"
                  sx={{
                    bgcolor: accent,
                    color: 'white',
                    fontWeight: 700,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: alpha(accent, 0.85),
                    },
                  }}
                >
                  Consultar Valores
                </Button>
              </Card>
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
