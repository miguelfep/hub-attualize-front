'use client';

import { m } from 'framer-motion';

import { alpha, useTheme } from '@mui/material/styles';
import { Box, Grid, Chip, Paper, Stack, Rating, Avatar, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ana Paula Santos',
    clinic: 'Clínica Beleza & Estética',
    city: 'Curitiba - PR',
    avatar: '/assets/images/avatar/avatar-1.webp',
    rating: 5,
    testimonial: 'A Attualize transformou a gestão da minha clínica! Com abertura de CNPJ e suporte especializado, consegui focar 100% nos meus clientes. A economia em impostos foi impressionante!',
    specialty: 'Estética Facial',
  },
  {
    id: 2,
    name: 'Mariana Costa',
    clinic: 'Estética Avançada',
    city: 'São Paulo - SP',
    avatar: '/assets/images/avatar/avatar-2.webp',
    rating: 5,
    testimonial: 'Economizei mais de R$ 4.000 no primeiro ano! A equipe entende perfeitamente as necessidades de clínicas de estética e sempre tem soluções práticas. Recomendo demais!',
    specialty: 'Estética Corporal',
  },
  {
    id: 3,
    name: 'Juliana Oliveira',
    clinic: 'Clínica Harmonia',
    city: 'Florianópolis - SC',
    avatar: '/assets/images/avatar/avatar-3.webp',
    rating: 5,
    testimonial: 'O atendimento especializado para estética faz toda a diferença! Eles entendem sobre Lei Salão-Parceiro, CNAEs e sempre têm soluções que realmente funcionam. Excelente!',
    specialty: 'Estética Integrada',
  },
  {
    id: 4,
    name: 'Roberta Alves',
    clinic: 'Beleza & Bem-Estar',
    city: 'Brasília - DF',
    avatar: '/assets/images/avatar/avatar-4.webp',
    rating: 5,
    testimonial: 'Migrei de outra contabilidade e foi a melhor decisão! Preço justo, atendimento humanizado e total transparência. Minha clínica nunca esteve tão organizada financeiramente.',
    specialty: 'Estética Facial e Corporal',
  },
  {
    id: 5,
    name: 'Fernanda Lima',
    clinic: 'Clínica Estética Premium',
    city: 'Salvador - BA',
    avatar: '/assets/images/avatar/avatar-5.webp',
    rating: 5,
    testimonial: 'Impressionante como simplificaram minha rotina! Portal intuitivo, relatórios claros e sempre disponíveis para tirar dúvidas sobre impostos ou contratos. Parceria de confiança!',
    specialty: 'Estética Avançada',
  },
  {
    id: 6,
    name: 'Patricia Mendes',
    clinic: 'Estética & Beleza',
    city: 'Recife - PE',
    avatar: '/assets/images/avatar/avatar-6.webp',
    rating: 5,
    testimonial: 'A abertura do CNPJ foi super rápida e sem burocracia. Em menos de 30 dias já estava atendendo legalmente. O processo foi impecável do início ao fim!',
    specialty: 'Estética Corporal',
  },
];

// ----------------------------------------------------------------------

export function EsteticaTestimonials() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  return (
    <Box
      component="section"
      id="depoimentos"
      sx={{
        py: { xs: 10, md: 15 },
        position: 'relative',
        overflow: 'hidden',
        // 1. Fundo com gradiente suave conforme o Prompt Base
        bgcolor: isLight
          ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.grey[500], 0.04)} 50%, ${theme.palette.background.default} 100%)`
          : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.grey[900], 0.5)} 50%, ${theme.palette.background.default} 100%)`,

        // 2. Linha de brilho no topo
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          maxWidth: 600,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, isLight ? 0.2 : 0.3)}, transparent)`,
        },
      }}
    >
      <Container component={MotionViewport}>
        {/* Header da Seção */}
        <Stack spacing={2} sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Chip
              icon={<Iconify icon="solar:star-bold" width={16} />}
              label="DEPOIMENTOS REAIS"
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
                letterSpacing: 1,
              }}
            />
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography component="h2" variant="h3" sx={{ fontWeight: 800 }}>
              Quem confia na Attualize
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 640, mx: 'auto' }}>
              Mais de <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>300 clínicas</Box> já simplificaram sua contabilidade conosco.
            </Typography>
          </m.div>
        </Stack>

        {/* Grid de Depoimentos */}
        <Grid container spacing={3}>
          {TESTIMONIALS.map((testimonial, index) => (
            <Grid item xs={12} sm={6} md={4} key={testimonial.id}>
              <TestimonialCard testimonial={testimonial} index={index} isLight={isLight} />
            </Grid>
          ))}
        </Grid>

        {/* CTA Otimizado */}
        <m.div variants={varFade().inUp}>
          <Stack
            alignItems="center"
            sx={{
              mt: 8,
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              textAlign: 'center',
              position: 'relative',
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Sua clínica pode ser a próxima!
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 480 }}>
              Comece hoje com <strong>abertura de CNPJ e regularização</strong> e tenha o suporte que sua estética merece.
            </Typography>
          </Stack>
        </m.div>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

function TestimonialCard({ testimonial, index, isLight }) {
  const theme = useTheme();

  return (
    <m.div
      variants={varFade().inUp}
      transition={{ delay: index * 0.05 }}
      style={{ height: '100%' }}
    >
      <Paper
        component="article"
        variant="outlined"
        sx={{
          p: 4,
          height: 1,
          borderRadius: 2.5,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create(['all']),
          // Estilo conforme Prompt Base: Translúcido + Blur
          bgcolor: isLight ? alpha(theme.palette.background.paper, 0.7) : alpha(theme.palette.background.paper, 0.05),
          backdropFilter: 'blur(10px)',
          '&:hover': {
            transform: 'translateY(-8px)',
            borderColor: 'primary.main',
            boxShadow: theme.customShadows?.z24,
            '& .quote-icon': { color: 'primary.main', opacity: 0.2 },
          },
        }}
      >
        {/* Aspas decorativas (UX sutil) */}
        <Iconify
          icon="solar:chat-round-quote-bold"
          width={40}
          className="quote-icon"
          sx={{
            position: 'absolute',
            top: 24,
            right: 24,
            opacity: 0.05,
            transition: 'all 0.3s ease',
            color: 'text.primary',
          }}
        />

        <Stack spacing={3} sx={{ height: 1 }}>
          <Rating value={testimonial.rating} readOnly size="small" sx={{ color: 'primary.main' }} />

          {/* Testemunho - Sem truncamento para SEO */}
          <Typography
            variant="body2"
            sx={{
              flexGrow: 1,
              lineHeight: 1.8,
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            &ldquo;{testimonial.testimonial}&rdquo;
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={testimonial.avatar}
              alt={testimonial.name}
              sx={{
                width: 48,
                height: 48,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {testimonial.name}
              </Typography>

              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block' }}>
                {testimonial.clinic}
              </Typography>

              <Stack direction="row" spacing={0.5} alignItems="center">
                <Iconify icon="solar:map-point-bold-duotone" width={12} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                  {testimonial.city}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </m.div>
  );
}