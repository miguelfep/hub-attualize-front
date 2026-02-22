'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';

import { useEmpresa } from 'src/hooks/use-empresa';

import axios from 'src/utils/axios';

import { useGetGuiasFiscaisPortal } from 'src/actions/guias-fiscais';
import { useBancosCliente } from 'src/app/portal-cliente/conciliacao-bancaria/hooks/use-bancos-cliente';

import { formatToCurrency } from 'src/components/animate';

import { useAuthContext } from 'src/auth/hooks';

import MetricCard from './components/MetricCards';
import { ANIMATION_FADE_IN_UP } from './components/dash-tokens';
import {
  useKPIMetrics,
  useExpenseData,
  useMonthSelector,
  useTransacoesConta,
  useReconciliationStatus,
} from './hooks';
import {
  MetricCardSkeleton,
  ExpensePieChartSkeleton,
  TaxCalendarWidgetSkeleton,
  BudgetOverviewChartSkeleton,
  AccountsPayableListSkeleton,
} from './skeletons';

// ✅ Componentes lazy (pesados - charts e modais)
const ExpensePieChartLazy = dynamic(
  () => import('./components/ExpensePieChart'),
  {
    ssr: false,
    loading: () => <ExpensePieChartSkeleton />,
  }
);

const BudgetOverviewChartLazy = dynamic(
  () => import('./components/BudgetOverviewChart'),
  {
    ssr: false,
    loading: () => <BudgetOverviewChartSkeleton />,
  }
);

const TaxCalendarWidgetLazy = dynamic(
  () => import('./components/TaxCalendarWidget'),
  {
    ssr: false,
    loading: () => <TaxCalendarWidgetSkeleton sx={{ boxShadow: 'none' }} />,
  }
);

const AccountsPayableListLazy = dynamic(
  () => import('./components/AccountsPayableList'),
  {
    ssr: false,
    loading: () => <AccountsPayableListSkeleton />,
  }
);

const DetalhesMensalModalLazy = dynamic(
  () => import('./components/DetalhesMensalModalArea'),
  {
    ssr: false,
  }
);

export default function PortalClienteDash2View() {
  const { user } = useAuthContext();
  const userId = user?.userId;

  // 🎯 Estados principais
  const [selectedCategory, setSelectedCategory] = useState(null); // Conta contábil selecionada
  const [selectedMonth, setSelectedMonth] = useState(null); // Mês selecionado para filtro do gráfico (YYYY-MM, null = mês anterior)
  const [selectedBankId, setSelectedBankId] = useState(null); // Banco selecionado (null = "Todos")
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonthForModal, setSelectedMonthForModal] = useState(null); // Mês selecionado para modal de detalhes

  // 🎯 Hooks de dados
  const { empresaAtiva } = useEmpresa(userId);
  const clienteId = empresaAtiva || userId; // Usar empresaAtiva se disponível, senão userId

  // 🎯 Hook helper para meses
  const { mesAnterior, mesesDisponiveis, getNomeMes } = useMonthSelector();

  // 🎯 Buscar bancos do cliente
  const { bancos, loading: loadingBancos } = useBancosCliente(clienteId);

  // 🎯 Mês atual (mês anterior se não selecionado)
  const mesAnoAtual = selectedMonth || mesAnterior;

  // 🎯 Hooks de dados de conciliação
  const {
    expenseData,
    loading: loadingExpenseData,
    error: errorExpenseData,
  } = useExpenseData(clienteId, selectedBankId, mesAnoAtual);

  const {
    status: reconciliationStatus,
    loading: loadingReconciliationStatus,
  } = useReconciliationStatus(clienteId, selectedBankId, mesAnoAtual);

  const {
    entrada: kpiEntrada,
    saida: kpiSaida,
    temExtrato: kpiTemExtrato,
    mesExibicao: kpiMesExibicao,
    loading: loadingKPIs,
  } = useKPIMetrics(clienteId, selectedBankId, mesAnoAtual);

  const {
    transacoes: transacoesConta,
    loading: loadingTransacoesConta,
  } = useTransacoesConta(clienteId, selectedCategory, selectedBankId, mesAnoAtual);

  // 🎯 Outros dados
  const { data, isLoading } = useGetGuiasFiscaisPortal({ limit: 200 });

  // 🎯 Buscar dados do dashboard da API (para vendas) — mesAno atualiza Vendas quando o backend suportar
  useEffect(() => {
    if (!userId) return;
    const fetchDashboardData = async () => {
      try {
        setLoadingDashboard(true);
        const url = `${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dashboard/${userId}`;
        const params = new URLSearchParams();
        if (mesAnoAtual) params.set('mesAno', mesAnoAtual);
        const query = params.toString();
        const response = await axios.get(query ? `${url}?${query}` : url);
        setDashboardData(response.data.data);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, [userId, mesAnoAtual]);

  // 🎯 Handler para limpar filtro (voltar para mês anterior)
  const handleLimparFiltro = useCallback(() => {
    setSelectedCategory(null);
    setSelectedMonth(null); // Volta para mês anterior
  }, []);

  // 🎯 Handler para mudança de mês
  const handleMonthChange = useCallback((mesAno) => {
    setSelectedMonth(mesAno);
    // Não limpar categoria ao mudar mês, mas pode limpar se necessário
  }, []);

  // 🎯 Handler para mudança de banco
  const handleBankChange = useCallback((bancoId) => {
    setSelectedBankId(bancoId === 'Todos' || bancoId === '' ? null : bancoId);
  }, []);

  // 🎯 Handler para seleção de conta contábil
  const handleCategorySelect = useCallback((contaContabilId) => {
    setSelectedCategory(contaContabilId === selectedCategory ? null : contaContabilId);
  }, [selectedCategory]);

  // 🎯 Label do período para os chips (todos os cards usam o mesmo mês selecionado)
  const chipPeriodo = useMemo(() => {
    const label = mesesDisponiveis.find((m) => m.value === mesAnoAtual)?.labelCurto || 'Mês Anterior';
    return label;
  }, [mesAnoAtual, mesesDisponiveis]);

  // 🎯 Vendas do período: usar visaoGeralAnual (vendas por mês) quando existir, senão faturamentoMensal
  const vendasDoPeriodo = useMemo(() => {
    const { faturamentoMensal, visaoGeralAnual } = dashboardData || {};
    if (!visaoGeralAnual?.length || !mesAnoAtual) return faturamentoMensal ?? 0;
    const [anoStr, mesStr] = mesAnoAtual.split('-');
    const ano = parseInt(anoStr, 10);
    const mes = parseInt(mesStr, 10); // 1-12
    const item = visaoGeralAnual.find((i) => i.ano === ano && i.mes === mes);
    return item?.vendas ?? faturamentoMensal ?? 0;
  }, [dashboardData, mesAnoAtual]);

  // 🎯 Calcular KPIs dinamicamente
  const metrics = useMemo(() => [
      {
        label: 'Vendas',
        value: formatToCurrency(vendasDoPeriodo || 0),
        change: 2.6,
        isPositive: true,
        icon: 'solar:chart-2-bold-duotone',
        color: 'primary',
        mostrarChipMesAtual: true,
        chipLabel: selectedMonth ? chipPeriodo : 'Mês Atual',
      },
      {
        label: 'Saída',
        value: formatToCurrency(kpiSaida || 0),
        valorExtrato: kpiSaida || 0,
        change: 0.8,
        isPositive: false,
        icon: 'account_balance_wallet',
        color: 'warning',
        mostrarChipExtrato: kpiTemExtrato,
        chipLabel: chipPeriodo,
        loading: loadingKPIs,
      },
      {
        label: 'Entrada',
        value: formatToCurrency(kpiEntrada || 0),
        valorExtrato: kpiEntrada || 0,
        change: 1.2,
        isPositive: true,
        icon: 'savings',
        color: 'success',
        mostrarChipExtrato: kpiTemExtrato,
        chipLabel: chipPeriodo,
        loading: loadingKPIs,
      },
    ], [vendasDoPeriodo, kpiEntrada, kpiSaida, kpiTemExtrato, loadingKPIs, selectedMonth, chipPeriodo]);

  // Transformar dados da API para o formato do gráfico
  const chartData = useMemo(() => {
    if (!dashboardData?.visaoGeralAnual) return [];

    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return dashboardData.visaoGeralAnual.map(item => ({
      label: item.label,
      orcamentos: item.orcamentos,
      vendas: item.vendas,
      ano: item.ano,
      mes: item.mes,
      mesNome: meses[item.mes - 1]
    }));
  }, [dashboardData]);

  // Nome da conta contábil selecionada
  const contaContabilNome = useMemo(() => {
    if (!selectedCategory || !expenseData || expenseData.length === 0) return null;
    const categoria = expenseData.find(c => c.contaContabilId === selectedCategory);
    return categoria?.contaContabilNome || null;
  }, [selectedCategory, expenseData]);

  // 🎯 Handler para clique no gráfico de orçamento (modal de detalhes)
  const handleMonthClick = (monthData) => {
    // monthData já vem com mes como número da API
    if (monthData?.mes && monthData?.ano) {
      setSelectedMonthForModal({
        ano: monthData.ano,
        mes: monthData.mes,
        label: monthData.label
      });
      setIsModalOpen(true);
    } else {
      console.warn("Dados do mês inválidos:", monthData);
    }
  };

  const handleCloseModel = () => {
    setIsModalOpen(false);
    setSelectedMonthForModal(null);
  };

  const handleMonthSelectChange = useCallback((event) => {
    const mesAno = event.target.value;
    handleMonthChange(mesAno || null);
  }, [handleMonthChange]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.50',
        overflow: 'hidden',
        pt: { xs: 1, sm: 1.25 },
        px: { xs: 1.5, sm: 2 },
        pb: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Select Mês/Ano global — atualiza Vendas, Saída e Entrada */}
      <Box sx={{ mb: 1.5, flexShrink: 0, ...ANIMATION_FADE_IN_UP }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Período:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={mesAnoAtual}
              onChange={handleMonthSelectChange}
              displayEmpty
              sx={{ fontSize: '0.875rem', fontWeight: 600, height: 36, bgcolor: 'background.paper' }}
            >
              {mesesDisponiveis.map((mes) => (
                <MenuItem key={mes.value} value={mes.value}>
                  {mes.labelCurto}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
          gap: { xs: 1.25, sm: 2 },
          mb: 2,
          flexShrink: 0,
          ...ANIMATION_FADE_IN_UP,
        }}
      >
        {loadingDashboard || loadingKPIs ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <MetricCardSkeleton key={`skeleton-${idx}`} />
          ))
        ) : (
          metrics.map((metric, idx) => (
            <MetricCard key={idx} metric={metric} index={idx} />
          ))
        )}
      </Box>

      {/* 2. Grid Principal (72% | 28%) */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2.57fr) minmax(0, 1fr)' },
          gap: { xs: 1.5, md: 2 },
          overflow: { xs: 'auto', md: 'hidden' },
          overflowX: 'hidden',
          ...ANIMATION_FADE_IN_UP,
          animationDelay: '50ms',
          animationFillMode: 'backwards',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          <Box sx={{ flex: 1.1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
            {loadingExpenseData || loadingReconciliationStatus ? (
              <ExpensePieChartSkeleton />
            ) : (
              <ExpensePieChartLazy
                clienteId={clienteId}
                selectedCategory={selectedCategory}
                selectedMonth={mesAnoAtual}
                selectedBankId={selectedBankId}
                expenseData={expenseData}
                loading={false}
                reconciliationStatus={reconciliationStatus}
                bancos={bancos}
                mesesDisponiveis={mesesDisponiveis}
                onCategorySelect={handleCategorySelect}
                onMonthChange={handleMonthChange}
                onBankChange={handleBankChange}
                onLimparFiltro={handleLimparFiltro}
              />
            )}
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
            {loadingDashboard || !chartData || chartData.length === 0 ? (
              <BudgetOverviewChartSkeleton />
            ) : (
              <BudgetOverviewChartLazy 
                data={chartData} 
                onMonthClick={handleMonthClick} 
              />
            )}
          </Box>

          {isModalOpen && (
            <DetalhesMensalModalLazy
              isOpen={isModalOpen}
              onClose={handleCloseModel}
              monthData={selectedMonthForModal}
              userId={userId}
            />
          )}
        </Box>

        <Box sx={{ minHeight: 0, minWidth: 0, maxWidth: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
          <Box sx={{ flex: 1.5, minHeight: 0, minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
            {loadingTransacoesConta ? (
              <AccountsPayableListSkeleton />
            ) : (
              <AccountsPayableListLazy
                filterCategory={selectedCategory}
                transacoes={transacoesConta}
                loading={false}
                contaContabilNome={contaContabilNome}
              />
            )}
          </Box>

          <Box sx={{ flexShrink: 0, minHeight: 440, maxHeight: 540, minWidth: 0, maxWidth: '100%' }}>
            {isLoading ? (
              <TaxCalendarWidgetSkeleton sx={{ boxShadow: 'none' }} />
            ) : (
              <TaxCalendarWidgetLazy
                guias={data?.guias || []}
                isLoading={false}
                sx={{ boxShadow: 'none' }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
