// ----------------------------------------------------------------------
// Dados da landing "Contabilidade para Psicólogos em Curitiba".
// Sem 'use client': este módulo é importado também pelo page.jsx (server)
// para montar o JSON-LD — o FAQ da página e o do schema saem daqui.
// ----------------------------------------------------------------------

export const SITE_URL = 'https://www.attualize.com.br';
export const PAGINA_URL = `${SITE_URL}/contabilidade-para-psicologos-em-curitiba`;

export const WHATSAPP_NUMERO = '554196982267';
export const WHATSAPP_TELEFONE_EXIBICAO = '+55 41 9698-2267';

export const whatsappLink = (mensagem) =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;

export const WHATSAPP_MSG_PADRAO =
  'Olá! Sou psicólogo(a) e cheguei pela página de Contabilidade para Psicólogos em Curitiba. Quero falar com um especialista.';

// ----------------------------------------------------------------------
// Paleta da página — rosa/magenta de destaque sobre base clara e neutra.
// Contraste AA verificado sobre `papel` e sobre branco.

export const CORES = {
  /** Destaque da marca — CTAs, links, marcações */
  rosa: '#C21858',
  /** Lavagem suave do rosa — fundos de apoio */
  rosaSuave: '#FBE9F0',
  /** Tinta — títulos e texto forte (ameixa quase preto) */
  tinta: '#2A1620',
  /** Grafite quente — texto secundário */
  grafite: '#5F4B55',
  /** Papel — base clara e neutra da página */
  papel: '#FAF6F3',
  /** Verde — resultado positivo / Anexo III */
  verde: '#1B7F4B',
};

// ----------------------------------------------------------------------

export const FAQ_ITEMS = [
  {
    pergunta: 'Psicólogo pode ser MEI?',
    resposta:
      'Não. A psicologia é uma profissão regulamentada e não está na lista de atividades permitidas ao MEI. O caminho para atuar como pessoa jurídica é abrir uma empresa (em geral uma sociedade limitada unipessoal) enquadrada no Simples Nacional, o que ainda assim costuma reduzir bastante a carga tributária em comparação a atender como autônomo.',
  },
  {
    pergunta: 'O que é o Fator R?',
    resposta:
      'O Fator R é a divisão entre a folha de pagamento (incluindo pró-labore e encargos) e a receita bruta, ambas dos últimos 12 meses. Se o resultado for igual ou maior que 28%, a empresa de psicologia é tributada pelo Anexo III do Simples Nacional, com alíquotas a partir de 6%. Abaixo de 28%, cai no Anexo V, que começa em 15,5% — por isso planejar o pró-labore certo faz tanta diferença no imposto.',
  },
  {
    pergunta: 'Quanto custa abrir um CNPJ de psicólogo em Curitiba?',
    resposta:
      'O registro na Junta Comercial do Paraná (JUCEPAR) custa R$ 96,90 para Empresário Individual ou R$ 134,55 para Sociedade Limitada, assinado digitalmente pelo sistema Empresa Fácil (conta gov.br Prata/Ouro ou e-CPF). Em Curitiba somam-se a Taxa de Expediente do alvará (R$ 50,95) e a Taxa de Licença para Localização, que começa em R$ 339,12 para imóveis de até 400 m², além do certificado digital e-CNPJ. A Attualize conduz todo o processo de forma digital e apresenta o custo total do seu caso no diagnóstico gratuito.',
  },
  {
    pergunta: 'Preciso ir ao escritório ou é tudo online?',
    resposta:
      'É tudo online. A Attualize tem sede em Curitiba, mas o atendimento é 100% digital: documentos, assinaturas, emissão de notas e reuniões acontecem pela internet. Você acompanha a contabilidade pelo portal do cliente e fala com o time por WhatsApp — sem precisar se deslocar, esteja você em Curitiba ou em qualquer cidade do Paraná.',
  },
  {
    pergunta: 'Qual a diferença entre o Anexo III e o Anexo V do Simples Nacional?',
    resposta:
      'Os dois anexos tributam serviços, mas com tabelas muito diferentes: o Anexo III começa em 6% e o Anexo V em 15,5% sobre a receita. Quem define em qual anexo a clínica ou consultório de psicologia se enquadra é o Fator R. Na prática, uma empresa que fatura R$ 25 mil por mês pode pagar mais que o dobro de imposto só por estar no anexo errado.',
  },
  {
    pergunta: 'O que é pró-labore e por que ele afeta meu imposto?',
    resposta:
      'Pró-labore é a remuneração mensal que o sócio recebe pelo trabalho na empresa — diferente da distribuição de lucros. Ele entra no cálculo da folha de pagamento e, portanto, do Fator R: um pró-labore bem dimensionado pode levar a empresa ao Anexo III e reduzir a alíquota efetiva. O ajuste precisa considerar também o INSS sobre o pró-labore, e é exatamente esse equilíbrio que a contabilidade especializada calcula.',
  },
  {
    pergunta: 'Como funciona a emissão de NFS-e para psicólogos em Curitiba?',
    resposta:
      'A emissão da nota fiscal de serviço passou a ser feita pelo portal nacional da NFS-e (Emissor Nacional). Além dele, a Attualize oferece sistema próprio de emissão: você emite as notas dos pacientes e convênios direto pelo nosso portal, em poucos cliques, já com o código de serviço correto para psicologia. Nós cuidamos do credenciamento, da configuração e das mudanças de regra municipal.',
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
  { titulo: 'Planejador de Empresa (grátis)', href: '/planejador-de-empresa?segmento=psicologia' },
  { titulo: 'Contabilidade para Psicólogos', href: '/contabilidade-para-psicologos' },
  {
    titulo: 'Contabilidade para Médicos em Curitiba',
    href: '/contabilidade-para-medicos-em-curitiba',
  },
  { titulo: 'Contabilidade para Médicos', href: '/contabilidade-para-medicos' },
  { titulo: 'Contabilidade para Dentistas', href: '/contabilidade-para-dentistas' },
  { titulo: 'Contabilidade para Fisioterapeutas', href: '/contabilidade-para-fisioterapeutas' },
  { titulo: 'Contabilidade para Fonoaudiólogos', href: '/contabilidade-para-fonoaudiologos' },
  { titulo: 'Contabilidade para Nutricionistas', href: '/contabilidade-para-nutricionistas' },
  { titulo: 'Contabilidade para Terapeutas', href: '/contabilidade-para-terapeutas' },
  { titulo: 'Contabilidade para Clínicas de Estética', href: '/contabilidade-para-clinicas-de-estetica' },
  { titulo: 'Contabilidade para a Área da Saúde', href: '/contabilidade-para-negocios-da-area-da-saude' },
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
  name: 'Calculadora de Fator R',
  url: `${PAGINA_URL}#calculadora-fator-r`,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  description:
    'Calcule o Fator R da sua empresa, descubra se ela se enquadra no Anexo III ou V do Simples Nacional e estime a economia de impostos.',
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
