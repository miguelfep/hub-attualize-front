// ----------------------------------------------------------------------
// Dados da landing "Contabilidade para Médicos em Curitiba".
// Sem 'use client': este módulo é importado também pelo page.jsx (server)
// para montar o JSON-LD — o FAQ da página e o do schema saem daqui.
// ----------------------------------------------------------------------

export const SITE_URL = 'https://www.attualize.com.br';
export const PAGINA_URL = `${SITE_URL}/contabilidade-para-medicos-em-curitiba`;

export const WHATSAPP_NUMERO = '554196982267';
export const WHATSAPP_TELEFONE_EXIBICAO = '+55 41 9698-2267';

export const whatsappLink = (mensagem) =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;

export const WHATSAPP_MSG_PADRAO =
  'Olá! Sou médico(a) e cheguei pela página de Contabilidade para Médicos em Curitiba. Quero falar com um especialista.';

// ----------------------------------------------------------------------
// Paleta da página — azul do segmento médico sobre base clara e neutra.
// Contraste AA verificado sobre `papel` e sobre branco.

export const CORES = {
  /** Destaque da marca — CTAs, links, marcações */
  azul: '#0369A1',
  /** Tom mais escuro do azul — hover dos CTAs */
  azulEscuro: '#02507C',
  /** Lavagem suave do azul — fundos de apoio */
  azulSuave: '#E3F1FA',
  /** Tinta — títulos e texto forte (azul-petróleo quase preto) */
  tinta: '#0F2430',
  /** Grafite frio — texto secundário */
  grafite: '#48606E',
  /** Papel — base clara e neutra da página */
  papel: '#F6FAFC',
  /** Verde — resultado positivo / Anexo III */
  verde: '#1B7F4B',
};

// ----------------------------------------------------------------------

export const FAQ_ITEMS = [
  {
    pergunta: 'Médico pode ser MEI?',
    resposta:
      'Não. A medicina é uma profissão regulamentada e não está na lista de atividades permitidas ao MEI. O caminho para atuar como pessoa jurídica é abrir uma empresa (em geral uma sociedade limitada unipessoal) enquadrada no Simples Nacional ou no Lucro Presumido — e, mesmo sem MEI, a tributação como PJ costuma ser bem menor do que atender como autônomo no carnê-leão.',
  },
  {
    pergunta: 'Vale a pena abrir CNPJ ou continuar no carnê-leão?',
    resposta:
      'Depende do faturamento, mas a partir de alguns milhares de reais por mês a diferença costuma ser grande: como pessoa física, o imposto sobre plantões e consultas pode chegar a 27,5% no carnê-leão; com CNPJ e o enquadramento correto (Anexo III via Fator R ou Lucro Presumido com equiparação hospitalar), médicos costumam pagar entre 6% e 16%. No diagnóstico gratuito fazemos o comparativo PF x PJ com os seus números.',
  },
  {
    pergunta: 'O que é o Fator R?',
    resposta:
      'O Fator R é a divisão entre a folha de pagamento (incluindo pró-labore e encargos) e a receita bruta, ambas dos últimos 12 meses. Se o resultado for igual ou maior que 28%, a empresa médica é tributada pelo Anexo III do Simples Nacional, com alíquotas a partir de 6%. Abaixo de 28%, cai no Anexo V, que começa em 15,5% — por isso planejar o pró-labore certo faz tanta diferença no imposto.',
  },
  {
    pergunta: 'O que é equiparação hospitalar e minha clínica pode usar?',
    resposta:
      'É um benefício fiscal do Lucro Presumido para clínicas que realizam procedimentos equiparados a serviços hospitalares (cirurgias, exames de imagem, procedimentos ambulatoriais): a base de cálculo do IRPJ cai de 32% para 8% e a da CSLL de 32% para 12%, o que pode reduzir em mais de 60% os impostos federais. É preciso cumprir requisitos legais e societários — analisamos se a sua clínica se enquadra antes de aplicar.',
  },
  {
    pergunta: 'Posso atender plantões e hospitais como PJ?',
    resposta:
      'Sim, é muito comum hospitais e operadoras contratarem médicos como pessoa jurídica. Com o CNPJ aberto e o CNAE correto, você emite nota fiscal para o hospital e paga muito menos imposto do que receberia como CLT ou autônomo. Cuidamos da abertura, do enquadramento e da emissão das notas de cada plantão.',
  },
  {
    pergunta: 'Quanto custa abrir um CNPJ de médico em Curitiba?',
    resposta:
      'O registro na Junta Comercial do Paraná (JUCEPAR) custa R$ 96,90 para Empresário Individual ou R$ 134,55 para Sociedade Limitada, assinado digitalmente pelo sistema Empresa Fácil (conta gov.br Prata/Ouro ou e-CPF). Em Curitiba somam-se a Taxa de Expediente do alvará (R$ 50,95), a Taxa de Licença para Localização (a partir de R$ 339,12 para imóveis de até 400 m²) e, para consultórios e clínicas, a Taxa de Vigilância Sanitária. A Attualize conduz todo o processo de forma digital e apresenta o custo total do seu caso no diagnóstico gratuito.',
  },
  {
    pergunta: 'Preciso registrar a empresa no CRM-PR?',
    resposta:
      'Sim. Clínicas e sociedades médicas precisam de registro no Conselho Regional de Medicina do Paraná (CRM-PR), com indicação de diretor técnico médico. O consultório individual como pessoa jurídica também passa por essa etapa. Orientamos a documentação e acompanhamos o registro junto com a abertura do CNPJ.',
  },
  {
    pergunta: 'Como funciona a emissão de NFS-e para médicos em Curitiba?',
    resposta:
      'A emissão da nota fiscal de serviço passou a ser feita pelo portal nacional da NFS-e (Emissor Nacional). Além dele, a Attualize oferece sistema próprio de emissão: você emite as notas de plantões, consultas e convênios direto pelo nosso portal, em poucos cliques, já com o código de serviço correto para medicina. Nós cuidamos do credenciamento, da configuração e das mudanças de regra municipal.',
  },
  {
    pergunta: 'Já tenho contador. Consigo migrar para a Attualize sem dor de cabeça?',
    resposta:
      'Sim. A troca de contabilidade é um direito seu e acontece sem interromper as obrigações da empresa: solicitamos os documentos e arquivos ao contador anterior, conferimos as declarações entregues e assumimos as rotinas a partir do mês combinado. Você só precisa formalizar o aviso — o restante da transição é conduzido pelo nosso time.',
  },
];

// ----------------------------------------------------------------------
// Links internos para outras especialidades do site (rodapé da página)

export const ESPECIALIDADES_INTERNAS = [
  { titulo: 'Planejador de Empresa (grátis)', href: '/planejador-de-empresa?segmento=medicina' },
  { titulo: 'Contabilidade para Médicos', href: '/contabilidade-para-medicos' },
  {
    titulo: 'Contabilidade para Psicólogos em Curitiba',
    href: '/contabilidade-para-psicologos-em-curitiba',
  },
  { titulo: 'Contabilidade para Psicólogos', href: '/contabilidade-para-psicologos' },
  { titulo: 'Contabilidade para Dentistas', href: '/contabilidade-para-dentistas' },
  { titulo: 'Contabilidade para Fisioterapeutas', href: '/contabilidade-para-fisioterapeutas' },
  { titulo: 'Contabilidade para Fonoaudiólogos', href: '/contabilidade-para-fonoaudiologos' },
  { titulo: 'Contabilidade para Nutricionistas', href: '/contabilidade-para-nutricionistas' },
  { titulo: 'Contabilidade para Terapeutas', href: '/contabilidade-para-terapeutas' },
  {
    titulo: 'Contabilidade para Clínicas de Estética',
    href: '/contabilidade-para-clinicas-de-estetica',
  },
  {
    titulo: 'Contabilidade para a Área da Saúde',
    href: '/contabilidade-para-negocios-da-area-da-saude',
  },
];

// ----------------------------------------------------------------------
// JSON-LD (usado pelo page.jsx no <head>)

export const JSONLD_ACCOUNTING_SERVICE = {
  '@context': 'https://schema.org',
  '@type': 'AccountingService',
  name: 'Attualize Contábil',
  description:
    'Contabilidade digital especializada em profissionais de saúde, beleza e bem-estar. Sede em Curitiba/PR, atendimento online.',
  url: SITE_URL,
  telephone: WHATSAPP_TELEFONE_EXIBICAO,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. Sen. Salgado Filho, 1847 - Sobreloja - Guabirotuba',
    addressLocality: 'Curitiba',
    addressRegion: 'PR',
    postalCode: '81570-001',
    addressCountry: 'BR',
  },
  areaServed: {
    '@type': 'State',
    name: 'Paraná',
  },
  sameAs: [
    'https://www.instagram.com/attualizecontabil/',
    'https://www.facebook.com/attualizecontabil/',
    'https://www.linkedin.com/company/attualize-contabil',
  ],
};

export const JSONLD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.pergunta,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.resposta,
    },
  })),
};

export const JSONLD_CALCULADORA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de Fator R para Médicos',
  url: `${PAGINA_URL}#calculadora-fator-r`,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  description:
    'Calcule o Fator R da sua empresa médica, descubra se ela se enquadra no Anexo III ou V do Simples Nacional e estime a economia de impostos.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
  },
  provider: {
    '@type': 'Organization',
    name: 'Attualize Contábil',
    url: SITE_URL,
  },
};
