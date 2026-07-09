import {
  buildBaseFaqs,
  buildWhyCards,
  buildBaseServices,
  buildWhatsappLink,
} from '../segment-defaults';

// ----------------------------------------------------------------------

export const NUTRICIONISTAS = {
  slug: 'contabilidade-para-nutricionistas',
  name: 'Nutricionistas',
  accent: '#54B435',
  whatsappLink: buildWhatsappLink('NUTRICIONISTAS'),

  seo: {
    title: 'Contabilidade para Nutricionistas - Attualize Contábil',
    description:
      'Contabilidade especializada para nutricionistas. Planejamento tributário com Fator R, abertura de CNPJ, atendimento online e infoprodutos no mesmo CNPJ. Atendimento humanizado 100% digital em todo o Brasil.',
    keywords: [
      'contabilidade para nutricionistas',
      'contador para nutricionista',
      'cnpj para nutricionista',
      'nutricionista pessoa jurídica',
      'fator r nutricionista',
      'abertura cnpj consultório de nutrição',
    ],
    serviceDescription:
      'Serviço de contabilidade especializada para nutricionistas: abertura de CNPJ, planejamento tributário com Fator R, pró-labore, notas fiscais de consultas presenciais e online e obrigações fiscais.',
  },

  hero: {
    chipIcon: 'solar:leaf-bold-duotone',
    chip: 'Contabilidade para Nutricionistas',
    titlePre: 'Contabilidade Especializada para',
    titleHighlight: 'Nutricionistas',
    subtitle: 'Menos Impostos, Menos Burocracia e Mais Tempo para os Seus Pacientes',
    description:
      'Consultório, atendimento online, palestras e infoprodutos? Entendemos todas as suas fontes de renda. Do Fator R ao CNAE correto, cuidamos da sua contabilidade para você pagar o mínimo de impostos dentro da lei.',
  },

  why: {
    intro: [
      'A Attualize é especialista em contabilidade para nutricionistas.',
      'Na prática, isso significa que entendemos a fundo a sua rotina: consultas presenciais e online, planos de acompanhamento, parcerias e infoprodutos, registro no CRN e os benefícios fiscais que a maioria das contabilidades genéricas não aplica.',
    ],
    cards: buildWhyCards({
      especializacao:
        'Foco total nas particularidades de nutricionistas: CRN, atendimento online, infoprodutos, CNAE correto e tributação da atividade.',
      otimizacao:
        'Análise de Fator R e comparativo de regimes para garantir o mínimo de impostos dentro da lei.',
    }),
  },

  tax: {
    intro:
      'A nutrição tem benefícios fiscais que a maioria das contabilidades genéricas não aplica. Conheça as três principais estratégias que analisamos no seu diagnóstico gratuito:',
    cards: [
      {
        icon: 'solar:calculator-bold-duotone',
        badge: 'Simples Nacional',
        title: 'Fator R: a partir de 6%',
        description:
          'Quando a folha de pagamento (incluindo o pró-labore) representa 28% ou mais do faturamento, a nutrição sai do Anexo V (15,5%) e vai para o Anexo III (6%).',
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
          'Como pessoa física, o imposto sobre as consultas pode chegar a 27,5% no carnê-leão. Com CNPJ e o enquadramento correto, nutricionistas costumam pagar bem menos.',
        bullets: [
          'Comparativo PF x PJ gratuito antes de decidir',
          'Abertura de CNPJ sem burocracia',
          'Orientação sobre CRN da empresa e CNAE correto',
        ],
      },
      {
        icon: 'solar:rocket-bold-duotone',
        badge: 'Várias receitas',
        title: 'Consultas + Infoprodutos',
        description:
          'Cursos, e-books, mentorias e palestras podem entrar no mesmo CNPJ com CNAEs secundários — cada receita com a tributação correta, sem você precisar de duas empresas.',
        bullets: [
          'CNAEs secundários para produtos digitais',
          'Tributação correta para cada tipo de receita',
          'Um CNPJ só para todas as frentes do seu negócio',
        ],
      },
    ],
  },

  services: buildBaseServices('CRN'),

  testimonials: [
    {
      title: 'Dra.',
      name: 'Renata Campos',
      city: 'Porto Alegre - RS',
      testimonial:
        'Eles entendem as particularidades de quem atende em consultório. Minha secretária fala direto com a equipe e tudo flui sem eu precisar parar os atendimentos.',
      specialty: 'Nutrição Clínica',
    },
    {
      title: 'Dra.',
      name: 'Isabela Martins',
      city: 'São Paulo - SP',
      testimonial:
        'Atendo 100% online e vendo um curso de reeducação alimentar. A Attualize montou meu CNPJ com os CNAEs certos e cada receita paga o imposto correto.',
      specialty: 'Nutrição Comportamental',
    },
    {
      title: 'Dr.',
      name: 'Felipe Cardoso',
      city: 'Curitiba - PR',
      testimonial:
        'Saí do carnê-leão e a diferença no fim do mês é enorme. Diagnóstico foi gratuito mesmo e o atendimento pelo WhatsApp é muito rápido.',
      specialty: 'Nutrição Esportiva',
    },
  ],

  faqs: [
    {
      question: 'Vale a pena abrir CNPJ ou continuar como autônomo no carnê-leão?',
      answer:
        'Depende do seu faturamento. Como autônomo, o imposto no carnê-leão pode chegar a 27,5%. Com CNPJ e um bom planejamento tributário, nutricionistas costumam pagar entre 6% e 16%. Fazemos esse comparativo gratuitamente para você decidir com segurança.',
    },
    {
      question: 'Atendo online. Muda algo nos impostos ou nas notas fiscais?',
      answer:
        'O atendimento online não muda o imposto, mas exige atenção na emissão das notas fiscais, que seguem as regras do município da sua empresa. Configuramos tudo para você emitir notas corretamente para pacientes de qualquer lugar do Brasil.',
    },
    {
      question: 'Posso vender cursos, e-books e mentorias no mesmo CNPJ?',
      answer:
        'Sim! Basta incluir os CNAEs secundários corretos no seu CNPJ. Cada tipo de receita (consulta, curso, mentoria) tem a sua tributação, e nós organizamos tudo para você não pagar imposto a mais em nenhuma delas.',
    },
    ...buildBaseFaqs('nutricionistas'),
  ],

  ctaSubtitle:
    'Chega de contabilidade genérica! Fale agora com especialistas que entendem a rotina da nutrição — e descubra quanto você pode economizar.',
};
