import React from 'react';
import { m } from 'framer-motion';

import { Box, Paper, Stack, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

const SERVICOS = [
  {
    icon: 'solar:document-add-bold-duotone',
    title: 'Abertura e Legalização',
    description:
      'Cuidamos de todo o processo de abertura do seu CNPJ, alvarás e licenças sanitárias, garantindo que sua clínica nasça 100% regularizada e sem dores de cabeça.',
  },
  {
    icon: 'solar:notebook-bookmark-bold-duotone',
    title: 'Contratos de Parceria',
    description:
      'Disponibilizamos um modelo de contrato para seus profissionais conforme a Lei Salão-Parceiro, oferecendo segurança jurídica e otimização de impostos.',
  },
  {
    icon: 'solar:target-bold-duotone',
    title: 'Planejamento Tributário',
    description:
      'Analisamos sua operação para encontrar o regime tributário mais vantajoso, garantindo que você pague o mínimo de impostos possível dentro da lei.',
  },
];


export function ServicosEspecializados() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 10, md: 15 } }}>
      <Container component={MotionViewport}>
        <Stack spacing={3} sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
          <m.div variants={varFade().inUp}>
            <Typography component="div" variant="overline" sx={{ color: 'text.disabled' }}>
              Nossas Soluções
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography variant="h2">
              Tudo que sua clínica precisa para prosperar
            </Typography>
          </m.div>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 4, md: 3 },
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          {SERVICOS.map((servico, index) => (
            <m.div key={servico.title} variants={varFade().inUp}>
              <Paper
                variant="outlined"
                sx={{
                  p: 5,
                  textAlign: 'center',
                  borderColor: 'divider',
                  transition: (theme) => theme.transitions.create('transform'),
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Iconify icon={servico.icon} width={48} sx={{ mb: 3, color: 'primary.main' }} />

                <Typography variant="h5" sx={{ mb: 2 }}>
                  {servico.title}
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {servico.description}
                </Typography>
              </Paper>
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
