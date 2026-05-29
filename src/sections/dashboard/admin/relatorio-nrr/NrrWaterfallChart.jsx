import { useMemo } from 'react';

import { useTheme } from '@mui/material/styles';
import { Box, Card, CardHeader } from '@mui/material';

import { Chart, useChart } from 'src/components/chart';
import { formatToCurrency } from 'src/components/animate';

// ----------------------------------------------------------------------

export default function NrrWaterfallChart({ resumo, height = 360 }) {
  const theme = useTheme();

  const { series, deltas } = useMemo(() => {
    const ri = resumo?.receitaInicial ?? 0;
    const exp = resumo?.expansao ?? 0;
    const down = resumo?.downgrade ?? 0;
    const churn = resumo?.churn ?? 0;
    const final = resumo?.receitaFinalCohort ?? ri + exp - down - churn;

    const afterExp = ri + exp;
    const afterDown = afterExp - down;
    const afterChurn = afterDown - churn;

    const data = [
      { x: 'Receita inicial', y: [0, ri], fillColor: theme.palette.info.main },
      { x: 'Expansão', y: [ri, afterExp], fillColor: theme.palette.success.main },
      { x: 'Downgrade', y: [afterDown, afterExp], fillColor: theme.palette.warning.main },
      { x: 'Churn', y: [afterChurn, afterDown], fillColor: theme.palette.error.main },
      { x: 'Receita final', y: [0, final], fillColor: theme.palette.primary.main },
    ];

    return {
      series: [{ name: 'MRR', data }],
      deltas: [ri, exp, -down, -churn, final],
    };
  }, [resumo, theme]);

  const options = useChart({
    chart: { type: 'rangeBar', toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
        rangeBarGroupRows: false,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val, opts) => {
        const delta = deltas[opts?.dataPointIndex] ?? 0;
        const prefix = delta > 0 && opts?.dataPointIndex > 0 && opts?.dataPointIndex < 4 ? '+' : '';
        return `${prefix}${formatToCurrency(delta)}`;
      },
      style: { fontSize: '11px', colors: [theme.palette.text.primary] },
      offsetY: -22,
    },
    tooltip: {
      y: {
        formatter: (val, opts) => {
          const delta = deltas[opts?.dataPointIndex] ?? 0;
          return formatToCurrency(delta);
        },
      },
    },
    yaxis: {
      labels: { formatter: (val) => formatToCurrency(val) },
    },
    legend: { show: false },
    grid: { strokeDashArray: 3 },
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Composição do NRR (cascata)"
        subheader="Receita inicial → + expansão → − downgrade → − churn → receita final da base"
      />
      <Box sx={{ p: 2 }}>
        <Chart type="rangeBar" series={series} options={options} height={height} />
      </Box>
    </Card>
  );
}
