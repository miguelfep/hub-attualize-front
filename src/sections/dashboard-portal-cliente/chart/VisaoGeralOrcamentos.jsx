import { useState } from 'react';

import { useTheme } from '@mui/material/styles';
import { Box, Card, Stack, CardHeader, Typography } from '@mui/material';

import { Chart, useChart } from 'src/components/chart';
import { formatToCurrency } from 'src/components/animate';

export default function VisaoGeralOrcamentos({
  title = 'Visão Geral',
  subheader = 'Acompanhe suas vendas e orçamentos nos últimos 12 meses',
  data = [],
  ...other
}) {
  const theme = useTheme();

  const [selectedSeries, setSelectedSeries] = useState(['Orçamentos', 'Vendas (NF-e)']);

  const categories = data.map((item) => item.label);

  const allSeries = [
    {
      name: 'Orçamentos',
      color: theme.palette.primary.main,
      data: data.map((item) => item.orcamentos),
    },
    {
      name: 'Vendas (NF)',
      color: theme.palette.info.main,
      data: data.map((item) => item.vendas),
    },
  ];

  const handleSeriesToggle = (seriesName) => {
    const newSelection = selectedSeries.includes(seriesName)
      ? selectedSeries.filter((name) => name !== seriesName)
      : [...selectedSeries, seriesName];

    if (newSelection.length > 0) {
      setSelectedSeries(newSelection);
    }
  };

  const series = allSeries.filter((s) => selectedSeries.includes(s.name));
  const seriesColors = series.map((s) => s.color);

  const chartOptions = useChart({
    colors: seriesColors.length ? seriesColors : [theme.palette.grey[500]],
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      dropShadow: {
        enabled: true,
        top: 5,
        left: 0,
        blur: 4,
        opacity: 0.1,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories,
      labels: { style: { colors: theme.palette.text.secondary } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (value) => formatToCurrency(value),
        style: { colors: theme.palette.text.disabled },
      },
    },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
    tooltip: {
      theme: 'light',
      shared: true,
      intersect: false,
      y: { formatter: (value) => formatToCurrency(value) },
    },
    legend: { show: false },
  });

  return (
    <Card {...other} sx={{ height: '100%', ...other.sx }}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Stack direction="row" spacing={3} sx={{ mr: 1.5, mt: 0.5 }}>
            {allSeries.map((seriesItem) => (
              <Stack
                key={seriesItem.name}
                direction="row"
                alignItems="center"
                spacing={1}
                onClick={() => handleSeriesToggle(seriesItem.name)}
                sx={{
                  cursor: 'pointer',
                  opacity: selectedSeries.includes(seriesItem.name) ? 1 : 0.48,
                  transition: 'opacity 0.3s',
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: seriesItem.color,
                  }}
                />
                <Typography variant="subtitle2">{seriesItem.name}</Typography>
              </Stack>
            ))}
          </Stack>
        }
      />
      <Box sx={{ p: 3, pb: 1 }}>
        <Chart dir="ltr" type="bar" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
