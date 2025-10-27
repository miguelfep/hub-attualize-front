import { m } from 'framer-motion';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { PlanCardSkeleton } from 'src/components/skeleton/PlanSkeleton';

// ----------------------------------------------------------------------

const MotionGrid = m(Grid);

const PLAN_ICONS = {
  start: 'solar:rocket-bold-duotone',
  pleno: 'solar:users-group-rounded-bold-duotone',
  premium: 'solar:crown-bold-duotone',
};

const PLAN_COLORS = {
  start: 'primary',
  pleno: 'info',
  premium: 'warning',
};

function PlanCard({ plan, isCurrent, isUpgrading, onUpgrade }) {
  const theme = useTheme();
  const color = PLAN_COLORS[plan.subscription] || 'default';

  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `2px solid`,
        borderColor: isCurrent ? theme.palette[color].main : 'transparent',
        opacity: isCurrent ? 1 : 0.8,
        transition: theme.transitions.create(['transform', 'box-shadow', 'opacity', 'border-color']),
        '&:hover': {
          opacity: 1,
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 16px 0 ${alpha(theme.palette.grey[500], 0.24)}`,
          borderColor: theme.palette[color].main,
        },
      }}
    >
      {isCurrent && (
        <Label color="success" startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />} sx={{ position: 'absolute', top: 16, right: 16 }}>
          Plano Atual
        </Label>
      )}

      <Box sx={{ width: 48, height: 48, mb: 2, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: `${color}.main`, bgcolor: alpha(theme.palette[color].main, 0.08) }}>
        <Iconify icon={PLAN_ICONS[plan.subscription]} width={28} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          {plan.name}
        </Typography>
        <Chip
          label={plan.subtitle}
          size="small"
          sx={{
            ml: 'auto',
            bgcolor: 'action.selected', 
            color: 'text.secondary',
            fontWeight: 'medium',
            borderRadius: '16px', 
          }}
        />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
        {plan.description}
      </Typography>

      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

      <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 2.5 }}>
        {plan.features.map((feature) => (
          <Stack key={feature} direction="row" alignItems="center" spacing={1.5}>
            <Iconify icon="eva:checkmark-circle-2-fill" width={16} sx={{ color: 'success.main' }} />
            <Typography variant="body2">{feature}</Typography>
          </Stack>
        ))}
      </Stack>

      {!isCurrent ? (
        <Button variant="contained" color={color} onClick={() => onUpgrade(plan.subscription)} disabled={isUpgrading} startIcon={isUpgrading ? <Iconify icon="eos-icons:loading" /> : null} size="large" fullWidth>
          {isUpgrading ? 'Redirecionando...' : 'Fazer Upgrade'}
        </Button>
      ) : (
        <Button variant="outlined" color="inherit" size="large" fullWidth disabled>Seu Plano Atual</Button>
      )}
    </Card>
  );
}

export function PlansSection({ currentPlan, onPlanChange, planData, loading }) {
  const theme = useTheme();
  
  const [isUpgrading, setIsUpgrading] = useState(false);
  const planOrder = useMemo(() => ['start', 'pleno', 'premium'], []);

  const availablePlans = useMemo(() => {
    if (!currentPlan || !planData) return [];
    
    const currentIndex = planOrder.indexOf(currentPlan.subscription);
    
    if (currentIndex === -1) return [];

    return planOrder.slice(currentIndex).map((sub) => planData[sub]).filter(Boolean);
  }, [currentPlan, planData, planOrder]);

  // ALTERAÇÃO PRINCIPAL: A lógica da função foi atualizada
  const handleUpgradePlan = useCallback((planSubscription) => {
      // Garante que temos os dados necessários
      if (!currentPlan || planSubscription === currentPlan.subscription) return;

      setIsUpgrading(true);

      const planoAtual = currentPlan.name;
      const novoPlano = planData[planSubscription]?.name;

      if (!novoPlano) {
          console.error("Dados do novo plano não encontrados!");
          setIsUpgrading(false);
          return;
      }

      const textoMensagem = `Olá! Vim pelo Portal do Cliente e gostaria de migrar do meu plano "${planoAtual}" para o plano "${novoPlano}".`;
      
      const whatsappUrl = `https://wa.me/5541996982267?text=${encodeURIComponent(textoMensagem)}`;
      
      window.open(whatsappUrl, '_blank');

      setTimeout(() => {
        setIsUpgrading(false);
      }, 2500);
    },
    [currentPlan, planData]
  );


  const renderSkeletons = () => (
    [...Array(4)].map((_, index) => (
      <Grid item xs={12} sm={6} md={3} key={`skeleton-${index}`}>
        <PlanCardSkeleton isCurrentPlan={index === 0} />
      </Grid>
    ))
  );
  
  return (
    <Card>
      <CardHeader
        title="Seu Plano e Upgrades"
        titleTypographyProps={{ variant: "h4", fontWeight: 700, color: 'text.primary' }} 
        subheader="Confira seu plano atual e as opções disponíveis para crescer"
        sx={{
          p: 4,
          bgcolor: 'background.neutral',
          borderRadius: '16px 16px 0 0',
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.1
          )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        }}
      />
      <CardContent>
        <Grid container spacing={3} sx={{ flexWrap: ''}}>
          {loading
            ? renderSkeletons()
            : availablePlans.map((plan, index) => (
                <MotionGrid
                  item
                  key={plan.subscription}
                  xs={12}
                  sm={6}
                  md={3}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PlanCard
                    plan={plan}
                    isCurrent={plan.subscription === currentPlan?.subscription}
                    isUpgrading={isUpgrading}
                    onUpgrade={handleUpgradePlan}
                  />
                </MotionGrid>
              ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
