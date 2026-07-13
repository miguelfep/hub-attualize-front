// ----------------------------------------------------------------------
// Dados da landing "Contabilidade para Barbearias".
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

const PAGINA_URL = `${SITE_URL}/contabilidade-para-barbearias`;

export const BARBEARIAS = {
  slug: 'contabilidade-para-barbearias',
  nome: 'Barbearias',

  // Paleta — âmbar/madeira, clima de barbearia. Contraste AA sobre papel e branco.
  cores: {
    destaque: '#9A4F12',
    destaqueEscuro: '#753C0D',
    suave: '#F9EDDF',
    tinta: '#26160A',
    grafite: '#5F4B3A',
    papel: '#FAF6F0',
    verde: '#1B7F4B',
  },

  paginaUrl: PAGINA_URL,
  whatsappMsgPadrao:
    'Olá! Tenho uma barbearia e cheguei pela página de Contabilidade para Barbearias. Quero falar com um especialista.',

  seo: {
    titulo: 'Contabilidade para Barbearias | Lei do Salão Parceiro | Attualize',
    descricao:
      'Contabilidade digital especializada em barbearias: Lei do Salão Parceiro, sistema de gestão de parceiros com emissão de notas, contratos de parceria e impostos em dia. Fale com um especialista.',
    keywords: [
      'contabilidade para barbearias',
      'contador para barbearia',
      'lei do salão parceiro barbearia',
      'barbeiro parceiro cnpj',
      'abrir cnpj barbearia',
      'barbeiro pode ser mei',
      'sistema para barbearia parceiros',
    ],
  },

  hero: {
    overline: 'Attualize Contábil · Beleza e Estética',
    titulo: 'Contabilidade para Barbearias',
    subtitulo:
      'Pague imposto só sobre a sua parte com a Lei do Salão Parceiro e acompanhe seus barbeiros parceiros em um sistema de gestão completo — contrato, repasses e emissão de notas, tudo digital.',
    fotoPrincipal: '/assets/images/beleza/barbearia-interior.webp',
    fotoSecundaria: '/assets/images/beleza/barbearia-atendimento.webp',
    fotoAlt: 'Interior de uma barbearia com cadeiras e espelhos',
  },

  // Simulação da cota-parte na seção Lei do Salão Parceiro
  parceiro: {
    intro:
      'A Lei 13.352/2016 regulariza a parceria entre a barbearia e os barbeiros que atendem nela. Com o contrato certo, a barbearia paga imposto apenas sobre a sua cota-parte — o repasse ao barbeiro parceiro sai legalmente da base de cálculo.',
    profissoesTexto: 'barbeiros e demais profissionais da beleza previstos na lei',
    exemploServico: 'Corte + barba',
    exemploValor: 'R$ 90,00',
    exemploCotaParceiro: 'R$ 45,00',
    exemploBase: 'R$ 45,00',
  },

  tributacao: {
    titulo: 'Impostos da barbearia: MEI, Simples e a hora certa de crescer',
    blocos: [
      {
        titulo: 'Barbeiro pode ser MEI',
        texto:
          'Diferente de profissões regulamentadas, o barbeiro pode começar como MEI — com limite de faturamento anual e um imposto fixo mensal. É o formato mais comum para o barbeiro parceiro que atende dentro de uma barbearia.',
      },
      {
        titulo: 'Barbearia no Simples Nacional',
        texto:
          'Quando o negócio cresce (equipe, mais cadeiras, faturamento acima do teto do MEI), a barbearia vira ME no Simples Nacional. Os serviços de barbearia são tributados pelo Anexo III, com alíquotas a partir de 6% — sem depender de Fator R.',
      },
      {
        titulo: 'Lei do Salão Parceiro na prática',
        texto:
          'Com os contratos de parceria implantados, a receita repassada aos barbeiros parceiros não entra na receita bruta da barbearia. Menos base de cálculo significa menos imposto — e, muitas vezes, uma faixa menor do Simples.',
      },
    ],
  },

  faq: [
    {
      pergunta: 'O que é a Lei do Salão Parceiro?',
      resposta:
        'É a Lei 13.352/2016, que criou o contrato de parceria entre salões e barbearias (salão-parceiro) e os profissionais que atendem neles (profissional-parceiro), como barbeiros e cabeleireiros. Com o contrato de parceria, o valor repassado ao profissional não integra a receita bruta do estabelecimento — a barbearia paga imposto apenas sobre a sua cota-parte.',
    },
    {
      pergunta: 'Barbeiro pode ser MEI?',
      resposta:
        'Sim. A atividade de barbeiro está na lista de ocupações permitidas ao MEI, com imposto fixo mensal e limite de faturamento anual. É o formato mais usado pelo barbeiro parceiro. Quando o faturamento cresce acima do teto, ajudamos na transição de MEI para ME sem susto.',
    },
    {
      pergunta: 'Como funciona o contrato de parceria com os barbeiros?',
      resposta:
        'O contrato precisa seguir o modelo da Lei 13.352/2016: definir a cota-parte de cada um, garantir a autonomia do profissional e, conforme o caso, ser homologado no sindicato da categoria. O barbeiro parceiro deve estar formalizado (MEI ou ME). Nós preparamos os contratos, orientamos a homologação e mantemos tudo documentado.',
    },
    {
      pergunta: 'Posso colocar toda a equipe como parceira?',
      resposta:
        'Não. A parceria vale para os profissionais que executam os serviços de beleza (barbeiro, cabeleireiro, esteticista, manicure, pedicure, depilador e maquiador). Recepcionista, gerente e equipe de apoio devem ser contratados como CLT. Estruturar isso errado é o que gera passivo trabalhista — e é exatamente o que evitamos.',
    },
    {
      pergunta: 'Quanto imposto uma barbearia paga?',
      resposta:
        'Como MEI, o dono paga um valor fixo mensal. Como ME no Simples Nacional, os serviços de barbearia caem no Anexo III, com alíquotas a partir de 6% sobre o faturamento — e, com a Lei do Salão Parceiro implantada, a base de cálculo considera apenas a cota-parte da barbearia, não o valor repassado aos parceiros.',
    },
    {
      pergunta: 'Como funciona o sistema de gestão de parceiros?',
      resposta:
        'Você recebe acesso à nossa plataforma de gestão de parceria: o gestor acompanha os serviços e repasses de cada barbeiro parceiro em um painel, a cota-parte é calculada automaticamente, as notas fiscais são emitidas de forma integrada e os contratos de parceria ficam organizados digitalmente. Sem planilha e sem risco de errar a base de imposto.',
    },
    {
      pergunta: 'Quanto custa abrir o CNPJ da barbearia?',
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
    origem: 'site-barbearias',
    segmentApi: 'beleza',
    tituloSecao: 'Receba um diagnóstico gratuito da sua barbearia',
    perfis: [
      'Dono(a) de barbearia',
      'Barbeiro(a) autônomo(a)',
      'Barbeiro(a) parceiro(a) (atendo em barbearia)',
      'Vou abrir minha barbearia agora',
      'Outro negócio de beleza',
    ],
  },

  especialidadesInternas: [
    { titulo: 'Planejador de Empresa (grátis)', href: '/planejador-de-empresa?segmento=barbearia' },
    { titulo: 'Contabilidade para Salão de Beleza', href: '/contabilidade-para-salao-de-beleza' },
    ...ESPECIALIDADES_BASE,
  ],

  // Shape esperado pelas seções compartilhadas de src/sections/saude/segment
  segment: {
    slug: 'contabilidade-para-barbearias',
    name: 'Donos de barbearia',
    accent: '#9A4F12',
    whatsappLink: whatsappLink(
      'Olá! Tenho uma barbearia e cheguei pela página de Contabilidade para Barbearias. Quero falar com um especialista.'
    ),
    steps: PASSOS_BELEZA,
    services: SERVICOS_BELEZA,
    servicesIntro:
      'Tudo o que a sua barbearia precisa em um só lugar: contabilidade completa, Lei do Salão Parceiro e sistema de gestão de parceiros.',
    testimonialsSubject: 'barbearias e negócios de beleza',
    testimonials: [
      {
        title: '',
        name: 'Rafael Moreira',
        city: 'Curitiba - PR',
        testimonial:
          'Implantamos a Lei do Salão Parceiro com a Attualize e o imposto caiu na hora. Os contratos dos meus quatro barbeiros ficaram redondos e os repasses saem certinhos todo mês.',
        specialty: 'Dono de barbearia',
      },
      {
        title: '',
        name: 'Diego Santana',
        city: 'São Paulo - SP',
        testimonial:
          'Saí do MEI para ME sem dor de cabeça quando a barbearia cresceu. O sistema de gestão me mostra quanto cada parceiro gerou e as notas saem sozinhas.',
        specialty: 'Barbearia com 6 cadeiras',
      },
      {
        title: '',
        name: 'Luan Ferreira',
        city: 'Florianópolis - SC',
        testimonial:
          'Atendimento pelo WhatsApp rápido de verdade. Eles cuidam da contabilidade e dos contratos de parceria, e eu cuido da tesoura.',
        specialty: 'Barbeiro e gestor',
      },
    ],
  },
};
