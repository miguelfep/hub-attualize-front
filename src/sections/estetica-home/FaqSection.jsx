import React from 'react';
import { m } from 'framer-motion';

import { Box, Stack, Accordion, Container, Typography, AccordionSummary, AccordionDetails } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

const FAQS = [
  {
    question: 'Quais os tipos de atividades (CNAEs) devo usar para minha clínica?',
    answer:
      'A escolha correta do CNAE é vital. O principal é o 9602-5/02 (Atividades de estética e outros serviços de beleza), mas dependendo dos seus serviços, podemos incluir outros secundários, como micropigmentação (9602-5/02), podologia (8690-9/04) ou práticas integrativas (8690-9/01). Nós analisamos seu negócio para definir a lista perfeita.',
  },
  {
    question: 'O que uma contabilidade especializada em estética realmente me oferece?',
    answer:
      'Muito além dos impostos, oferecemos paz de espírito. Garantimos que todas as licenças e alvarás estejam em dia, criamos contratos de parceria seguros (Lei Salão-Parceiro) para evitar riscos trabalhistas e fazemos um planeamento tributário para que você pague o mínimo de impostos possível, aumentando sua lucratividade.',
  },
  {
    question: 'Qual a melhor natureza jurídica para começar?',
    answer:
      'Depende da sua estrutura. Para quem começa sozinho, a Sociedade Limitada Unipessoal (SLU) é a mais recomendada, pois protege o seu património pessoal. Se tiver sócios, a Sociedade Limitada (LTDA) é o caminho ideal, definindo as regras e responsabilidades de cada um no Contrato Social.',
  },
  {
    question: 'Toda clínica pode usar a Lei do Salão-Parceiro?',
    answer:
      'Não, existem regras claras. A lei só se aplica a profissionais parceiros que também sejam regularizados (com CNPJ ativo, seja MEI ou ME). É essencial ter um contrato de parceria válido e registado para usufruir do benefício fiscal. Funcionários CLT não entram nesta categoria.',
  },
];


export function FaqSection() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 10, md: 15 } }}>
      <Container component={MotionViewport}>
        <Stack spacing={3} sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
          <m.div variants={varFade().inUp}>
            <Typography component="div" variant="overline" sx={{ color: 'text.disabled' }}>
              PRECISA DE AJUDA?
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography variant="h2">Perguntas Frequentes</Typography>
          </m.div>
        </Stack>

        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {FAQS.map((faq, index) => (
             <m.div key={index} variants={varFade().inUp}>
              <Accordion
                 sx={{
                  mb: 2,
                  '&.Mui-expanded': {
                    boxShadow: (theme) => theme.customShadows.z16
                  },
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                >
                  <Typography variant="subtitle1">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ color: 'text.secondary' }}>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
             </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
