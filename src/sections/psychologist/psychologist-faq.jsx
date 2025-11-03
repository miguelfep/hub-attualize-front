'use client';

import { useState } from 'react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const FAQS = [
  {
    question: 'Sou de outra cidade e estado, vocês podem me atender?',
    answer:
      'Sim. Atendemos psicólogos em 21 estados do Brasil de forma 100% online. Nossas ferramentas digitais eliminam qualquer barreira de distância.',
  },
  {
    question: 'Quando vou precisar pagar a primeira mensalidade?',
    answer:
      'Para planos com abertura gratuita sua primeira mensalidade será paga no ato da contratação, caso opte por um plano mensal, sua primeira mensalidade será paga somente no mês seguinte à assinatura do contrato, na data que for escolhida previamente por você.',
  },
  {
    question: 'No contrato, há algum termo de fidelidade por tempo determinado?',
    answer:
      'Somente se você desejar que sua abertura de empresa seja grátis, caso contrário, não vai haver nenhuma fidelidade ou multas para cancelar. A única condição é que nos avise com 30 dias de antecedência.',
  },
  {
    question: 'Por que são cobrados mais R$ 50 na mensalidade, caso eu tenha um funcionário CLT?',
    answer:
      'Ter um funcinario CLT aumenta o custo da mensalidade em R$ 50,00, pois iremos cuidar da folha de pagamento dele, juntamente com todos os cálculos de impostos e descontos sobre a folha.',
  },
];

// ----------------------------------------------------------------------

export function PsychologistFaq() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      id="faq"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Dúvidas{' '}
              <Box component="span" sx={{ color: '#FEC615' }}>
                Frequentes
              </Box>
            </Typography>
          </m.div>
        </Box>

        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          {FAQS.map((faq, index) => (
            <m.div key={faq.question} variants={varFade().inRight}>
              <Accordion
                expanded={expanded === `panel${index}`}
                onChange={handleChange(`panel${index}`)}
                sx={{
                  mb: 2,
                  '&:before': { display: 'none' },
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  boxShadow: (theme) => theme.customShadows.card,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: '#0096D9',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      {expanded === `panel${index}` ? '−' : '+'}
                    </Box>
                  }
                  sx={{
                    px: 3,
                    py: 2.5,
                    '& .MuiAccordionSummary-content': {
                      my: 1.5,
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, pr: 2 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: 3,
                    pb: 3,
                    pt: 0,
                    borderTop: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.9375rem' }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
