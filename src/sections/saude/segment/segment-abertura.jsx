'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { DEFAULT_ABERTURA_STEPS } from './segment-defaults';

// ----------------------------------------------------------------------

export function SegmentAbertura({ segment }) {
  const theme = useTheme();

  const { accent } = segment;

  return (
    <Box
      id="processo"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Sua Abertura de Empresa Realizada em Apenas{' '}
              <Box component="span" sx={{ color: accent }}>
                6 Passos
              </Box>
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography sx={{ maxWidth: 720, mx: 'auto', color: 'text.secondary', lineHeight: 1.8 }}>
              Do primeiro contato ao CNPJ na mão: você acompanha tudo e nós cuidamos de toda a
              burocracia.
            </Typography>
          </m.div>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 8, md: 6 },
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            position: 'relative',
            mt: 4,
          }}
        >
          {DEFAULT_ABERTURA_STEPS.map((step) => (
            <m.div key={step.number} variants={varFade().inUp} style={{ height: '100%' }}>
              <Card
                sx={{
                  p: 4,
                  pt: 7,
                  height: '100%',
                  position: 'relative',
                  bgcolor: 'background.paper',
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  transition: 'all 0.3s ease',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.customShadows.z16,
                  },
                  '&::before': {
                    content: `"${step.number}"`,
                    position: 'absolute',
                    top: -24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: accent,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    boxShadow: theme.customShadows.primary,
                    border: `4px solid ${theme.palette.background.paper}`,
                    zIndex: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 3,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={step.icon} width={40} sx={{ color: accent }} />
                </Box>

                <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 700 }}>
                  {step.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '0.875rem' }}
                >
                  {step.description}
                </Typography>
              </Card>
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
