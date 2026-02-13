'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SaldoCards({ conta, loading }) {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid xs={12} sm={6} md={3} key={item}>
            <Card sx={{ p: 3 }}>
              <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" height={32} />
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const cards = [
    {
      title: 'Saldo Disponível',
      value: conta?.saldoDisponivel || 0,
      icon: 'solar:wallet-money-bold-duotone',
      color: 'success',
      bgColor: 'success.lighter',
    },
    {
      title: 'Saldo Pendente',
      value: conta?.saldoPendente || 0,
      icon: 'solar:clock-circle-bold-duotone',
      color: 'warning',
      bgColor: 'warning.lighter',
    },
    {
      title: 'Total Ganho',
      value: conta?.saldoTotalGanho || 0,
      icon: 'solar:hand-money-bold-duotone',
      color: 'info',
      bgColor: 'info.lighter',
    },
    {
      title: 'Total Usado',
      value: (conta?.totalDescontosAplicados || 0) + (conta?.totalPixPago || 0),
      icon: 'solar:graph-down-bold-duotone',
      color: 'text.secondary',
      bgColor: 'grey.200',
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid xs={12} sm={6} md={3} key={index}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: card.bgColor,
                }}
              >
                <Iconify icon={card.icon} width={28} sx={{ color: card.color }} />
              </Box>

              <Stack spacing={0.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  {card.title}
                </Typography>
                <Typography variant="h4" sx={{ color: card.color }}>
                  {fCurrency(card.value)}
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
