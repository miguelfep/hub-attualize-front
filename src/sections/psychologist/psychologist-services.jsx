'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const SERVICES = [
  'Escolha do CNAE Ideal',
  'Elaboração do Contrato Social',
  'Emissão do CNPJ',
  'Emissão de Certificados Digitais',
  'Definição do Melhor Regime Tributário',
  'Inscrições Municipais e Estaduais',
  'Liberação para Emissão de Notas Fiscais',
  'Emissão de Licenças e Alvarás',
];

// ----------------------------------------------------------------------

export function PsychologistServices() {
  const theme = useTheme();

  return (
    <Box
      id="servicos"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: alpha(theme.palette.grey[500], 0.04),
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Tudo o Que Vamos Realizar na Abertura da{' '}
              <Box component="span" sx={{ color: '#FEC615' }}>
                Sua Empresa
              </Box>
            </Typography>
          </m.div>
        </Box>

        <m.div variants={varFade().inUp}>
          <Card
            sx={{
              maxWidth: 900,
              mx: 'auto',
              p: { xs: 4, sm: 6, md: 8 },
              boxShadow: theme.customShadows.z16,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              }}
            >
              {SERVICES.map((service) => (
                <Stack key={service} direction="row" spacing={1.5} alignItems="flex-start">
                  <Iconify
                    icon="solar:check-circle-bold"
                    width={24}
                    sx={{ color: '#28a745', flexShrink: 0, mt: 0.25 }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.9375rem', md: '1rem' },
                    }}
                  >
                    {service}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Card>
        </m.div>
      </Container>
    </Box>
  );
}

