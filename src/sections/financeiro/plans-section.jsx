import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const PLAN_ICONS = {
  start: 'solar:rocket-bold',
  pleno: 'solar:users-group-rounded-bold',
  premium: 'solar:crown-bold',
  plus: 'solar:buildings-bold',
};

const PLAN_COLORS = {
  start: 'primary',
  pleno: 'info',
  premium: 'warning',
  plus: 'error',
};

export function PlansSection({ currentPlan, onPlanChange, planData }) {
  const [loading, setLoading] = useState(false);

  // Ordem dos planos (do menor para o maior)
  const planOrder = ['start', 'pleno', 'premium', 'plus'];
  
  // Filtrar planos baseado no plano atual
  const getAvailablePlans = () => {
    console.log('🔍 PlansSection - currentPlan:', currentPlan);
    console.log('🔍 PlansSection - planData:', planData);
    
    if (!currentPlan || !planData) {
      console.log('⚠️ Sem currentPlan ou planData, retornando todos os planos');
      return Object.values(planData || {});
    }

    const currentIndex = planOrder.indexOf(currentPlan.subscription);
    console.log('🔍 Current index:', currentIndex, 'for subscription:', currentPlan.subscription);
    
    if (currentIndex === -1) {
      console.log('⚠️ Plano não encontrado na ordem, retornando todos');
      return Object.values(planData);
    }

    // Retornar apenas o plano atual e os planos superiores
    const filteredPlans = planOrder
      .slice(currentIndex)
      .map(subscription => planData[subscription])
      .filter(Boolean);
    
    console.log('✅ Planos filtrados:', filteredPlans.map(p => p.subscription));
    return filteredPlans;
  };

  const availablePlans = getAvailablePlans();

  const handleUpgradePlan = useCallback(async (planSubscription) => {
    if (planSubscription === currentPlan?.subscription) return;

    try {
      setLoading(true);
      // Aqui você faria a chamada para a API para alterar o plano
      console.log('🔄 Alterando plano para:', planSubscription);
      
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onPlanChange) {
        onPlanChange(planSubscription);
      }
      
      // Aqui você mostraria uma mensagem de sucesso
      console.log('✅ Plano alterado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao alterar plano:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPlan?.subscription, onPlanChange]);

  const renderUpgradeOption = (plan) => (
    <Grid xs={12} sm={6} md={3} key={plan.subscription}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          opacity: plan.subscription === currentPlan?.subscription ? 0.6 : 1,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 2,
          },
        }}
      >
        {plan.subscription === currentPlan?.subscription && (
          <Label
            color="success"
            startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            Atual
          </Label>
        )}

        <Stack spacing={1.5} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Nome e Faturamento */}
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
              {plan.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
              Faturamento: {plan.faturamento}
            </Typography>
          </Stack>

          {/* Features */}
          <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
            {plan.features.map((feature, index) => (
              <Stack key={index} direction="row" alignItems="center" spacing={1}>
                <Iconify 
                  icon="eva:checkmark-circle-2-fill" 
                  width={14} 
                  sx={{ color: 'success.main' }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {feature}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {/* Botão de Upgrade - sempre na parte inferior */}
          <Box sx={{ mt: 'auto', pt: 1 }}>
            {plan.subscription !== currentPlan?.subscription ? (
              <Button
                variant="contained"
                onClick={() => handleUpgradePlan(plan.subscription)}
                disabled={loading}
                startIcon={loading ? <Iconify icon="eos-icons:loading" /> : <Iconify icon="eva:arrow-upward-fill" />}
                size="small"
                fullWidth
              >
                {loading ? 'Alterando...' : 'Fazer Upgrade'}
              </Button>
            ) : (
              <Box sx={{ height: 36 }} />
            )}
          </Box>
        </Stack>
      </Paper>
    </Grid>
  );

  return (
    <Card>
      <CardHeader 
        title="Planos Disponíveis" 
        subheader="Escolha o plano que melhor atende às suas necessidades"
      />
      
      <CardContent>
        <Grid container spacing={3}>
          {availablePlans.map(renderUpgradeOption)}
        </Grid>
      </CardContent>
    </Card>
  );
}
