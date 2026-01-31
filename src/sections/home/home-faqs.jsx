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
    question: 'O que é contabilidade especializada para saúde, beleza e bem-estar?',
    answer: (
      <Typography component="p">
        A contabilidade especializada para saúde, beleza e bem-estar é um serviço contábil focado
        nas particularidades desses setores. Inclui conhecimento específico sobre tributação,
        legislação trabalhista, CNAEs adequados e obrigações fiscais específicas para clínicas de
        estética, profissionais da saúde, psicólogos, academias e estúdios de bem-estar.
      </Typography>
    ),
  },
  {
    question: 'A Attualize atende todo o Brasil com contabilidade especializada?',
    answer: (
      <Typography component="p">
        Sim, por ser uma contabilidade digital especializada, atendemos todo o Brasil de forma
        remota, oferecendo serviços de contabilidade para saúde, beleza e bem-estar com a mesma
        qualidade e expertise, independente da localização do cliente.
      </Typography>
    ),
  },
  {
    question: 'Quais são as especialidades da Attualize em contabilidade?',
    answer: (
      <Box component="ul" sx={{ pl: 3, listStyleType: 'disc' }}>
        <li>
          <strong>Contabilidade para clínicas de estética:</strong> gestão contábil completa para
          clínicas de estética, depilação, estética facial e corporal.
        </li>
        <li>
          <strong>Contabilidade para profissionais da saúde:</strong> médicos, dentistas,
          fisioterapeutas, nutricionistas, psicólogos e outros profissionais da área da saúde.
        </li>
        <li>
          <strong>Contabilidade para bem-estar:</strong> academias, estúdios de pilates, yoga,
          crossfit, personal trainers e outras atividades de bem-estar.
        </li>
        <li>
          <strong>Contabilidade para psicólogos:</strong> especialização em abertura de CNPJ para
          psicólogos, gestão tributária e orientações específicas da categoria.
        </li>
      </Box>
    ),
  },
  {
    question: 'Como funciona a contabilidade para psicólogos?',
    answer: (
      <Typography component="p">
        A contabilidade para psicólogos inclui orientação sobre abertura de CNPJ, escolha do regime
        tributário mais adequado (Simples Nacional, MEI ou Lucro Presumido), emissão de notas
        fiscais, controle de receitas e despesas, e cumprimento de todas as obrigações fiscais
        específicas da profissão. Oferecemos suporte completo para psicólogos que atendem presencial
        ou online.
      </Typography>
    ),
  },
  {
    question: 'Quais serviços de contabilidade vocês fornecem mensalmente?',
    answer: (
      <Box component="ul" sx={{ pl: 3, listStyleType: 'disc' }}>
        <li>
          Elaboração da contabilidade especializada de acordo com a legislação, incluindo balancetes
          e balanços.
        </li>
        <li>
          Apuração de tributos conforme a emissão de notas fiscais da empresa, com conhecimento
          específico do setor.
        </li>
        <li>
          Orientação trabalhista, elaboração de pró-labore e guias de encargos sociais para sócios.
        </li>
        <li>
          Consultoria contábil especializada em saúde, beleza e bem-estar para otimização
          tributária.
        </li>
        <li>Suporte para emissão de notas fiscais e controle de receitas.</li>
      </Box>
    ),
  },
  {
    question: 'Por que escolher a Attualize para contabilidade especializada?',
    answer: (
      <Typography component="p">
        Somos especializados em contabilidade digital para estética, saúde e bem-estar. Oferecemos
        um atendimento humanizado, acompanhamento personalizado e conhecimento profundo das
        particularidades do seu setor. Nossa expertise em contabilidade para psicólogos, clínicas
        de estética e profissionais da saúde garante que você tenha o melhor suporte contábil
        especializado.
      </Typography>
    ),
  },
  {
    question: 'Como funciona o atendimento da contabilidade especializada?',
    answer: (
      <Typography component="p">
        Nosso atendimento de contabilidade especializada é 100% digital, mas totalmente humanizado.
        Você pode entrar em contato conosco por canais como WhatsApp, e-mail ou agendar uma reunião
        virtual com nossos especialistas em contabilidade para saúde, beleza e bem-estar.
      </Typography>
    ),
  },
  {
    question: 'Quais documentos preciso para abrir minha empresa na área de saúde ou beleza?',
    answer: (
      <Box component="ul" sx={{ pl: 3, listStyleType: 'disc' }}>
        <li>RG e CPF do responsável legal.</li>
        <li>Comprovante de endereço atualizado.</li>
        <li>Definição da atividade (CNAE) adequada para seu segmento (saúde, beleza ou bem-estar).</li>
        <li>Nome fantasia e razão social da empresa.</li>
        <li>Registro profissional (CRM, CRP, CRO, etc.) quando aplicável.</li>
        <li>Alvará de funcionamento (quando necessário para o tipo de atividade).</li>
      </Box>
    ),
  },
  {
    question: 'Quais são os benefícios de contratar uma contabilidade digital especializada?',
    answer: (
      <Typography component="p">
        A contabilidade digital especializada permite mais agilidade, redução de custos e maior
        comodidade no acompanhamento de seus resultados financeiros, sem perder a qualidade do
        atendimento. Além disso, você conta com conhecimento específico sobre tributação e
        legislação do seu setor, otimizando sua gestão contábil e fiscal.
      </Typography>
    ),
  },
  {
    question: 'A Attualize oferece contabilidade para clínicas de estética?',
    answer: (
      <Typography component="p">
        Sim, oferecemos contabilidade especializada para clínicas de estética, incluindo gestão
        tributária, emissão de notas fiscais, controle de receitas e despesas, e orientação sobre
        CNAEs adequados. Nossa expertise garante que sua clínica de estética tenha toda a
        documentação contábil em dia, permitindo que você foque no crescimento do seu negócio.
      </Typography>
    ),
  },
  {
    question: 'Qual o melhor regime tributário para profissionais da saúde e beleza?',
    answer: (
      <Typography component="p">
        O melhor regime tributário depende do faturamento, tipo de atividade e estrutura do
        negócio. Para profissionais da saúde e beleza, geralmente recomendamos o Simples Nacional
        (até determinado faturamento) ou Lucro Presumido. Nossa equipe especializada em
        contabilidade para saúde, beleza e bem-estar analisa seu caso específico e indica a melhor
        opção tributária para otimizar seus impostos.
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
      title="Dúvidas sobre Contabilidade"
      txtGradient="para Saúde, Beleza e Bem-Estar"
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
