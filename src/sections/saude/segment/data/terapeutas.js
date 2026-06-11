import {
  buildBaseFaqs,
  buildWhyCards,
  buildBaseServices,
  buildWhatsappLink,
} from '../segment-defaults';

// ----------------------------------------------------------------------

export const TERAPEUTAS = {
  slug: 'contabilidade-para-terapeutas',
  name: 'Terapeutas',
  accent: '#FF8C42',
  // Algumas atividades terapêuticas (não regulamentadas) podem ser MEI
  allowMei: true,
  whatsappLink: buildWhatsappLink('TERAPEUTAS'),

  seo: {
    title: 'Contabilidade para Terapeutas - Attualize Contábil',
    description:
      'Contabilidade especializada para terapeutas e profissionais do bem-estar: acupuntura, massoterapia, terapias integrativas e holísticas. MEI ou ME, abertura de CNPJ e atendimento humanizado 100% digital em todo o Brasil.',
    keywords: [
      'contabilidade para terapeutas',
      'contador para terapeuta',
      'cnpj para terapeuta',
      'mei terapeuta',
      'contabilidade terapias integrativas',
      'contabilidade massoterapia',
      'abertura cnpj terapeuta holístico',
    ],
    serviceDescription:
      'Serviço de contabilidade especializada para terapeutas e profissionais do bem-estar: enquadramento MEI ou ME, abertura de CNPJ, emissão de notas fiscais, impostos e obrigações fiscais.',
  },

  hero: {
    chipIcon: 'solar:hand-heart-bold-duotone',
    chip: 'Contabilidade para Terapeutas e Bem-Estar',
    titlePre: 'Contabilidade Especializada para',
    titleHighlight: 'Terapeutas',
    subtitle: 'Menos Impostos, Menos Burocracia e Mais Tempo para os Seus Atendimentos',
    description:
      'Acupuntura, massoterapia, terapias integrativas ou holísticas? Entendemos o seu trabalho. Do enquadramento certo (MEI ou ME) à emissão de notas, cuidamos da sua contabilidade para você se formalizar pagando o mínimo de impostos.',
  },

  why: {
    intro: [
      'A Attualize é especialista em contabilidade para terapeutas e profissionais do bem-estar.',
      'Na prática, isso significa que entendemos a fundo a sua rotina: atendimentos em espaço próprio ou compartilhado, pacotes de sessões, parcerias com clínicas e o enquadramento correto para a sua atividade — que faz toda a diferença no imposto.',
    ],
    cards: buildWhyCards({
      especializacao:
        'Foco total nas particularidades de terapeutas: enquadramento MEI ou ME, CNAE correto, espaços compartilhados e parcerias com clínicas.',
      otimizacao:
        'Escolha do regime certo para a sua atividade e faturamento, para garantir o mínimo de impostos dentro da lei.',
    }),
  },

  tax: {
    intro:
      'Para terapeutas, o segredo está no enquadramento correto. Conheça as três principais estratégias que analisamos no seu diagnóstico gratuito:',
    cards: [
      {
        icon: 'solar:user-id-bold-duotone',
        badge: 'Formalização',
        title: 'MEI ou ME: o enquadramento certo',
        description:
          'Algumas atividades terapêuticas podem ser MEI (custo fixo baixo por mês); outras exigem ME. O enquadramento errado pode custar caro ou até travar a emissão de notas para clínicas e empresas.',
        bullets: [
          'Análise da sua atividade e CNAE permitido',
          'MEI: custo fixo mensal reduzido',
          'Migração de MEI para ME quando o negócio cresce',
        ],
      },
      {
        icon: 'solar:calculator-bold-duotone',
        badge: 'Simples Nacional',
        title: 'Simples com o menor anexo',
        description:
          'Para quem fatura acima do limite do MEI, o Simples Nacional com o CNAE e o anexo corretos (e o Fator R, quando aplicável) garante alíquotas muito menores que o carnê-leão.',
        bullets: [
          'Enquadramento no anexo correto da sua atividade',
          'Monitoramento do Fator R quando aplicável',
          'Alíquotas a partir de 6% sobre o faturamento',
        ],
      },
      {
        icon: 'solar:case-minimalistic-bold-duotone',
        badge: 'Autônomo → PJ',
        title: 'Do Carnê-Leão ao CNPJ',
        description:
          'Como pessoa física, o imposto sobre os atendimentos pode chegar a 27,5% no carnê-leão. Formalizado, você paga menos, emite nota para clínicas e empresas e ainda consegue plano de saúde e crédito PJ.',
        bullets: [
          'Comparativo PF x PJ gratuito antes de decidir',
          'Abertura de CNPJ sem burocracia',
          'Notas fiscais para clínicas, empresas e pacotes',
        ],
      },
    ],
  },

  services: buildBaseServices(null),

  testimonials: [
    {
      name: 'Juliana Prado',
      city: 'Curitiba - PR',
      testimonial:
        'Como acupunturista, eu não sabia se podia ser MEI. A Attualize analisou minha atividade, me formalizou certinho e hoje emito nota para duas clínicas parceiras.',
      specialty: 'Acupuntura',
    },
    {
      name: 'Ricardo Antunes',
      city: 'São Paulo - SP',
      testimonial:
        'Meu estúdio de massoterapia cresceu e migrei de MEI para ME com eles. A transição foi tranquila e o imposto continua baixo com o enquadramento certo.',
      specialty: 'Massoterapia',
    },
    {
      name: 'Fernanda Saldanha',
      city: 'Belo Horizonte - MG',
      testimonial:
        'Trabalho com terapias integrativas e sempre tive medo da parte burocrática. Eles cuidam de tudo pelo WhatsApp e eu só me preocupo com os atendimentos.',
      specialty: 'Terapias Integrativas',
    },
  ],

  faqs: [
    {
      question: 'Posso ser MEI como terapeuta?',
      answer:
        'Depende da sua atividade. Algumas ocupações do bem-estar são permitidas no MEI, enquanto outras exigem abertura de ME. Analisamos o seu caso gratuitamente e indicamos o enquadramento mais barato e seguro para a sua atuação.',
    },
    {
      question: 'Preciso de CNPJ para atender em clínicas ou emitir nota fiscal?',
      answer:
        'Para emitir nota fiscal, sim. Muitas clínicas, empresas e planos de bem-estar só contratam terapeutas que emitem nota. Com o CNPJ certo, você acessa essas parcerias e ainda paga menos imposto do que no carnê-leão.',
    },
    {
      question: 'Minha atividade não é regulamentada por conselho. Tem problema?',
      answer:
        'Não. Atividades terapêuticas não regulamentadas podem ser exercidas legalmente com o CNAE correto. Orientamos o enquadramento adequado para você trabalhar formalizado e sem riscos.',
    },
    ...buildBaseFaqs('terapeutas'),
  ],

  ctaSubtitle:
    'Chega de contabilidade genérica! Fale agora com especialistas que entendem a rotina de terapeutas — e descubra quanto você pode economizar.',
};
