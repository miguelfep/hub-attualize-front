// ----------------------------------------------------------------------
// Dados da landing "Contabilidade para Salão de Beleza".
// Sem 'use client': importado também pelo page.jsx (server) para o JSON-LD.
// ----------------------------------------------------------------------

import {
  SITE_URL,
  whatsappLink,
  PASSOS_BELEZA,
  SERVICOS_BELEZA,
  ESPECIALIDADES_BASE,
} from './dados-compartilhados';

// ----------------------------------------------------------------------

const PAGINA_URL = `${SITE_URL}/contabilidade-para-salao-de-beleza`;

export const SALAO_DE_BELEZA = {
  slug: 'contabilidade-para-salao-de-beleza',
  nome: 'Salões de Beleza',

  // Paleta — violeta elegante, alinhada ao ParceiroID. Contraste AA sobre papel e branco.
  cores: {
    destaque: '#6D28D9',
    destaqueEscuro: '#54209F',
    suave: '#F1EAFC',
    tinta: '#1F1233',
    grafite: '#5A4A6E',
    papel: '#FAF8FD',
    verde: '#1B7F4B',
  },

  paginaUrl: PAGINA_URL,
  whatsappMsgPadrao:
    'Olá! Tenho um salão de beleza e cheguei pela página de Contabilidade para Salão de Beleza. Quero falar com um especialista.',

  seo: {
    titulo: 'Contabilidade para Salão de Beleza | Lei do Salão Parceiro | Attualize',
    descricao:
      'Contabilidade digital especializada em salões de beleza: Lei do Salão Parceiro, sistema de gestão de parceiros com emissão de notas, contratos de parceria e impostos em dia. Fale com um especialista.',
    keywords: [
      'contabilidade para salão de beleza',
      'contador para salão de beleza',
      'lei do salão parceiro',
      'contrato de parceria salão de beleza',
      'abrir cnpj salão de beleza',
      'cabeleireira pode ser mei',
      'sistema para salão parceiro',
    ],
  },

  hero: {
    overline: 'Attualize Contábil · Beleza e Estética',
    titulo: 'Contabilidade para Salão de Beleza',
    subtitulo:
      'Pague imposto só sobre a sua parte com a Lei do Salão Parceiro e acompanhe cabeleireiras, manicures e demais parceiros em um sistema de gestão completo — contrato, repasses e emissão de notas, tudo digital.',
    fotoPrincipal: '/assets/images/beleza/salao-interior.webp',
    fotoSecundaria: '/assets/images/beleza/salao-detalhe.webp',
    fotoAlt: 'Interior de um salão de beleza com cadeiras e espelhos',
  },

  // Simulação da cota-parte na seção Lei do Salão Parceiro
  parceiro: {
    intro:
      'A Lei 13.352/2016 regulariza a parceria entre o salão e os profissionais que atendem nele — cabeleireiros, manicures, esteticistas, depiladores e maquiadores. Com o contrato certo, o salão paga imposto apenas sobre a sua cota-parte — o repasse ao profissional parceiro sai legalmente da base de cálculo.',
    profissoesTexto:
      'cabeleireiros, manicures, pedicures, esteticistas, depiladores e maquiadores',
    exemploServico: 'Corte + escova',
    exemploValor: 'R$ 150,00',
    exemploCotaParceiro: 'R$ 75,00',
    exemploBase: 'R$ 75,00',
  },

  tributacao: {
    titulo: 'Impostos do salão: MEI, Simples e a hora certa de crescer',
    blocos: [
      {
        titulo: 'Cabeleireira e manicure podem ser MEI',
        texto:
          'As atividades de cabeleireiro, manicure, pedicure, depilação e maquiagem estão na lista do MEI — com imposto fixo mensal e limite de faturamento anual. É o formato mais comum para o profissional parceiro que atende dentro do salão.',
      },
      {
        titulo: 'Salão no Simples Nacional',
        texto:
          'Quando o negócio cresce (equipe, mais cadeiras, faturamento acima do teto do MEI), o salão vira ME no Simples Nacional. Os serviços de beleza são tributados pelo Anexo III, com alíquotas a partir de 6% — sem depender de Fator R.',
      },
      {
        titulo: 'Lei do Salão Parceiro na prática',
        texto:
          'Com os contratos de parceria implantados, a receita repassada aos profissionais parceiros não entra na receita bruta do salão. Menos base de cálculo significa menos imposto — e, muitas vezes, uma faixa menor do Simples.',
      },
    ],
  },

  faq: [
    {
      pergunta: 'O que é a Lei do Salão Parceiro?',
      resposta:
        'É a Lei 13.352/2016, que criou o contrato de parceria entre o salão de beleza (salão-parceiro) e os profissionais que atendem nele (profissional-parceiro): cabeleireiro, barbeiro, esteticista, manicure, pedicure, depilador e maquiador. Com o contrato de parceria, o valor repassado ao profissional não integra a receita bruta do salão — você paga imposto apenas sobre a sua cota-parte.',
    },
    {
      pergunta: 'Cabeleireira e manicure podem ser MEI?',
      resposta:
        'Sim. Cabeleireiro, manicure, pedicure, depilador e maquiador estão na lista de ocupações permitidas ao MEI, com imposto fixo mensal e limite de faturamento anual. É o formato mais usado pelos profissionais parceiros. Quando o faturamento cresce acima do teto, ajudamos na transição de MEI para ME.',
    },
    {
      pergunta: 'Como funciona o contrato de parceria com os profissionais?',
      resposta:
        'O contrato precisa seguir o modelo da Lei 13.352/2016: definir a cota-parte de cada um, garantir a autonomia do profissional e, conforme o caso, ser homologado no sindicato da categoria. O profissional parceiro deve estar formalizado (MEI ou ME). Nós preparamos os contratos, orientamos a homologação e mantemos tudo documentado.',
    },
    {
      pergunta: 'Posso colocar toda a equipe como parceira?',
      resposta:
        'Não. A parceria vale para quem executa os serviços de beleza (cabeleireiro, esteticista, manicure, pedicure, depilador, maquiador e barbeiro). Recepcionista, gerente e equipe de apoio devem ser contratados como CLT. Estruturar isso errado é o que gera passivo trabalhista — e é exatamente o que evitamos.',
    },
    {
      pergunta: 'Quanto imposto um salão de beleza paga?',
      resposta:
        'Como MEI, o dono paga um valor fixo mensal. Como ME no Simples Nacional, os serviços de beleza caem no Anexo III, com alíquotas a partir de 6% sobre o faturamento — e, com a Lei do Salão Parceiro implantada, a base de cálculo considera apenas a cota-parte do salão, não o valor repassado aos parceiros.',
    },
    {
      pergunta: 'Como funciona o sistema de gestão de parceiros?',
      resposta:
        'Você recebe acesso à nossa plataforma de gestão de parceria: o gestor acompanha os serviços e repasses de cada profissional parceiro em um painel, a cota-parte é calculada automaticamente, as notas fiscais são emitidas de forma integrada e os contratos de parceria ficam organizados digitalmente. Sem planilha e sem risco de errar a base de imposto.',
    },
    {
      pergunta: 'Quanto custa abrir o CNPJ do salão?',
      resposta:
        'Depende do formato: o MEI é gratuito e imediato; a ME tem taxas de Junta Comercial e alvará que variam por estado e município. No diagnóstico gratuito apresentamos o custo total do seu caso — e em alguns planos a abertura da empresa sai de graça.',
    },
    {
      pergunta: 'Já tenho contador. Consigo migrar sem dor de cabeça?',
      resposta:
        'Sim. A troca de contabilidade é um direito seu e acontece sem interromper as obrigações da empresa: solicitamos documentos ao contador anterior, conferimos as declarações e assumimos as rotinas a partir do mês combinado. Você só formaliza o aviso — o resto é com a gente.',
    },
  ],

  leadForm: {
    origem: 'site-salao-de-beleza',
    segmentApi: 'beleza',
    tituloSecao: 'Receba um diagnóstico gratuito do seu salão',
    perfis: [
      'Dono(a) de salão de beleza',
      'Cabeleireiro(a) autônomo(a)',
      'Profissional parceiro(a) (atendo em salão)',
      'Vou abrir meu salão agora',
      'Outro negócio de beleza',
    ],
  },

  especialidadesInternas: [
    { titulo: 'Planejador de Empresa (grátis)', href: '/planejador-de-empresa?segmento=salao' },
    { titulo: 'Contabilidade para Barbearias', href: '/contabilidade-para-barbearias' },
    ...ESPECIALIDADES_BASE,
  ],

  // Shape esperado pelas seções compartilhadas de src/sections/saude/segment
  segment: {
    slug: 'contabilidade-para-salao-de-beleza',
    name: 'Donos de salão',
    accent: '#6D28D9',
    whatsappLink: whatsappLink(
      'Olá! Tenho um salão de beleza e cheguei pela página de Contabilidade para Salão de Beleza. Quero falar com um especialista.'
    ),
    steps: PASSOS_BELEZA,
    services: SERVICOS_BELEZA,
    servicesIntro:
      'Tudo o que o seu salão precisa em um só lugar: contabilidade completa, Lei do Salão Parceiro e sistema de gestão de parceiros.',
    testimonialsSubject: 'salões e negócios de beleza',
    testimonials: [
      {
        title: '',
        name: 'Patrícia Ramos',
        city: 'Curitiba - PR',
        testimonial:
          'A Attualize implantou a Lei do Salão Parceiro no meu salão e organizou os contratos das minhas oito parceiras. O imposto caiu e a folha de dor de cabeça também.',
        specialty: 'Dona de salão de beleza',
      },
      {
        title: '',
        name: 'Vanessa Lima',
        city: 'Balneário Camboriú - SC',
        testimonial:
          'O painel de gestão me mostra quanto cada parceira gerou no mês e os repasses saem calculados. As notas fiscais são emitidas na hora, sem eu precisar correr atrás.',
        specialty: 'Salão com 12 profissionais',
      },
      {
        title: '',
        name: 'Juliana Castro',
        city: 'São Paulo - SP',
        testimonial:
          'Migrei de contador sem parar o salão um dia sequer. Atendimento humano pelo WhatsApp e orientação de verdade sobre parceria e CLT.',
        specialty: 'Cabeleireira e gestora',
      },
    ],
  },
};
