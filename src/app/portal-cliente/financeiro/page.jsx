'use client';

import { toast } from 'sonner';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';

import axios from 'src/utils/axios';

import { PlansSection } from 'src/sections/financeiro/plans-section';
import { PaymentInfoSection } from 'src/sections/financeiro/payment-info-section';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function PortalClienteFinanceiroView() {
  const { user } = useAuthContext();

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);

  const planData = useMemo(() => ({
    start: {
      subscription: 'start',
      name: 'Start',
      faturamento: 'R$ 20.000,00',
      subtitle: 'O Essencial para Começar Bem',
      description: 'Para quem está abrindo o negócio e quer ficar 100% regularizado sem complicações.',
      features: [
        'Contabilidade Digital Completa',
        'Pró-labore dos Sócios',
        'Envio de Impostos e Taxas',
        'Balanço de Patrimônial e DRE Anual',
        'Suporte por Whatsapp e e-mail'
      ]
    },
    pleno: {
      subscription: 'pleno',
      name: 'Pleno',
      faturamento: 'R$ 100.000,00',
      subtitle: 'Gestão e Crescimento',
      description: 'Para quem já tem operação constante e quer mais controle financeiro e previsibilidade.',
      features: [
        'Contabilidade Digital Completa',
        'Pró-labore dos Sócios',
        'Envio de Impostos e Taxas',
        'Balanço de Patrimônial e DRE Anual',
        'Suporte por Whatsapp e e-mail',
        'Relatórios Trimestrais',
        'Sistema Financeiro',
        'Emissor de Notas Fiscais (até 20 NFs)',
      ]
    },
    premium: {
      subscription: 'premium',
      name: 'Premium',
      faturamento: 'R$ 300.000,00',
      subtitle: 'Estratégia e Performance',
      description: 'Para quem busca crescimento com acompanhamento próximo e visão estratégica.',
      features: [
        'Contabilidade Digital Completa',
        'Pró-labore dos Sócios',
        'Envio de Impostos e Taxas',
        'Balanço de Patrimônial e DRE Anual',
        'Suporte por Whatsapp e e-mail',
        'Relatórios Trimestrais',
        'Sistema Financeiro',
        'Emissor de Notas Fiscais (até 50 NFs)',
        'Reuniões Trimestrais de Sucesso',
        'Gerente exclusivo para sua empresa',
        'Grupo de Whatsapp',
      ]
    }
  }), []);

  const fetchContratos = useCallback(async (userId) => {
    try {
      const params = { page: 1, limit: 10, sortBy: 'dataVencimento', sortOrder: 'desc' };

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/faturas/${userId}`, { params });
      const contratosData = response.data.data || [];
      setContratos(contratosData);

      if (contratosData.length > 0) {
        const planoAtualFromAPI = contratosData[0].planoAtual;
        setCurrentPlan(planData[planoAtualFromAPI] || planData.start);
      } else {
        setCurrentPlan(planData.start);
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      toast.error('Erro ao carregar contratos');
      setCurrentPlan(planData.start);
    }
  }, [planData]);

  useEffect(() => {
    if (user?.userId) {
      fetchContratos(user.userId);
    }
  }, [user?.userId, fetchContratos]);

  useEffect(() => {
    if (currentPlan) {
      setLoading(false);
    }
  }, [currentPlan]);

  const handlePlanChange = useCallback((newPlanSubscription) => {
    if (planData[newPlanSubscription]) {
      setCurrentPlan(planData[newPlanSubscription]);
      toast.success(`Plano alterado para ${planData[newPlanSubscription].name}!`);
    }
  }, [planData]);


  return (
    <Stack spacing={5}>
      <PlansSection
        currentPlan={currentPlan}
        onPlanChange={handlePlanChange}
        planData={planData}
        loading={loading}
      />
      <PaymentInfoSection
        user={user}
        currentPlan={currentPlan}
        contratos={contratos}
        loading={loading}
      />
    </Stack>
  );
}
