
import { useTheme } from '@mui/material/styles';
import { Box, Card, CardHeader } from '@mui/material';

import { Chart, useChart } from 'src/components/chart';
import { formatToCurrency } from 'src/components/animate';

export default function VisaoGeralOrcamentos({
  title = 'Visão Geral',
  subheader = 'Acompanhe seu faturamento nos últimos 12 meses',
  data = [],
  height,
  onMonthClick,
  ...other
}) {
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
    {
      name: 'Orçamentos',
      color: theme.palette.primary.light,
      data: chartData.seriesData[0],
    },
    {
      name: 'Vendas (NF-e)',
      color: theme.palette.info.main,
      data: chartData.seriesData[1],
    },
  ];

  const chartOptions = useChart({
    colors: series.map((s) => s.color),
    chart: {
    events: {
        markerClick: (event, chartContext, { dataPointIndex, seriesIndex }) => {
          const monthData = data[dataPointIndex];
          if (monthData && onMonthClick) {
            onMonthClick({ 
              ano: monthData.ano, 
              mes: monthData.mes, 
              label: monthData.label 
            });
          }
        }
       },
      toolbar: { show: false },
      dropShadow: {
        enabled: true,
        top: 6,
        left: 0,
        blur: 6,
        opacity: 0.15,
      },
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      fillOpacity: 1,
      strokeOpacity: 1,
      hover: {
        size: 6,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        opacityFrom: 0.5,
        opacityTo: 0.08,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    legend: {
      show: true,
      position: 'top',
    },
    xaxis: {
      categories: chartData.categories,
      labels: { style: { colors: theme.palette.text.secondary } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      title: {
        text: 'Valor (R$)',
        style: {
          color: theme.palette.text.disabled,
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (value) => formatToCurrency(value),
        style: { colors: theme.palette.text.disabled },
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode,
      shared: true,
      intersect: false,
      y: { formatter: (value) => formatToCurrency(value) },
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ p: 3, pb: 1 }}>
        <Chart dir="ltr" type="area" series={series} options={chartOptions} height={height} />
      </Box>
    </Card>
  );
}