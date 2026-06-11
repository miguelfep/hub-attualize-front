import { buildWhatsappLink } from '../segment-defaults';

// ----------------------------------------------------------------------

export const PRESTADORES_SERVICOS = {
  slug: 'contabilidade-para-prestadores-de-servicos',
  name: 'Prestadores de Serviços',
  accent: '#475BE8',
  // Diversas atividades de serviços são permitidas no MEI
  allowMei: true,
  whatsappLink: buildWhatsappLink('PRESTADORES DE SERVIÇOS'),

  seo: {
    title: 'Contabilidade para Prestadores de Serviços - Attualize Contábil',
    description:
      'Contabilidade especializada para prestadores de serviços PJ: consultores, freelancers, profissionais de TI, marketing e mais. Abertura de CNPJ, Fator R, notas fiscais e atendimento humanizado 100% digital.',
    keywords: [
      'contabilidade para prestadores de serviços',
      'contador para pj',
      'cnpj prestador de serviços',
      'contabilidade para consultores',
      'contabilidade para freelancer',
      'fator r prestador de serviços',
      'abertura de empresa de serviços',
    ],
    serviceDescription:
      'Serviço de contabilidade especializada para prestadores de serviços: abertura de CNPJ, planejamento tributário com Fator R, emissão de notas fiscais, pró-labore e obrigações fiscais.',
  },

  hero: {
    chipIcon: 'solar:case-minimalistic-bold-duotone',
    chip: 'Contabilidade para Prestadores de Serviços',
    titlePre: 'Contabilidade Especializada para',
    titleHighlight: 'Prestadores de Serviços',
    subtitle: 'Menos Impostos, Menos Burocracia e Mais Tempo para os Seus Clientes',
    description:
      'Consultor, freelancer, profissional de TI, marketing ou qualquer serviço PJ? Cuidamos do seu CNPJ, das suas notas e do seu planejamento tributário para você pagar o mínimo de impostos dentro da lei — do contrato à nota fiscal.',
  },

  stats: [
    {
      icon: 'solar:calendar-bold-duotone',
      value: '+10 anos',
      label: 'de experiência com serviços',
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
  ],

  steps: [
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
        'Impostos, pró-labore, obrigações e notas fiscais: nossa equipe assume a parte chata para você focar nos seus clientes.',
    },
    {
      icon: 'solar:graph-up-bold-duotone',
      title: 'Acompanhamento contínuo',
      description:
        'Monitoramos seu Fator R e seu enquadramento todos os meses, com relatórios claros e orientação para o crescimento do negócio.',
    },
  ],

  why: {
    intro: [
      'A Attualize é especialista em contabilidade para prestadores de serviços.',
      'Na prática, isso significa que entendemos a fundo a sua rotina: contratos PJ, notas fiscais para empresas, pró-labore, Fator R e o enquadramento que faz seu imposto ser o menor possível.',
    ],
    cards: [
      {
        icon: 'solar:hand-heart-bold-duotone',
        title: 'Atendimento Humanizado',
        description:
          'Chega de tickets infinitos e robôs que não entendem o que você quer. Aqui na Attualize valorizamos a comunicação entre pessoas.',
      },
      {
        icon: 'solar:case-minimalistic-bold-duotone',
        title: 'Especialização em Serviços',
        description:
          'Foco total nas particularidades de quem presta serviço: CNAE correto, contratos PJ, retenções de impostos e notas para empresas.',
      },
      {
        icon: 'solar:dollar-bold-duotone',
        title: 'Otimização Tributária',
        description:
          'Análise de Fator R e comparativo de regimes para garantir o mínimo de impostos dentro da lei.',
      },
      {
        icon: 'solar:calendar-bold-duotone',
        title: '+10 Anos de Experiência',
        description: 'Uma década de conhecimento aplicado a negócios de serviços de todo o Brasil.',
      },
      {
        icon: 'solar:chat-round-dots-bold-duotone',
        title: 'Agilidade no WhatsApp',
        description:
          'Sabemos que sua rotina é corrida. Atendemos pelo WhatsApp com agilidade, sem enrolação.',
      },
      {
        icon: 'solar:monitor-bold-duotone',
        title: '100% Digital',
        description:
          'Atendimento em todo o Brasil, sem papelada e sem você precisar sair do escritório.',
      },
    ],
  },

  tax: {
    intro:
      'Quem presta serviços tem várias formas de pagar menos imposto — desde que o enquadramento esteja certo. Conheça as três estratégias que analisamos no seu diagnóstico gratuito:',
    cards: [
      {
        icon: 'solar:calculator-bold-duotone',
        badge: 'Simples Nacional',
        title: 'Fator R: a partir de 6%',
        description:
          'Quando a folha de pagamento (incluindo o pró-labore) representa 28% ou mais do faturamento, muitas atividades de serviços saem do Anexo V (15,5%) e vão para o Anexo III (6%).',
        bullets: [
          'Monitoramento mensal do Fator R',
          'Ajuste estratégico do pró-labore',
          'Alíquotas a partir de 6% sobre o faturamento',
        ],
      },
      {
        icon: 'solar:user-id-bold-duotone',
        badge: 'Formalização',
        title: 'MEI ou ME: o enquadramento certo',
        description:
          'Diversas atividades de serviços podem ser MEI (custo fixo baixo); outras exigem ME. O enquadramento errado pode custar caro ou travar contratos com empresas maiores.',
        bullets: [
          'Análise da sua atividade e CNAE permitido',
          'MEI: custo fixo mensal reduzido',
          'Migração de MEI para ME quando o negócio cresce',
        ],
      },
      {
        icon: 'solar:case-minimalistic-bold-duotone',
        badge: 'CLT → PJ',
        title: 'Contratos PJ bem estruturados',
        description:
          'Vai atender empresas como PJ? Com o CNPJ e o contrato certos, você emite notas, aproveita retenções corretamente e recebe mais líquido do que como CLT ou autônomo.',
        bullets: [
          'Comparativo CLT x PJ x carnê-leão gratuito',
          'Abertura de CNPJ sem burocracia',
          'Orientação sobre retenções (ISS, IR, INSS) nas notas',
        ],
      },
    ],
  },

  servicesIntro:
    'Da abertura do CNPJ ao planejamento tributário avançado: cuidamos de toda a rotina contábil, fiscal e trabalhista do seu negócio.',
  services: [
    'Abertura de CNPJ e alterações contratuais',
    'Troca de contador sem dor de cabeça',
    'Planejamento tributário e monitoramento do Fator R',
    'Migração de MEI para ME',
    'Apuração de impostos e obrigações fiscais',
    'Folha de pagamento e pró-labore',
    'Orientação para emissão de notas fiscais e retenções',
    'Imposto de Renda dos sócios (IRPF)',
    'Relatórios gerenciais e indicadores do negócio',
    'Certificado digital',
    'Suporte ágil pelo WhatsApp',
  ],

  testimonialsSubject: '200 profissionais e empresas',
  testimonials: [
    {
      name: 'Rodrigo Siqueira',
      city: 'São Paulo - SP',
      testimonial:
        'Saí do CLT para atender como PJ e a Attualize estruturou tudo: CNPJ, contrato e pró-labore com Fator R. Recebo mais líquido e sem sustos com impostos.',
      specialty: 'Desenvolvedor de Software',
    },
    {
      name: 'Marina Lopes',
      city: 'Curitiba - PR',
      testimonial:
        'Minha agência de marketing cresceu e migramos de MEI para ME com eles. A transição foi tranquila e os relatórios me ajudam a precificar melhor.',
      specialty: 'Consultora de Marketing',
    },
    {
      name: 'Cláudio Ferraz',
      city: 'Florianópolis - SC',
      testimonial:
        'Presto consultoria para três empresas e cada nota tem retenção diferente. Eles organizaram tudo e hoje sei exatamente quanto pago de imposto em cada contrato.',
      specialty: 'Consultor Financeiro',
    },
  ],

  faqs: [
    {
      question: 'Vale a pena abrir CNPJ ou continuar como autônomo no carnê-leão?',
      answer:
        'Depende do seu faturamento. Como autônomo, o imposto no carnê-leão pode chegar a 27,5%. Com CNPJ e um bom planejamento tributário, prestadores de serviços costumam pagar entre 6% e 16%. Fazemos esse comparativo gratuitamente para você decidir com segurança.',
    },
    {
      question: 'Vou trabalhar como PJ para uma empresa. O que preciso saber?',
      answer:
        'Você precisa de CNPJ com o CNAE correto, contrato de prestação de serviços bem estruturado e emissão de notas com as retenções certas (ISS, IR, INSS quando aplicável). Cuidamos de tudo isso e ainda calculamos quanto você recebe líquido na proposta.',
    },
    {
      question: 'Posso ser MEI como prestador de serviços?',
      answer:
        'Depende da atividade. Muitas ocupações de serviços são permitidas no MEI (até R$ 81 mil/ano), mas atividades intelectuais e regulamentadas exigem ME. Analisamos seu caso gratuitamente e indicamos o enquadramento mais barato e seguro.',
    },
    {
      question: 'Vocês atendem por WhatsApp?',
      answer:
        'Sim! O WhatsApp é o nosso principal canal de atendimento. Nada de tickets infinitos ou robôs: aqui você fala com contadores de verdade, com agilidade.',
    },
    {
      question: 'Sou de outra cidade ou estado, vocês podem me atender?',
      answer:
        'Sim. Atendemos prestadores de serviços em todo o Brasil de forma 100% digital. Nossas ferramentas eliminam qualquer barreira de distância.',
    },
    {
      question: 'No contrato, há fidelidade ou multa para cancelar?',
      answer:
        'Não há fidelidade nem multa de cancelamento nos planos mensais. A única condição é nos avisar com 30 dias de antecedência. Acreditamos que você fica pelo atendimento, não por contrato.',
    },
  ],

  ctaSubtitle:
    'Chega de contabilidade genérica! Fale agora com especialistas em prestadores de serviços — e descubra quanto você pode economizar.',
};
