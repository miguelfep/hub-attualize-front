import {
  buildBaseFaqs,
  buildWhyCards,
  buildBaseServices,
  buildWhatsappLink,
} from '../segment-defaults';

// ----------------------------------------------------------------------

export const MEDICOS = {
  slug: 'contabilidade-para-medicos',
  name: 'Médicos',
  accent: '#0096D9',
  whatsappLink: buildWhatsappLink('MÉDICOS'),

  seo: {
    title: 'Contabilidade para Médicos - Attualize Contábil',
    description:
      'Contabilidade especializada para médicos e consultórios. Planejamento tributário com Fator R e equiparação hospitalar, abertura de CNPJ, pró-labore e atendimento humanizado 100% digital em todo o Brasil.',
    keywords: [
      'contabilidade para médicos',
      'contador para médicos',
      'cnpj para médico',
      'médico pessoa jurídica',
      'equiparação hospitalar',
      'fator r médico',
      'abertura cnpj consultório médico',
    ],
    serviceDescription:
      'Serviço de contabilidade especializada para médicos e consultórios: abertura de CNPJ, planejamento tributário com Fator R e equiparação hospitalar, pró-labore, folha de pagamento e obrigações fiscais.',
  },

  hero: {
    chipIcon: 'solar:stethoscope-bold-duotone',
    chip: 'Contabilidade para Médicos',
    titlePre: 'Contabilidade Especializada para',
    titleHighlight: 'Médicos',
    subtitle: 'Menos Impostos, Menos Burocracia e Mais Tempo para os Seus Pacientes',
    description:
      'Plantões, consultório, convênios e ainda a contabilidade? Deixa com a gente. Do Fator R à equiparação hospitalar, cuidamos de tudo para você pagar o mínimo de impostos dentro da lei — seja você PJ ou recém-saído do carnê-leão.',
  },

  why: {
    intro: [
      'A Attualize é especialista em contabilidade para médicos.',
      'Na prática, isso significa que entendemos a fundo a sua rotina: recebimentos de plantões e convênios, pró-labore, CNAE correto do consultório e os benefícios fiscais que a maioria das contabilidades genéricas não aplica.',
    ],
    cards: buildWhyCards({
      especializacao:
        'Foco total nas particularidades de médicos: CRM, plantões PJ, convênios, CNAE correto e tributação da atividade médica.',
      otimizacao:
        'Análise de Fator R e equiparação hospitalar para garantir o mínimo de impostos dentro da lei.',
    }),
  },

  tax: {
    intro:
      'A medicina tem benefícios fiscais que a maioria das contabilidades genéricas não aplica. Conheça as três principais estratégias que analisamos no seu diagnóstico gratuito:',
    cards: [
      {
        icon: 'solar:calculator-bold-duotone',
        badge: 'Simples Nacional',
        title: 'Fator R: a partir de 6%',
        description:
          'Quando a folha de pagamento (incluindo o pró-labore) representa 28% ou mais do faturamento, a atividade médica sai do Anexo V (15,5%) e vai para o Anexo III (6%).',
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
          'Clínicas médicas que realizam procedimentos equiparados a serviços hospitalares (cirurgias, exames, procedimentos ambulatoriais) reduzem a base do IRPJ de 32% para 8% e da CSLL de 32% para 12%.',
        bullets: [
          'Economia que pode passar de 60% nos impostos federais',
          'Análise dos requisitos legais e societários',
          'Indicado para clínicas com procedimentos e exames',
        ],
      },
      {
        icon: 'solar:user-id-bold-duotone',
        badge: 'Autônomo → PJ',
        title: 'Do Carnê-Leão ao CNPJ',
        description:
          'Como pessoa física, o imposto sobre plantões e consultas pode chegar a 27,5% no carnê-leão. Com CNPJ e o enquadramento correto, médicos costumam pagar bem menos.',
        bullets: [
          'Comparativo PF x PJ gratuito antes de decidir',
          'Abertura de CNPJ sem burocracia',
          'Orientação sobre CRM da empresa e CNAE correto',
        ],
      },
    ],
  },

  services: buildBaseServices('CRM'),

  testimonials: [
    {
      title: 'Dra.',
      name: 'Camila Ferreira',
      city: 'Curitiba - PR',
      testimonial:
        'Migrei do carnê-leão para o CNPJ com a Attualize e a economia foi imediata. Eles cuidam de tudo e eu finalmente parei de perder tempo com burocracia.',
      specialty: 'Dermatologista',
    },
    {
      title: 'Dr.',
      name: 'Eduardo Tavares',
      city: 'Brasília - DF',
      testimonial:
        'A análise de equiparação hospitalar reduziu drasticamente os impostos da nossa clínica. Profissionais que realmente conhecem a área da saúde.',
      specialty: 'Clínica de Imagem',
    },
    {
      title: 'Dr.',
      name: 'Marcos Vinícius Rocha',
      city: 'São Paulo - SP',
      testimonial:
        'Faço plantões em três hospitais e a Attualize organizou tudo: notas, pró-labore e impostos. O atendimento pelo WhatsApp é rápido de verdade.',
      specialty: 'Médico Plantonista',
    },
  ],

  faqs: [
    {
      question: 'Vale a pena abrir CNPJ ou continuar como autônomo no carnê-leão?',
      answer:
        'Depende do seu faturamento. Como autônomo, o imposto no carnê-leão pode chegar a 27,5%. Com CNPJ e um bom planejamento tributário, médicos costumam pagar entre 6% e 16%. Fazemos esse comparativo gratuitamente para você decidir com segurança.',
    },
    {
      question: 'Posso atender plantões e hospitais como PJ?',
      answer:
        'Sim, é muito comum hospitais contratarem médicos como pessoa jurídica. Com o CNPJ aberto e o CNAE correto, você emite nota fiscal para o hospital e paga muito menos imposto do que receberia como CLT ou autônomo. Orientamos todo o processo.',
    },
    {
      question: 'O que é equiparação hospitalar e minha clínica pode usar?',
      answer:
        'É um benefício fiscal no Lucro Presumido para clínicas que realizam procedimentos equiparados a serviços hospitalares (cirurgias, exames, procedimentos ambulatoriais), reduzindo a base de cálculo do IRPJ de 32% para 8% e da CSLL de 32% para 12%. A economia pode passar de 60% nos impostos federais. Analisamos se a sua clínica se enquadra nos requisitos.',
    },
    ...buildBaseFaqs('médicos'),
  ],

  ctaSubtitle:
    'Chega de contabilidade genérica! Fale agora com especialistas que entendem a rotina médica — e descubra quanto você pode economizar.',
};
