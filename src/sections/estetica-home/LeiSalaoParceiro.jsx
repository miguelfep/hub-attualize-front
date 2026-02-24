'use client';

import { m } from 'framer-motion';

import { alpha, useTheme } from '@mui/material/styles';
import { Box, Grid, Paper, Stack, Button, Divider, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function LeiSalaoParceiro() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const SECTION_BG = isLight
    ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.grey[500], 0.04)} 50%, ${theme.palette.background.default} 100%)`
    : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.grey[900], 0.5)} 50%, ${theme.palette.background.default} 100%)`;

  return (
    <Box
      component="section"
      id="lei-salao-parceiro"
      sx={{
        py: { xs: 10, md: 15 },
        position: 'relative',
        background: SECTION_BG,
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
        {/* Header Principal */}
        <Stack spacing={2} sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
          <m.div variants={varFade().inDown}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: '#9864FD'
              }}
            >
              Lei do Salão Parceiro
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 720, mx: 'auto', mt: 2 }}>
              A regularização ideal para a relação entre clínicas e <strong>especialistas técnicos (esteticistas, manicures e depiladores)</strong>, garantindo conformidade com a Lei 13.352/2016.
            </Typography>
          </m.div>
        </Stack>

        <Grid container spacing={5} alignItems="flex-start">
          {/* Coluna 1: Como Funciona */}
          <Grid item xs={12} md={7}>
            <Stack spacing={4}>
              <m.div variants={varFade().inLeft}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Economia Tributária Real</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  Sua clínica deixa de ser tributada pelo faturamento bruto e passa a pagar impostos apenas sobre a <b>sua cota-parte</b>. O valor repassado aos profissionais parceiros é deduzido legalmente da sua base de cálculo.
                </Typography>
              </m.div>

              {/* Card de Simulação Visual */}
              <m.div variants={varFade().inLeft}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha('#9864FD', 0.03),
                    borderColor: alpha('#9864FD', 0.2),
                    borderStyle: 'dashed'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#9864FD', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Na ponta do lápis:
                  </Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Serviço Técnico (ex: Limpeza de Pele):</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>R$ 200,00</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Cota do Profissional (Parceiro):</Typography>
                      <Typography variant="body2" sx={{ color: 'error.main' }}>- R$ 100,00</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                      <Typography variant="subtitle2">Sua base de imposto (Cota-Parte):</Typography>
                      <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 900 }}>R$ 100,00</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </m.div>
            </Stack>
          </Grid>

          {/* Coluna 2: Regras de Ouro */}
          <Grid item xs={12} md={5}>
            <m.div variants={varFade().inRight}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 3,
                  bgcolor: isLight ? alpha(theme.palette.background.paper, 0.8) : alpha(theme.palette.background.paper, 0.05),
                  backdropFilter: 'blur(10px)',
                  boxShadow: theme.customShadows?.z16
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Iconify icon="solar:shield-check-bold-duotone" sx={{ color: 'primary.main' }} />
                  Pilares de Segurança
                </Typography>
                <Stack spacing={3}>
                  {[
                    {
                      t: 'Escopo Restrito da Lei',
                      d: 'Válido apenas para profissionais técnicos de estética e beleza. Equipe administrativa e de apoio devem permanecer no regime CLT.'
                    },
                    {
                      t: 'Profissional Formalizado',
                      d: 'O parceiro deve atuar com CNPJ (MEI ou ME) e possuir autonomia técnica na execução dos seus serviços.'
                    },
                    {
                      t: 'Contrato e Homologação',
                      d: 'O documento deve ser específico para a Lei 13.352 e, conforme o caso, homologado no sindicato da categoria.'
                    },
                  ].map((item) => (
                    <Box key={item.t}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{item.t}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>{item.d}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </m.div>
          </Grid>
        </Grid>

        {/* --- SEÇÃO DE CONFORMIDADE COM PARCEIRO ID --- */}
        <Box sx={{ mt: 10, pt: 8, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <m.div variants={varFade().inUp}>
            <Typography variant="h4" textAlign="center" sx={{ fontWeight: 800, mb: 6 }}>
              Como garantimos sua proteção total?
            </Typography>

            <Grid container spacing={4}>
              {/* Item 1: Jurídico */}
              <Grid item xs={12} md={4}>
                <Stack spacing={2} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Iconify icon="solar:document-text-bold-duotone" sx={{ color: 'primary.main', mx: { xs: 'auto', md: 0 } }} width={32} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Blindagem Contratual</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Disponibilizamos contratos que atendem todos os requisitos da Lei 13.352/16, reduzindo a exposição a passivos trabalhistas.
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Item 2: Parceiro ID (O diferencial tecnológico) */}
              <Grid item xs={12} md={4}>
                <Stack
                  spacing={2}
                  sx={{
                    textAlign: { xs: 'center', md: 'left' },
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: alpha('#9864FD', 0.05),
                    border: `1px solid ${alpha('#9864FD', 0.1)}`,
                    transition: 'all 0.3s',
                    '&:hover': { bgcolor: alpha('#9864FD', 0.08) }
                  }}
                >
                  <Box
                    component="img"
                    src="/logo/pid-logo.webp"
                    sx={{ width: 40, height: 40, mx: { xs: 'auto', md: 0 }, borderRadius: 1 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#9864FD' }}>Gestão via Parceiro ID</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Automatizamos o controle de repasses e emissão de notas para seus parceiros através da nossa plataforma integrada.
                    </Typography>
                    <Button
                      component="a"
                      href="https://parceiroid.com.br/"
                      target="_blank"
                      size="small"
                      rel="noopener noreferrer"
                      endIcon={<Iconify icon="solar:arrow-right-up-bold" />}
                      sx={{ p: 0, color: '#9864FD', fontWeight: 700, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                    >
                      Conhecer Tecnologia
                    </Button>
                  </Box>
                </Stack>
              </Grid>

              {/* Item 3: Contabilidade */}
              <Grid item xs={12} md={4}>
                <Stack spacing={2} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Iconify icon="solar:checklist-minimalistic-bold-duotone" sx={{ color: 'primary.main', mx: { xs: 'auto', md: 0 } }} width={32} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Conformidade Fiscal</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Apuração mensal rigorosa para garantir que sua estética aproveite 100% dos benefícios da lei.
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </m.div>
        </Box>

        {/* CTA Final */}
        <m.div variants={varFade().inUp}>
          <Stack alignItems="center" sx={{ mt: 10 }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                py: 2, px: 6, borderRadius: 1.5, fontWeight: 800, fontSize: '1.1rem',
                bgcolor: '#9864FD',
                '&:hover': { bgcolor: alpha('#9864FD', 0.9) },
                boxShadow: `0 8px 24px ${alpha('#9864FD', 0.3)}`
              }}
            >
              Quero aplicar na minha clínica
            </Button>
          </Stack>
        </m.div>
      </Container>
    </Box>
  );
}