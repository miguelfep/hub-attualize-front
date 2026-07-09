import {
  buildBaseFaqs,
  buildWhyCards,
  buildBaseServices,
  buildWhatsappLink,
} from '../segment-defaults';

// ----------------------------------------------------------------------

export const DENTISTAS = {
  slug: 'contabilidade-para-dentistas',
  name: 'Dentistas',
  accent: '#00B8D9',
  whatsappLink: buildWhatsappLink('DENTISTAS'),

  seo: {
    title: 'Contabilidade para Dentistas - Attualize Contábil',
    description:
      'Contabilidade especializada para dentistas e clínicas odontológicas. Planejamento tributário com Fator R, abertura de CNPJ, pró-labore e atendimento humanizado 100% digital em todo o Brasil.',
    keywords: [
      'contabilidade para dentistas',
      'contador para dentista',
      'cnpj para dentista',
      'contabilidade clínica odontológica',
      'fator r dentista',
      'abertura cnpj consultório odontológico',
    ],
    serviceDescription:
      'Serviço de contabilidade especializada para dentistas e clínicas odontológicas: abertura de CNPJ, planejamento tributário com Fator R, pró-labore, folha de pagamento e obrigações fiscais.',
  },

  hero: {
    chipIcon: 'mdi:tooth',
    chip: 'Contabilidade para Dentistas',
    titlePre: 'Contabilidade Especializada para',
    titleHighlight: 'Dentistas',
    subtitle: 'Menos Impostos, Menos Burocracia e Mais Tempo para os Seus Pacientes',
    description:
      'Consultório próprio, atendimento em clínicas ou convênios odontológicos? Entendemos a sua rotina. Do Fator R ao CNAE correto da odontologia, cuidamos da sua contabilidade para você pagar o mínimo de impostos dentro da lei.',
  },

  why: {
    intro: [
      'A Attualize é especialista em contabilidade para dentistas.',
      'Na prática, isso significa que entendemos a fundo a sua rotina: materiais e laboratório, convênios odontológicos, pró-labore, registro no CRO e os benefícios fiscais que a maioria das contabilidades genéricas não aplica.',
    ],
    cards: buildWhyCards({
      especializacao:
        'Foco total nas particularidades de dentistas: CRO, convênios odontológicos, CNAE correto e tributação da atividade.',
      otimizacao:
        'Análise de Fator R e comparativo de regimes para garantir o mínimo de impostos dentro da lei.',
    }),
  },

  tax: {
    intro:
      'A odontologia tem benefícios fiscais que a maioria das contabilidades genéricas não aplica. Conheça as três principais estratégias que analisamos no seu diagnóstico gratuito:',
    cards: [
      {
        icon: 'solar:calculator-bold-duotone',
        badge: 'Simples Nacional',
        title: 'Fator R: a partir de 6%',
        description:
          'Quando a folha de pagamento (incluindo o pró-labore) representa 28% ou mais do faturamento, a atividade odontológica sai do Anexo V (15,5%) e vai para o Anexo III (6%).',
        bullets: [
          'Monitoramento mensal do Fator R',
          'Ajuste estratégico do pró-labore',
          'Alíquotas a partir de 6% sobre o faturamento',
        ],
      },
      {
        icon: 'solar:hospital-bold-duotone',
        badge: 'Lucro Presumido',
        title: 'Equiparação Hospitalar',
        description:
          'Clínicas odontológicas que realizam procedimentos equiparados a serviços hospitalares (cirurgias e procedimentos ambulatoriais) podem reduzir a base do IRPJ de 32% para 8% e da CSLL de 32% para 12%.',
        bullets: [
          'Economia que pode passar de 60% nos impostos federais',
          'Análise dos requisitos legais e societários',
          'Indicado para clínicas com procedimentos cirúrgicos',
        ],
      },
      {
        icon: 'solar:user-id-bold-duotone',
        badge: 'Autônomo → PJ',
        title: 'Do Carnê-Leão ao CNPJ',
        description:
          'Como pessoa física, o imposto sobre os atendimentos pode chegar a 27,5% no carnê-leão. Com CNPJ e o enquadramento correto, dentistas costumam pagar bem menos.',
        bullets: [
          'Comparativo PF x PJ gratuito antes de decidir',
          'Abertura de CNPJ sem burocracia',
          'Orientação sobre CRO da empresa e CNAE correto',
        ],
      },
    ],
  },

  services: buildBaseServices('CRO'),

  testimonials: [
    {
      title: 'Dr.',
      name: 'Rafael Moreira',
      city: 'São Paulo - SP',
      testimonial:
        'Minha clínica odontológica estava pagando imposto a mais há anos. Com o planejamento tributário deles, a mensalidade da contabilidade se paga sozinha.',
      specialty: 'Cirurgião-Dentista',
    },
    {
      title: 'Dra.',
      name: 'Larissa Brandão',
      city: 'Curitiba - PR',
      testimonial:
        'Abri meu primeiro consultório com a Attualize. CNPJ rápido, orientação sobre vigilância sanitária e zero dor de cabeça com impostos.',
      specialty: 'Ortodontista',
    },
    {
      title: 'Dr.',
      name: 'Thiago Sampaio',
      city: 'Belo Horizonte - MG',
      testimonial:
        'Atendo em duas clínicas como PJ e a Attualize organizou minhas notas e meu pró-labore para aproveitar o Fator R. Recomendo para todo colega dentista.',
      specialty: 'Implantodontista',
    },
  ],

  faqs: [
    {
      question: 'Vale a pena abrir CNPJ ou continuar como autônomo no carnê-leão?',
      answer:
        'Depende do seu faturamento. Como autônomo, o imposto no carnê-leão pode chegar a 27,5%. Com CNPJ e um bom planejamento tributário, dentistas costumam pagar entre 6% e 16%. Fazemos esse comparativo gratuitamente para você decidir com segurança.',
    },
    {
      question: 'Atendo em clínicas de terceiros. Posso receber como PJ?',
      answer:
        'Sim, é muito comum clínicas contratarem dentistas como pessoa jurídica. Com o CNPJ aberto e o CNAE correto, você emite nota fiscal para a clínica e paga muito menos imposto. Orientamos todo o processo, do contrato à emissão das notas.',
    },
    {
      question: 'Minha clínica precisa de registro no CRO e alvará sanitário?',
      answer:
        'Sim. Além do CNPJ, clínicas e consultórios odontológicos precisam de registro da empresa no CRO e de licença da vigilância sanitária. Nós orientamos todo o processo de regularização para você atender sem riscos.',
    },
    ...buildBaseFaqs('dentistas'),
  ],

  ctaSubtitle:
    'Chega de contabilidade genérica! Fale agora com especialistas que entendem a rotina da odontologia — e descubra quanto você pode economizar.',
};
