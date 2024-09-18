'use client';

import { useState, useEffect } from 'react';

import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import { buscarDadosDashboard } from 'src/actions/lead';
import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';

import { getUser } from 'src/auth/context/jwt';

import { AppWelcome } from '../app-welcome';
import { AppFeatured } from '../app-featured';
import { AppNewInvoice } from '../app-new-invoice';
import { AppWidgetSummary } from '../app-widget-summary';

export function OverviewAppView() {
  const [dashboardData, setDashboardData] = useState({
    totalContasPagar: 0,
    percentualVariacaoContasPagar: 0,
    categoriesContasPagar: [],
    seriesContasPagar: [],
    totalCobrancas: 0,
    percentualVariacaoCobrancas: 0,
    categoriesCobrancas: [],
    seriesCobrancas: [],
    leads: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const user = getUser();

  const appFeatured = [
    {
      id: 1,
      title: 'Vendas',
      description: 'Sistema para vendas e orçamentos',
    },
  ];

  const fetchDashboardData = async () => {
    try {
      const response = await buscarDadosDashboard();
      setDashboardData({
        totalContasPagar: response.totalContasPagar || 0,
        percentualVariacaoContasPagar: response.percentualVariacaoContasPagar || 0,
        categoriesContasPagar: response.categoriesContasPagar || [],
        seriesContasPagar: response.seriesContasPagar || [],
        totalCobrancas: response.totalCobrancas || 0,
        percentualVariacaoCobrancas: response.percentualVariacaoCobrancas || 0,
        categoriesCobrancas: response.categoriesCobrancas || [],
        seriesCobrancas: response.seriesCobrancas || [],
        leads: response.leads || [],
      });
    } catch (err) { // Renomeando a variável de 'error' para 'err'
      setError('Erro ao buscar dados do dashboard.');
      console.error('Erro ao buscar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <AppWelcome
            title={`Olá 👋 \n ${user?.name}`}
            description="Espero que você tenha uma otima experiencia em nosso HUB"
            img={<SeoIllustration hideBackground />}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppFeatured list={appFeatured} />
        </Grid>
        {/* Contas a Pagar */}
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Contas a Pagar"
            total={dashboardData.totalContasPagar}
            percent={dashboardData.percentualVariacaoContasPagar}
            chart={{
              categories:
                dashboardData.categoriesContasPagar.length > 0
                  ? dashboardData.categoriesContasPagar
                  : ['Nenhum dado'],
              series:
                dashboardData.seriesContasPagar.length > 0 ? dashboardData.seriesContasPagar : [0],
            }}
          />
        </Grid>

        {/* Cobranças */}
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Cobranças"
            total={dashboardData.totalCobrancas}
            percent={dashboardData.percentualVariacaoCobrancas}
            chart={{
              categories:
                dashboardData.categoriesCobrancas.length > 0
                  ? dashboardData.categoriesCobrancas
                  : ['Nenhum dado'],
              series:
                dashboardData.seriesCobrancas.length > 0 ? dashboardData.seriesCobrancas : [0],
            }}
          />
        </Grid>

        {/* Leads */}
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Leads"
            total={dashboardData.leads.length} // Exibe o total de leads
            percent={0} // Sem cálculo de variação para leads
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [18, 19, 31, 8, 16, 37, 12, 33], // Dados fictícios para o gráfico
            }}
          />
        </Grid>
        <Grid xs={12} lg={12}>
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
