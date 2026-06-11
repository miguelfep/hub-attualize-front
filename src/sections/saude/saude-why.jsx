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
    icon: 'solar:hand-heart-bold-duotone',
    title: 'Atendimento Humanizado',
    description:
      'Chega de tickets infinitos e robôs que não entendem o que você quer. Aqui na Attualize valorizamos a comunicação entre pessoas.',
  },
  {
    icon: 'solar:heart-pulse-bold-duotone',
    title: 'Especialização em Saúde',
    description:
      'Foco total nas particularidades fiscais e contábeis da saúde: conselhos de classe, CNAEs corretos, vigilância sanitária e tributação da sua atividade.',
  },
  {
    icon: 'solar:dollar-bold-duotone',
    title: 'Otimização Tributária',
    description:
      'Análise de Fator R, equiparação hospitalar e comparativo de regimes para garantir o mínimo de impostos dentro da lei.',
  },
  {
    icon: 'solar:calendar-bold-duotone',
    title: '+10 Anos de Experiência',
    description: 'Uma década de conhecimento aplicado a consultórios e clínicas de todo o Brasil.',
  },
  {
    icon: 'solar:chat-round-dots-bold-duotone',
    title: 'Agilidade no WhatsApp',
    description:
      'Sabemos que sua rotina é corrida. Atendemos pelo WhatsApp com agilidade, envolvendo sua secretária ou sócios sempre que necessário.',
  },
  {
    icon: 'solar:monitor-bold-duotone',
    title: '100% Digital',
    description:
      'Atendimento em todo o Brasil, sem papelada e sem você precisar sair do consultório.',
  },
];

// ----------------------------------------------------------------------

export function SaudeWhy() {
  const theme = useTheme();

  return (
    <Box
      id="porque"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Valorizamos o{' '}
              <Box component="span" sx={{ color: '#0096D9' }}>
                atendimento humanizado
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
              <Typography>
                Quem cuida de pessoas merece uma contabilidade que também cuida.
              </Typography>
              <Typography>
                Seja você médico, dentista, psicólogo ou fisioterapeuta: vá direto ao ponto com quem
                entende do assunto e tenha a solução exata que o seu negócio precisa, com a
                qualidade que só a experiência focada na saúde pode oferecer.
              </Typography>
            </Box>
          </m.div>
        </Box>

        <Grid container spacing={3}>
          {WHY_CARDS.map((card) => (
            <Grid key={card.title} xs={12} sm={6} md={4}>
              <m.div variants={varFade().inUp} style={{ height: '100%' }}>
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    bgcolor: 'background.paper',
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
