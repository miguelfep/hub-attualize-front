'use client';

import { toast } from 'sonner';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';

import axios from 'src/utils/axios';

import { SimplePaper } from 'src/components/paper/SimplePaper';

import { PlansSection } from 'src/sections/financeiro/plans-section';
import { PaymentInfoSection } from 'src/sections/financeiro/payment-info-section';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function PortalClienteFinanceiroView() {
  const { user, empresa } = useAuthContext();

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);

  // Dados dos planos disponíveis
  const planData = useMemo(() => ({
    start: { 
      subscription: 'start', 
      name: 'Start', 
      faturamento: 'R$ 20.000,00',
      description: 'Plano inicial para começar',
      features: ['Contabilidade', 'Impostos', 'Pró-labore', 'Portal do Cliente']
    },
    pleno: { 
      subscription: 'pleno', 
      name: 'Pleno', 
      faturamento: 'R$ 100.000,00',
      description: 'Plano intermediário',
      features: ['Contabilidade', 'Impostos', 'Pró-labore', 'Portal do Cliente', 'Sistema financeiro', 'Atendimento via whatsapp']
    },
    premium: { 
      subscription: 'premium', 
      name: 'Premium', 
      faturamento: 'R$ 300.000,00',
      description: 'Plano avançado',
      features: ['Contabilidade', 'Impostos', 'Pró-labore', 'Certificado Digital E-CNPJ', 'Portal do Cliente', 'Sistema financeiro', 'Atendimento via whatsapp', 'Reuniões mensais']
    },
    plus: { 
      subscription: 'plus', 
      name: 'Plus', 
      faturamento: 'Sem limites',
      description: 'Plano completo sem limites',
      features: ['Contabilidade', 'Impostos', 'Pró-labore', 'Certificado Digital E-CNPJ', 'Portal do Cliente', 'Sistema financeiro', 'Atendimento via whatsapp', 'Reuniões mensais', 'Gerente de sucesso', 'Power BI']
    },
  }), []);

  useEffect(() => {
    const fetchContratos = async () => {
      try {
        setLoading(true);
        const params = {
          page: 1,
          limit: 10,
          sortBy: 'dataVencimento',
          sortOrder: 'desc', // da mais recente para a mais antiga
        };

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/faturas/${  user.userId}`, { params });
        const contratosData = response.data.data || [];
        setContratos(contratosData);

        // Definir o plano atual baseado na resposta da API
        if (contratosData.length > 0) {
          const planoAtualFromAPI = contratosData[0].planoAtual;
          console.log('🎯 Plano atual da API:', planoAtualFromAPI);
          if (planoAtualFromAPI && planData[planoAtualFromAPI]) {
            setCurrentPlan(planData[planoAtualFromAPI]);
            console.log('✅ Plano atual definido:', planData[planoAtualFromAPI]);
          } else {
            console.log('❌ Plano não encontrado no planData:', planoAtualFromAPI);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar contratos:', error);
        toast.error('Erro ao carregar contratos');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchContratos();
    }
  }, [user?.userId, planData]);

  const handlePlanChange = useCallback((newPlanSubscription) => {
    // Aqui você faria a chamada para a API para alterar o plano
    console.log('🔄 Alterando plano para:', newPlanSubscription);
    
    if (planData[newPlanSubscription]) {
      setCurrentPlan(planData[newPlanSubscription]);
      toast.success(`✅ Plano alterado para ${planData[newPlanSubscription].name}!`);
    }
  }, [planData]);

  const handleEmpresaChange = useCallback((novaEmpresa) => {
    console.log('🏢 Empresa alterada para:', novaEmpresa);
    // Recarregar dados da nova empresa
    if (user?.userId) {
      const fetchContratos = async () => {
        try {
          setLoading(true);
          const params = {
            page: 1,
            limit: 10,
            sortBy: 'dataVencimento',
            sortOrder: 'desc',
          };

          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/faturas/${  user.userId}`, { params });
          const contratosData = response.data.data || [];
          setContratos(contratosData);

          // Definir o plano atual baseado na resposta da API
          if (contratosData.length > 0) {
            const planoAtualFromAPI = contratosData[0].planoAtual;
            console.log('🎯 Plano atual da API:', planoAtualFromAPI);
            if (planoAtualFromAPI && planData[planoAtualFromAPI]) {
              setCurrentPlan(planData[planoAtualFromAPI]);
              console.log('✅ Plano atual definido:', planData[planoAtualFromAPI]);
            } else {
              console.log('❌ Plano não encontrado no planData:', planoAtualFromAPI);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar contratos:', error);
          toast.error('Erro ao carregar contratos');
        } finally {
          setLoading(false);
        }
      };

      fetchContratos();
    }
  }, [user?.userId, planData]);

  return (
    <SimplePaper>
      <Stack spacing={4}>
       {/* Seção de Planos */}
        <PlansSection 
          currentPlan={currentPlan} 
          onPlanChange={handlePlanChange}
          planData={planData}
        />

        {/* Seção de Informações de Pagamento */}
        <PaymentInfoSection 
          user={user} 
          currentPlan={currentPlan}
          contratos={contratos}
        />
      </Stack>
    </SimplePaper>
  );
}
