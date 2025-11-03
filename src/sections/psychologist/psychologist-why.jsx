'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const WHY_CARDS = [
  {
    icon: 'solar:user-bold-duotone',
    title: 'Especialização',
    description:
      'Foco total nas particularidades fiscais e contábeis de psicólogos (CRP, Fator R, etc.).',
  },
  {
    icon: 'solar:dollar-bold-duotone',
    title: 'Otimização Tributária',
    description:
      'Análise de Fator R e planejamento para garantir o mínimo de impostos (a partir de 6% no Simples).',
  },
  {
    icon: 'solar:calendar-bold-duotone',
    title: '+10 Anos Experiência',
    description: 'Uma década de conhecimento aplicado ao seu negócio.',
  },
  {
    icon: 'solar:like-bold-duotone',
    title: '+200 Clientes',
    description: 'Junte-se a centenas de empresas que confiam na Attualize.',
  },
  {
    icon: 'solar:chat-round-bold-duotone',
    title: 'Atendimento Próximo',
    description:
      'Contadores de verdade, prontos para tirar suas dúvidas sobre fluxo de caixa, impostos ou pró-labore.',
  },
  {
    icon: 'solar:check-circle-bold-duotone',
    title: 'Processos Simples',
    description: 'Menos burocracia para você focar no que realmente importa.',
  },
];

// ----------------------------------------------------------------------

export function PsychologistWhy() {
  const theme = useTheme();

  return (
    <Box
      id="porque"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Entendemos o{' '}
              <Box component="span" sx={{ color: '#FEC615' }}>
                Seu Mundo
              </Box>{' '}
              para Impulsionar{' '}
              <Box component="span" sx={{ color: '#FEC615' }}>
                Seus Resultados
              </Box>
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Box
              sx={{
                maxWidth: 900,
                mx: 'auto',
                color: 'text.secondary',
                '& p': { mb: 2, lineHeight: 1.8 },
              }}
            >
              <Typography>A Attualize é especialista em contabilidade para psicólogos.</Typography>
              <Typography>
                Na prática, isso significa que entendemos a fundo as suas necessidades: do{' '}
                <strong>Carnê-Leão</strong> ao <strong>CNPJ</strong>, da gestão de recibos à
                aplicação do <strong>Fator R</strong> para pagar menos impostos.
              </Typography>
              <Typography>
                Então, vá direto ao ponto com quem entende do assunto. Obtenha a solução exata que
                você precisa, com a qualidade que só a experiência focada pode oferecer!
              </Typography>
            </Box>
          </m.div>
        </Box>

        <Grid container spacing={3}>
          {WHY_CARDS.map((card, index) => (
            <Grid key={card.title} xs={12} sm={6} md={4}>
              <m.div variants={varFade().inUp}>
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    bgcolor: alpha(theme.palette.grey[500], 0.04),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.customShadows.z16,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Iconify
                      icon={card.icon}
                      width={32}
                      sx={{ color: '#0096D9', mr: 2, flexShrink: 0 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {card.title}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {card.description}
                  </Typography>
                </Card>
              </m.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

