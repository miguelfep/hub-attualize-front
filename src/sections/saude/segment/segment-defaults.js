// ----------------------------------------------------------------------
// Dados compartilhados entre as landing pages de segmentos da saúde
// (médicos, dentistas, fisioterapeutas, nutricionistas, fonoaudiólogos...)
// ----------------------------------------------------------------------

const WHATSAPP_NUMBER = '554196982267';

export function buildWhatsappLink(label) {
  const message = `Olá, vim pelo site e quero informações sobre contabilidade para ${label}!`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const MIGRAR_WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Olá, estou no site e tenho interesse em migrar minha contabilidade para a Attualize!'
)}`;

export const DEFAULT_STATS = [
  {
    icon: 'solar:calendar-bold-duotone',
    value: '+10 anos',
    label: 'de experiência com saúde',
  },
  {
    icon: 'solar:users-group-rounded-bold-duotone',
    value: '+200',
    label: 'clientes atendidos',
  },
  {
    icon: 'solar:map-point-bold-duotone',
    value: 'Todo o Brasil',
    label: 'atendimento 100% digital',
  },
  {
    icon: 'solar:chat-round-dots-bold-duotone',
    value: 'WhatsApp',
    label: 'atendimento humanizado',
  },
];

export const DEFAULT_STEPS = [
  {
    icon: 'solar:chat-round-dots-bold-duotone',
    title: 'Diagnóstico gratuito',
    description:
      'Você fala com um especialista pelo WhatsApp e analisamos sua situação atual: regime tributário, impostos pagos e oportunidades de economia.',
  },
  {
    icon: 'solar:document-add-bold-duotone',
    title: 'Proposta sob medida',
    description:
      'Apresentamos o plano ideal para o seu negócio — abertura de CNPJ ou migração de contador, sem burocracia e sem interromper sua rotina.',
  },
  {
    icon: 'solar:check-circle-bold-duotone',
    title: 'Cuidamos de tudo',
    description:
      'Impostos, folha de pagamento, pró-labore, obrigações e notas fiscais: nossa equipe assume a parte chata para você focar nos pacientes.',
  },
  {
    icon: 'solar:graph-up-bold-duotone',
    title: 'Acompanhamento contínuo',
    description:
      'Monitoramos seu Fator R e seu enquadramento todos os meses, com relatórios claros e orientação para o crescimento do negócio.',
  },
];

export const DEFAULT_ABERTURA_STEPS = [
  {
    number: '1',
    title: 'Comercial',
    description:
      'Nesta etapa, você analisa nossa proposta e, se ela fizer sentido para você, o próximo passo é o envio dos seus documentos através do nosso formulário.',
    icon: 'solar:document-text-bold-duotone',
  },
  {
    number: '2',
    title: 'Kickoff',
    description:
      'Após nossa equipe validar eles, vamos marcar uma reunião para alinharmos a abertura da sua empresa. Além disso, você também poderá acompanhar todo o processo do início ao fim.',
    icon: 'solar:calendar-bold-duotone',
  },
  {
    number: '3',
    title: 'Abertura',
    description:
      'Nessa etapa, nós cuidamos de toda a burocracia em um processo que leva em média 30 dias úteis até ser concluído. E claro, que exige o pagamento de taxas aos órgãos envolvidos.',
    icon: 'solar:clock-circle-bold-duotone',
  },
  {
    number: '4',
    title: 'Contrato',
    description:
      'Após a abertura da sua empresa, formalizamos nossa parceria com um contrato simples. A primeira mensalidade só será paga no mês seguinte.',
    icon: 'solar:document-add-bold-duotone',
  },
  {
    number: '5',
    title: 'Onboarding',
    description:
      'Liberamos o acesso à nossa plataforma com guias e vídeos. Agendamos uma reunião para tirar suas dúvidas e começarmos alinhados.',
    icon: 'solar:monitor-bold-duotone',
  },
  {
    number: '6',
    title: 'Conclusão',
    description:
      'Parceria iniciada! Cuidaremos das obrigações contábeis e fiscais para você focar no crescimento do seu negócio!',
    icon: 'solar:buildings-bold-duotone',
  },
];

export const DEFAULT_PLANS = [
  {
    title: 'PLANO START',
    badge: 'RECOMENDADO',
    badgeColor: 'info',
    subtitle: 'O Essencial para Começar Bem',
    description:
      'Para quem está abrindo o negócio e quer ficar 100% regularizado sem complicações.',
    limit: 'Limitado a faturamentos mensais até R$ 20k',
    features: [
      {
        title: 'Um contábil completo:',
        description:
          'Balancete, balanço patrimonial, DRE, distribuição de lucros e demais obrigações contábeis.',
      },
      {
        title: 'Um fiscal completo:',
        description:
          'Escrituração dos documentos fiscais e apuração de impostos (com análise de Fator R).',
      },
      {
        title: 'Um DP completo:',
        description:
          'Manutenção estratégica nos registros e pró-labore dos sócios com encargos e tributos inclusos.',
      },
      {
        title: 'Portal do Cliente:',
        description:
          'Centralizamos todos os documentos e guias da sua empresa em um único local de fácil acesso.',
      },
      {
        title: 'Suporte Completo:',
        description:
          'Fale conosco via WhatsApp ou e-mail, para tirar dúvidas sobre sua empresa e pedir orientações trabalhistas.',
      },
    ],
    isPopular: false,
  },
  {
    title: 'PLANO PLENO',
    badge: 'MAIS ESCOLHIDO',
    badgeColor: 'warning',
    subtitle: 'Gestão e Crescimento',
    description:
      'Para quem já tem operação constante e quer mais controle financeiro e previsibilidade.',
    limit: 'Limitado a faturamentos mensais até R$ 100k',
    features: [
      {
        title: 'Um contábil completo:',
        description:
          'Balancete, balanço patrimonial, DRE, distribuição de lucros e demais obrigações contábeis.',
      },
      {
        title: 'Um fiscal completo:',
        description:
          'Escrituração dos documentos fiscais e apuração de impostos (com análise de Fator R).',
      },
      {
        title: 'Um DP completo:',
        description:
          'Manutenção estratégica nos registros e pró-labore dos sócios com encargos e tributos inclusos.',
      },
      {
        title: 'Portal do Cliente:',
        description:
          'Centralizamos todos os documentos e guias da sua empresa em um único local de fácil acesso.',
      },
      {
        title: 'Suporte Completo:',
        description:
          'Fale conosco via WhatsApp ou e-mail, para tirar dúvidas sobre sua empresa e pedir orientações trabalhistas.',
      },
      {
        title: 'Relatórios Trimestrais:',
        description:
          'Receba análises detalhadas da saúde financeira do seu negócio a cada trimestre.',
      },
      {
        title: 'Sistema Financeiro:',
        description:
          'Tenha acesso a um sistema para organizar suas contas a pagar e receber de forma eficiente.',
      },
      {
        title: 'Emissor de Notas Fiscais:',
        description:
          'Emita suas notas fiscais de serviço (até 20 NF/mês) diretamente pela plataforma.',
      },
    ],
    isPopular: true,
  },
  {
    title: 'PLANO PREMIUM',
    badge: 'EXCLUSIVO',
    badgeColor: 'secondary',
    subtitle: 'Estratégia e Performance',
    description: 'Para quem busca crescimento com acompanhamento próximo e visão estratégica.',
    limit: 'Limitado a faturamentos mensais até R$ 300k',
    features: [
      {
        title: 'Um contábil completo:',
        description:
          'Balancete, balanço patrimonial, DRE, distribuição de lucros e demais obrigações contábeis.',
      },
      {
        title: 'Um fiscal completo:',
        description:
          'Escrituração dos documentos fiscais e apuração de impostos (com análise de Fator R).',
      },
      {
        title: 'Um DP completo:',
        description:
          'Manutenção estratégica nos registros e pró-labore dos sócios com encargos e tributos inclusos.',
      },
      {
        title: 'Portal do Cliente:',
        description:
          'Centralizamos todos os documentos e guias da sua empresa em um único local de fácil acesso.',
      },
      {
        title: 'Suporte Completo:',
        description:
          'Fale conosco via WhatsApp ou e-mail, para tirar dúvidas sobre sua empresa e pedir orientações trabalhistas.',
      },
      {
        title: 'Reuniões Trimestrais:',
        description:
          'A cada 3 meses, avaliamos os resultados da sua empresa para tomada de decisões estratégicas.',
      },
      {
        title: 'Relatórios Trimestrais:',
        description:
          'Receba análises detalhadas da saúde financeira do seu negócio a cada trimestre.',
      },
      {
        title: 'Gerente Exclusivo:',
        description:
          'Tenha um especialista dedicado exclusivamente a sua empresa em todos os atendimentos e reuniões.',
      },
      {
        title: 'Sistema Financeiro:',
        description:
          'Tenha acesso a um sistema para organizar suas contas a pagar e receber de forma eficiente.',
      },
      {
        title: 'Emissor de Notas Fiscais:',
        description:
          'Emita suas notas fiscais de serviço (até 50 NF/mês) diretamente pela plataforma.',
      },
      {
        title: 'Grupo no WhatsApp:',
        description:
          'Participe de um grupo exclusivo para centralizar o atendimento e agilizar a comunicação.',
      },
    ],
    isPopular: false,
  },
];

export function buildBaseServices(registro) {
  return [
    'Abertura de CNPJ e alterações contratuais',
    'Troca de contador sem dor de cabeça',
    'Planejamento tributário e monitoramento do Fator R',
    'Apuração de impostos e obrigações fiscais',
    'Folha de pagamento e pró-labore',
    'Orientação para emissão de notas fiscais',
    'Imposto de Renda dos sócios (IRPF)',
    'Relatórios gerenciais e indicadores do negócio',
    'Orientação sobre alvarás e vigilância sanitária',
    ...(registro ? [`Orientação sobre registro da empresa no ${registro}`] : []),
    'Certificado digital',
    'Suporte ágil pelo WhatsApp',
  ];
}

export function buildWhyCards({ especializacao, otimizacao }) {
  return [
    {
      icon: 'solar:hand-heart-bold-duotone',
      title: 'Atendimento Humanizado',
      description:
        'Chega de tickets infinitos e robôs que não entendem o que você quer. Aqui na Attualize valorizamos a comunicação entre pessoas.',
    },
    {
      icon: 'solar:heart-pulse-bold-duotone',
      title: 'Especialização',
      description: especializacao,
    },
    {
      icon: 'solar:dollar-bold-duotone',
      title: 'Otimização Tributária',
      description: otimizacao,
    },
    {
      icon: 'solar:calendar-bold-duotone',
      title: '+10 Anos de Experiência',
      description:
        'Uma década de conhecimento aplicado a consultórios e clínicas de todo o Brasil.',
    },
    {
      icon: 'solar:chat-round-dots-bold-duotone',
      title: 'Agilidade no WhatsApp',
      description:
        'Sabemos que sua rotina é corrida. Atendemos pelo WhatsApp com agilidade, envolvendo sua secretária ou sócios sempre que necessário.',
    },
    {
      icon: 'solar:monitor-bold-duotone',
      title: '100% Digital',
      description:
        'Atendimento em todo o Brasil, sem papelada e sem você precisar sair do consultório.',
    },
  ];
}

export function buildBaseFaqs(profissaoPlural) {
  return [
    {
      question: 'Tenho uma secretária no consultório, ela pode falar com vocês?',
      answer:
        'Sem problemas! Temos muitos clientes na área da saúde e sabemos como a sua rotina é corrida. Na hora que você embarca na Attualize, entendemos o seu negócio e envolvemos todas as pessoas que forem necessárias na nossa comunicação — secretária, sócios ou quem mais você indicar.',
    },
    {
      question: 'Vocês atendem por WhatsApp?',
      answer:
        'Sim! O WhatsApp é o nosso principal canal de atendimento. Nada de tickets infinitos ou robôs que não entendem o que você quer: aqui você fala com contadores de verdade, com agilidade, para que a comunicação flua de forma efetiva.',
    },
    {
      question: 'Sou de outra cidade ou estado, vocês podem me atender?',
      answer: `Sim. Atendemos ${profissaoPlural} em todo o Brasil de forma 100% digital. Nossas ferramentas eliminam qualquer barreira de distância — você resolve tudo sem sair do consultório.`,
    },
    {
      question: 'Já tenho contador. Como funciona a troca?',
      answer:
        'A troca é mais simples do que parece — e nós cuidamos de tudo. Solicitamos os documentos e informações diretamente à contabilidade anterior, sem desgaste para você, e a transição acontece sem parar a emissão de notas ou atrasar obrigações.',
    },
    {
      question: 'No contrato, há fidelidade ou multa para cancelar?',
      answer:
        'Não há fidelidade nem multa de cancelamento nos planos mensais. A única condição é nos avisar com 30 dias de antecedência. Acreditamos que você fica pelo atendimento, não por contrato.',
    },
  ];
}
