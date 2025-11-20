'use client';

import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

import { Card, CardHeader, Box, useTheme } from '@mui/material';

import { formatarPeriodo, FATOR_R_MINIMO } from 'src/types/apuracao';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ----------------------------------------------------------------------

export function HistoricoChart({ historicos }) {
  const theme = useTheme();

  // Ordenar históricos por período
  const historicosSorted = [...historicos].sort(
    (a, b) => parseInt(a.periodoApuracao, 10) - parseInt(b.periodoApuracao, 10)
  );

  const categories = historicosSorted.map((h) => formatarPeriodo(h.periodoApuracao));

  const series = [
    {
      name: 'Faturamento Bruto',
      type: 'column',
      data: historicosSorted.map((h) => h.faturamentoBruto),
    },
    {
      name: 'Folha + INSS',
      type: 'column',
      data: historicosSorted.map((h) => h.folhaComEncargos),
    },
    {
      name: 'Fator R (%)',
      type: 'line',
      data: historicosSorted.map((h) => h.fatorRPercentual),
    },
  ];

  const chartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: true },
      zoom: { enabled: true },
    },
    stroke: {
      width: [0, 0, 3],
      curve: 'smooth',
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 4,
      },
    },
    fill: {
      opacity: [0.85, 0.85, 1],
      gradient: {
        inverseColors: false,
        shade: 'light',
        type: 'vertical',
        opacityFrom: 0.85,
        opacityTo: 0.55,
        stops: [0, 100, 100, 100],
      },
    },
    labels: categories,
    markers: {
      size: 0,
    },
    xaxis: {
      type: 'category',
      labels: {
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: [
      {
        seriesName: 'Faturamento Bruto',
        title: {
          text: 'Valores (R$)',
        },
        labels: {
          formatter: (value) =>
            `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
        },
      },
      {
        seriesName: 'Faturamento Bruto',
        show: false,
      },
      {
        opposite: true,
        seriesName: 'Fator R (%)',
        title: {
          text: 'Fator R (%)',
        },
        min: 0,
        max: Math.max(...historicosSorted.map((h) => h.fatorRPercentual), FATOR_R_MINIMO) + 5,
        labels: {
          formatter: (value) => `${value.toFixed(1)}%`,
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value, { seriesIndex }) => {
          if (seriesIndex === 2) {
            return `${value.toFixed(2)}%`;
          }
          return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        },
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.warning.main,
      theme.palette.success.main,
    ],
    annotations: {
      yaxis: [
        {
          y: FATOR_R_MINIMO,
          y2: null,
          yAxisIndex: 2,
          borderColor: theme.palette.error.main,
          fillColor: theme.palette.error.main,
          opacity: 0.1,
          label: {
            borderColor: theme.palette.error.main,
            style: {
              color: '#fff',
              background: theme.palette.error.main,
            },
            text: `Fator R Mínimo: ${FATOR_R_MINIMO}%`,
          },
        },
      ],
    },
  };

  return (
    <Card>
      <CardHeader
        title="Evolução do Histórico (12 meses)"
        subheader="Faturamento, Folha e Fator R"
      />
      <Box sx={{ p: 3, pb: 1 }}>
        <ReactApexChart type="line" series={series} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}

HistoricoChart.propTypes = {
  historicos: PropTypes.array.isRequired,
};

