'use client';

import { useEffect, useState } from 'react';

import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';
import { getUser } from 'src/auth/context/jwt';
import { buscarDadosDashboard } from 'src/actions/lead';

import { AppWidgetSummary } from '../app-widget-summary';
import { EcommerceCurrentBalance } from '../../e-commerce/ecommerce-current-balance';

export default function DashboardFinanceiroView() {
  const user = getUser();

  const [dashboardData, setDashboardData] = useState({
    totalContasPagar: 0,
    percentualVariacaoContasPagar: 0,
    ticketMedioContratos: 0,
    totalContratos: 0,
    totalCobrancas: 0,
    percentualVariacaoCobrancas: 0,
    categoriesContasPagar: [],
    seriesContasPagar: [],
    categoriesCobrancas: [],
    seriesCobrancas: [],
  });

  useEffect(() => {
    buscarDadosDashboard().then(setDashboardData);
      // eslint-disable-next-line react-hooks/exhaustive-deps

  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
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

        <Grid xs={12} md={6}>
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

        <Grid xs={12}>
          <EcommerceCurrentBalance
            title="Ticket Médio"
            orderTotal={dashboardData.totalContratos}
            currentBalance={dashboardData.ticketMedioContratos}
            texto="Contratos"
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
