'use client';

import { m } from 'framer-motion';

import { alpha, useTheme } from '@mui/material/styles';
import { Box, Chip, Grid, Stack, Paper, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const CATEGORIAS = [
  {
    id: 'abertura',
    titulo: 'Abertura e Legalização',
    icon: 'solar:buildings-2-bold-duotone',
    itens: [
      'Abertura e Legalização Completa',
      'Emissão do CNPJ',
      'Alvarás e Licenças Sanitárias',
      'Escolha do CNAE Ideal',
      'Contratos de Parceria e Sublocação',
    ],
  },
  {
    id: 'tributario',
    titulo: 'Tributário e Fiscal',
    icon: 'solar:calculator-minimalistic-bold-duotone',
    itens: [
      'Planejamento Tributário Especializado',
      'Definição do Melhor Regime Fiscal',
      'Orientação sobre Lei do Salão Parceiro',
      'Liberação para Emissão de Notas Fiscais',
    ],
  },
  {
    id: 'documentos',
    titulo: 'Documentos e Certificados',
    icon: 'solar:document-text-bold-duotone',
    itens: ['Emissão de Certificados Digitais', 'Inscrições Municipais e Estaduais'],
  },
  {
    id: 'consultoria',
    titulo: 'Consultoria',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    itens: ['Consultoria Contábil Especializada'],
  },
];

// ----------------------------------------------------------------------

export function ServicosEspecializados() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  return (
    <Box
      component="section"
      id="servicos"
      sx={{
        py: { xs: 10, md: 15 },
        bgcolor: 'background.default',
        position: 'relative',
      }}
    >
      <Container component={MotionViewport}>
        {/* Header - Foco em SEO com H2 */}
        <Stack spacing={2} sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Chip
              label="SOLUÇÕES COMPLETAS"
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                letterSpacing: 1,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                  opacity: 0.85,
                },
              }}
            />
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography component="h2" variant="h3" sx={{ fontWeight: 800 }}>
              Tudo para sua clínica de estética
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480, mx: 'auto' }}>
              Deixe a burocracia com especialistas e foque no crescimento do seu negócio.
            </Typography>
          </m.div>
        </Stack>

        {/* Grid de Cards */}
        <Grid container spacing={3}>
          {CATEGORIAS.map((categoria, index) => (
            <Grid item xs={12} sm={6} md={3} key={categoria.id}>
              <ServiceCard categoria={categoria} index={index} isLight={isLight} />
            </Grid>
          ))}
        </Grid>

        {/* Footer Scroll Hint */}
        <Stack alignItems="center" sx={{ mt: 8 }}>
          <m.div variants={varFade().inUp}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, mb: 1, display: 'block', fontSize: '10px' }}>
              VEJA O QUE NOSSOS CLIENTES DIZEM
            </Typography>
            <Box
              sx={{
                width: 2,
                height: 40,
                mx: 'auto',
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '50%',
                  bgcolor: 'primary.main',
                  animation: 'scroll-anim 2s infinite ease-in-out',
                },
                '@keyframes scroll-anim': {
                  '0%': { top: '0%', opacity: 0 },
                  '50%': { opacity: 1 },
                  '100%': { top: '100%', opacity: 0 },
                },
              }}
            />
          </m.div>
        </Stack>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

function ServiceCard({ categoria, index, isLight }) {
  const theme = useTheme();

  // Definição da cor de fundo (Azul claro suave)
  const bgLight = alpha(theme.palette.primary.main, 0.04); // 4% de azul
  const bgHover = alpha(theme.palette.primary.main, 0.08); // 8% no hover

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
          p: 3,
          height: 1,
          borderRadius: 2.5,
          position: 'relative',
          transition: theme.transitions.create(['all']),
          // FUNDO COLORIDO AQUI:
          bgcolor: isLight ? bgLight : alpha(theme.palette.background.paper, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, // Borda sutil na cor do tema

          '&:hover': {
            transform: 'translateY(-8px)',
            borderColor: 'primary.main',
            bgcolor: isLight ? bgHover : alpha(theme.palette.primary.main, 0.12),
            boxShadow: theme.customShadows?.z24 || `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
            '& .icon-box': {
              bgcolor: 'primary.main',
              color: 'common.white',
              transform: 'scale(1.1) rotate(5deg)',
            },
          },
        }}
      >
        <Stack spacing={2.5}>
          {/* Ícone */}
          <Box
            className="icon-box"
            sx={{
              width: 56,
              height: 56,
              display: 'flex',
              borderRadius: 2,
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              transition: 'all 0.3s ease',
              bgcolor: isLight ? 'common.white' : alpha(theme.palette.primary.main, 0.2),
              boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            <Iconify icon={categoria.icon} width={28} />
          </Box>

          <Box>
            <Typography
              component="h3"
              variant="h6"
              sx={{
                fontWeight: 800,
                mb: 1.5,
                lineHeight: 1.2,
                color: 'text.primary',
                minHeight: { md: 48 },
              }}
            >
              {categoria.titulo}
            </Typography>

            <Stack component="ul" spacing={1.5} sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {categoria.itens.map((item) => (
                <Stack key={item} component="li" direction="row" spacing={1.2} alignItems="flex-start">
                  <Iconify
                    icon="solar:check-circle-bold"
                    width={18}
                    sx={{ color: 'primary.main', mt: 0.3, flexShrink: 0 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </m.div>
  );
}