'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fCurrency } from 'src/utils/format-number';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Cards de resumo financeiro (IR): total em R$ por faixa de status.
 * @param {{ loading?: boolean, error?: unknown, data?: { pendente: number, demais: number } | null }} props
 */
export function IrResumoFinanceiroCards({ loading, error, data }) {
  const theme = useTheme();

  if (error) {
    return null;
  }

  if (loading && !data) {
    return (
      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
        </Grid>
        <Grid xs={12} md={6}>
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
        </Grid>
      </Grid>
    );
  }

  const pendente = data?.pendente ?? 0;
  const demais = data?.demais ?? 0;

  const items = [
    {
      key: 'pendente',
      title: 'Aguardando pagamento',
      subtitle: 'Soma dos pedidos em “Aguardando Pagamento”',
      value: pendente,
      icon: 'eva:clock-outline',
      color: theme.palette.warning.main,
    },
    {
      key: 'demais',
      title: 'Demais pedidos',
      subtitle: 'Todos os outros status (pagos, em andamento, etc.)',
      value: demais,
      icon: 'eva:trending-up-fill',
      color: theme.palette.success.main,
    },
  ];

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.key} xs={12} md={6}>
          <Card
            variant="outlined"
            sx={{
              p: 2.5,
              height: '100%',
              borderRadius: 2,
              borderColor: alpha(item.color, 0.35),
              background: (t) =>
                `linear-gradient(135deg, ${alpha(item.color, 0.08)} 0%, ${alpha(t.palette.background.paper, 1)} 55%)`,
              transition: 'box-shadow 0.2s',
              '&:hover': {
                boxShadow: (t) => t.shadows[8],
              },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  bgcolor: alpha(item.color, 0.16),
                  color: item.color,
                }}
              >
                <Iconify icon={item.icon} width={26} />
              </Box>
              <Box flex={1} minWidth={0}>
                <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.25, lineHeight: 1.2 }}>
                  {fCurrency(item.value)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  {item.subtitle}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
