'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

import { Grid, Container } from '@mui/material';

import axios from 'src/utils/axios';

import { getBannersForUser } from 'src/data/banners';
import { useSettingsContext } from 'src/contexts/SettingsContext';

import { BannersSection } from 'src/components/banner/banners-section';
import { DashboardSkeleton } from 'src/components/skeleton/DashboardSkeleton';

import { AnalyticsWelcome } from 'src/sections/dashboard-portal-cliente/AnalyticsWelcome';
import VisaoGeralOrcamentos from 'src/sections/dashboard-portal-cliente/chart/VisaoGeralOrcamentos';
import { AnalyticsWidgetSummary } from 'src/sections/dashboard-portal-cliente/AnalyticsWidgetSummary';

import { useAuthContext } from 'src/auth/hooks';

export default function PortalClienteDashboardView() {
  const { user } = useAuthContext();
  const { updateSettings } = useSettingsContext();

  const [dashboardData, setDashboardData] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dashboard/${user.userId}`);
        const { data } = response.data;
        setDashboardData(data);
        if (data?.settings) {
          updateSettings(data.settings);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast.error('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchDashboardData();
      const userBanners = getBannersForUser(user);
      setBanners(userBanners);
    }
  }, [user, user?.userId, updateSettings]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <Container maxWidth="xl">

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <AnalyticsWelcome 
              user={user} 
              vencidasCount={dashboardData?.stats?.licencasVencidas || 0}
              aExpirarCount={dashboardData?.stats?.licencasAExpirar || 0}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <BannersSection banners={banners} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <AnalyticsWidgetSummary
              title="Total de Clientes"
              total={dashboardData?.estatisticasGerais?.totalClientes || 0}
              icon="solar:users-group-rounded-bold-duotone"
              color="primary"
              link="/portal-cliente/clientes"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticsWidgetSummary
              title="Orçamentos Realizados"
              count={dashboardData?.estatisticasGerais?.totalOrcamentosCount || 0}
              total={dashboardData?.estatisticasGerais?.totalOrcamentosValor || 0}
              formatar
              icon="solar:bill-list-bold-duotone"
              color="info"
              link="/portal-cliente/vendas"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <AnalyticsWidgetSummary
              title="Notas Fiscais Emitidas"
              total={dashboardData?.estatisticasGerais?.totalNotasFiscais || 0}
              icon="solar:file-text-bold-duotone"
              color="warning"
              link="/portal-cliente/vendas"
            />
          </Grid>

          <Grid item xs={12} md={12}>
            <VisaoGeralOrcamentos data={dashboardData?.visaoGeralAnual || []} />
          </Grid>
        </Grid>
      </Container>
    </LazyMotion>
  );
}
