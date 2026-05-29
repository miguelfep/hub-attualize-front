import { useMemo } from 'react';

import { useTheme } from '@mui/material/styles';
import { Box, Card, Stack, Divider, Typography, CardHeader } from '@mui/material';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function NrrContadoresDonut({ contadores, height = 300 }) {
  const theme = useTheme();

  const itens = useMemo(
    () => [
      { label: 'Retidos', value: contadores?.retidos ?? 0, color: theme.palette.info.main },
      { label: 'Expandidos', value: contadores?.expandidos ?? 0, color: theme.palette.success.main },
      { label: 'Reduzidos', value: contadores?.reduzidos ?? 0, color: theme.palette.warning.main },
      { label: 'Churnados', value: contadores?.churnados ?? 0, color: theme.palette.error.main },
    ],
    [contadores, theme]
  );

  const total = contadores?.contratosBase ?? itens.reduce((acc, i) => acc + i.value, 0);
  const isEmpty = total === 0;

  const options = useChart({
    chart: { type: 'donut' },
    labels: itens.map((i) => i.label),
    colors: itens.map((i) => i.color),
    legend: { show: false },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Contratos',
              formatter: () => `${total}`,
            },
            value: { formatter: (val) => `${val}` },
          },
        },
      },
    },
    tooltip: { y: { formatter: (val) => `${val} contrato(s)` } },
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Contadores da coorte" subheader={`Base: ${total} contrato(s)`} />
      <Box sx={{ p: 2 }}>
        <Chart
          type="donut"
          series={isEmpty ? [1] : itens.map((i) => i.value)}
          options={isEmpty ? { ...options, labels: ['Sem base'], colors: [theme.palette.grey[300]] } : options}
          height={height}
        />

        <Stack spacing={1} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} sx={{ mt: 2 }}>
          {itens.map((item) => (
            <Stack key={item.label} direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                <Typography variant="body2">{item.label}</Typography>
              </Stack>
              <Typography variant="subtitle2">{item.value}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
