import {
  buildBaseFaqs,
  buildWhyCards,
  buildBaseServices,
  buildWhatsappLink,
} from '../segment-defaults';

// ----------------------------------------------------------------------

export const FONOAUDIOLOGOS = {
  slug: 'contabilidade-para-fonoaudiologos',
  name: 'Fonoaudiólogos',
  accent: '#8E33FF',
  whatsappLink: buildWhatsappLink('FONOAUDIÓLOGOS'),

  seo: {
    title: 'Contabilidade para Fonoaudiólogos - Attualize Contábil',
    description:
      'Contabilidade especializada para fonoaudiólogos. Planejamento tributário com Fator R, abertura de CNPJ, atendimento presencial e online. Atendimento humanizado 100% digital em todo o Brasil.',
    keywords: [
      'contabilidade para fonoaudiólogos',
      'contador para fonoaudiólogo',
      'cnpj para fonoaudiólogo',
      'fonoaudiólogo pessoa jurídica',
      'fator r fonoaudiólogo',
      'abertura cnpj consultório de fonoaudiologia',
    ],
    serviceDescription:
      'Serviço de contabilidade especializada para fonoaudiólogos: abertura de CNPJ, planejamento tributário com Fator R, pró-labore, notas fiscais de atendimentos presenciais e online e obrigações fiscais.',
  },

  hero: {
    chipIcon: 'solar:user-speak-rounded-bold-duotone',
    chip: 'Contabilidade para Fonoaudiólogos',
    titlePre: 'Contabilidade Especializada para',
    titleHighlight: 'Fonoaudiólogos',
    subtitle: 'Menos Impostos, Menos Burocracia e Mais Tempo para os Seus Pacientes',
    description:
      'Consultório, escolas, home care ou teleatendimento? Entendemos a sua rotina. Do Fator R ao CNAE correto da fonoaudiologia, cuidamos da sua contabilidade para você pagar o mínimo de impostos dentro da lei.',
  },

  why: {
    intro: [
      'A Attualize é especialista em contabilidade para fonoaudiólogos.',
      'Na prática, isso significa que entendemos a fundo a sua rotina: atendimentos em consultório, escolas e domicílio, convênios, registro no CRFa e os benefícios fiscais que a maioria das contabilidades genéricas não aplica.',
    ],
    cards: buildWhyCards({
      especializacao:
        'Foco total nas particularidades de fonoaudiólogos: CRFa, convênios, teleatendimento, CNAE correto e tributação da atividade.',
      otimizacao:
        'Análise de Fator R e comparativo de regimes para garantir o mínimo de impostos dentro da lei.',
    }),
  },

  tax: {
    intro:
      'A fonoaudiologia tem benefícios fiscais que a maioria das contabilidades genéricas não aplica. Conheça as três principais estratégias que analisamos no seu diagnóstico gratuito:',
    cards: [
      {
        icon: 'solar:calculator-bold-duotone',
        badge: 'Simples Nacional',
        title: 'Fator R: a partir de 6%',
        description:
          'Quando a folha de pagamento (incluindo o pró-labore) representa 28% ou mais do faturamento, a fonoaudiologia sai do Anexo V (15,5%) e vai para o Anexo III (6%).',
        bullets: [
          'Monitoramento mensal do Fator R',
          'Ajuste estratégico do pró-labore',
          'Alíquotas a partir de 6% sobre o faturamento',
        ],
      },
      {
        icon: 'solar:user-id-bold-duotone',
        badge: 'Autônomo → PJ',
        title: 'Do Carnê-Leão ao CNPJ',
        description:
          'Como pessoa física, o imposto sobre os atendimentos pode chegar a 27,5% no carnê-leão. Com CNPJ e o enquadramento correto, fonoaudiólogos costumam pagar bem menos.',
        bullets: [
          'Comparativo PF x PJ gratuito antes de decidir',
          'Abertura de CNPJ sem burocracia',
          'Orientação sobre CRFa da empresa e CNAE correto',
        ],
      },
      {
        icon: 'solar:case-minimalistic-bold-duotone',
        badge: 'Convênios e parcerias',
        title: 'Escolas, Clínicas e Convênios',
        description:
          'Atendimentos para escolas, clínicas multidisciplinares e convênios exigem notas fiscais e contratos bem estruturados — e abrem espaço para receitas recorrentes no seu CNPJ.',
        bullets: [
          'Notas fiscais corretas para cada contratante',
          'Contratos PJ bem estruturados',
          'Organização das receitas para o menor imposto',
        ],
      },
    ],
  },

  services: buildBaseServices('CRFa'),

  testimonials: [
    {
      title: 'Dra.',
      name: 'Vanessa Ribeiro',
      city: 'Curitiba - PR',
      testimonial:
        'Saí do carnê-leão para o CNPJ com a orientação da Attualize e a economia foi visível já no primeiro mês. Atendimento rápido e sem burocracia.',
      specialty: 'Fonoaudiologia Infantil',
    },
    {
      title: 'Dr.',
      name: 'André Luiz Mota',
      city: 'São Paulo - SP',
      testimonial:
        'Presto serviço para duas escolas e uma clínica multidisciplinar. A Attualize organizou meus contratos PJ e as notas de cada contratante.',
      specialty: 'Audiologia',
    },
    {
      title: 'Dra.',
      name: 'Carolina Freitas',
      city: 'Florianópolis - SC',
      testimonial:
        'Faço teleatendimento para pacientes de vários estados e eles cuidam de toda a parte fiscal. Sobra tempo para o que importa: meus pacientes.',
      specialty: 'Motricidade Orofacial',
    },
  ],

  faqs: [
    {
      question: 'Vale a pena abrir CNPJ ou continuar como autônomo no carnê-leão?',
      answer:
        'Depende do seu faturamento. Como autônomo, o imposto no carnê-leão pode chegar a 27,5%. Com CNPJ e um bom planejamento tributário, fonoaudiólogos costumam pagar entre 6% e 16%. Fazemos esse comparativo gratuitamente para você decidir com segurança.',
    },
    {
      question: 'Presto serviço para escolas e clínicas. Posso receber como PJ?',
      answer:
        'Sim, é muito comum escolas e clínicas multidisciplinares contratarem fonoaudiólogos como pessoa jurídica. Com o CNPJ e o CNAE corretos, você emite nota fiscal para cada contratante e paga muito menos imposto. Orientamos todo o processo.',
    },
    {
      question: 'Faço teleatendimento. Muda algo nos impostos ou nas notas fiscais?',
      answer:
        'O teleatendimento não muda o imposto, mas exige atenção na emissão das notas fiscais, que seguem as regras do município da sua empresa. Configuramos tudo para você atender pacientes de qualquer lugar do Brasil sem dor de cabeça.',
    },
    ...buildBaseFaqs('fonoaudiólogos'),
  ],

  ctaSubtitle:
    'Chega de contabilidade genérica! Fale agora com especialistas que entendem a rotina da fonoaudiologia — e descubra quanto você pode economizar.',
};
