'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Chart, useChart } from 'src/components/chart';
import { formatToCurrency } from 'src/components/animate';

import { useMonthSelector } from '../hooks';
import { CARD, CARD_HEADER } from './dash-tokens';

// 🎨 Cores padrão para o gráfico (será gerado dinamicamente se necessário)
const DEFAULT_COLORS = [
  '#1877F2', '#8E33FF', '#00B8D9', '#FFAB00', '#FF5630',
  '#22C55E', '#919EAB', '#73BAFB', '#F48FB1', '#FF6B9D'
];

function generateColors(count) {
  if (count <= DEFAULT_COLORS.length) {
    return DEFAULT_COLORS.slice(0, count);
  }
  // Se precisar de mais cores, gerar gradientes
  const colors = [...DEFAULT_COLORS];
  for (let i = DEFAULT_COLORS.length; i < count; i += 1) {
    const hue = (i * 137.508) % 360; // Golden angle para distribuição uniforme
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
}

export default function ExpensePieChart({
  clienteId,
  selectedCategory, // ID da conta contábil selecionada
  selectedMonth, // YYYY-MM
  selectedBankId, // ID do banco ou null
  expenseData = [], // Dados das contas contábeis
  loading = false,
  reconciliationStatus = {},
  bancos = [],
  mesesDisponiveis = [],
  onCategorySelect,
  onMonthChange,
  onBankChange,
  onLimparFiltro,
}) {
  const theme = useTheme();
  const router = useRouter();
  const { getNomeMes } = useMonthSelector();

  // 🎯 Valores derivados das props (sem estado local desnecessário)
  const displayMonth = selectedMonth || '';
  const displayBank = selectedBankId || 'Todos';

  // 🎯 Transformar expenseData para formato do gráfico
  const chartData = useMemo(() => {
    // ✅ Validação robusta: verificar se é array válido
    if (!Array.isArray(expenseData) || expenseData.length === 0) {
      return {
        series: [],
        labels: [],
        colors: [],
        categories: [],
      };
    }

    // Se há categoria selecionada, filtrar apenas ela
    if (selectedCategory) {
      const categoria = expenseData.find(c => c.contaContabilId === selectedCategory);
      if (categoria) {
        return {
          series: [categoria.total],
          labels: [categoria.contaContabilNome],
          colors: [DEFAULT_COLORS[0]],
          categories: [categoria],
        };
      }
    }

    // Ordenar por total decrescente
    const sortedData = [...expenseData].sort((a, b) => b.total - a.total);
    const colors = generateColors(sortedData.length);

    return {
      series: sortedData.map(c => c.total),
      labels: sortedData.map(c => c.contaContabilNome),
      colors,
      categories: sortedData,
    };
  }, [expenseData, selectedCategory]);

  // 🎯 Calcular total
  const totalExpenses = useMemo(() => {
    if (selectedCategory) {
      const categoria = chartData.categories[0];
      return categoria?.total || 0;
    }
    return chartData.series.reduce((sum, val) => sum + val, 0);
  }, [chartData, selectedCategory]);

  // 🎯 Nome da categoria selecionada
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory || !chartData.categories.length) return null;
    return chartData.categories[0]?.contaContabilNome || null;
  }, [selectedCategory, chartData]);

  // 🔥 Handlers memoizados com useCallback (mês é controlado pelo select global na página)
  const handleBankChangeLocal = useCallback((event) => {
    const novoBanco = event.target.value;
    if (onBankChange) {
      onBankChange(novoBanco === 'Todos' ? null : novoBanco);
    }
  }, [onBankChange]);

  const handleChartClick = useCallback((event, chartContext, config) => {
    if (config.dataPointIndex !== undefined && chartData.categories[config.dataPointIndex]) {
      const categoria = chartData.categories[config.dataPointIndex];
      const { contaContabilId } = categoria || {};
      onCategorySelect(contaContabilId === selectedCategory ? null : contaContabilId);
    }
  }, [chartData.categories, onCategorySelect, selectedCategory]);

  const handleConciliarAgora = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedBankId) params.append('bancoId', selectedBankId);
    if (selectedMonth) params.append('mesAno', selectedMonth);

    router.push(`/portal-cliente/conciliacao-bancaria?${params.toString()}`);
  }, [selectedBankId, selectedMonth, router]);

  // 🎯 Handler para fazer upload de extrato
  const handleFazerUpload = () => {
    const params = new URLSearchParams();
    if (selectedBankId) params.append('bancoId', selectedBankId);
    if (selectedMonth) params.append('mesAno', selectedMonth);

    router.push(`/portal-cliente/conciliacao-bancaria?${params.toString()}`);
  };

  // 🎯 Verificar estados vazios (garantir valores booleanos explícitos)
  const { temExtrato: temExtratoRaw, temConciliacao: temConciliacaoRaw, conciliacaoId } = reconciliationStatus || {};
  // Garantir que sejam booleanos explícitos (tratar undefined/null como false)
  const temExtrato = Boolean(temExtratoRaw);
  const temConciliacao = Boolean(temConciliacaoRaw);
  const mesNome = getNomeMes(selectedMonth || '');

  // 🎯 Obter nome do banco selecionado
  const bancoSelecionadoNome = useMemo(() => {
    if (!selectedBankId) return null; // null quando "Todos os Bancos"
    const banco = bancos.find(b => b._id === selectedBankId);
    return banco?.instituicaoBancariaId?.nome || 'Banco';
  }, [selectedBankId, bancos]);

  // 🎯 Título dinâmico do gráfico
  const tituloGrafico = useMemo(() => {
    const mesFormatado = mesNome || 'Mês Anterior';
    if (bancoSelecionadoNome) {
      return `Saída Ref. ${mesFormatado} - ${bancoSelecionadoNome}`;
    }
    // Quando nenhum banco específico está selecionado, não mencionar o banco
    return `Saída Ref. ${mesFormatado}`;
  }, [mesNome, bancoSelecionadoNome]);

  // 🎯 Opções do gráfico (memoizado para evitar reanimação desnecessária ao selecionar categoria)
  const chartOptionsBase = useMemo(() => ({
    colors: chartData.colors,
    chart: {
      type: 'donut',
      sparkline: { enabled: false },
      animations: {
        enabled: false,
      },
      events: {
        dataPointSelection: handleChartClick,
      },
    },
    grid: {
      padding: { top: 20, bottom: 20 },
    },
    plotOptions: {
      pie: {
        customScale: 1,
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: selectedCategoryName ?? 'Total',
              fontSize: '12px',
              color: theme.palette.text.secondary,
              formatter: () => formatToCurrency(totalExpenses) || 'R$ 0,00',
            },
            value: {
              show: true,
              formatter: (val) => formatToCurrency(val),
              fontSize: '22px',
              fontWeight: 800,
            },
          },
        },
      },
    },
    labels: chartData.labels,
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => formatToCurrency(val) } },
  }), [chartData.colors, chartData.labels, selectedCategoryName, totalExpenses, handleChartClick, theme.palette.text.secondary]);

  const chartOptions = useChart(chartOptionsBase);

  // 🎯 Renderizar estados vazios (ordem importante: primeiro verifica extrato, depois conciliação)
  // 1️⃣ PRIORIDADE: Se não tem extrato, sempre mostrar mensagem de extrato (não importa status de conciliação)
  if (!temExtrato && !loading) {
    return (
      <Card sx={{ ...CARD, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title={tituloGrafico}
          action={
            <Stack direction="row" spacing={1.5} alignItems="center">
              <FormControl size="small">
                <Select
                  value={displayBank}
                  onChange={handleBankChangeLocal}
                  sx={{ fontSize: '0.75rem', fontWeight: 600, height: 32, minWidth: 180 }}
                >
                  <MenuItem value="Todos">Todos Bancos</MenuItem>
                  {bancos.map((banco) => (
                    <MenuItem key={banco._id} value={banco._id}>
                      {banco.instituicaoBancariaId?.nome || 'Banco'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          }
          sx={{
            ...CARD_HEADER,
            py: 2,
            gap: 3,
            '& .MuiCardHeader-action': { m: 0, alignSelf: 'center' }
          }}
        />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mês {mesNome} ainda não possui extrato bancário
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFazerUpload}
            sx={{ textTransform: 'none' }}
          >
            Fazer Upload do Extrato
          </Button>
        </Box>
      </Card>
    );
  }

  // 2️⃣ Se tem extrato mas não foi conciliado (só chega aqui se temExtrato === true)
  if (temExtrato && !temConciliacao && !loading) {
    return (
      <Card sx={{ ...CARD, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title={tituloGrafico}
          action={
            <Stack direction="row" spacing={1.5} alignItems="center">
              <FormControl size="small">
                <Select
                  value={displayBank}
                  onChange={handleBankChangeLocal}
                  sx={{ fontSize: '0.75rem', fontWeight: 600, height: 32, minWidth: 180 }}
                >
                  <MenuItem value="Todos">Todos Bancos</MenuItem>
                  {bancos.map((banco) => (
                    <MenuItem key={banco._id} value={banco._id}>
                      {banco.instituicaoBancariaId?.nome || 'Banco'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          }
          sx={{
            ...CARD_HEADER,
            py: 2,
            gap: 3,
            '& .MuiCardHeader-action': { m: 0, alignSelf: 'center' }
          }}
        />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mês {mesNome} ainda não foi conciliado
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConciliarAgora}
            sx={{ textTransform: 'none' }}
          >
            Conciliar Agora
          </Button>
        </Box>
      </Card>
    );
  }

  // 🎯 Renderizar gráfico normal (com dados ou loading)
  return (
    <Card sx={{ ...CARD, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={tituloGrafico}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            {selectedCategory && (
              <Button
                size="small"
                color="error"
                onClick={onLimparFiltro}
                sx={{ fontSize: '12px', textTransform: 'none', height: 28 }}
              >
                Limpar Filtro
              </Button>
            )}
            <FormControl size="small">
              <Select
                value={displayBank}
                onChange={handleBankChangeLocal}
                sx={{ fontSize: '0.75rem', fontWeight: 600, height: 32, minWidth: 180 }}
              >
                <MenuItem value="Todos">Todos Bancos</MenuItem>
                {bancos.map((banco) => (
                  <MenuItem key={banco._id} value={banco._id}>
                    {banco.instituicaoBancariaId?.nome || 'Banco'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        }
        sx={{
          ...CARD_HEADER,
          py: 2,
          gap: 3,
          '& .MuiCardHeader-action': { m: 0, alignSelf: 'center' }
        }}
      />

      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={40} />
        </Box>
      ) : chartData.series.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Nenhum dado disponível para o período selecionado
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* LADO ESQUERDO (60%) - Gráfico */}
          <Box sx={{
            flex: '0 0 60%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: 0,
          }}>
            <Chart
              key={`chart-${selectedMonth || 'default'}-${selectedBankId || 'all'}`}
              dir="ltr"
              type="donut"
              series={chartData.series}
              options={chartOptions}
              width="100%"
              height={320}
            />
          </Box>

          {/* LADO DIREITO (40%) - Lista de categorias */}
          <Box sx={{
            flex: '0 0 40%',
            minWidth: 0,
            pl: 1,
            pr: 6,
            py: 2,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': { width: 5 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.grey[500], 0.2),
              borderRadius: 2
            },
          }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.25 }}>
              {chartData.categories.map((category, index) => {
                const isSelected = selectedCategory === category.contaContabilId;
                const color = chartData.colors[index] || DEFAULT_COLORS[0];

                return (
                  <Box
                    key={category.contaContabilId}
                    onClick={() => onCategorySelect(isSelected ? null : category.contaContabilId)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.2,
                      borderRadius: 1,
                      minWidth: 0,
                      cursor: 'pointer',
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.grey[500], 0.04),
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.08) },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.78rem',
                          color: isSelected ? 'primary.main' : 'text.primary',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {category.contaContabilNome}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        ml: 1,
                        flexShrink: 0,
                        color: isSelected ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {formatToCurrency(category.total)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}
    </Card>
  );
}
