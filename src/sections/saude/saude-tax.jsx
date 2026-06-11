'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const TAX_CARDS = [
  {
    icon: 'solar:calculator-bold-duotone',
    badge: 'Simples Nacional',
    title: 'Fator R: a partir de 6%',
    description:
      'Quando a folha de pagamento (incluindo o pró-labore) representa 28% ou mais do faturamento, atividades da saúde saem do Anexo V (15,5%) e vão para o Anexo III (6%).',
    bullets: [
      'Monitoramento mensal do Fator R',
      'Ajuste estratégico do pró-labore',
      'Alíquotas a partir de 6% sobre o faturamento',
    ],
  },
  {
    icon: 'solar:hospital-bold-duotone',
    badge: 'Lucro Presumido',
    title: 'Equiparação Hospitalar',
    description:
      'Clínicas que realizam procedimentos equiparados a serviços hospitalares podem reduzir a base do IRPJ de 32% para 8% e da CSLL de 32% para 12%.',
    bullets: [
      'Economia que pode passar de 60% nos impostos federais',
      'Análise dos requisitos legais e societários',
      'Indicado para clínicas com procedimentos e exames',
    ],
  },
  {
    icon: 'solar:user-id-bold-duotone',
    badge: 'Autônomo → PJ',
    title: 'Do Carnê-Leão ao CNPJ',
    description:
      'Como pessoa física, o imposto pode chegar a 27,5% no carnê-leão. Com CNPJ e o enquadramento correto, profissionais da saúde costumam pagar bem menos.',
    bullets: [
      'Comparativo PF x PJ gratuito antes de decidir',
      'Abertura de CNPJ sem burocracia',
      'Orientação sobre conselho de classe e CNAE correto',
    ],
  },
];

// ----------------------------------------------------------------------

export function SaudeTax() {
  const theme = useTheme();

  return (
    <Box
      id="tributacao"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Pague{' '}
              <Box component="span" sx={{ color: '#0096D9' }}>
                menos impostos
              </Box>
              , dentro da lei
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography sx={{ maxWidth: 760, mx: 'auto', color: 'text.secondary', lineHeight: 1.8 }}>
              A área da saúde tem benefícios fiscais que a maioria das contabilidades genéricas não
              aplica. Conheça as três principais estratégias que analisamos no seu diagnóstico
              gratuito:
            </Typography>
          </m.div>
        </Box>

        <Grid container spacing={3}>
          {TAX_CARDS.map((card) => (
            <Grid key={card.title} xs={12} md={4}>
              <m.div variants={varFade().inUp} style={{ height: '100%' }}>
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${alpha('#0096D9', 0.16)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.customShadows.z16,
                      borderColor: alpha('#0096D9', 0.4),
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Iconify icon={card.icon} width={40} sx={{ color: '#0096D9', flexShrink: 0 }} />
                    <Chip
                      label={card.badge}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: alpha('#FEC615', 0.16),
                        color: '#8a6d00',
                      }}
                    />
                  </Stack>

                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                    {card.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}
                  >
                    {card.description}
                  </Typography>

                  <Stack spacing={1.5} sx={{ mt: 'auto' }}>
                    {card.bullets.map((bullet) => (
                      <Stack key={bullet} direction="row" spacing={1} alignItems="flex-start">
                        <Iconify
                          icon="solar:check-circle-bold-duotone"
                          width={20}
                          sx={{ color: '#28a745', flexShrink: 0, mt: 0.25 }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {bullet}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              </m.div>
            </Grid>
          ))}
        </Grid>

        <m.div variants={varFade().inUp}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 4,
              color: 'text.disabled',
              maxWidth: 720,
              mx: 'auto',
            }}
          >
            * Os percentuais são ilustrativos e dependem do faturamento, da atividade e do
            enquadramento de cada negócio. A estratégia ideal é definida em análise individual.
          </Typography>
        </m.div>
      </Container>
    </Box>
  );
}
