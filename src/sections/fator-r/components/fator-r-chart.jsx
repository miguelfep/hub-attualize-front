import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';

import { LIMIAR_FATOR_R, competenciaLabel } from '../utils';

/**
 * Evolução do Fator R. A linha tracejada em 28% é o ponto do gráfico: sem ela o
 * usuário vê uma curva subindo e descendo sem saber de que lado do penhasco está.
 */
export function FatorRChart({ serie = [] }) {
  const theme = useTheme();

  const categories = serie.map((p) => competenciaLabel(p.competencia?.ano, p.competencia?.mes));
  const valores = serie.map((p) => (p.fatorR === null ? null : Number((p.fatorR * 100).toFixed(2))));

  const chartOptions = useChart({
    colors: [theme.palette.primary.main],
    stroke: { width: 3, curve: 'smooth' },
    xaxis: { categories },
    yaxis: {
      labels: { formatter: (v) => (v == null ? '—' : `${v.toFixed(0)}%`) },
    },
    tooltip: {
      y: { formatter: (v) => (v == null ? 'Sem dados' : `${v.toFixed(1).replace('.', ',')}%`) },
    },
    annotations: {
      yaxis: [
        {
          y: LIMIAR_FATOR_R * 100,
          borderColor: theme.palette.error.main,
          strokeDashArray: 6,
          label: {
            text: 'Limite 28% — abaixo daqui é Anexo V',
            position: 'left',
            textAnchor: 'start',
            style: {
              color: theme.palette.error.contrastText,
              background: hexAlpha(theme.palette.error.main, 0.9),
              fontSize: '11px',
            },
          },
        },
      ],
    },
  });

  return (
    <Card>
      <CardHeader
        title="Evolução do Fator R"
        subheader="Cada ponto é um período de apuração, calculado sobre os 12 meses anteriores"
      />
      <Box sx={{ p: 3, pb: 1 }}>
        <Chart type="area" series={[{ name: 'Fator R', data: valores }]} options={chartOptions} height={320} />
      </Box>
    </Card>
  );
}
