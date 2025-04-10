import { useState } from 'react';
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Accordion, { accordionClasses } from '@mui/material/Accordion';
import AccordionDetails, { accordionDetailsClasses } from '@mui/material/AccordionDetails';
import AccordionSummary, { accordionSummaryClasses } from '@mui/material/AccordionSummary';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { SectionTitle } from './components/section-title';

// ----------------------------------------------------------------------

const FAQs = [
  {
    question: 'A Attualize atende todo o Brasil?',
    answer: (
      <Typography component="p">
        Sim, por ser uma contabilidade digital, atendemos todo o Brasil, oferecendo nossos serviços
        de maneira remota e prática.
      </Typography>
    ),
  },
  {
    question: 'Quais são as especialidades da Attualize?',
    answer: (
      <Box component="ul" sx={{ pl: 3, listStyleType: 'disc' }}>
        <li>Clínicas de estética.</li>
        <li>Profissionais da área da saúde (médicos, dentistas, fisioterapeutas).</li>
        <li>Academias, estúdios de pilates, crossfit e outras atividades de bem-estar.</li>
      </Box>
    ),
  },
  {
    question: 'Quais serviços vocês fornecem mensalmente?',
    answer: (
      <Box component="ul" sx={{ pl: 3, listStyleType: 'disc' }}>
        <li>
          Elaboração da contabilidade de acordo com a legislação, incluindo balancetes e balanços.
        </li>
        <li>Apuração de tributos conforme a emissão de notas fiscais da empresa.</li>
        <li>
          Orientação trabalhista, elaboração de pró-labore e guias de encargos sociais para sócios.
        </li>
      </Box>
    ),
  },
  {
    question: 'Por que escolher a Attualize para sua contabilidade?',
    answer: (
      <Typography component="p">
        Somos especializados em contabilidade digital para estética, saúde e bem-estar. Oferecemos
        um atendimento humanizado, acompanhamento personalizado e conhecimento profundo das
        particularidades do seu setor.
      </Typography>
    ),
  },
  {
    question: 'Como funciona o atendimento da Attualize?',
    answer: (
      <Typography component="p">
        Nosso atendimento é 100% digital, mas totalmente humanizado. Você pode entrar em contato
        conosco por canais como WhatsApp, e-mail ou até agendar uma reunião virtual com nossos
        especialistas.
      </Typography>
    ),
  },
  {
    question: 'Quais documentos preciso para abrir minha empresa?',
    answer: (
      <Box component="ul" sx={{ pl: 3, listStyleType: 'disc' }}>
        <li>RG e CPF do responsável legal.</li>
        <li>Comprovante de endereço atualizado.</li>
        <li>Definição da atividade (CNAE).</li>
        <li>Nome fantasia e razão social da empresa.</li>
      </Box>
    ),
  },
  {
    question: 'Quais são os benefícios de contratar uma contabilidade digital?',
    answer: (
      <Typography component="p">
        A contabilidade digital permite mais agilidade, redução de custos e maior comodidade no
        acompanhamento de seus resultados financeiros, sem perder a qualidade do atendimento.
      </Typography>
    ),
  },
];

// ----------------------------------------------------------------------

export function HomeFAQs({ sx, ...other }) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const renderDescription = (
    <SectionTitle
      caption="FAQs"
      title="Dúvidas"
      txtGradient="frequentes"
      sx={{ textAlign: 'center' }}
    />
  );

  const renderContent = (
    <Stack
      spacing={1}
      sx={{
        mt: 8,
        mx: 'auto',
        maxWidth: 720,
        mb: { xs: 5, md: 8 },
      }}
    >
      {FAQs.map((item, index) => (
        <Accordion
          key={item.question}
          component={m.div}
          variants={varFade({ distance: 24 }).inUp}
          expanded={expanded === item.question}
          onChange={handleChange(item.question)}
          sx={{
            borderRadius: 2,
            transition: (theme) =>
              theme.transitions.create(['background-color'], {
                duration: theme.transitions.duration.short,
              }),
            '&::before': { display: 'none' },
            '&:hover': {
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
            },
            '&:first-of-type, &:last-of-type': { borderRadius: 2 },
            [`&.${accordionClasses.expanded}`]: {
              m: 0,
              borderRadius: 2,
              boxShadow: 'none',
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            },
            [`& .${accordionSummaryClasses.root}`]: {
              py: 3,
              px: 2.5,
              minHeight: 'auto',
              [`& .${accordionSummaryClasses.content}`]: {
                m: 0,
                [`&.${accordionSummaryClasses.expanded}`]: { m: 0 },
              },
            },
            [`& .${accordionDetailsClasses.root}`]: { px: 2.5, pt: 0, pb: 3 },
          }}
        >
          <AccordionSummary
            expandIcon={
              <Iconify
                width={20}
                icon={expanded === item.question ? 'mingcute:minimize-line' : 'mingcute:add-line'}
              />
            }
            aria-controls={`panel${index}bh-content`}
            id={`panel${index}bh-header`}
          >
            <Typography variant="h6">{item.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>{item.answer}</AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );

  return (
    <Stack component="section" sx={{ ...sx }} {...other}>
      <MotionViewport sx={{ py: 10, position: 'relative' }}>
        <Container>
          {renderDescription}
          {renderContent}
        </Container>
      </MotionViewport>
    </Stack>
  );
}
