import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const FAQS_CONTABILIDADE = [
  {
    heading: 'Qual o melhor regime tributário para o meu negócio?',
    detail:
      'Depende do faturamento, da atividade e da estrutura da empresa. Para profissionais e negócios de saúde, beleza e bem-estar, geralmente avaliamos entre Simples Nacional e Lucro Presumido, considerando também o Fator R. Na Attualize fazemos esse estudo tributário para indicar a opção mais econômica para o seu caso.',
  },
  {
    heading: 'O que é o Fator R e como ele afeta meus impostos?',
    detail:
      'O Fator R é a relação entre a folha de pagamento (incluindo pró-labore) e o faturamento dos últimos 12 meses. Se a folha representar 28% ou mais do faturamento, atividades de saúde podem ser tributadas no Anexo III do Simples Nacional, com alíquotas a partir de 6%, em vez do Anexo V, que começa em 15,5%.',
  },
  {
    heading: 'Quais documentos preciso para abrir minha empresa?',
    detail:
      'Em geral: RG e CPF do responsável, comprovante de endereço, IPTU ou contrato de locação do endereço comercial e, dependendo da atividade, registro no conselho de classe (CRM, CRO, CRP, CREFITO etc.). Nossa equipe conduz todo o processo de abertura para você.',
  },
  {
    heading: 'Posso trocar de contador a qualquer momento?',
    detail:
      'Sim. A troca de contabilidade pode ser feita em qualquer época do ano e a Attualize cuida de toda a migração: solicitamos os documentos e informações ao contador anterior e você não precisa se preocupar com a burocracia.',
  },
  {
    heading: 'Quais serviços estão inclusos na mensalidade?',
    detail:
      'Escrituração contábil e fiscal completa, apuração de impostos, folha de pagamento e pró-labore, entrega das obrigações acessórias, balancetes e demonstrativos, além de atendimento consultivo com nosso time por WhatsApp e e-mail.',
  },
  {
    heading: 'Preciso emitir nota fiscal de todos os atendimentos?',
    detail:
      'Sim. Toda prestação de serviço deve ser acompanhada da emissão de nota fiscal. Além de ser uma exigência legal, o faturamento correto evita problemas com o Fisco e mantém a empresa regular para crédito, licitações e convênios.',
  },
  {
    heading: 'A Attualize atende todo o Brasil?',
    detail:
      'Sim. Somos uma contabilidade digital e atendemos clientes em todo o Brasil de forma remota, com atendimento humanizado por WhatsApp, e-mail e reuniões on-line.',
  },
];

const FAQS_PORTAL = [
  {
    heading: 'Como acesso o Portal do Cliente Attualize?',
    detail:
      'Você recebe seu acesso por e-mail ao se tornar cliente. Basta entrar com seu e-mail e senha na área de login do site. No portal você acompanha sua empresa de qualquer lugar, a qualquer hora.',
  },
  {
    heading: 'O que consigo fazer no portal?',
    detail:
      'No portal você acompanha seu financeiro, acessa documentos e contratos, acompanha processos societários (abertura e alterações), visualiza orçamentos e vendas, emite e baixa notas fiscais, consulta guias de impostos e tem acesso a conteúdos exclusivos e à comunidade.',
  },
  {
    heading: 'Onde encontro minhas guias de impostos e documentos?',
    detail:
      'As guias e documentos ficam disponíveis na área Financeiro e em Documentos e Societário do portal. Você também recebe avisos quando novas guias são liberadas, para não perder nenhum vencimento.',
  },
  {
    heading: 'Como emito notas fiscais pelo sistema?',
    detail:
      'O portal possui integração para emissão de notas fiscais de serviço, incluindo o Emissor Nacional da NFS-e. Você emite, consulta e baixa suas notas em poucos cliques, sem precisar acessar sistemas de prefeitura.',
  },
  {
    heading: 'Esqueci minha senha do portal. O que faço?',
    detail:
      'Na tela de login, clique em "Esqueceu a senha?" e informe seu e-mail cadastrado. Você receberá um link para criar uma nova senha. Se tiver dificuldade, fale com nosso atendimento.',
  },
];

// ----------------------------------------------------------------------

function FaqsGroup({ title, items }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>

      {items.map((accordion) => (
        <Accordion key={accordion.heading}>
          <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
            <Typography variant="subtitle1">{accordion.heading}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Typography>{accordion.detail}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

export function FaqsList() {
  return (
    <div>
      <FaqsGroup title="Contabilidade" items={FAQS_CONTABILIDADE} />
      <FaqsGroup title="Portal do Cliente" items={FAQS_PORTAL} />
    </div>
  );
}
