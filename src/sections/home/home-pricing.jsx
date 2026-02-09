'use client';

import { m } from 'framer-motion';
import React, { useMemo, useEffect } from 'react';

import { useTheme } from '@mui/material/styles';
import { Box, Tab, Tabs, Stack, Button, Divider, Container, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, varScale, MotionViewport } from 'src/components/animate';

import { SectionTitle } from './components/section-title';
import { FloatLine, FloatXIcon } from './components/svg-elements';

// ----------------------------------------------------------------------

export function HomePricing({ sx, ...other }) {
  const theme = useTheme();
  
  // Valores válidos dos planos - memoizado para evitar recriação a cada render
  const validValues = useMemo(() => ['Start', 'Pleno', 'Premium', 'Plus'], []);
  
  // Garantir que o valor inicial seja sempre válido - passar validValues para o hook
  const tabs = useTabs('Start', validValues);
  
  // Validação imediata e agressiva: forçar correção se o valor for inválido ANTES de qualquer cálculo
  // Isso garante que "Standard" nunca seja passado ao Tabs
  // IMPORTANTE: Esta validação deve executar ANTES de qualquer uso do tabs.value
  // Usar uma constante para evitar múltiplas leituras do valor
  const currentTabValue = tabs.value;
  
  // Validação crítica: se o valor for "Standard" ou inválido, forçar 'Start' IMEDIATAMENTE
  if (currentTabValue === 'Standard' || (currentTabValue && !validValues.includes(currentTabValue))) {
    // Corrigir imediatamente no estado - SEMPRE forçar 'Start' se inválido
    if (currentTabValue !== 'Start') {
      tabs.setValue('Start');
    }
  }
  
  // Valor seguro para o Tabs - sempre válido
  // Garante que nunca passe um valor inválido para o componente Tabs
  // Validação rigorosa: se o valor não for válido, forçar 'Start' imediatamente
  const safeTabValue = useMemo(() => {
    const currentValue = tabs.value;
    
    // Validação rigorosa: garantir que o valor seja sempre válido
    // Se o valor for "Standard" ou qualquer outro valor inválido, forçar 'Start'
    if (!currentValue || currentValue === 'Standard' || typeof currentValue !== 'string' || !validValues.includes(currentValue)) {
      // Corrigir imediatamente no estado se inválido
      if (currentValue && currentValue !== 'Start') {
        // Usar setTimeout com 0 para garantir que a correção aconteça após o render atual
        setTimeout(() => {
          tabs.setValue('Start');
        }, 0);
      }
      // Retornar 'Start' imediatamente para evitar passar valor inválido ao Tabs
      return 'Start';
    }
    return currentValue;
  }, [tabs, validValues]);
  
  // Validação adicional: garantir que o valor seja sempre válido antes de renderizar
  // Isso força a correção mesmo se o valor inválido vier de cache
  useEffect(() => {
    const currentValue = tabs.value;
    if (currentValue && !validValues.includes(currentValue)) {
      // Forçar correção imediata
      tabs.setValue('Start');
    }
  }, [tabs.value, validValues, tabs.setValue, tabs]);
  
  // Corrigir valor no estado se for inválido (executa imediatamente e no mount)
  useEffect(() => {
    const currentValue = tabs.value;
    // Validação adicional: garantir que o valor seja sempre válido
    if (currentValue && !validValues.includes(currentValue)) {
      // Forçar correção imediata
      tabs.setValue('Start');
    }
  }, [tabs.value, validValues, tabs]);

  const renderDescription = (
    <SectionTitle
      caption="Planos"
      title="Conheça nossos"
      txtGradient="Planos"
      description="Conheça um pouco mais os planos da Attualize Contábil e saiba qual deles atende às suas necessidades!"
      sx={{ mb: 8, textAlign: 'center' }}
    />
  );

  const renderContentDesktop = (
    <Box gridTemplateColumns="repeat(4, 1fr)" sx={{ display: { xs: 'none', md: 'grid' } }}>
      {PLANS.map((plan) => (
        <PlanCard
          key={plan.license}
          plan={plan}
          sx={{
            ...(plan.license === 'Pleno' && {
              transform: 'scale(1.05)',
              zIndex: 1,
              boxShadow: theme.shadows[5],
            }),
            ...(plan.license === 'Plus' && {
              [theme.breakpoints.down(1440)]: {
                borderLeft: `dashed 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
                borderRight: `dashed 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
              },
            }),
          }}
        />
      ))}
    </Box>
  );

  const renderContentMobile = (
    <Stack spacing={5} alignItems="center" sx={{ display: { md: 'none' } }}>
      <Tabs
        value={(() => {
          // Validação inline: garantir que o valor seja sempre válido antes de passar ao Tabs
          // Especialmente importante: nunca passar "Standard" ou qualquer valor inválido
          // Esta é a ÚLTIMA camada de proteção antes do Tabs receber o valor
          const currentValue = safeTabValue || tabs.value || 'Start';
          
          // Validação rigorosa: se o valor não for válido OU for "Standard", forçar 'Start'
          // NUNCA passar "Standard" ao Tabs, mesmo que venha do estado
          // Esta validação é CRÍTICA e deve SEMPRE retornar um valor válido
          if (
            !currentValue || 
            currentValue === 'Standard' || 
            typeof currentValue !== 'string' || 
            !validValues.includes(currentValue)
          ) {
            // Corrigir no estado imediatamente
            if (tabs.value && tabs.value !== 'Start' && tabs.value !== currentValue) {
              // Usar requestAnimationFrame para garantir que a correção aconteça
              requestAnimationFrame(() => {
                tabs.setValue('Start');
              });
            }
            // SEMPRE retornar 'Start' se o valor for inválido - NUNCA passar "Standard"
            return 'Start';
          }
          // Validação final: garantir que o valor retornado seja sempre válido
          // Se por algum motivo ainda não for válido, retornar 'Start'
          return validValues.includes(currentValue) ? currentValue : 'Start';
        })()}
        onChange={(event, newValue) => {
          // Validar antes de atualizar - garantir que seja sempre um valor válido
          const validatedValue = validValues.includes(newValue) ? newValue : 'Start';
          tabs.onChange(event, validatedValue);
        }}
        sx={{
          boxShadow: `0px -2px 0px 0px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)} inset`,
        }}
      >
        {PLANS.map((tab) => (
          <Tab key={tab.license} value={tab.license} label={tab.license} />
        ))}
      </Tabs>

      <Box
        sx={{
          width: 1,
          borderRadius: 2,
          border: `dashed 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
        }}
      >
        {PLANS.map(
          (tab) => tab.license === tabs.value && <PlanCard key={tab.license} plan={tab} />
        )}
      </Box>
    </Stack>
  );

  return (
    <Stack component="section" sx={{ py: 10, position: 'relative', ...sx }} {...other}>
      <MotionViewport>
        <FloatLine vertical sx={{ top: 0, left: 80 }} />

        <Container>{renderDescription}</Container>

        <Box
          sx={{
            position: 'relative',
            '&::before, &::after': {
              width: 64,
              height: 64,
              content: "''",
              [theme.breakpoints.up(1440)]: {
                display: 'block',
              },
            },
          }}
        >
          <Container>{renderContentDesktop}</Container>

          <FloatLine sx={{ top: 64, left: 0 }} />
          <FloatLine sx={{ bottom: 64, left: 0 }} />
        </Box>

        <Container>{renderContentMobile}</Container>
      </MotionViewport>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function PlanCard({ plan, sx, ...other }) {
  const startLicense = plan.license === 'Start';
  const plenoLicense = plan.license === 'Pleno';
  const premiumLicense = plan.license === 'Premium';

  const renderLines = (
    <>
      <FloatLine vertical sx={{ top: -64, left: 0, height: 'calc(100% + (64px * 2))' }} />
      <FloatLine vertical sx={{ top: -64, right: 0, height: 'calc(100% + (64px * 2))' }} />
      <FloatXIcon sx={{ top: -8, left: -8 }} />
      <FloatXIcon sx={{ top: -8, right: -8 }} />
      <FloatXIcon sx={{ bottom: -8, left: -8 }} />
      <FloatXIcon sx={{ bottom: -8, right: -8 }} />
    </>
  );

  return (
    <Stack
      spacing={5}
      component={MotionViewport}
      sx={{
        px: 6,
        py: 8,
        position: 'relative',
        ...sx,
      }}
      {...other}
    >
      {plenoLicense && renderLines}

      <Stack direction="row" alignItems="center">
        <Stack flexGrow={1}>
          <m.div variants={varFade({ distance: 24 }).inLeft}>
            <Typography variant="h4" component="h6">
              {plan.license}
            </Typography>
          </m.div>

          <m.div variants={varScale({ distance: 24 }).inX}>
            <Box
              sx={{
                width: 32,
                height: 6,
                opacity: 0.24,
                borderRadius: 1,
                bgcolor: 'error.main',
                ...(startLicense && { bgcolor: 'primary.main' }),
                ...(plenoLicense && { bgcolor: 'secondary.main' }),
              }}
            />
          </m.div>
        </Stack>
      </Stack>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
          Faturamento:
        </Typography>
        <Typography variant="body2" color="primary.main">
          {plan.revenue}
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        {plan.commons.map((option) => (
          <Stack
            key={option}
            component={m.div}
            variants={varFade().in}
            spacing={1.5}
            direction="row"
            alignItems="center"
            sx={{ typography: 'body2' }}
          >
            <Iconify width={16} icon="eva:checkmark-fill" />
            {option}
          </Stack>
        ))}

        <m.div variants={varFade({ distance: 24 }).inLeft}>
          <Divider sx={{ borderStyle: 'dashed' }} />
        </m.div>

        {plan.options.map((option, index) => {
          const disabled =
            (startLicense && [0, 1, 2, 3, 4].includes(index)) ||
            (plenoLicense && [2, 3, 4].includes(index)) ||
            (premiumLicense && [3, 4].includes(index));

          return (
            <Stack
              key={option}
              component={m.div}
              variants={varFade().in}
              spacing={1.5}
              direction="row"
              alignItems="center"
              sx={{
                typography: 'body2',
                ...(disabled && { color: 'text.disabled', textDecoration: 'line-through' }),
              }}
            >
              <Iconify width={18} icon={disabled ? 'mingcute:close-line' : 'eva:checkmark-fill'} />
              {option}
            </Stack>
          );
        })}
      </Stack>

      <m.div variants={varFade({ distance: 24 }).inUp}>
        <Button
          fullWidth
          variant={plenoLicense ? 'contained' : 'outlined'}
          color="inherit"
          size="large"
          target="_blank"
          rel="noopener"
          href={plan.link}
        >
          Quero Esse
        </Button>
      </m.div>
    </Stack>
  );
}

// ----------------------------------------------------------------------

const PLANS = [
  {
    license: 'Start',
    price: 69,
    commons: ['Contabilidade', 'Impostos', 'Pró-labore', 'Portal do Cliente'],
    options: [
      'Sistema financeiro',
      'Atendimento via whatsapp',
      'Reuniões mensais',
      'Gerente de sucesso',
      'Power BI',
    ],
    revenue: 'R$ 20.000,00',
    link: 'https://api.whatsapp.com/send?phone=55413068-1800&text=Oi,%20vim%20pelo%20site%20e%20quero%20informa%C3%A7%C3%B5es%20sobre%20o%20plano%20de%20contabilidade%20START',
  },
  {
    license: 'Pleno',
    price: 129,
    commons: ['Contabilidade', 'Impostos', 'Pró-labore', 'Portal do Cliente'],
    options: [
      'Sistema financeiro',
      'Atendimento via whatsapp',
      'Reuniões mensais',
      'Gerente de sucesso',
      'Power BI',
    ],
    revenue: 'R$ 100.000,00',
    link: 'https://api.whatsapp.com/send?phone=55413068-1800&text=Oi,%20vim%20pelo%20site%20e%20quero%20informa%C3%A7%C3%B5es%20sobre%20o%20plano%20de%20contabilidade%20PLENO',
  },
  {
    license: 'Premium',
    price: 599,
    commons: [
      'Contabilidade',
      'Impostos',
      'Pró-labore',
      'Certificado Digital E-CNPJ',
      'Portal do Cliente',
    ],
    options: [
      'Sistema financeiro',
      'Atendimento via whatsapp',
      'Reuniões mensais',
      'Gerente de sucesso',
      'Power BI',
    ],
    revenue: 'R$ 300.000,00',
    link: 'https://api.whatsapp.com/send?phone=55413068-1800&text=Oi,%20vim%20pelo%20site%20e%20quero%20informa%C3%A7%C3%B5es%20sobre%20o%20plano%20de%20contabilidade%20PREMIUM',
  },
  {
    license: 'Plus',
    price: 999,
    commons: [
      'Contabilidade',
      'Impostos',
      'Pró-labore',
      'Certificado Digital E-CNPJ',
      'Portal do Cliente',
    ],
    options: [
      'Sistema financeiro',
      'Atendimento via whatsapp',
      'Reuniões mensais',
      'Gerente de sucesso',
      'Power BI',
    ],
    revenue: 'Sem limites',
    link: 'https://api.whatsapp.com/send?phone=55413068-1800&text=Oi,%20vim%20pelo%20site%20e%20quero%20informa%C3%A7%C3%B5es%20sobre%20o%20plano%20de%20contabilidade%20PLUS',
  },
];
