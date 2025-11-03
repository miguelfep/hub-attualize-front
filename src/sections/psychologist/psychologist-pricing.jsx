'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const PLANS = [
  {
    title: 'PLANO START',
    badge: 'RECOMENDADO',
    badgeColor: 'info',
    subtitle: 'O Essencial para Começar Bem',
    description: 'Para quem está abrindo o negócio e quer ficar 100% regularizado sem complicações.',
    limit: 'Limitado a faturamentos mensais até R$ 20k',
    features: [
      {
        title: 'Um contábil completo:',
        description:
          'Balancete, balanço patrimonial, DRE, distribuição de lucros e demais obrigações contábeis.',
      },
      {
        title: 'Um fiscal completo:',
        description:
          'Escrituração dos documentos fiscais e apuração de impostos (com análise de Fator R).',
      },
      {
        title: 'Um DP completo:',
        description:
          'Manutenção estratégica nos registros e pró-labore dos sócios com encargos e tributos inclusos.',
      },
      {
        title: 'Portal do Cliente:',
        description:
          'Centralizamos todos os documentos e guias da sua empresa em um único local de fácil acesso.',
      },
      {
        title: 'Suporte Completo:',
        description:
          'Fale conosco via WhatsApp ou e-mail, para tirar dúvidas sobre sua empresa e pedir orientações trabalhistas.',
      },
    ],
    isPopular: false,
  },
  {
    title: 'PLANO PLENO',
    badge: 'MAIS ESCOLHIDO',
    badgeColor: 'warning',
    subtitle: 'Gestão e Crescimento',
    description:
      'Para quem já tem operação constante e quer mais controle financeiro e previsibilidade.',
    limit: 'Limitado a faturamentos mensais até R$ 100k',
    features: [
      {
        title: 'Um contábil completo:',
        description:
          'Balancete, balanço patrimonial, DRE, distribuição de lucros e demais obrigações contábeis.',
      },
      {
        title: 'Um fiscal completo:',
        description:
          'Escrituração dos documentos fiscais e apuração de impostos (com análise de Fator R).',
      },
      {
        title: 'Um DP completo:',
        description:
          'Manutenção estratégica nos registros e pró-labore dos sócios com encargos e tributos inclusos.',
      },
      {
        title: 'Portal do Cliente:',
        description:
          'Centralizamos todos os documentos e guias da sua empresa em um único local de fácil acesso.',
      },
      {
        title: 'Suporte Completo:',
        description:
          'Fale conosco via WhatsApp ou e-mail, para tirar dúvidas sobre sua empresa e pedir orientações trabalhistas.',
      },
      {
        title: 'Relatórios Trimestrais:',
        description:
          'Receba análises detalhadas da saúde financeira do seu negócio a cada trimestre.',
      },
      {
        title: 'Sistema Financeiro:',
        description:
          'Tenha acesso a um sistema para organizar suas contas a pagar e receber de forma eficiente.',
      },
      {
        title: 'Emissor de Notas Fiscais:',
        description:
          'Emita suas notas fiscais de serviço (até 20 NF/mês) diretamente pela plataforma.',
      },
    ],
    isPopular: true,
  },
  {
    title: 'PLANO PREMIUM',
    badge: 'EXCLUSIVO',
    badgeColor: 'secondary',
    subtitle: 'Estratégia e Performance',
    description:
      'Para quem busca crescimento com acompanhamento próximo e visão estratégica.',
    limit: 'Limitado a faturamentos mensais até R$ 300k',
    features: [
      {
        title: 'Um contábil completo:',
        description:
          'Balancete, balanço patrimonial, DRE, distribuição de lucros e demais obrigações contábeis.',
      },
      {
        title: 'Um fiscal completo:',
        description:
          'Escrituração dos documentos fiscais e apuração de impostos (com análise de Fator R).',
      },
      {
        title: 'Um DP completo:',
        description:
          'Manutenção estratégica nos registros e pró-labore dos sócios com encargos e tributos inclusos.',
      },
      {
        title: 'Portal do Cliente:',
        description:
          'Centralizamos todos os documentos e guias da sua empresa em um único local de fácil acesso.',
      },
      {
        title: 'Suporte Completo:',
        description:
          'Fale conosco via WhatsApp ou e-mail, para tirar dúvidas sobre sua empresa e pedir orientações trabalhistas.',
      },
      {
        title: 'Reuniões Trimestrais:',
        description:
          'A cada 3 meses, avaliamos os resultados da sua empresa para tomada de decisões estratégicas.',
      },
      {
        title: 'Relatórios Trimestrais:',
        description:
          'Receba análises detalhadas da saúde financeira do seu negócio a cada trimestre.',
      },
      {
        title: 'Gerente Exclusivo:',
        description:
          'Tenha um especialista dedicado exclusivamente a sua empresa em todos os atendimentos e reuniões.',
      },
      {
        title: 'Sistema Financeiro:',
        description:
          'Tenha acesso a um sistema para organizar suas contas a pagar e receber de forma eficiente.',
      },
      {
        title: 'Emissor de Notas Fiscais:',
        description:
          'Emita suas notas fiscais de serviço (até 50 NF/mês) diretamente pela plataforma.',
      },
      {
        title: 'Grupo no WhatsApp:',
        description:
          'Participe de um grupo exclusivo para centralizar o atendimento e agilizar a comunicação.',
      },
    ],
    isPopular: false,
  },
];

// ----------------------------------------------------------------------

export function PsychologistPricing() {
  const theme = useTheme();

  return (
    <Box
      id="planos"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Planos Sob Medida Para o{' '}
              <Box component="span" sx={{ color: '#FEC615' }}>
                Seu Sucesso
              </Box>
            </Typography>
          </m.div>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' },
            maxWidth: 1400,
            mx: 'auto',
            alignItems: 'stretch',
          }}
        >
          {PLANS.map((plan, index) => (
            <m.div key={plan.title} variants={varFade().inUp}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  bgcolor: plan.isPopular ? 'background.paper' : alpha(theme.palette.grey[500], 0.04),
                  border: plan.isPopular
                    ? `2px solid #FEC615`
                    : `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  boxShadow: plan.isPopular ? theme.customShadows.z24 : theme.customShadows.card,
                  transform: plan.isPopular ? { md: 'scale(1.05)' } : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: plan.isPopular ? { md: 'scale(1.08)' } : 'translateY(-8px)',
                    boxShadow: theme.customShadows.z24,
                  },
                }}
              >
                {plan.isPopular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bgcolor: '#FEC615',
                      color: '#333',
                      px: 2,
                      py: 0.5,
                      borderRadius: '0 0 0 8px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                    }}
                  >
                    {plan.badge}
                  </Box>
                )}

                <Box sx={{ textAlign: 'center', mb: 3, mt: plan.isPopular ? 3 : 0 }}>
                  {!plan.isPopular && (
                    <Chip
                      label={plan.badge}
                      color={plan.badgeColor}
                      size="small"
                      sx={{ mb: 2, fontWeight: 600 }}
                    />
                  )}

                  <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                    {plan.title}
                  </Typography>

                  <Chip
                    label={plan.subtitle}
                    size="small"
                    sx={{
                      mb: 1,
                      bgcolor:
                        plan.badgeColor === 'warning'
                          ? alpha('#FEC615', 0.2)
                          : alpha(theme.palette[plan.badgeColor].main, 0.2),
                      color:
                        plan.badgeColor === 'warning'
                          ? '#333'
                          : theme.palette[plan.badgeColor].dark,
                      fontWeight: 600,
                    }}
                  />

                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.6, px: 2 }}>
                    {plan.description}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'text.disabled',
                      mt: 2,
                      fontSize: '0.75rem',
                    }}
                  >
                    {plan.limit}
                  </Typography>
                </Box>

                <Stack spacing={2} sx={{ flex: 1, mb: 4 }}>
                  {plan.features.map((feature) => (
                    <Stack key={feature.title} direction="row" spacing={1} alignItems="flex-start">
                      <Iconify
                        icon="solar:check-circle-bold"
                        width={20}
                        sx={{ color: '#28a745', flexShrink: 0, mt: 0.25 }}
                      />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        <strong style={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {feature.title}
                        </strong>{' '}
                        <Box component="span" sx={{ color: 'text.secondary' }}>
                          {feature.description}
                        </Box>
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  component={RouterLink}
                  href="#cta-final"
                  fullWidth
                  size="large"
                  variant="contained"
                  sx={{
                    bgcolor: '#FEC615',
                    color: '#333',
                    fontWeight: 700,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: '#e5b213',
                    },
                  }}
                >
                  Consultar Valores
                </Button>
              </Card>
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
