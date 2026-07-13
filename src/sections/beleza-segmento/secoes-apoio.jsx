'use client';

import { useState } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
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

// ----------------------------------------------------------------------
// Tributação do segmento — MEI, Simples e Lei do Salão Parceiro

export function SecaoTributacao({ segmento }) {
  const { cores, tributacao } = segmento;

  return (
    <Box
      component="section"
      aria-labelledby="titulo-tributacao"
      sx={{ py: { xs: 6, md: 10 }, bgcolor: cores.papel }}
    >
      <Container maxWidth="lg">
        <Typography
          id="titulo-tributacao"
          component="h2"
          variant="h3"
          sx={{ color: cores.tinta, textAlign: 'center', mb: { xs: 4, md: 6 } }}
        >
          {tributacao.titulo}
        </Typography>
        <Grid container spacing={3}>
          {tributacao.blocos.map((bloco) => (
            <Grid key={bloco.titulo} xs={12} md={4}>
              <Stack
                spacing={1.5}
                sx={{
                  p: 3,
                  height: 1,
                  borderRadius: 3,
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${cores.suave}`,
                }}
              >
                <Typography component="h3" variant="h6" sx={{ color: cores.tinta }}>
                  {bloco.titulo}
                </Typography>
                <Typography variant="body2" sx={{ color: cores.grafite, lineHeight: 1.7 }}>
                  {bloco.texto}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------
// FAQ — mesmas perguntas/respostas do JSON-LD (importadas do dados do segmento)

export function SecaoFaqBeleza({ segmento }) {
  const [aberta, setAberta] = useState(null);
  const { cores, faq } = segmento;

  return (
    <Box
      component="section"
      aria-labelledby="titulo-faq"
      sx={{ py: { xs: 6, md: 10 }, bgcolor: cores.papel }}
    >
      <Container maxWidth="md">
        <Typography
          id="titulo-faq"
          component="h2"
          variant="h3"
          sx={{ color: cores.tinta, textAlign: 'center', mb: { xs: 4, md: 6 } }}
        >
          Perguntas frequentes
        </Typography>

        {faq.map((item, index) => (
          <Accordion
            key={item.pergunta}
            expanded={aberta === index}
            onChange={(_, expandida) => setAberta(expandida ? index : null)}
            disableGutters
            sx={{
              bgcolor: '#FFFFFF',
              border: `1px solid ${cores.suave}`,
              borderRadius: '12px !important',
              mb: 1.5,
              '&::before': { display: 'none' },
              boxShadow: 'none',
            }}
          >
            <AccordionSummary
              expandIcon={
                <Iconify icon="eva:arrow-ios-downward-fill" sx={{ color: cores.destaque }} />
              }
              sx={{ '&:focus-visible': { outline: `3px solid ${cores.destaque}`, outlineOffset: -3 } }}
            >
              <Typography component="h3" variant="subtitle1" sx={{ color: cores.tinta }}>
                {item.pergunta}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: cores.grafite }}>
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
// Links internos para outras especialidades (SEO)

export function SecaoLinksInternosBeleza({ segmento }) {
  const { cores, especialidadesInternas } = segmento;

  return (
    <Box
      component="section"
      aria-labelledby="titulo-links"
      sx={{ py: { xs: 5, md: 7 }, bgcolor: '#FFFFFF', borderTop: `1px solid ${cores.suave}` }}
    >
      <Container maxWidth="lg">
        <Typography id="titulo-links" component="h2" variant="h6" sx={{ color: cores.tinta, mb: 2 }}>
          A Attualize também é especialista em
        </Typography>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={{ xs: 1.5, sm: 2.5 }}>
          {especialidadesInternas.map((especialidade) => (
            <Link
              key={especialidade.href}
              href={especialidade.href}
              underline="hover"
              variant="body2"
              sx={{
                color: cores.grafite,
                '&:hover': { color: cores.destaque },
                '&:focus-visible': { outline: `2px solid ${cores.destaque}`, outlineOffset: 2 },
              }}
            >
              {especialidade.titulo}
            </Link>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
