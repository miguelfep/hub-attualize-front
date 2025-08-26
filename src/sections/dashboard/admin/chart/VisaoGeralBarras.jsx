import { useTheme } from '@mui/material/styles';
import { Box, Card, CardHeader } from '@mui/material';

import { Chart, useChart } from 'src/components/chart';
import { formatToCurrency } from 'src/components/animate';

export default function VisaoGeralBarras({
  totalPagar = 0,
  totalReceber = 0,
  activeView = 'pagar', // 'pagar' ou 'receber'
  onBarClick = () => {},
  height = 350,
}) {
  const theme = useTheme();

  const activeColor = theme.palette.primary.main;
  const inactiveColor = theme.palette.grey[500];

  const options = useChart({
    colors: [
        activeView === 'pagar' ? activeColor : inactiveColor,
        activeView === 'receber' ? activeColor : inactiveColor,
    ],
    chart: {
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const { dataPointIndex } = config;
          if (dataPointIndex === 0) {
            onBarClick('pagar');
          } else if (dataPointIndex === 1) {
            onBarClick('receber');
          }
        },
      },
    },
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 4,
        horizontal: false,
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => formatToCurrency(value),
      },
    },
    xaxis: {
      categories: ['Contas a Pagar', 'Contas a Receber'],
    },
    tooltip: {
      y: {
        formatter: (value) => formatToCurrency(value),
      },
    },
    legend: { show: false },
  });

  const series = [
    {
      name: 'Total',
      data: [totalPagar, totalReceber],
    },
  ];

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
      <CardHeader title="Receita vs Despesa" subheader="Selecione uma opção para obter mais informações" />
      <Box sx={{ p: 2 }}>
        <Chart type="bar" series={series} options={options} height={height - 80} />
      </Box>
    </Card>
  );
}
