'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SaldoCards({ conta, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid key={item} xs={12} sm={6} md={3}>
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
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
      color: theme.palette.success.main,
      priority: true,
    },
    {
      title: 'Saldo Pendente',
      value: conta?.saldoPendente || 0,
      icon: 'solar:clock-circle-bold-duotone',
      color: theme.palette.warning.main,
    },
    {
      title: 'Total Ganho',
      value: conta?.saldoTotalGanho || 0,
      icon: 'solar:hand-money-bold-duotone',
      color: theme.palette.info.main,
    },
    {
      title: 'Total Usado',
      value: (conta?.totalDescontosAplicados || 0) + (conta?.totalPixPago || 0),
      icon: 'solar:graph-down-bold-duotone',
      color: theme.palette.error.main,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item key={index} xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
              position: 'relative',
              overflow: 'hidden',
              ...(card.priority && {
                bgcolor: alpha(card.color, 0.04),
                borderColor: alpha(card.color, 0.2),
              }),
            }}
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                  bgcolor: alpha(card.color, 0.12),
                }}
              >
                <Iconify icon={card.icon} width={28} />
              </Box>

              <Stack spacing={0.5}>
                <Typography variant="overline" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                  {card.title}
                </Typography>

                <Typography variant="h4" sx={{ fontWeight: '800' }}>
                  {fCurrency(card.value)}
                </Typography>
              </Stack>
            </Stack>

            <Iconify
              icon={card.icon}
              width={120}
              sx={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                opacity: 0.04,
                transform: 'rotate(-10deg)',
                color: card.color,
              }}
            />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}