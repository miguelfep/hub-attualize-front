import { buildWhatsappLink } from '../segment-defaults';

// ----------------------------------------------------------------------

export const PROFISSIONAL_PARCEIRO = {
  slug: 'contabilidade-para-profissional-parceiro',
  name: 'Profissionais Parceiros',
  accent: '#E91E63',
  // Cabeleireiros, barbeiros, manicures e esteticistas têm ocupações permitidas no MEI
  allowMei: true,
  whatsappLink: buildWhatsappLink('PROFISSIONAL PARCEIRO'),

  seo: {
    title: 'Contabilidade para Profissional Parceiro - Attualize Contábil',
    description:
      'Contabilidade especializada para profissionais parceiros de salões e clínicas (Lei do Salão Parceiro): cabeleireiros, barbeiros, manicures e esteticistas. MEI ou ME, emissão de notas e formalização sem burocracia.',
    keywords: [
      'contabilidade profissional parceiro',
      'lei do salão parceiro',
      'cnpj para cabeleireiro',
      'mei cabeleireiro',
      'contrato de parceria salão de beleza',
      'cnpj para barbeiro',
      'cnpj para manicure',
    ],
    serviceDescription:
      'Serviço de contabilidade especializada para profissionais parceiros (Lei do Salão Parceiro): formalização MEI ou ME, contrato de parceria, emissão de notas fiscais e impostos em dia.',
  },

  hero: {
    chipIcon: 'solar:users-group-rounded-bold-duotone',
    chip: 'Contabilidade para Profissional Parceiro',
    titlePre: 'Contabilidade Especializada para',
    titleHighlight: 'Profissionais Parceiros',
    subtitle: 'Formalize sua Parceria, Pague Menos Impostos e Trabalhe Tranquilo',
    description:
      'Cabeleireiro, barbeiro, manicure ou esteticista atuando como parceiro de salão ou clínica? A Lei do Salão Parceiro só protege você (e o salão) se a formalização estiver correta. Cuidamos de tudo: CNPJ, contrato de parceria e notas fiscais.',
  },

  stats: [
    {
      icon: 'solar:calendar-bold-duotone',
      value: '+10 anos',
      label: 'de experiência com beleza',
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
        'Você fala com um especialista pelo WhatsApp e analisamos sua situação atual: enquadramento, parceria com o salão e oportunidades de economia.',
    },
    {
      icon: 'solar:document-add-bold-duotone',
      title: 'Proposta sob medida',
      description:
        'Apresentamos o plano ideal para você — formalização MEI/ME ou migração de contador, sem burocracia e sem interromper seus atendimentos.',
    },
    {
      icon: 'solar:check-circle-bold-duotone',
      title: 'Cuidamos de tudo',
      description:
        'Impostos, contrato de parceria, obrigações e notas fiscais: nossa equipe assume a parte chata para você focar nos seus clientes.',
    },
    {
      icon: 'solar:graph-up-bold-duotone',
      title: 'Acompanhamento contínuo',
      description:
        'Monitoramos seu enquadramento e seus repasses todos os meses, com orientação para o crescimento do seu negócio.',
    },
  ],

  why: {
    intro: [
      'A Attualize é especialista no setor de beleza e na Lei do Salão Parceiro.',
      'Na prática, isso significa que entendemos a fundo a sua rotina: comissões e repasses, contrato de parceria homologado, enquadramento como MEI ou ME e a emissão correta das notas para o salão-parceiro.',
    ],
    cards: [
      {
        icon: 'solar:hand-heart-bold-duotone',
        title: 'Atendimento Humanizado',
        description:
          'Chega de tickets infinitos e robôs que não entendem o que você quer. Aqui na Attualize valorizamos a comunicação entre pessoas.',
      },
      {
        icon: 'solar:medal-ribbons-star-bold-duotone',
        title: 'Especialização em Beleza',
        description:
          'Foco total nas particularidades do setor: Lei do Salão Parceiro, contrato de parceria, CNAE correto e vigilância sanitária.',
      },
      {
        icon: 'solar:dollar-bold-duotone',
        title: 'Otimização Tributária',
        description:
          'Enquadramento certo (MEI ou ME) e tributação apenas sobre a sua cota-parte, para garantir o mínimo de impostos dentro da lei.',
      },
      {
        icon: 'solar:calendar-bold-duotone',
        title: '+10 Anos de Experiência',
        description:
          'Uma década de conhecimento aplicado a salões, clínicas e profissionais parceiros de todo o Brasil.',
      },
      {
        icon: 'solar:chat-round-dots-bold-duotone',
        title: 'Agilidade no WhatsApp',
        description:
          'Sabemos que sua agenda é cheia. Atendemos pelo WhatsApp com agilidade, sem você precisar parar os atendimentos.',
      },
      {
        icon: 'solar:monitor-bold-duotone',
        title: '100% Digital',
        description: 'Atendimento em todo o Brasil, sem papelada e sem você precisar sair do salão.',
      },
    ],
  },

  tax: {
    intro:
      'A Lei do Salão Parceiro (Lei 13.352/2016) traz vantagens reais — mas só quando a formalização está correta. Conheça as três estratégias que analisamos no seu diagnóstico gratuito:',
    cards: [
      {
        icon: 'solar:document-text-bold-duotone',
        badge: 'Lei 13.352/2016',
        title: 'Lei do Salão Parceiro',
        description:
          'Com o contrato de parceria homologado, o salão repassa sua cota-parte sem vínculo empregatício e cada um tributa apenas a sua parte da receita.',
        bullets: [
          'Contrato de parceria redigido e homologado corretamente',
          'Você tributa só a sua cota-parte, não o valor cheio',
          'Proteção contra passivos trabalhistas para os dois lados',
        ],
      },
      {
        icon: 'solar:user-id-bold-duotone',
        badge: 'Formalização',
        title: 'MEI ou ME: o enquadramento certo',
        description:
          'Cabeleireiros, barbeiros, manicures e esteticistas podem ser MEI (custo fixo baixo). Quando o faturamento cresce, migramos para ME sem dor de cabeça.',
        bullets: [
          'MEI: custo fixo mensal reduzido',
          'Migração de MEI para ME quando o negócio cresce',
          'CNAE correto para a sua atividade',
        ],
      },
      {
        icon: 'solar:calculator-bold-duotone',
        badge: 'Simples Nacional',
        title: 'Acima do MEI, ainda é barato',
        description:
          'Se você fatura acima do limite do MEI, o Simples Nacional com o anexo correto mantém os impostos baixos — muito menos que os 27,5% do carnê-leão.',
        bullets: [
          'Enquadramento no anexo correto da sua atividade',
          'Comparativo MEI x ME x carnê-leão gratuito',
          'Notas fiscais para o salão e para clientes diretos',
        ],
      },
    ],
  },

  servicesIntro:
    'Da abertura do CNPJ ao contrato de parceria: cuidamos de toda a rotina contábil e fiscal para você focar nos seus clientes.',
  services: [
    'Abertura de CNPJ (MEI ou ME) e alterações',
    'Contrato de parceria (Lei do Salão Parceiro)',
    'Troca de contador sem dor de cabeça',
    'Migração de MEI para ME',
    'Apuração de impostos e obrigações fiscais',
    'Orientação para emissão de notas fiscais',
    'Imposto de Renda (IRPF)',
    'Orientação sobre alvarás e vigilância sanitária',
    'Certificado digital',
    'Suporte ágil pelo WhatsApp',
  ],

  testimonialsSubject: '200 profissionais e salões',
  testimonials: [
    {
      name: 'Aline Castro',
      city: 'Curitiba - PR',
      testimonial:
        'Trabalho como parceira em dois salões e a Attualize formalizou tudo: meu MEI, os contratos de parceria e as notas. Hoje recebo certinho e sem medo de problema trabalhista.',
      specialty: 'Cabeleireira Parceira',
    },
    {
      name: 'Bruno Cardoso',
      city: 'São Paulo - SP',
      testimonial:
        'Como barbeiro parceiro, eu não sabia que tributava só a minha parte da comissão. Com o enquadramento certo, meu imposto caiu muito. Atendimento rápido pelo WhatsApp.',
      specialty: 'Barbeiro Parceiro',
    },
    {
      name: 'Patrícia Nunes',
      city: 'Belo Horizonte - MG',
      testimonial:
        'Cresci, passei do limite do MEI e eles fizeram a migração para ME sem eu parar de atender um dia sequer. Recomendo para toda profissional parceira.',
      specialty: 'Manicure e Nail Designer',
    },
  ],

  faqs: [
    {
      question: 'O que é a Lei do Salão Parceiro e por que preciso me formalizar?',
      answer:
        'A Lei 13.352/2016 permite que salões e profissionais atuem como parceiros, sem vínculo empregatício: o salão repassa sua cota-parte e cada um paga imposto só sobre a sua parte. Mas isso exige profissional formalizado (MEI ou ME) e contrato de parceria homologado — sem isso, o salão corre risco trabalhista e você pode pagar imposto a mais.',
    },
    {
      question: 'Posso ser MEI como cabeleireiro, barbeiro, manicure ou esteticista?',
      answer:
        'Sim! Essas ocupações são permitidas no MEI, com custo fixo mensal baixo. Analisamos seu caso gratuitamente e, se o MEI for o melhor enquadramento, fazemos a formalização e o contrato de parceria.',
    },
    {
      question: 'Trabalho em mais de um salão. Como fica a minha situação?',
      answer:
        'Sem problema: você pode manter contratos de parceria com vários salões usando o mesmo CNPJ. Orientamos a emissão das notas e o controle dos repasses de cada parceria.',
    },
    {
      question: 'Vocês atendem por WhatsApp?',
      answer:
        'Sim! O WhatsApp é o nosso principal canal de atendimento. Nada de tickets infinitos ou robôs: aqui você fala com contadores de verdade, com agilidade.',
    },
    {
      question: 'Sou de outra cidade ou estado, vocês podem me atender?',
      answer:
        'Sim. Atendemos profissionais parceiros em todo o Brasil de forma 100% digital. Você resolve tudo sem sair do salão.',
    },
    {
      question: 'No contrato, há fidelidade ou multa para cancelar?',
      answer:
        'Não há fidelidade nem multa de cancelamento nos planos mensais. A única condição é nos avisar com 30 dias de antecedência. Acreditamos que você fica pelo atendimento, não por contrato.',
    },
  ],

  ctaSubtitle:
    'Chega de contabilidade genérica! Fale agora com especialistas na Lei do Salão Parceiro — e formalize sua parceria do jeito certo.',
};
