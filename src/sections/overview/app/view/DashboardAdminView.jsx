'use client';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { Skeleton, Typography } from '@mui/material';

import { toTitleCase } from 'src/utils/helper';

import { DashboardContent } from 'src/layouts/dashboard';
import { buscarDadosDashboard, buscarDashboardFinanceiroPagar, buscarDashboardFinanceiroReceber, } from 'src/actions/lead';

import { SimplePaper } from 'src/components/paper/SimplePaper';
import ChartCardSkeleton from 'src/components/skeleton/ChartCardSkeleton';
import WidgetSummarySkeleton from 'src/components/skeleton/WidgetSummarySkeleton';

import DashboardFiltros from 'src/sections/dashboard/admin/chart/DashboardFiltros';
import DetalhesDiaModal from 'src/sections/dashboard/admin/chart/DetalhesDiaModal';
import ComposicaoReceberDonnut from 'src/sections/dashboard/admin/chart/ComposicaoReceberDonnut';

import { getUser } from 'src/auth/context/jwt';

import { AppNewInvoice } from '../app-new-invoice';
import { AppWidgetSummary } from '../app-widget-summary';
import VisaoGeralBarras from '../../../dashboard/admin/chart/VisaoGeralBarras';
import DashboardGeralArea from '../../../dashboard/admin/chart/DashboardGeralArea';
import { EcommerceCurrentBalance } from '../../e-commerce/ecommerce-current-balance';
import ComposicaoPagarDonnut from '../../../dashboard/admin/chart/ComposicaoPagarDonnut';


export default function DashboardAdminView() {

  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [donnutData, setDonnutData] = useState('pagar');

  const [dashboardData, setDashboardData] = useState(null);
  const [financeiroPagar, setFinanceiroPagar] = useState(null);
  const [financeiroReceber, setFinanceiroReceber] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateData, setSelectedDateData] = useState(null);


  const [filters, setFilters] = useState({
    dataInicio: dayjs().startOf('month').toISOString(),
    dataFim: dayjs().endOf('month').toISOString(),
    // Filtros de Contas a Pagar
    tipo: '',
    statusPagar: '',
    // Filtros de Contas a Receber
    statusCobranca: '',
    statusInvoice: '',
  });


  const fetchData = useCallback(async () => {
    try {
      const promises = [
        buscarDadosDashboard(filters),
        buscarDashboardFinanceiroPagar(filters),
        buscarDashboardFinanceiroReceber(filters),
      ];

      const [dashboardResult, pagarResult, receberResult] = await Promise.all(promises);

      setDashboardData(dashboardResult);
      setFinanceiroPagar(pagarResult);
      setFinanceiroReceber(receberResult);

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      setDashboardData(null);
      setFinanceiroPagar(null);
      setFinanceiroReceber(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const areaCharData = useMemo(() => {
    const aggregateByDay = (transtions, dateField, valueField) => {
      const dailyTotals = new Map();
      if (!transtions) return [];
      transtions.forEach((item) => {
        const date = dayjs(item[dateField]).startOf('day').valueOf();
        const value = item.total ?? item.valor ?? 0;
        dailyTotals.set(date, (dailyTotals.get(date) || 0) + value);
      });
      return Array.from(dailyTotals.entries()).sort((a, b) => a[0] - b[0]);
    }

    const receitas = [
      ...(financeiroReceber?.infoInvoices ?? []),
      ...(financeiroReceber?.infoCobrancas ?? []),
    ]

    const despesas = financeiroPagar?.infoContasPagar ?? [];

    const seriesReceitas = aggregateByDay(receitas, 'dataVencimento');
    const seriesDespesas = aggregateByDay(despesas, 'dataVencimento');

    return {
      seriesReceitas,
      seriesDespesas,
    }
  }, [financeiroPagar, financeiroReceber]);

  const handleFilterChange = useCallback((event) => {
    const { name, value } = event.target;
    setFilters(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

    const handleDateClick = (timestamp) => {
    const clickedDate = dayjs(timestamp);

    const invoicesDoDia = (financeiroReceber?.infoInvoices ?? []).map((item) => ({
      ...item,
      tipoLancamento: 'invoice',
    }))

    const cobrancasDoDia = (financeiroReceber?.infoCobrancas ?? []).map((item) => ({
      ...item,
      tipoLancamento: 'cobranca',
    }))

    const receitasDoDia = [...invoicesDoDia, ...cobrancasDoDia]
      .filter((item) => dayjs(item.dataVencimento).isSame(clickedDate, 'day'));

    const despesasDoDia = (financeiroPagar?.infoContasPagar ?? [])
      .map((item) => ({
        ...item,
        tipoLancamento: 'conta_a_pagar',
      }))
    .filter((item) => dayjs(item.dataVencimento).isSame(clickedDate, 'day'));

    setSelectedDateData({ date: timestamp, receitas: receitasDoDia, despesas: despesasDoDia });
    setIsModalOpen(true);
};

  const handleCloseModal = () =>  setIsModalOpen(false);

  if (loading) {
    return (
      <DashboardContent maxWidth="xl">
        <Grid container spacing={3}>
          <Grid xs={12}>
            <Skeleton variant="rounded" height={80} />
          </Grid>

          <Grid xs={12} md={4}>
            <WidgetSummarySkeleton />
          </Grid>
          <Grid xs={12} md={4}>
            <WidgetSummarySkeleton />
          </Grid>
          <Grid xs={12} md={4}>
            <WidgetSummarySkeleton />
          </Grid>

          <Grid xs={12} md={12}>
            <ChartCardSkeleton chartType="rectangular" />
          </Grid>

          <Grid xs={12} md={4}>
            <ChartCardSkeleton chartType="rectangular" />
          </Grid>

          <Grid xs={12} md={8}>
            <ChartCardSkeleton chartType="circular" />
          </Grid>

          <Grid xs={12}>
            <Skeleton variant="rounded" height={320} />
          </Grid>
        </Grid>
      </DashboardContent>
    );
  }

     if (!dashboardData || !financeiroPagar || !financeiroReceber) {
    return (
       <DashboardContent>
        <Typography variant="h6" color="error">
          Não foi possível carregar os dados do dashboard.
        </Typography>
      </DashboardContent>
    )
  }

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>

        <Grid xs={12} md={12}>
          <SimplePaper>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Olá {toTitleCase(user?.name)} 👋
              </Typography>
              <Typography variant="subtitle3" color="text.secondary">
                Confira suas métricas em nosso painel de controle!
              </Typography>
          </SimplePaper>
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Contas a Pagar"
            total={dashboardData.totalContasPagar}
            percent={dashboardData.percentualVariaçãoContasPagar}
            isCurrency
            chart={{
              categories: dashboardData.categoriesContasPagar || [],
              series: dashboardData.seriesContasPagar || [],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Contas a Receber"
            total={dashboardData.totalCobrancas}
            percent={dashboardData.percentualVariacaoCobrancas}
            isCurrency
            chart={{
              categories: dashboardData.categoriesCobrancas || [],
              series: dashboardData.seriesCobrancas || [],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Novos Clientes"
            total={dashboardData.totalEntradasClientes || 0 }
            percent={dashboardData.percentualNovosClientes}
            chart={{
              categories: dashboardData.categoriesCobrancas || [],
              series: dashboardData.seriesCobrancas || [],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <EcommerceCurrentBalance
            title="Ticket Médio"
            orderTotal={dashboardData.totalContratos}
            currentBalance={dashboardData.ticketMedioContratos}
            texto="Contratos"
          />
        </Grid>

        <Grid xs={12} md={12}>
          <DashboardGeralArea
            height={500}
            series={[
              { name: 'Receitas', type: 'line', data: areaCharData.seriesReceitas },
              { name: 'Despesas', type: 'line', data: areaCharData.seriesDespesas }
            ]}
            onDateClick={handleDateClick}
          />
        </Grid>

        <DetalhesDiaModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          data={selectedDateData}
        />

      <Grid container xs={12} justifyContent="center" spacing={3}>
        <Grid item>
          <DashboardFiltros onFilterChange={handleFilterChange} />
        </Grid>
      </Grid>

        <Grid xs={12} md={4}>
          <VisaoGeralBarras
            totalPagar={financeiroPagar?.totalContasPagar ?? 0}
            totalReceber={financeiroReceber?.totalContasReceber ?? 0}
            activeView={donnutData}
            onBarClick={setDonnutData}
            height={414}
          />
        </Grid>

        <Grid xs={12} md={8}>
          {donnutData === 'pagar' ? (
            <ComposicaoPagarDonnut
              height={350}
              dadosContaPagar={financeiroPagar?.infoContasPagar ?? []}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          ) : (
            <ComposicaoReceberDonnut
              height={350}
              dadosInvoice={financeiroReceber?.infoInvoices ?? []}
              dadosCobrancas={financeiroReceber?.infoCobrancas ?? []}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          )}
        </Grid>

        <Grid xs={12}>
          <AppNewInvoice
            title="Leads"
            tableData={dashboardData.leads}
            headLabel={[
              { id: 'nome', label: 'Nome' },
              { id: 'segment', label: 'Segmento' },
              { id: 'local', label: 'Local' },
              { id: 'status', label: 'Contato' },
              { id: '' },
            ]}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
