import { paramCase } from 'src/utils/change-case';

import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
  CLIENTE: '/portal-cliente',
};

// ----------------------------------------------------------------------

export const paths = {
  esteticaHome: '/contabilidade-para-clinicas-de-estetica',
  psychologistHome: '/contabilidade-para-psicologos',
  aberturaCnpjPsicologo: '/abertura-cnpj-psicologo',
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/sobre',
  contact: '/fale-conosco',
  faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneStore: 'https://mui.com/store/items/zone-landing-page/',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figma: 'https://www.figma.com/design/cAPz4pYPtQEXivqe11EcDE/%5BPreview%5D-Minimal-Web.v6.0.0',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: { details: `/product/${MOCK_ID}` },
  },
  invoice: {
    root: `${ROOTS.DASHBOARD}/invoice`,
    new: `${ROOTS.DASHBOARD}/invoice/new`,
    details: (id) => `${ROOTS.DASHBOARD}/invoice/${id}`,
    edit: (id) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
    demo: {
      details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
      edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
    },
  },
  post: {
    root: `/post`,
    blog: `/blog`,
    details: (slug) => `/post/${slug}`,
    demo: { details: `/post/${paramCase(MOCK_TITLE)}` },
  },
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
      resetPassword: `${ROOTS.AUTH}/jwt/reset-password`,
      updatePassword: `${ROOTS.AUTH}/jwt/update-password`,
      updatePasswordWithToken: (userId) => `/reset-password/${userId}`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  authDemo: {
    split: {
      signIn: `${ROOTS.AUTH_DEMO}/split/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/split/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/split/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/split/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/split/verify`,
    },
    centered: {
      signIn: `${ROOTS.AUTH_DEMO}/centered/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/centered/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/centered/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/centered/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/centered/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    fiscal: {
      root: `${ROOTS.DASHBOARD}/fiscal/nfse`,
    },
    contabil: {
      root: `${ROOTS.DASHBOARD}/contabil/conciliacoes`,
      conciliacoes: {
        root: `${ROOTS.DASHBOARD}/contabil/conciliacoes`,
        details: (id) => `${ROOTS.DASHBOARD}/contabil/conciliacoes/${id}`,
      },
    },
    certificados: {
      root: `${ROOTS.DASHBOARD}/certificados`,
    },
    cliente: {
      root: `${ROOTS.DASHBOARD}/cliente/list`,
      new: `${ROOTS.DASHBOARD}/cliente/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/cliente/${id}/edit`,
    },
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
      course: `${ROOTS.DASHBOARD}/course`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },
    usuarios: {
      root: `${ROOTS.DASHBOARD}/usuarios`,
      new: `${ROOTS.DASHBOARD}/usuarios/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/usuarios/${id}/edit`,
    },
    contratos: {
      root: `${ROOTS.DASHBOARD}/financeiro/contratos`,
      new: `${ROOTS.DASHBOARD}/financeiro/contratos/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/financeiro/contratos/${id}/edit`,
      pagar: `${ROOTS.DASHBOARD}/financeiro/pagar`,
      receber: `${ROOTS.DASHBOARD}/financeiro/receber`,
    },
    financeiro: {
      root: `${ROOTS.DASHBOARD}/financeiro/dashboard`,
      new: `${ROOTS.DASHBOARD}/financeiro/contratos/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/financeiro/contratos/${id}/edit`,
      receber: `${ROOTS.DASHBOARD}/financeiro/receber`,
      pagar: `${ROOTS.DASHBOARD}/financeiro/pagar`,
      pagarnovo: `${ROOTS.DASHBOARD}/financeiro/pagar/new`,
    },
    aberturas: {
      root: `${ROOTS.DASHBOARD}/societario/abertura`,
      edit: (id) => `${ROOTS.DASHBOARD}/societario/abertura/${id}/edit`,
      licenca: `${ROOTS.DASHBOARD}/licencas`,
    },
    alteracao: {
      root: `${ROOTS.DASHBOARD}/societario/alteracao`,
      edit: (id) => `${ROOTS.DASHBOARD}/societario/alteracao/${id}/edit`,
    },
    comercial: {
      leads: `${ROOTS.DASHBOARD}/comercial/leads`,
      leadDetails: (id) => `${ROOTS.DASHBOARD}/comercial/leads/${id}`,
      funil: `${ROOTS.DASHBOARD}/comercial/vendas`,
    },
    servicos: `${ROOTS.DASHBOARD}/servicos`,
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}`,
      edit: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}`,
      },
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
    relatorios: {
      comercial: `${ROOTS.DASHBOARD}/relatorios/comercial`,
      financeiro: `${ROOTS.DASHBOARD}/relatorios/financeiro`,
    },
    avaliacoes: {
      root: `${ROOTS.DASHBOARD}/avaliacoes`,
      detalhes: (id) => `${ROOTS.DASHBOARD}/avaliacoes/${id}`,
    },
  },
  // CLIENTE AREA
  cliente: {
    root: ROOTS.CLIENTE,
    dashboard: `${ROOTS.CLIENTE}/dashboard`,
    empresa: `${ROOTS.CLIENTE}/empresa`,
    clientes: `${ROOTS.CLIENTE}/clientes`,
    servicos: `${ROOTS.CLIENTE}/servicos`,
    orcamentos: { 
      root: `${ROOTS.CLIENTE}/vendas`,
      novo: `${ROOTS.CLIENTE}/vendas/novo`, 
    },
    financeiro: {
      root: `${ROOTS.CLIENTE}/financeiro`,
      contas: `${ROOTS.CLIENTE}/financeiro/contas`,
      relatorios: `${ROOTS.CLIENTE}/financeiro/relatorios`,
    },
    faturamentos: {
      root: `${ROOTS.CLIENTE}/faturamentos`,
    },
    societario: {
      root: `${ROOTS.CLIENTE}/societario`,
      documentos: `${ROOTS.CLIENTE}/societario/documentos`,
    },
    contratos: {
      root: `${ROOTS.CLIENTE}/contratos`,
      list: `${ROOTS.CLIENTE}/contratos/list`,
      details: (id) => `${ROOTS.CLIENTE}/contratos/${id}`,
    },
    licencas: `${ROOTS.CLIENTE}/licencas`,
    profile: `${ROOTS.CLIENTE}/profile`,
    settings: `${ROOTS.CLIENTE}/settings`,
    conciliacaoBancaria: `${ROOTS.CLIENTE}/conciliacao-bancaria`,
    conteudos: {
      root: `${ROOTS.CLIENTE}/conteudos`,
      aulaoReforma: `${ROOTS.CLIENTE}/conteudos/aulao-reforma`,
      guiaIRPF2026: `${ROOTS.CLIENTE}/conteudos/guia-irpf-2026`,
      reformaTributaria: `${ROOTS.CLIENTE}/conteudos/reforma-tributaria`,
    },
    aulaoReforma: `${ROOTS.CLIENTE}/conteudos/aulao-reforma`,
  },
};
