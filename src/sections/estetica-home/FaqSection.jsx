'use client';

import { useState } from 'react';
import { m } from 'framer-motion';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Stack,
  Accordion,
  Container,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const FAQS = [
  {
    question: 'Quais os tipos de atividades (CNAEs) devo usar para minha clínica?',
    answer:
      'A escolha correta do CNAE é vital para não pagar imposto a mais. O principal é o 9602-5/02 (Estética), mas dependendo dos seus serviços, podemos incluir outros secundários como práticas integrativas ou podologia. Nós analisamos seu escopo para definir a lista perfeita.',
  },
  {
    question: 'O que uma contabilidade especializada realmente oferece?',
    answer:
      'Muito além de emitir guias, oferecemos segurança jurídica. Criamos seus contratos de parceria (Lei Salão-Parceiro) para blindar seu negócio contra riscos trabalhistas e fazemos o Fator R para que você pague 6% de imposto em vez de 15,5%.',
  },
  {
    question: 'Qual a melhor natureza jurídica para começar?',
    answer:
      'Para quem começa sozinho, a Sociedade Limitada Unipessoal (SLU) é a favorita absoluta, pois protege seus bens pessoais. Se você tem sócios, estruturamos a LTDA com um contrato social que define claramente as regras de crescimento.',
  },
  {
    question: 'Toda clínica pode usar a Lei do Salão-Parceiro?',
    answer:
      'Não. Existem regras de quarentena (para ex-funcionários) e restrições para atos médicos. É essencial ter um contrato homologado e que os parceiros tenham CNPJ ativo (MEI ou ME). Sem essa organização, o risco de vínculo trabalhista é alto.',
  },
];

// ----------------------------------------------------------------------

export function FaqSection() {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  const isLight = theme.palette.mode === 'light';
  const PRIMARY_MAIN = theme.palette.primary.main;

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 10, md: 15 },
        position: 'relative',
        background: isLight
          ? `linear-gradient(180deg, ${alpha(PRIMARY_MAIN, 0.02)} 0%, ${alpha(theme.palette.grey[500], 0.04)} 50%, ${theme.palette.background.default} 100%)`
          : `linear-gradient(180deg, ${alpha(PRIMARY_MAIN, 0.06)} 0%, ${alpha(theme.palette.grey[900], 0.5)} 50%, ${theme.palette.background.default} 100%)`,
        // Brilho no topo seguindo o Prompt Base
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '1px',
          background: `linear-gradient(90deg, transparent, ${alpha(PRIMARY_MAIN, 0.3)}, transparent)`,
        },
      }}
    >
      <Container component={MotionViewport}>
        {/* Header */}
        <Stack spacing={2} sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="overline" sx={{ color: PRIMARY_MAIN, fontWeight: 800, letterSpacing: 2 }}>
              DÚVIDAS FREQUENTES
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, mt: 1 }}>
              Perguntas <Box component="span" sx={{ color: PRIMARY_MAIN }}>Comuns</Box>
            </Typography>
          </m.div>
        </Stack>

        <Box sx={{ maxWidth: 840, mx: 'auto' }}>
          {FAQS.map((faq, index) => {
            const isExpanded = expanded === `panel${index}`;

            return (
              <m.div key={index} variants={varFade().inUp}>
                <Accordion
                  expanded={isExpanded}
                  onChange={handleChange(`panel${index}`)}
                  sx={{
                    mb: 2,
                    borderRadius: '16px !important', // Mantém o arredondamento mesmo aberto
                    bgcolor: isLight 
                      ? alpha(theme.palette.background.paper, 0.7) 
                      : alpha(theme.palette.background.paper, 0.05),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isExpanded ? alpha(PRIMARY_MAIN, 0.3) : alpha(theme.palette.divider, 0.08)}`,
                    transition: theme.transitions.create(['all']),
                    boxShadow: isExpanded ? theme.customShadows?.z24 : 'none',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <Iconify 
                        icon={isExpanded ? "solar:minus-circle-bold" : "solar:add-circle-bold"} 
                        width={24} 
                        sx={{ color: isExpanded ? PRIMARY_MAIN : 'text.disabled', transition: '0.3s' }}
                      />
                    }
                    sx={{
                      px: 3,
                      py: 1,
                      '& .MuiAccordionSummary-content': { my: 2 },
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: isExpanded ? 800 : 600,
                        color: isExpanded ? 'text.primary' : 'text.secondary',
                        transition: 'color 0.3s'
                      }}
                    >
                      {faq.question}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary', 
                        lineHeight: 1.8,
                        pt: 2,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </m.div>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}