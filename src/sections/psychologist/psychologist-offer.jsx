'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function PsychologistOffer() {
  const theme = useTheme();

  return (
    <Box
      id="oferta"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: alpha(theme.palette.grey[500], 0.04),
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Abra Seu CNPJ de Psicólogo{' '}
              <Box component="span" sx={{ color: '#FEC615' }}>
                SEM CUSTOS
              </Box>
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="h5"
              sx={{
                mb: 5,
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.8,
              }}
            >
              Ao contratar um plano anual,{' '}
              <strong style={{ fontWeight: 600 }}>a abertura do seu CNPJ é por nossa conta!</strong>{' '}
              Comece seu consultório com o pé direito, sem se preocupar com a burocracia inicial.
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Button
              component={RouterLink}
              href={paths.aberturaCnpjPsicologo}
              size="large"
              variant="contained"
              sx={{
                bgcolor: '#FEC615',
                color: '#333',
                px: { xs: 4, md: 6 },
                py: 2,
                fontSize: { xs: '0.95rem', md: '1.25rem' },
                fontWeight: 700,
                borderRadius: 10,
                boxShadow: '0 8px 24px 0 rgba(254, 198, 21, 0.4)',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#e5b213',
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 32px 0 rgba(254, 198, 21, 0.5)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Quero Minha Abertura Grátis!
            </Button>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="caption"
              sx={{
                mt: 3,
                display: 'block',
                color: 'text.disabled',
              }}
            >
              *Válido na contratação de plano anual com fidelidade de 12 meses.
            </Typography>
          </m.div>
        </Box>
      </Container>
    </Box>
  );
}

