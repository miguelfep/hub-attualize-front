import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.site.serverUrl });
// const axiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_HOST_API });
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }

};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: `${baseUrl  }/chat`,  // Removido /api duplicado
  kanban: `${baseUrl  }/comercial/board`,
  calendar: '/api/calendar',
  auth: {
    signIn:  `${baseUrl  }/api/users/authenticate`,
    signUp: '/api/auth/sign-up',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  clientes: {
    list: `${baseUrl  }/api/clientes`,
    leads: `${baseUrl  }/api/clientes/leads/all`,
    create: `${baseUrl  }/api/financeiro/invoice/create`,
    update: `${baseUrl  }/api/clientes`,
  },
  invoices: {
    list: `${baseUrl  }/api/financeiro/invoices`,
    create: `${baseUrl  }/api/financeiro/invoice/create`,
    update: `${baseUrl  }/api/financeiro/invoice/update`,
        delete: `${baseUrl  }/api/financeiro/invoice/`,
    checkout: `${baseUrl  }/api/checkout/orcamento`,
  },
  contasPagar: {
    criar: `${baseUrl  }/api/financeiro/contas-pagar`,
    mes: `${baseUrl  }/api/financeiro/contas-a-pagar/periodo`,
    get: `${baseUrl  }/api/financeiro/contas-pagar`,
    update: `${baseUrl  }/api/financeiro/contas-pagar`,
    delete: `${baseUrl  }/api/financeiro/contas-pagar`,
    registrar: `${baseUrl  }/api/financeiro/contas-pagar`,
    agendamentoInter: `${baseUrl  }/api/financeiro/contas-pagar`,
    dashboard: `${baseUrl  }/api/financeiro/infos/dashboard`,
  },
  contratos: {
    list: `${baseUrl  }/api/contratos/all`,
    new: `${baseUrl  }/api/contratos/criar`,
    get: `${baseUrl  }/api/contratos/id`,
    update: `${baseUrl  }/api/contratos`,
    delete: `${baseUrl  }/api/contratos/delete`,
    faturasMesAno: `${baseUrl  }/api/contratos/cobrancas/faturas/mesano`,
    faturasDatas: `${baseUrl  }/api/contratos/cobrancas/faturas/datas`,
    cliente: `${baseUrl  }/api/contratos/cliente/id`,
    criarCobranca: `${baseUrl  }/api/contratos/cobrancas/criar`,
    deleteCobranca: `${baseUrl  }/api/contratos/cobrancas/delete`,
    gerarBoleto: `${baseUrl  }/api/contratos/cobrancas/boleto`,
    fatura: `${baseUrl  }/api/contratos/cobrancas/fatura`,
    enviarMensagem: `${baseUrl  }/api/contratos/cobrancas/mensagem`,
    subscription: `${baseUrl  }/api/contratos/subscription`,
  },
  marketing: {
    create: `${baseUrl  }/api/marketing/criar/lead`,
    update: `${baseUrl  }/api/marketing/atualizar/lead`,
    dashboard: `${baseUrl  }/api/marketing/dashboard-data`,
    financeiro: {
      pagar: `${baseUrl  }/api/marketing/dashboard-contas-a-pagar`,
      receber: `${baseUrl  }/api/marketing/dashboard-contas-a-receber`,
    }
  },
  contacts: {
    chat: {
      conversations: `${baseUrl  }/api/chat/conversations`,
      messages: `${baseUrl  }/api/chat/messages`,
      markAsSeen: `${baseUrl  }/api/chat/mark-as-seen`,
    },
    list: `${baseUrl  }/api/contacts`,
    create: `${baseUrl  }/api/contacts`,
    update: `${baseUrl  }/api/contacts`,
    delete: `${baseUrl  }/api/contacts`,
    conversation: `${baseUrl  }/api/contacts`,
    message: `${baseUrl  }/api/contacts`,
  },
};
