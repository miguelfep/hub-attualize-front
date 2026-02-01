'use client';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import { paths } from 'src/routes/paths';

import { IndicacaoCard } from 'src/sections/indicacoes/indicacao-card';
import { IndicacoesListView } from 'src/sections/indicacoes/indicacoes-list-view';

// ----------------------------------------------------------------------

export default function IndicacoesPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <IndicacaoCard />
        </Grid>
        <Grid xs={12} md={8}>
          <IndicacoesListView />
        </Grid>
      </Grid>
    </Container>
  );
}
