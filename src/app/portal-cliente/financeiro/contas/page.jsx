'use client';

import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';

import axios from 'src/utils/axios';

import { SimplePaper } from 'src/components/paper/SimplePaper';

import { PlansSection } from 'src/sections/financeiro/plans-section';
import { PaymentInfoSection } from 'src/sections/financeiro/payment-info-section';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function PortalClienteFaturasView() {
  const { user } = useAuthContext();

  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado do plano atual (você pode buscar isso de uma API)
  const [currentPlan, setCurrentPlan] = useState({
    subscription: 'starter',
    name: 'Starter',
    price: 29.90,
    features: ['Até 50 clientes', 'Suporte prioritário', 'Relatórios avançados'],
  });

  useEffect(() => {
    const fetchFaturas = async () => {
      try {
        setLoading(true);
        const params = {
          page: 1,
          limit: 10,
          sortBy: 'dataVencimento',
          sortOrder: 'desc', // da mais recente para a mais antiga
        };

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/faturas/${  user.userId}`, { params });
        setFaturas(response.data.data || []);
      } catch (error) {
        console.error('Erro ao carregar faturas:', error);
        toast.error('Erro ao carregar faturas');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchFaturas();
    }
  }, [user?.userId]);


  const handlePlanChange = useCallback((newPlanSubscription) => {
    // Aqui você faria a chamada para a API para alterar o plano
    console.log('🔄 Alterando plano para:', newPlanSubscription);
    
    // Simular atualização do plano
    const planData = {
      basic: { subscription: 'basic', name: 'Básico', price: 0 },
      starter: { subscription: 'starter', name: 'Starter', price: 29.90 },
      premium: { subscription: 'premium', name: 'Premium', price: 59.90 },
      enterprise: { subscription: 'enterprise', name: 'Enterprise', price: 99.90 },
    };
    
    setCurrentPlan(planData[newPlanSubscription]);
    toast.success(`✅ Plano alterado para ${planData[newPlanSubscription].name}!`);
  }, []);

  return (
    <SimplePaper>
      <Stack spacing={4}>
        {/* Seção de Planos */}
        <PlansSection 
          currentPlan={currentPlan} 
          onPlanChange={handlePlanChange} 
        />

        {/* Seção de Informações de Pagamento */}
        <PaymentInfoSection 
          user={user} 
          currentPlan={currentPlan}
          faturas={faturas}
        />

      </Stack>
    </SimplePaper>
  );
}
