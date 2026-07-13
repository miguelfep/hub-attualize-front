'use client';

import Grid from '@mui/material/Unstable_Grid2';
import { Box, Stack, Paper, Divider, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Seção Lei do Salão Parceiro (Lei 13.352/2016) — coração das landings de beleza.

const PILARES = [
  {
    titulo: 'Escopo restrito da lei',
    texto:
      'A parceria vale para quem executa os serviços de beleza previstos na lei. Recepção, gerência e equipe de apoio permanecem no regime CLT.',
  },
  {
    titulo: 'Profissional formalizado',
    texto:
      'O parceiro deve atuar com CNPJ (MEI ou ME) e ter autonomia técnica na execução dos seus serviços.',
  },
  {
    titulo: 'Contrato específico e homologação',
    texto:
      'O contrato deve seguir a Lei 13.352/2016 e, conforme o caso, ser homologado no sindicato da categoria.',
  },
];

export function SecaoLeiSalaoParceiro({ segmento }) {
  const { cores, parceiro } = segmento;

  return (
    <Box
      component="section"
      id="lei-salao-parceiro"
      aria-labelledby="titulo-lei-parceiro"
      sx={{ py: { xs: 6, md: 10 }, bgcolor: cores.suave, scrollMarginTop: 96 }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1.5} sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="overline"
            sx={{ color: cores.destaque, letterSpacing: 1.5, fontWeight: 700 }}
          >
            Lei 13.352/2016
          </Typography>
          <Typography
            id="titulo-lei-parceiro"
            component="h2"
            variant="h3"
            sx={{ color: cores.tinta }}
          >
            Lei do Salão Parceiro: pague imposto só sobre a sua parte
          </Typography>
          <Typography variant="body1" sx={{ color: cores.grafite, maxWidth: 720, mx: 'auto' }}>
            {parceiro.intro}
          </Typography>
        </Stack>

        <Grid container spacing={4} alignItems="stretch">
          {/* Simulação da cota-parte */}
          <Grid xs={12} md={6}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 3, md: 4 },
                height: 1,
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                borderColor: 'transparent',
                borderStyle: 'solid',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 2,
                  color: cores.destaque,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Na ponta do lápis
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: cores.grafite }}>
                    {parceiro.exemploServico}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: cores.tinta }}>
                    {parceiro.exemploValor}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: cores.grafite }}>
                    Cota do profissional parceiro:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'error.main' }}>
                    - {parceiro.exemploCotaParceiro}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: cores.tinta }}>
                    Sua base de imposto (cota-parte):
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: cores.verde, fontWeight: 900 }}>
                    {parceiro.exemploBase}
                  </Typography>
                </Stack>
              </Stack>
              <Typography variant="caption" sx={{ color: cores.grafite, display: 'block', mt: 2.5 }}>
                Sem o contrato de parceria, o imposto incide sobre o valor cheio do serviço. Com a
                lei aplicada, o repasse ao parceiro sai da base de cálculo.
              </Typography>
            </Paper>
          </Grid>

          {/* Pilares de segurança */}
          <Grid xs={12} md={6}>
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                height: 1,
                borderRadius: 3,
                bgcolor: '#FFFFFF',
              }}
            >
              <Typography
                component="h3"
                variant="h6"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: cores.tinta,
                }}
              >
                <Iconify icon="solar:shield-check-bold-duotone" sx={{ color: cores.destaque }} />
                Pilares de segurança
              </Typography>
              <Stack spacing={2.5}>
                {PILARES.map((item) => (
                  <Box key={item.titulo}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: cores.tinta }}>
                      {item.titulo}
                    </Typography>
                    <Typography variant="body2" sx={{ color: cores.grafite, lineHeight: 1.6 }}>
                      {item.texto}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
