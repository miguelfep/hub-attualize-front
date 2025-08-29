import { useMemo } from 'react';

import { useTheme } from '@mui/material/styles';
import { Box, Card, Stack, MenuItem, TextField, CardHeader } from '@mui/material';

import { Chart, useChart } from 'src/components/chart';
import { formatToCurrency } from 'src/components/animate';

// Opções para os filtros
const statusInvoiceOptions = [
  { value: '', label: 'Todos' },
  { value: 'pago', label: 'Pago' },
  { value: 'orcamento', label: 'Orçamento' },
  { value: 'aprovada', label: 'Aprovada' },
  { value: 'perdida', label: 'Perdida' },
];

const statusCobrancaOptions = [
  { value: '', label: 'Todos' },
  { value: 'EMABERTO', label: 'Em Aberto' },
  { value: 'PAGO', label: 'Pago' },
  { value: 'RECEBIDO', label: 'Recebido' },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'ATRASADO', label: 'Atrasado' },
  { value: 'A_RECEBER', label: 'A Receber' },
  { value: 'PROCESSANDO', label: 'Processando' },
  { value: 'ERRO_PROCESSAMENTO', label: 'Erro no Processamento' },
];

export default function ComposicaoReceberDonnut({
  height = 300,
  dadosInvoice = [],
  dadosCobrancas = [],
  filters = {},
  onFilterChange = () => {},
}) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    const totalInvoices = dadosInvoice.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalCobrancas = dadosCobrancas.reduce((sum, cobranca) => sum + cobranca.valor, 0);

    const chartLabels = [];
    const chartSeries = [];

    if (totalInvoices > 0) {
      chartLabels.push('Vendas');
      chartSeries.push(totalInvoices);
    }
    if (totalCobrancas > 0) {
      chartLabels.push('Cobranças');
      chartSeries.push(totalCobrancas);
    }

    const isEmpty = chartSeries.length === 0;

    return {
      chartLabels: isEmpty ? ['Nenhum dado para exibir'] : chartLabels,
      chartSeries: isEmpty ? [1] : chartSeries,
      isEmpty,
    };
  }, [dadosInvoice, dadosCobrancas]);

  const subheaderText = useMemo(() => {
    const { statusCobranca, statusInvoice } = filters;
    const activeFilters = [];

    if (statusCobranca) {
      const cobrancaLabel = statusCobrancaOptions.find(opt => opt.value === statusCobranca)?.label;
      if (cobrancaLabel) {
        activeFilters.push(`Cobrança: ${cobrancaLabel}`);
      }
    }

    if (statusInvoice) {
      const invoiceLabel = statusInvoiceOptions.find(opt => opt.value === statusInvoice)?.label;
      if (invoiceLabel) {
        activeFilters.push(`Venda: ${invoiceLabel}`);
      }
    }

    if (activeFilters.length === 0) {
      return "Filtre por Vendas e/ou Cobranças";
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
            }
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
        formatter: (val, opts) => {
          const percentual = totalGeral > 0 ? (val / totalGeral) * 100 : 0;
          return `${formatToCurrency(val)} (${percentual.toFixed(1)}%)`;
        },
      },
    },
  });

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
      <CardHeader
        title="Composição das Receitas"
        subheader={subheaderText}
        action={
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Status Cobrança"
              name="statusCobranca"
              value={filters.statusCobranca || ''}
              onChange={onFilterChange}
              size="small"
              sx={{ minWidth: 150 }}
            >
              {statusCobrancaOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status Venda"
              name="statusInvoice"
              value={filters.statusInvoice || ''}
              onChange={onFilterChange}
              size="small"
              sx={{ minWidth: 160 }}
            >informações
              {statusInvoiceOptions.map((option) => (
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
          key={`${JSON.stringify(dadosInvoice)}-${JSON.stringify(dadosCobrancas)}`}
          type="donut"
          series={chartData.chartSeries}
          options={options}
          height="100%"
        />
      </Box>
    </Card>
  );
}
