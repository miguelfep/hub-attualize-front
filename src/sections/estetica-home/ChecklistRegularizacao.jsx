import React from 'react';
import { m } from 'framer-motion';

import { alpha } from '@mui/material/styles';
import { Box, Grid, Paper, Stack, Divider, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

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


export function ChecklistRegularizacao() {
  return (
    <Box sx={{ bgcolor: 'background.neutral', py: { xs: 10, md: 15 } }}>
      <Container component={MotionViewport}>
        <Stack spacing={3} sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
          <m.div variants={varFade().inUp}>
            <Typography variant="h2">Sua Clínica 100% em Conformidade</Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography sx={{ color: 'text.secondary' }}>
              Garantir a regularização é o pilar para um negócio de sucesso e sem surpresas.
              Confira os pontos essenciais que cuidamos para você.
            </Typography>
          </m.div>
        </Stack>

        <Grid container spacing={4}>
          <Grid xs={12} md={6}>
            <m.div variants={varFade().inUp}>
              <Paper
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 2,
                  height: '100%',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Iconify
                      icon="solar:card-2-bold-duotone"
                      width={40}
                      sx={{ color: 'primary.main' }}
                    />
                    <Typography variant="h5">Atividades (CNAEs) Essenciais</Typography>
                  </Stack>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Stack spacing={2}>
                    {CHECKLIST_CNAE.map((item) => (
                      <Stack key={item.text} direction="row" spacing={1.5} alignItems="center">
                        <Iconify
                          icon="eva:checkmark-circle-2-fill"
                          width={20}
                          sx={{ color: 'primary.main' }}
                        />
                        <Typography variant="body2">{item.text}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </m.div>
          </Grid>

          <Grid xs={12} md={6}>
            <m.div variants={varFade().inUp}>
               <Paper
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 2,
                  height: '100%',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Iconify
                      icon="solar:shield-check-bold-duotone"
                      width={40}
                      sx={{ color: 'primary.darker' }}
                    />
                    <Typography variant="h5" sx={{ color: 'primary.darker' }}>
                      Exigências da Vigilância Sanitária
                    </Typography>
                  </Stack>
                  <Divider sx={{ borderStyle: 'dashed', borderColor: 'primary.light' }} />
                  <Stack spacing={2}>
                    {CHECKLIST_VIGILANCIA.map((item) => (
                      <Stack key={item.text} direction="row" spacing={1.5} alignItems="center">
                        <Iconify
                          icon="eva:checkmark-circle-2-fill"
                          width={20}
                          sx={{ color: 'primary.darker' }}
                        />
                        <Typography variant="body2">{item.text}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
