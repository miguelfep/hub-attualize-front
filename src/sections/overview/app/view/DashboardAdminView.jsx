'use client';

import { useEffect, useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';
import { getUser } from 'src/auth/context/jwt';
import { SeoIllustration } from 'src/assets/illustrations';
import { buscarDadosDashboard } from 'src/actions/lead';

import { AppWelcome } from '../app-welcome';
import { AppFeatured } from '../app-featured';
import { AppWidgetSummary } from '../app-widget-summary';
import { AppNewInvoice } from '../app-new-invoice';
import { EcommerceCurrentBalance } from '../../e-commerce/ecommerce-current-balance';

export default function DashboardAdminView() {
  const user = getUser();

  const appFeatured = [
    {
      id: 1,
      title: 'Vendas',
      description: 'Sistema para vendas e orçamentos',
    },
  ];

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

  useEffect(() => {
    buscarDadosDashboard().then(setDashboardData);
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <AppWelcome
            title={`Olá 👋 \n ${user?.name}`}
            description="Visão geral administrativa"
            img={<SeoIllustration hideBackground />}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppFeatured list={appFeatured} />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Contas a Pagar"
            total={dashboardData.totalContasPagar}
            percent={dashboardData.percentualVariacaoContasPagar}
            chart={{
              categories: dashboardData.categoriesContasPagar,
              series: dashboardData.seriesContasPagar,
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Contas a Receber"
            total={dashboardData.totalCobrancas}
            percent={dashboardData.percentualVariacaoCobrancas}
            chart={{
              categories: dashboardData.categoriesCobrancas,
              series: dashboardData.seriesCobrancas,
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <EcommerceCurrentBalance
            title="Ticket Médio"
            orderTotal={dashboardData.totalContratos}
            currentBalance={dashboardData.ticketMedioContratos}
            texto="Contratos"
          />
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
