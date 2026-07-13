// ----------------------------------------------------------------------
// Dados do Planejador de Empresa (/planejador-de-empresa).
// Sem 'use client': importado também pelo page.jsx (server) para o JSON-LD.
// ----------------------------------------------------------------------

export const SITE_URL = 'https://www.attualize.com.br';
export const PAGINA_URL = `${SITE_URL}/planejador-de-empresa`;

export const WHATSAPP_NUMERO = '554196982267';

export const whatsappLink = (mensagem) =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;

// ----------------------------------------------------------------------
// Segmentos atendidos pelo planejador.
// meiPermitido: atividade consta na lista do MEI.
// fatorR: serviço sujeito aos Anexos III/V conforme Fator R.
// leiSalaoParceiro: pode usar a Lei 13.352/2016 com profissionais parceiros.

export const SEGMENTOS = [
  {
    id: 'psicologia',
    label: 'Psicologia',
    rotuloAtividade: 'psicólogo(a)',
    icone: 'solar:chat-round-like-bold-duotone',
    meiPermitido: false,
    fatorR: true,
    conselho: 'CRP',
    segmentApi: 'psicologia',
    paginaEspecialidade: '/contabilidade-para-psicologos',
  },
  {
    id: 'medicina',
    label: 'Medicina',
    rotuloAtividade: 'médico(a)',
    icone: 'solar:stethoscope-bold-duotone',
    meiPermitido: false,
    fatorR: true,
    equiparacaoHospitalar: true,
    conselho: 'CRM',
    segmentApi: 'medicina',
    paginaEspecialidade: '/contabilidade-para-medicos',
  },
  {
    id: 'odontologia',
    label: 'Odontologia',
    rotuloAtividade: 'dentista',
    icone: 'solar:health-bold-duotone',
    meiPermitido: false,
    fatorR: true,
    conselho: 'CRO',
    segmentApi: 'odontologia',
    paginaEspecialidade: '/contabilidade-para-dentistas',
  },
  {
    id: 'outra-saude',
    label: 'Outra área da saúde',
    rotuloAtividade: 'profissional de saúde',
    icone: 'solar:heart-pulse-bold-duotone',
    meiPermitido: false,
    fatorR: true,
    conselho: 'conselho da sua categoria',
    segmentApi: 'saude',
    paginaEspecialidade: '/contabilidade-para-negocios-da-area-da-saude',
  },
  {
    id: 'barbearia',
    label: 'Barbearia',
    rotuloAtividade: 'barbeiro(a)',
    icone: 'solar:scissors-bold-duotone',
    meiPermitido: true,
    fatorR: false,
    leiSalaoParceiro: true,
    conselho: null,
    segmentApi: 'beleza',
    paginaEspecialidade: '/contabilidade-para-barbearias',
  },
  {
    id: 'salao',
    label: 'Salão de beleza',
    rotuloAtividade: 'cabeleireiro(a)',
    icone: 'solar:magic-stick-3-bold-duotone',
    meiPermitido: true,
    fatorR: false,
    leiSalaoParceiro: true,
    conselho: null,
    segmentApi: 'beleza',
    paginaEspecialidade: '/contabilidade-para-salao-de-beleza',
  },
  {
    id: 'estetica',
    label: 'Estética',
    rotuloAtividade: 'esteticista',
    icone: 'solar:face-scan-circle-bold-duotone',
    meiPermitido: true,
    fatorR: false,
    leiSalaoParceiro: true,
    conselho: null,
    segmentApi: 'estetica',
    paginaEspecialidade: '/contabilidade-para-clinicas-de-estetica',
  },
  {
    id: 'servicos',
    label: 'Outros serviços',
    rotuloAtividade: 'prestador(a) de serviços',
    icone: 'solar:case-round-bold-duotone',
    meiPermitido: false,
    fatorR: true,
    conselho: null,
    segmentApi: 'servicos',
    paginaEspecialidade: '/contabilidade-para-prestadores-de-servicos',
  },
];

export const ATUACOES = [
  { id: 'vou-comecar', label: 'Estou começando agora' },
  { id: 'autonomo', label: 'Atendo como autônomo(a) — carnê-leão' },
  { id: 'clt', label: 'Sou CLT e vou empreender' },
  { id: 'mei', label: 'Já sou MEI' },
  { id: 'tenho-cnpj', label: 'Já tenho CNPJ (ME ou maior)' },
];

// ----------------------------------------------------------------------

export const FAQ_ITEMS = [
  {
    pergunta: 'O que é o Planejador de Empresa da Attualize?',
    resposta:
      'É uma ferramenta gratuita que monta um plano inicial para o seu negócio: qual formato de empresa abrir (MEI ou Sociedade Limitada Unipessoal), qual regime tributário faz sentido (Simples Nacional Anexo III ou V, Fator R, Lei do Salão Parceiro), uma estimativa do imposto mensal e o checklist dos próximos passos. Você responde 3 perguntas e vê o resultado na hora.',
  },
  {
    pergunta: 'MEI ou ME: qual é o melhor para começar?',
    resposta:
      'Se a sua atividade está na lista do MEI e o faturamento cabe no limite anual de R$ 81 mil, o MEI é o formato mais barato: um valor fixo por mês, sem apuração de impostos. Profissões regulamentadas (psicólogo, médico, dentista, fisioterapeuta e outras) não podem ser MEI — nesses casos, a Sociedade Limitada Unipessoal no Simples Nacional costuma ser o caminho, e ainda assim paga menos imposto que o autônomo no carnê-leão.',
  },
  {
    pergunta: 'Quanto vou pagar de imposto com CNPJ?',
    resposta:
      'Depende do segmento e do planejamento. No Simples Nacional, serviços começam em 6% pelo Anexo III — que, para saúde e serviços intelectuais, exige Fator R de 28% (folha + pró-labore sobre a receita). Sem esse planejamento, a empresa cai no Anexo V, que começa em 15,5%. Para salões e barbearias com a Lei do Salão Parceiro, o imposto incide só sobre a cota-parte do estabelecimento. O planejador estima os dois cenários com os seus números.',
  },
  {
    pergunta: 'Vale a pena sair do carnê-leão e abrir CNPJ?',
    resposta:
      'Na maioria dos casos, sim, a partir de alguns milhares de reais por mês: como pessoa física, a tabela progressiva do IRPF chega a 27,5%, além do INSS. Como pessoa jurídica bem enquadrada, a carga costuma ficar entre 6% e 16%. O planejador mostra a estimativa e, no diagnóstico gratuito, calculamos o comparativo exato.',
  },
  {
    pergunta: 'O resultado do planejador substitui um contador?',
    resposta:
      'Não. É uma simulação simplificada para você entender as opções e ter uma ordem de grandeza dos impostos. O plano definitivo depende da análise individual — CNAE correto, município, ISS, pró-labore, equipe — que fazemos gratuitamente com um especialista antes de você decidir.',
  },
  {
    pergunta: 'Quanto custa usar o planejador?',
    resposta:
      'Nada. A ferramenta é 100% gratuita e o diagnóstico com o especialista também. Você só contrata a Attualize se quiser seguir com a abertura da empresa ou a migração da contabilidade.',
  },
];

// ----------------------------------------------------------------------
// JSON-LD

export const JSONLD_WEBAPP = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Planejador de Empresa',
  url: PAGINA_URL,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  description:
    'Planejador empresarial gratuito: descubra se você pode ser MEI, qual regime tributário paga menos imposto (Simples Nacional, Fator R, Lei do Salão Parceiro) e receba um checklist para abrir ou regularizar sua empresa.',
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

export const JSONLD_ACCOUNTING_SERVICE = {
  '@context': 'https://schema.org',
  '@type': 'AccountingService',
  name: 'Attualize Contábil',
  description:
    'Contabilidade digital especializada em saúde, beleza e serviços. Atendimento 100% online em todo o Brasil.',
  url: SITE_URL,
  telephone: '+55 41 9698-2267',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. Sen. Salgado Filho, 1847 - Sobreloja - Guabirotuba',
    addressLocality: 'Curitiba',
    addressRegion: 'PR',
    postalCode: '81570-001',
    addressCountry: 'BR',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Brazil',
  },
  sameAs: [
    'https://www.instagram.com/attualizecontabil/',
    'https://www.facebook.com/attualizecontabil/',
    'https://www.linkedin.com/company/attualize-contabil',
  ],
};
