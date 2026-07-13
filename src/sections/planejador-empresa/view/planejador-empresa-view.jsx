'use client';

import { useState } from 'react';

import { alpha } from '@mui/material/styles';
import {
  Box,
  Link,
  Stack,
  Accordion,
  Container,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { SEGMENTOS, FAQ_ITEMS } from '../dados';
import { PlanejadorWizard } from '../planejador-wizard';

// ----------------------------------------------------------------------

const DESTAQUES = [
  { icone: 'solar:clock-circle-bold-duotone', texto: 'Resultado em 2 minutos' },
  { icone: 'solar:hand-money-bold-duotone', texto: '100% gratuito' },
  { icone: 'solar:shield-check-bold-duotone', texto: 'Validado por contadores' },
];

function HeroPlanejador() {
  return (
    <Box
      component="section"
      aria-label="Apresentação"
      sx={{
        pt: { xs: 8, md: 10 },
        pb: { xs: 2, md: 4 },
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={2.5} alignItems="center">
          <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 2, fontWeight: 700 }}>
            Ferramenta gratuita
          </Typography>
          <Typography component="h1" variant="h2" sx={{ lineHeight: 1.15 }}>
            Planejador de Empresa: descubra o melhor caminho para o seu CNPJ
          </Typography>
          <Typography variant="h6" component="p" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 640 }}>
            Responda 3 perguntas e receba um plano inicial: MEI ou Sociedade Limitada, quanto vai
            pagar de imposto no Simples Nacional e o checklist para abrir ou regularizar sua
            empresa — sem juridiquês.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 3 }}
            sx={{ color: 'text.secondary' }}
          >
            {DESTAQUES.map((item) => (
              <Stack key={item.texto} direction="row" spacing={1} alignItems="center" justifyContent="center">
                <Iconify icon={item.icone} width={20} sx={{ color: 'primary.main' }} />
                <Typography variant="body2">{item.texto}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

function SecaoFaqPlanejador() {
  const [aberta, setAberta] = useState(null);

  return (
    <Box
      component="section"
      aria-labelledby="titulo-faq"
      sx={{ py: { xs: 6, md: 10 }, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04) }}
    >
      <Container maxWidth="md">
        <Typography
          id="titulo-faq"
          component="h2"
          variant="h3"
          sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}
        >
          Perguntas frequentes
        </Typography>

        {FAQ_ITEMS.map((item, index) => (
          <Accordion
            key={item.pergunta}
            expanded={aberta === index}
            onChange={(_, expandida) => setAberta(expandida ? index : null)}
            disableGutters
            sx={{
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
              borderRadius: '12px !important',
              mb: 1.5,
              '&::before': { display: 'none' },
              boxShadow: 'none',
            }}
          >
            <AccordionSummary
              expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" sx={{ color: 'primary.main' }} />}
            >
              <Typography component="h3" variant="subtitle1">
                {item.pergunta}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {item.resposta}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

function SecaoEspecialidadesPlanejador() {
  return (
    <Box component="section" aria-labelledby="titulo-links" sx={{ py: { xs: 5, md: 7 } }}>
      <Container maxWidth="lg">
        <Typography id="titulo-links" component="h2" variant="h6" sx={{ mb: 0.5 }}>
          Contabilidade especializada no seu segmento
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Depois de montar seu plano, conheça a página da sua especialidade:
        </Typography>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={{ xs: 1.5, sm: 2.5 }}>
          {SEGMENTOS.map((segmento) => (
            <Link
              key={segmento.id}
              href={segmento.paginaEspecialidade}
              underline="hover"
              variant="body2"
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              Contabilidade para {segmento.label}
            </Link>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function PlanejadorEmpresaView() {
  return (
    <Box>
      <HeroPlanejador />
      <PlanejadorWizard />
      <SecaoFaqPlanejador />
      <SecaoEspecialidadesPlanejador />
    </Box>
  );
}
