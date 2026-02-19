'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { Chart, useChart } from 'src/components/chart';
import { formatToCurrency } from 'src/components/animate';

import { CARD, CARD_HEADER } from './dash-tokens';
import { BUDGET_OVERVIEW_DATA } from './constants';

export default function BudgetOverviewChart({ data = BUDGET_OVERVIEW_DATA, onMonthClick, sx, ...other }) {
  const theme = useTheme();

  const chartData = data.reduce(
    (acc, item) => {
      acc.categories.push(item.label);
      acc.seriesData[0].push(item.orcamentos);
      acc.seriesData[1].push(item.vendas);
      return acc;
    },
    { categories: [], seriesData: [[], []] }
  );

  const series = [
    { name: 'Orçamentos', data: chartData.seriesData[0] },
    { name: 'Vendas (NF-e)', data: chartData.seriesData[1] },
  ];

  const chartOptions = useChart({
    colors: [theme.palette.primary.main, theme.palette.info.main],
    chart: {
      type: 'area',
      sparkline: { enabled: false },
      toolbar: { show: false },
      events: {
        // TROCADO PARA markerClick: mais preciso para pontos em gráficos de área
        markerClick: (event, chartContext, { dataPointIndex }) => {
          const selectedData = data[dataPointIndex];
          console.log('Ponto clicado:', selectedData);
          if (onMonthClick && selectedData) {
            onMonthClick(selectedData);
          }
        },
      },
    },
    grid: {
      padding: { top: 20, bottom: 0, left: 15, right: 15 },
      strokeDashArray: 4,
      borderColor: theme.palette.divider,
    },
    stroke: { curve: 'smooth', width: 2.5 },
    xaxis: {
      categories: chartData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: '0.75rem', fontWeight: 600, colors: theme.palette.text.secondary } },
    },
    yaxis: {
      labels: {
        style: { fontSize: '0.75rem', fontWeight: 600, colors: theme.palette.text.secondary },
        formatter: (val) => val >= 1000 ? `R$ ${(val / 1000).toFixed(0)}k` : `R$ ${val}`,
      },
    },
    markers: {
      size: 4, // Garante que o marcador exista para ser clicável
      hover: { size: 6 }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontWeight: 600,
      itemMargin: { horizontal: 12 },
    },
    tooltip: { shared: true, intersect: false, y: { formatter: (val) => formatToCurrency(val) } },
  });

  return (
    <Card
      sx={{
        ...CARD,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title="Visão Geral"
        subheader="Faturamento últimos 12 meses"
        sx={{
          ...CARD_HEADER,
          py: 2,
          gap: 3,
          '& .MuiCardHeader-action': { m: 0, alignSelf: 'center' },
          '& .MuiCardHeader-title': { ...CARD_HEADER.title, fontSize: '1.125rem' },
          '& .MuiCardHeader-subheader': { fontSize: '0.875rem', fontWeight: 500 },
        }}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 1.5, pb: 2 }}>
        <Chart dir="ltr" type="area" series={series} options={chartOptions} width="100%" height={320} />
      </Box>
    </Card>
  );
}