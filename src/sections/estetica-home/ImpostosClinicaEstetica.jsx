import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';

import { Box, Grid, Paper, Stack, Container, Typography  } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

const informacoesData = [
  {
    label: 'Lei do Salão Parceiro',
    icon: 'mdi:handshake-outline',
    content: {
      title: 'Lei do Salão Parceiro',
      description:
        'Entenda como funciona a Lei do Salão Parceiro, quem pode aderir e quais os cuidados para evitar riscos trabalhistas e fiscais.',
      items: [
        'Quem pode aderir à lei',
        'Regras para repasse de valores',
        'Modelo de contrato necessário',
        'Responsabilidades do parceiro x salão',
        'Riscos comuns e como evitá-los',
      ],
    },
  },
  {
    label: 'Tributação para Clínicas',
    icon: 'mdi:scale-balance',
    content: {
      title: 'Tributação para Clínicas de Estética',
      description:
        'Veja as opções tributárias mais comuns para clínicas e profissionais de estética e como otimizar os impostos pagos.',
      items: [
        'MEI: limitações e quando faz sentido',
        'Simples Nacional: anexos III e V',
        'Impacto do Fator R',
        'Lucro Presumido em casos específicos',
        'Alíquotas de ISS variam por município',
      ],
    },
  },
  {
    label: 'Exigências da Vigilância',
    icon: 'mdi:clipboard-check-outline',
    content: {
      title: 'Exigências da Vigilância Sanitária',
      description:
        'Saiba quais documentos e condições estruturais sua clínica precisa atender para obter e manter a licença sanitária.',
      items: [
        'Requerimento de licença sanitária',
        'Responsabilidade técnica (RT)',
        'Alvará de funcionamento',
        'Condições de biossegurança',
        'Renovação e fiscalizações periódicas',
      ],
    },
  },
  {
    label: 'Natureza Jurídica',
    icon: 'mdi:domain',
    content: {
      title: 'Qual a melhor natureza jurídica?',
      description:
        'Compare os tipos mais comuns (EI, SLU e LTDA) e descubra qual se adapta melhor ao porte e objetivos da sua clínica.',
      items: [
        'Empresário Individual (EI)',
        'Sociedade Limitada Unipessoal (SLU)',
        'LTDA com sócios',
        'Diferenças de responsabilidade',
        'Flexibilidade societária e percepção no mercado',
      ],
    },
  },
];

function ContentCard({ content }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={4}>
        <Stack spacing={2}>
          <Typography variant="h3" sx={{ color: 'text.primary' }}>
            {content.title}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {content.description}
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {content.items.map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon="mdi:check-circle" width={20} color="primary.main" />
                <Typography variant="body2">{item}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Paper>
  );
}

export function InformacoesEssenciais() {
  const [activeInfo, setActiveInfo] = useState(0);

  return (
    <Box sx={{ bgcolor: 'background.neutral', py: { xs: 10, md: 15 } }}>
      <Container component={MotionViewport} maxWidth="lg">
        <Stack sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
          <m.div variants={varFade().inUp}>
            <Typography
              variant="h2"
              component="h2"
              sx={{ color: 'text.primary', mb: 2 }}
            >
              Informações Essenciais para Clínicas de Estética
            </Typography>
          </m.div>
          <m.div variants={varFade().inUp}>
            <Typography sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              Tudo o que você precisa saber sobre tributação, legislação e
              regularização para manter sua clínica em conformidade.
            </Typography>
          </m.div>
        </Stack>

        <Grid container spacing={{ xs: 5, md: 8 }}>
          <Grid item xs={12} md={4}>
            <m.div variants={varFade().inLeft}>
              <Stack spacing={2}>
                {informacoesData.map((info, index) => (
                  <Paper
                    key={info.label}
                    onClick={() => setActiveInfo(index)}
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: (theme) =>
                        theme.transitions.create(['background-color', 'box-shadow']),
                      ...(activeInfo === index && {
                        bgcolor: 'primary.main',
                        color: 'common.white',
                        boxShadow: (theme) => theme.customShadows.primary,
                      }),
                    }}
                  >
                    <Iconify icon={info.icon} width={28} sx={{ mr: 2 }} />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 'fontWeightBold' }}
                    >
                      {info.label}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </m.div>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ minHeight: { md: 480 } }}>
              <AnimatePresence mode="wait">
                <m.div
                  key={activeInfo}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ContentCard content={informacoesData[activeInfo].content} />
                </m.div>
              </AnimatePresence>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );


}
