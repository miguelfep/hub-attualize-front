import { useTheme } from '@mui/material/styles';
import { Box, Card, CardHeader } from '@mui/material';

import { Chart, useChart } from 'src/components/chart';

export default function DashboardGeralArea({ series, height, onDateClick = () => {} }) {
  const theme = useTheme();

  const options = useChart({
    colors: [theme.palette.success.main, theme.palette.error.main],
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      dropShadow: {
        enabled: true,
        top: 4,
        left: 0,
        blur: 4,
        opacity: 0.12,
      },
      events: {
        markerClick: (event, chartContext, { dataPointIndex, seriesIndex }) => {
          const timestamp =
            chartContext.w.globals.seriesX[seriesIndex][dataPointIndex];
          onDateClick(timestamp);
        },
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: theme.palette.text.secondary,
      },
      markers: { radius: 12 },
    },
    fill: {
      type: 'stroke',
      gradient: {
        shade: 'light',
        type: 'horizontal',
        opacityFrom: 0.3,
        opacityTo: 0,
      },
    },
    stroke: {
      width: [2, 2],
      curve: 'smooth',
      colors: [theme.palette.success.main, theme.palette.error.main],
    },
    markers: {
      size: 4,
      strokeColors: '#fff',
      strokeWidth: 4,
      hover: { size: 6 },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'dd/MM',
        style: { colors: theme.palette.text.disabled },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.disabled },
      },
    },
    tooltip: {
      theme: 'light',
      shared: true,
      intersect: false,
      x: {
        format: 'dd/MM/yyyy',
      },
      y: {
        formatter: (value) =>
          value ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
      },
    },
  });

  return (
    <Card>
      <CardHeader title="Visão Geral Financeira" subheader="Acompanhe suas receitas e despesas. Clique em um dia para ver mais detalhes!"/>
      <Box sx={{ p: 3, pb: 1 }}>
        <Chart
          key={JSON.stringify(series)}
          type="area"
          series={series}
          options={options}
          height={height}
        />
      </Box>
    </Card>
  );
}
