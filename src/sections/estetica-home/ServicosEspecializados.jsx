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
      'Cuidamos de cada detalhe da abertura da sua clínica: CNPJ, alvarás e licenças sanitárias. Assim, você começa já no caminho certo, sem dores de cabeça.'
  },
  {
    icon: 'solar:notebook-bookmark-bold-duotone',
    title: 'Contratos de Parceria',
    description:
      'Apoiamos para a escolha do melhor tipo de contratação, seja CLT, parcerias ou sublocação, garantindo segurança jurídica, organização e economia tributária para sua clínica.'
  },
  {
    icon: 'solar:target-bold-duotone',
    title: 'Planejamento Tributário',
    description:
      'Encontramos o regime mais vantajoso para que você pague menos impostos e tenha mais lucro, sempre dentro da lei.',
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
                  height: '100%',
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
