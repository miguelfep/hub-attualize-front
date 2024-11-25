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
import { AppAreaInstalled } from '../app-area-installed';
import { EcommerceCurrentBalance } from '../../e-commerce/ecommerce-current-balance';

export function OverviewAppView() {
  const [dashboardData, setDashboardData] = useState({
    totalContasPagar: 0,
    percentualVariacaoContasPagar: 0,
    ticketMedioContratos: 0,
    totalContratos: 0,
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
        ticketMedioContratos: response.ticketMedioContratos || 0,
        totalContratos: response.totalContratos || 0,
        categoriesContasPagar: response.categoriesContasPagar || [],
        seriesContasPagar: response.seriesContasPagar || [],
        totalCobrancas: response.totalCobrancas || 0,
        percentualVariacaoCobrancas: response.percentualVariacaoCobrancas || 0,
        categoriesCobrancas: response.categoriesCobrancas || [],
        seriesCobrancas: response.seriesCobrancas || [],
        leads: response.leads || [],
      });
    } catch (err) {
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

  // Verifica se o usuário tem a role 'admin' ou 'financeiro'
  const isFinanceOrAdmin = user?.role === 'admin' || user?.role === 'financeiro';

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <AppWelcome
            title={`Olá 👋 \n ${user?.name}`}
            description="Espero que você tenha uma ótima experiência em nosso HUB"
            img={<SeoIllustration hideBackground />}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppFeatured list={appFeatured} />
        </Grid>

        {/* Condicional para Contas a Pagar e Cobranças */}
        {isFinanceOrAdmin && (
          <>
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
                    dashboardData.seriesContasPagar.length > 0
                      ? dashboardData.seriesContasPagar
                      : [0],
                }}
              />
            </Grid>

            {/* Cobranças */}
            <Grid xs={12} md={4}>
              <AppWidgetSummary
                title="Contas a Receber"
                total={dashboardData.totalCobrancas}
                percent={dashboardData.percentualVariacaoCobrancas}
                chart={{
                  categories:
                    dashboardData.categoriesCobrancas.length > 0
                      ? dashboardData.categoriesCobrancas
                      : ['Nenhum dado'],
                  series:
                    dashboardData.seriesCobrancas.length > 0
                      ? dashboardData.seriesCobrancas
                      : [0],
                }}
              />
            </Grid>
     
   
        <Grid xs={12} md={4}>          
          <EcommerceCurrentBalance
            title="Ticket Médio"
            orderTotal={dashboardData.totalContratos}
            currentBalance={dashboardData.ticketMedioContratos}
          />
        </Grid>

        <Grid xs={12} md={12} lg={12}>
          <AppAreaInstalled
            title="Carteira de clientes"
            chart={{
              categories: [
                'Jan',
                'Fev',
                'Mar',
                'Abr',
                'Mai',
                'Jun',
                'Jul',
                'Ago',
                'Set',
                'Out',
                'Nov',
                'Dez',
              ],
              series: [
                {
                  name: '2023',
                  data: [
                    { name: 'Entrada', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Churn', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Pontual', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                  ],
                },
                {
                  name: '2024',
                  data: [
                    { name: 'Entrada', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8] },
                    { name: 'Churn', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8] },
                    { name: 'Pontual', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8] },
                  ],
                },                
              ],
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
        </>
        )}
      </Grid>      
    </DashboardContent>
  );
}
