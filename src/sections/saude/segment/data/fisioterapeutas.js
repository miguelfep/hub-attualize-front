import {
  buildBaseFaqs,
  buildWhyCards,
  buildBaseServices,
  buildWhatsappLink,
} from '../segment-defaults';

// ----------------------------------------------------------------------

export const FISIOTERAPEUTAS = {
  slug: 'contabilidade-para-fisioterapeutas',
  name: 'Fisioterapeutas',
  accent: '#22C55E',
  whatsappLink: buildWhatsappLink('FISIOTERAPEUTAS'),

  seo: {
    title: 'Contabilidade para Fisioterapeutas - Attualize Contábil',
    description:
      'Contabilidade especializada para fisioterapeutas, estúdios de pilates e clínicas de fisioterapia. Planejamento tributário com Fator R, abertura de CNPJ e atendimento humanizado 100% digital em todo o Brasil.',
    keywords: [
      'contabilidade para fisioterapeutas',
      'contador para fisioterapeuta',
      'cnpj para fisioterapeuta',
      'contabilidade estúdio de pilates',
      'fator r fisioterapia',
      'abertura cnpj clínica de fisioterapia',
    ],
    serviceDescription:
      'Serviço de contabilidade especializada para fisioterapeutas, estúdios de pilates e clínicas de fisioterapia: abertura de CNPJ, planejamento tributário com Fator R, pró-labore, folha de pagamento e obrigações fiscais.',
  },

  hero: {
    chipIcon: 'solar:body-bold-duotone',
    chip: 'Contabilidade para Fisioterapeutas',
    titlePre: 'Contabilidade Especializada para',
    titleHighlight: 'Fisioterapeutas',
    subtitle: 'Menos Impostos, Menos Burocracia e Mais Tempo para os Seus Pacientes',
    description:
      'Clínica, estúdio de pilates, atendimento domiciliar ou home care? Entendemos o seu espaço e a sua rotina. Do Fator R ao alvará sanitário, cuidamos da sua contabilidade para você pagar o mínimo de impostos dentro da lei.',
  },

  why: {
    intro: [
      'A Attualize é especialista em contabilidade para fisioterapeutas.',
      'Na prática, isso significa que entendemos a fundo a sua rotina: atendimentos em clínica, domicílio ou estúdio, convênios e home care, registro no CREFITO e os benefícios fiscais que a maioria das contabilidades genéricas não aplica.',
    ],
    cards: buildWhyCards({
      especializacao:
        'Foco total nas particularidades de fisioterapeutas: CREFITO, pilates, home care, CNAE correto e tributação da atividade.',
      otimizacao:
        'Análise de Fator R e comparativo de regimes para garantir o mínimo de impostos dentro da lei.',
    }),
  },

  tax: {
    intro:
      'A fisioterapia tem benefícios fiscais que a maioria das contabilidades genéricas não aplica. Conheça as três principais estratégias que analisamos no seu diagnóstico gratuito:',
    cards: [
      {
        icon: 'solar:calculator-bold-duotone',
        badge: 'Simples Nacional',
        title: 'Fator R: a partir de 6%',
        description:
          'Quando a folha de pagamento (incluindo o pró-labore) representa 28% ou mais do faturamento, a fisioterapia sai do Anexo V (15,5%) e vai para o Anexo III (6%).',
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
          'Clínicas de fisioterapia com estrutura para procedimentos de reabilitação podem pleitear a equiparação hospitalar, reduzindo a base do IRPJ de 32% para 8% e da CSLL de 32% para 12%.',
        bullets: [
          'Economia que pode passar de 60% nos impostos federais',
          'Análise dos requisitos legais e societários',
          'Indicado para clínicas estruturadas de reabilitação',
        ],
      },
      {
        icon: 'solar:user-id-bold-duotone',
        badge: 'Autônomo → PJ',
        title: 'Do Carnê-Leão ao CNPJ',
        description:
          'Como pessoa física, o imposto sobre os atendimentos pode chegar a 27,5% no carnê-leão. Com CNPJ e o enquadramento correto, fisioterapeutas costumam pagar bem menos.',
        bullets: [
          'Comparativo PF x PJ gratuito antes de decidir',
          'Abertura de CNPJ sem burocracia',
          'Orientação sobre CREFITO da empresa e CNAE correto',
        ],
      },
    ],
  },

  services: buildBaseServices('CREFITO'),

  testimonials: [
    {
      title: 'Dr.',
      name: 'Gustavo Andrade',
      city: 'Belo Horizonte - MG',
      testimonial:
        'Abri meu estúdio de fisioterapia com a Attualize. CNPJ saiu rápido, me orientaram sobre alvará e vigilância sanitária e hoje cuidam de toda a rotina.',
      specialty: 'Fisioterapeuta - Pilates',
    },
    {
      title: 'Dra.',
      name: 'Bianca Souto',
      city: 'Campinas - SP',
      testimonial:
        'Atendo home care por duas operadoras e a Attualize organizou minhas notas e meu Fator R. Pago muito menos imposto do que quando estava no carnê-leão.',
      specialty: 'Fisioterapia Domiciliar',
    },
    {
      title: 'Dr.',
      name: 'Henrique Vilela',
      city: 'Porto Alegre - RS',
      testimonial:
        'Nossa clínica de reabilitação cresceu e a contabilidade acompanhou: folha dos funcionários, impostos e relatórios sempre em dia, com atendimento humano.',
      specialty: 'Fisioterapia Esportiva',
    },
  ],

  faqs: [
    {
      question: 'Vale a pena abrir CNPJ ou continuar como autônomo no carnê-leão?',
      answer:
        'Depende do seu faturamento. Como autônomo, o imposto no carnê-leão pode chegar a 27,5%. Com CNPJ e um bom planejamento tributário, fisioterapeutas costumam pagar entre 6% e 16%. Fazemos esse comparativo gratuitamente para você decidir com segurança.',
    },
    {
      question: 'Atendo em domicílio e em estúdio de pilates. Muda algo na contabilidade?',
      answer:
        'Muda principalmente o CNAE e as licenças. Atendimento domiciliar, estúdio de pilates e clínica têm enquadramentos e exigências sanitárias diferentes. Configuramos seu CNPJ com as atividades corretas para você atuar em todas as frentes sem risco.',
    },
    {
      question: 'Recebo de convênios e home care. Vocês cuidam das notas?',
      answer:
        'Sim. Orientamos a emissão das notas fiscais para operadoras, convênios e empresas de home care, e organizamos os recebimentos para o cálculo correto dos impostos e do seu Fator R.',
    },
    ...buildBaseFaqs('fisioterapeutas'),
  ],

  ctaSubtitle:
    'Chega de contabilidade genérica! Fale agora com especialistas que entendem a rotina da fisioterapia — e descubra quanto você pode economizar.',
};
