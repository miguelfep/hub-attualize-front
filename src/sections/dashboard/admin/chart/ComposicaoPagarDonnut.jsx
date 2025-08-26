import { useMemo } from 'react';

import { useTheme } from '@mui/material/styles';
import { Box, Card, Stack, MenuItem, TextField, CardHeader } from '@mui/material';

import { categoriasDespesas } from 'src/utils/constants/categorias';

import { Chart, useChart } from 'src/components/chart';
import { formatToCurrency } from 'src/components/animate';

// Opções para os filtros
const typeOptions = [
  { value: '', label: 'Todos os Tipos' },
  { value: 'AVULSA', label: 'Avulsa' },
  { value: 'RECORRENTE', label: 'Recorrente' },
];

const statusOptions = [
  { value: '', label: 'Todos os Status' },
  { value: 'PAGO', label: 'Pago' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'AGENDADO', label: 'Agendado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export default function ComposicaoPagarDonnut({
  height = 300,
  dadosContaPagar = [],
  filters = {},
  onFilterChange = () => {},
}) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    const totalPorCategoria = {};
    dadosContaPagar.forEach((despesa) => {
      const categoriaInfo = categoriasDespesas.find((cat) => cat._id === despesa.categoria);
      const nomeCategoria = categoriaInfo ? categoriaInfo.nome : 'Outros';

      if (totalPorCategoria[nomeCategoria]) {
        totalPorCategoria[nomeCategoria] += despesa.valor;
      } else {
        totalPorCategoria[nomeCategoria] = despesa.valor;
      }
    });

    const chartLabels = Object.keys(totalPorCategoria);
    const chartSeries = Object.values(totalPorCategoria);
    const isEmpty = chartSeries.length === 0;

    return {
      chartLabels: isEmpty ? ['Nenhum dado para exibir'] : chartLabels,
      chartSeries: isEmpty ? [1] : chartSeries,
      isEmpty,
    };
  }, [dadosContaPagar]);

  const subheaderText = useMemo(() => {
    const { tipo, statusPagar: status } = filters;
    const activeFilters = [];

    if (tipo) {
      const tipoLabel = typeOptions.find(option => option.value === tipo)?.label;
      if (tipoLabel) {
        activeFilters.push(`Tipo: ${tipoLabel}`);
      }
    }

    if (status) {
      const statusLabel = statusOptions.find(option => option.value === status)?.label;
      if (statusLabel) {
        activeFilters.push(`Status: ${statusLabel}`);
      }
    }

    if (activeFilters.length === 0) {
      return 'Filtre por tipo e/ou status';
    }

    return activeFilters.join(' | ');
  }, [filters]);


  const totalGeral = chartData.isEmpty ? 0 : chartData.chartSeries.reduce((a, b) => a + b, 0);

  const options = useChart({
    labels: chartData.chartLabels,
    legend: {
      show: !chartData.isEmpty,
      position: 'right',
      horizontalAlign: 'center',
      floating: false,
      itemMargin: {
        vertical: 4,
      },
    },
    plotOptions: {
      pie: {
        customScale: 0.85,
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: (w) => {
                if (chartData.isEmpty) return 'R$ 0,00';
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return formatToCurrency(sum);
              },
            },
            value: {
              show: true,
              formatter: (val) => formatToCurrency(val),
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
    },
    tooltip: {
      enabled: !chartData.isEmpty,
      y: {
        formatter: (val) => {
          const percentual = totalGeral > 0 ? (val / totalGeral) * 100 : 0;
          return `${formatToCurrency(val)} (${percentual.toFixed(1)}%)`;
        },
      },
    },
  });

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
      <CardHeader
        title="Composição das Despesas"
        subheader={subheaderText}
        action={
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Tipo"
              name="tipo"
              value={filters.tipo || ''}
              onChange={onFilterChange}
              size="small"
              sx={{ minWidth: 150 }}
            >
              {typeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              name="statusPagar"
              value={filters.statusPagar || ''}
              onChange={onFilterChange}
              size="small"
              sx={{ minWidth: 160 }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        }
      />
      <Box sx={{ height: `calc(100% - 64px)` }}>
        <Chart
          key={JSON.stringify(dadosContaPagar)}
          type="donut"
          series={chartData.chartSeries}
          options={options}
          height="100%"
        />
      </Box>
    </Card>
  );
}
