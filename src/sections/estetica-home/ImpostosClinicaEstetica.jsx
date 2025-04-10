import React from 'react';

import { Box, Grid, Paper, Container, Typography } from '@mui/material';

import { MotionViewport } from 'src/components/animate';

import { Calculadora } from './CalculadoraEstetica';

export function ImpostosClinicaEstetica() {
  return (
    <Box
      sx={{
        backgroundColor: 'grey.100',
        py: { xs: 8, md: 12 },
      }}
    >
      <Container component={MotionViewport} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
        {/* Título Centralizado */}
        <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Impostos para Clínicas de Estética
        </Typography>

        {/* Introdução */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="body1" paragraph>
            As clínicas de estética estão sujeitas a diferentes regimes de tributação, como Simples
            Nacional, Lucro Presumido e Lucro Real. Cada regime tem suas particularidades e pode
            influenciar diretamente nos impostos que sua empresa irá pagar.
          </Typography>
          <Typography variant="body1">
            Escolher o regime certo é essencial para evitar pagar impostos desnecessários e garantir
            a saúde financeira do seu negócio. Conheça os principais regimes tributários e use nossa
            calculadora para ter uma ideia dos impostos que sua clínica poderá pagar.
          </Typography>
        </Box>

        {/* Regimes Tributários */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, backgroundColor: 'common.white' }}>
              <Typography variant="h6" gutterBottom>
                Simples Nacional
              </Typography>
              <Typography variant="body2">
                Ideal para empresas com faturamento anual de até R$ 4,8 milhões. Oferece alíquotas
                reduzidas e um processo simplificado de pagamento de impostos.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, backgroundColor: 'common.white' }}>
              <Typography variant="h6" gutterBottom>
                Lucro Presumido
              </Typography>
              <Typography variant="body2">
                Indicado para empresas com faturamento maior que R$ 4,8 milhões e margem de lucro
                elevada. A tributação é calculada com base em uma margem presumida definida pelo
                governo.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, backgroundColor: 'common.white' }}>
              <Typography variant="h6" gutterBottom>
                Lucro Real
              </Typography>
              <Typography variant="body2">
                Necessário para empresas com faturamento elevado ou que trabalham com margens de
                lucro reduzidas. A tributação é calculada com base no lucro real apurado.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Título Centralizado */}
        <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Descubra qual será seu imposto
        </Typography>
        <Calculadora />
      </Container>
    </Box>
  );
}
