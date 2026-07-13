// ----------------------------------------------------------------------
// Dados compartilhados entre as landings de beleza (barbearias e salões).
// Sem 'use client': importado também pelos page.jsx (server) para o JSON-LD.
// ----------------------------------------------------------------------

export const SITE_URL = 'https://www.attualize.com.br';

export const WHATSAPP_NUMERO = '554196982267';
export const WHATSAPP_TELEFONE_EXIBICAO = '+55 41 9698-2267';

export const whatsappLink = (mensagem) =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;

export const PARCEIRO_ID_URL = 'https://parceiroid.com.br/';

// ----------------------------------------------------------------------
// Sistema de gestão de parceiros (ParceiroID) — destaque das duas páginas

export const SISTEMA_PARCEIROS = {
  titulo: 'Sistema de gestão para acompanhar seus parceiros',
  subtitulo:
    'Além da contabilidade, você recebe acesso à nossa plataforma de gestão de parceria: o gestor acompanha cada profissional parceiro em um painel único, dentro das regras da Lei do Salão Parceiro.',
  features: [
    {
      icone: 'solar:monitor-bold-duotone',
      titulo: 'Painel do gestor',
      texto:
        'Visão de todos os profissionais parceiros em um só lugar: serviços realizados, valores, repasses e situação de cada contrato.',
    },
    {
      icone: 'solar:wallet-money-bold-duotone',
      titulo: 'Repasses e cota-parte automáticos',
      texto:
        'O sistema calcula a cota-parte de cada parceiro e organiza os repasses, sem planilha e sem erro na base de imposto.',
    },
    {
      icone: 'solar:document-add-bold-duotone',
      titulo: 'Emissão de notas fiscais',
      texto:
        'Emissão de NFS-e integrada para o estabelecimento e para os parceiros, com o código de serviço correto de cada atividade.',
    },
    {
      icone: 'solar:document-text-bold-duotone',
      titulo: 'Contrato de parceria digital',
      texto:
        'Contratos no modelo da Lei 13.352/2016, assinados digitalmente e organizados por parceiro — prontos para homologação quando exigida.',
    },
    {
      icone: 'solar:graph-up-bold-duotone',
      titulo: 'Relatórios e indicadores',
      texto:
        'Faturamento por parceiro, comissões, cota-parte e evolução mensal para decidir com números, não no achismo.',
    },
    {
      icone: 'solar:shield-check-bold-duotone',
      titulo: 'Conformidade com a lei',
      texto:
        'Tudo registrado do jeito que a fiscalização espera: parceiro formalizado, contrato específico e repasses documentados.',
    },
  ],
};

// ----------------------------------------------------------------------
// JSON-LD builders

export const buildJsonldAccountingService = () => ({
  '@context': 'https://schema.org',
  '@type': 'AccountingService',
  name: 'Attualize Contábil',
  description:
    'Contabilidade digital especializada em negócios de beleza, estética e bem-estar. Atendimento 100% online em todo o Brasil.',
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
    '@type': 'Country',
    name: 'Brazil',
  },
  sameAs: [
    'https://www.instagram.com/attualizecontabil/',
    'https://www.facebook.com/attualizecontabil/',
    'https://www.linkedin.com/company/attualize-contabil',
  ],
});

export const buildJsonldCalculadora = (segmento) => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: `Calculadora da Lei do Salão Parceiro para ${segmento.nome}`,
  url: `${segmento.paginaUrl}#calculadora-parceria`,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  description:
    'Calcule quanto seu negócio economiza de imposto com a Lei do Salão Parceiro (Lei 13.352/2016): compare o Simples Nacional sobre o valor cheio dos serviços e sobre a sua cota-parte.',
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
});

export const buildJsonldFaq = (faqItems) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.pergunta,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.resposta,
    },
  })),
});

// ----------------------------------------------------------------------
// Links internos (SEO) — comuns às duas páginas; cada dados.js injeta a "outra" página no topo

export const ESPECIALIDADES_BASE = [
  {
    titulo: 'Contabilidade para Clínicas de Estética',
    href: '/contabilidade-para-clinicas-de-estetica',
  },
  {
    titulo: 'Contabilidade para Profissional Parceiro',
    href: '/contabilidade-para-profissional-parceiro',
  },
  { titulo: 'Contabilidade para Psicólogos', href: '/contabilidade-para-psicologos' },
  { titulo: 'Contabilidade para Médicos', href: '/contabilidade-para-medicos' },
  { titulo: 'Contabilidade para Dentistas', href: '/contabilidade-para-dentistas' },
  { titulo: 'Contabilidade para Terapeutas', href: '/contabilidade-para-terapeutas' },
  {
    titulo: 'Contabilidade para a Área da Saúde',
    href: '/contabilidade-para-negocios-da-area-da-saude',
  },
];

// ----------------------------------------------------------------------
// Passos "como funciona" adaptados à beleza (sem jargão de consultório)

export const PASSOS_BELEZA = [
  {
    icon: 'solar:chat-round-dots-bold-duotone',
    title: 'Diagnóstico gratuito',
    description:
      'Você fala com um especialista pelo WhatsApp e analisamos sua situação atual: regime tributário, impostos pagos, parceiros e oportunidades de economia.',
  },
  {
    icon: 'solar:document-add-bold-duotone',
    title: 'Proposta sob medida',
    description:
      'Apresentamos o plano ideal para o seu negócio — abertura de CNPJ, migração de contador ou implantação da Lei do Salão Parceiro, sem burocracia.',
  },
  {
    icon: 'solar:check-circle-bold-duotone',
    title: 'Cuidamos de tudo',
    description:
      'Impostos, folha de pagamento, pró-labore, contratos de parceria e notas fiscais: nossa equipe assume a parte chata para você focar nos clientes.',
  },
  {
    icon: 'solar:graph-up-bold-duotone',
    title: 'Acompanhamento contínuo',
    description:
      'Monitoramos seu enquadramento e os repasses aos parceiros todos os meses, com relatórios claros e orientação para o crescimento do negócio.',
  },
];

// ----------------------------------------------------------------------
// Serviços inclusos — lista comum, com a Lei Salão Parceiro em destaque

export const SERVICOS_BELEZA = [
  'Abertura de CNPJ e alterações contratuais',
  'Troca de contador sem dor de cabeça',
  'Implantação da Lei do Salão Parceiro (contratos e homologação)',
  'Gestão de repasses e cota-parte dos parceiros',
  'Sistema de gestão de parceria com emissão de notas fiscais',
  'Apuração de impostos e obrigações fiscais',
  'Folha de pagamento (equipe CLT) e pró-labore',
  'Transição de MEI para ME na hora certa',
  'Imposto de Renda dos sócios (IRPF)',
  'Relatórios gerenciais e indicadores do negócio',
  'Orientação sobre alvarás e vigilância sanitária',
  'Certificado digital',
  'Suporte ágil pelo WhatsApp',
];
