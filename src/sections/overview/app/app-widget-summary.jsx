import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { AnimateCountUp, formatToInteger, formatToCurrency } from 'src/components/animate';

// ----------------------------------------------------------------------

export function AppWidgetSummary({ title, percent, total, chart, sx, isCurrency = false, ...other }) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.main];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: { categories: chart.categories },
    tooltip: {
      y: { formatter: (value) => fNumber(value), title: { formatter: () => '' } },
    },
    plotOptions: { bar: { borderRadius: 1.5, columnWidth: '64%' } },
    ...chart.options,
  });

  const renderPeriodInfo = (
    <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
      <Iconify
        width={20}
        icon="solar:calendar-bold-duotone"
        sx={{ flexShrink: 0, color: 'primary.main' }}
      />
      <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
        Período selecionado
      </Box>
    </Box>
  );

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ typography: 'subtitle2' }}>{title}</Box>
        <AnimateCountUp
          to={total}
          component={Box}
          formatter={isCurrency ? formatToCurrency : formatToInteger}
          sx={{ mt: 1.5, typography: 'h3' }}
        />
        <Box sx={{ mt: 1 }}>
          {renderPeriodInfo}
        </Box>
      </Box>

      <Chart
        type="bar"
        series={[{ data: chart.series }]}
        options={chartOptions}
        width={60}
        height={40}
      />
    </Card>
  );
}
