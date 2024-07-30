import React from 'react';
import { m } from 'framer-motion';

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
  const tabs = useTabs('Standard');

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
        value={tabs.value}
        onChange={tabs.onChange}
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
            (startLicense && [0, 1, 2, 3, 4].includes(index)) || (plenoLicense && [ 2, 3, 4].includes(index)) || (premiumLicense && [3, 4].includes(index));

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
    commons: [
      'Contabilidade',
      'Impostos',
      'Pró-labore',
      'Portal do Cliente',
    ],
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
    commons: [
      'Contabilidade',
      'Impostos',
      'Pró-labore',
      'Portal do Cliente',
    ],
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
