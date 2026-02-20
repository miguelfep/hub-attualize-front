'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';

import { alpha, useTheme } from '@mui/material/styles';
import { Box, Grid, Paper, Stack, Container, Typography, ButtonBase } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const INFORMACOES_DATA = [
  {
    label: 'Lei do Salão Parceiro',
    icon: '/logo/pid-logo.webp',
    isCustomLogo: true,
    content: {
      title: 'Lei do Salão Parceiro para Estética',
      description: 'A solução definitiva para evitar o vínculo empregatício e reduzir a carga tributária da sua clínica através de contratos de parceria homologados.',
      items: [
        'Quem pode aderir à lei legalmente',
        'Regras para repasse de valores',
        'Modelo de contrato obrigatório',
        'Responsabilidades de cada parte',
        'Como evitar riscos trabalhistas',
      ],
    },
  },
  {
    label: 'Tributação Especializada',
    icon: 'solar:bill-list-bold-duotone',
    isCustomLogo: false,
    content: {
      title: 'Planejamento Tributário Estratégico',
      description: 'Analisamos se o Simples Nacional (com Fator R) ou o Lucro Presumido trará a maior economia real para o seu faturamento.',
      items: [
        'MEI: Limitações e riscos',
        'Simples Nacional: Anexos III e V',
        'Estratégia de Fator R (Economia)',
        'Lucro Presumido para clínicas',
        'Equiparação Hospitalar',
        'ISS fixo municipal',
      ],
    },
  },
  {
    label: 'Vigilância Sanitária',
    icon: 'solar:shield-check-bold-duotone',
    isCustomLogo: false,
    content: {
      title: 'Conformidade Sanitária e Biossegurança',
      description: 'Cuidamos da documentação estrutural necessária para obter e renovar sua licença sem interrupções no atendimento.',
      items: [
        'Requerimento de Licença Sanitária',
        'Responsabilidade Técnica (RT)',
        'Alvará de Funcionamento',
        'Manuais de Biossegurança (POPs)',
        'Gestão de Resíduos (PGRSS)',
      ],
    },
  },
  {
    label: 'Natureza Jurídica',
    icon: 'solar:bill-list-bold-duotone',
    isCustomLogo: false,
    content: {
      title: 'Qual a melhor estrutura jurídica?',
      description: 'A escolha entre SLU, LTDA ou EI define sua proteção patrimonial e a facilidade de atrair sócios no futuro.',
      items: [
        'Sociedade Limitada Unipessoal (SLU)',
        'Proteção de bens pessoais',
        'LTDA com Sócios Investidores',
        'Diferenças de responsabilidade civil',
        'Acordos de cotistas para segurança',
      ],
    },
  },
];

// ----------------------------------------------------------------------

export function InformacoesEssenciais() {
  const theme = useTheme();
  const [activeInfo, setActiveInfo] = useState(0);
  const isLight = theme.palette.mode === 'light';
  const PRIMARY = theme.palette.primary.main;

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 10, md: 15 },
        background: isLight
          ? `linear-gradient(180deg, ${alpha(PRIMARY, 0.02)} 0%, ${alpha(theme.palette.grey[500], 0.04)} 50%, ${theme.palette.background.default} 100%)`
          : `linear-gradient(180deg, ${alpha(PRIMARY, 0.06)} 0%, ${alpha(theme.palette.grey[900], 0.5)} 50%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Container component={MotionViewport} maxWidth="lg">
        <Stack spacing={2} sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ fontWeight: 800 }}>
              Informações <Box component="span" sx={{ color: PRIMARY }}>Essenciais</Box>
            </Typography>
          </m.div>
        </Stack>

        <Grid container spacing={5}>
          {/* Navegação Lateral */}
          <Grid item xs={12} md={4}>
            <Stack spacing={1.5}>
              {INFORMACOES_DATA.map((info, index) => (
                <ButtonBase
                  key={info.label}
                  onClick={() => setActiveInfo(index)}
                  sx={{
                    p: 2,
                    width: 1,
                    borderRadius: 2,
                    justifyContent: 'flex-start',
                    border: `1px solid ${activeInfo === index ? PRIMARY : alpha(theme.palette.divider, 0.1)}`,
                    bgcolor: activeInfo === index ? alpha(PRIMARY, 0.08) : 'background.paper',
                    transition: 'all 0.3s',
                  }}
                >
                  {info.isCustomLogo ? (
                    <Box
                      component="img"
                      src={info.icon}
                      sx={{
                        width: 28,
                        height: 28,
                        mr: 2,
                        borderRadius: 0.5,
                        filter: activeInfo === index ? 'none' : 'grayscale(1) opacity(0.5)',
                        transition: 'filter 0.3s'
                      }}
                    />
                  ) : (
                    <Iconify
                      icon={info.icon}
                      width={28}
                      sx={{ mr: 2, color: activeInfo === index ? PRIMARY : 'text.disabled' }}
                    />
                  )}

                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {info.label}
                  </Typography>
                </ButtonBase>
              ))}
            </Stack>
          </Grid>

          {/* Conteúdo */}
          <Grid item xs={12} md={8}>
            <AnimatePresence mode="wait">
              <m.div
                key={activeInfo}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 4, md: 6 },
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                    {INFORMACOES_DATA[activeInfo].content.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.8 }}>
                    {INFORMACOES_DATA[activeInfo].content.description}
                  </Typography>

                  <Box
                    component="ul"
                    sx={{
                      p: 0, m: 0, listStyle: 'none',
                      display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2
                    }}
                  >
                    {INFORMACOES_DATA[activeInfo].content.items.map((item) => (
                      <Stack key={item} component="li" direction="row" spacing={1.5}>
                        <Iconify icon="solar:check-circle-bold" sx={{ color: PRIMARY, mt: 0.3 }} width={20} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item}</Typography>
                      </Stack>
                    ))}
                  </Box>
                </Paper>
              </m.div>
            </AnimatePresence>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}