'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { useContaRecompensa } from 'src/actions/recompensas';
import { AnalyticsWidgetSummary } from 'src/sections/dashboard-portal-cliente/AnalyticsWidgetSummary';

import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { SolicitarDescontoDialog } from './solicitar-desconto-dialog';
import { SolicitarPixDialog } from './solicitar-pix-dialog';

// ----------------------------------------------------------------------

export function RecompensasDashboardView({ onRefresh }) {
  const { conta, isLoading, mutate } = useContaRecompensa();
  const [descontoOpen, setDescontoOpen] = useState(false);
  const [pixOpen, setPixOpen] = useState(false);

  const handleDescontoSuccess = () => {
    mutate();
    if (onRefresh) onRefresh();
  };

  const handlePixSuccess = () => {
    mutate();
    if (onRefresh) onRefresh();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title="Saldo Disponível"
            total={conta?.saldoDisponivel || 0}
            formatar
            icon="solar:wallet-money-bold-duotone"
            color="success"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title="Saldo Pendente"
            total={conta?.saldoPendente || 0}
            formatar
            icon="solar:clock-circle-bold-duotone"
            color="warning"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <AnalyticsWidgetSummary
            title="Total Ganho"
            total={conta?.saldoTotalGanho || 0}
            formatar
            icon="solar:chart-2-bold-duotone"
            color="info"
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Iconify icon="solar:tag-price-bold" />}
          onClick={() => setDescontoOpen(true)}
          disabled={!conta?.saldoDisponivel || conta.saldoDisponivel <= 0}
        >
          Solicitar Desconto
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<Iconify icon="solar:card-receive-bold" />}
          onClick={() => setPixOpen(true)}
          disabled={!conta?.saldoDisponivel || conta.saldoDisponivel <= 0}
        >
          Solicitar PIX
        </Button>
      </Box>

      <SolicitarDescontoDialog
        open={descontoOpen}
        onClose={() => setDescontoOpen(false)}
        onSuccess={handleDescontoSuccess}
        saldoDisponivel={conta?.saldoDisponivel || 0}
      />

      <SolicitarPixDialog
        open={pixOpen}
        onClose={() => setPixOpen(false)}
        onSuccess={handlePixSuccess}
        saldoDisponivel={conta?.saldoDisponivel || 0}
      />
    </Stack>
  );
}
