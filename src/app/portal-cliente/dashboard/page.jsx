'use client';

import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

import { Grid, Container } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useResponsive } from 'src/hooks/use-responsive';

import axios from 'src/utils/axios';

import { getBannersForUser } from 'src/data/banners';
import { useSettingsContext } from 'src/contexts/SettingsContext';

import { BannersSection } from 'src/components/banner/banners-section';
import { DashboardSkeleton } from 'src/components/skeleton/DashboardSkeleton';

import { AnalyticsWelcome } from 'src/sections/dashboard-portal-cliente/AnalyticsWelcome';
import DetalhesMensalModal from 'src/sections/dashboard-portal-cliente/chart/DetalhesMensalModal';
import VisaoGeralOrcamentos from 'src/sections/dashboard-portal-cliente/chart/VisaoGeralOrcamentos';
import { AnalyticsWidgetSummary } from 'src/sections/dashboard-portal-cliente/AnalyticsWidgetSummary';

import { useAuthContext } from 'src/auth/hooks';

export default function PortalClienteDashboardView() {
  const { user } = useAuthContext();
  const { updateSettings } = useSettingsContext();

  const [dashboardData, setDashboardData] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const isMobile = useResponsive('down', 'sm');

  const fetchDashboardData = useCallback(async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dashboard/${user.userId}`);
      const { data } = response.data;
      setDashboardData(data);
      if (data?.settings) {
        updateSettings(data.settings);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, updateSettings]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (user) {
      const userBanners = getBannersForUser(user);
      setBanners(userBanners);
    }
  }, [user]);

  const handleMonthClick = ({ ano, mes, label }) => {
    if (!ano || !mes || !label) return;
    setSelectedMonth({ ano, mes, label });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <Container 
        maxWidth="xl"
        sx={{
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={3} sx={{ width: '100%' }}>
          <Grid item xs={12} md={8}>
            <AnalyticsWelcome user={user} />
          </Grid>

          {!isMobile && (
            <Grid item xs={12} md={4} sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
              <BannersSection banners={banners} />
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={6}>
            <AnalyticsWidgetSummary
              title="Orçamentos do Mês"
              total={dashboardData?.valorOrcamentoMensal || 0}
              formatar
              icon="solar:bill-list-bold-duotone"
              color="info"
              link={paths.cliente.orcamentos.root}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <AnalyticsWidgetSummary
              title="Faturamento Mensal"
              count={dashboardData?.notaFiscalMensal || 0}
              total={dashboardData?.faturamentoMensal || 0}
              formatar
              icon="solar:file-text-bold-duotone"
              color="warning"
              link={paths.cliente.faturamentos.root}
            />
        </Grid>
          <Grid item xs={12} sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}> 
            <VisaoGeralOrcamentos
              height={500} 
              data={dashboardData?.visaoGeralAnual || [] }
              onMonthClick={handleMonthClick}
            />
          </Grid>
        </Grid>

        <DetalhesMensalModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          monthData={selectedMonth}
          userId={user?.userId}
        />
      </Container>
    </LazyMotion>
  );
}