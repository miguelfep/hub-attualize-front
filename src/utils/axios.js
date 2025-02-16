import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.site.serverUrl });
// const axiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_HOST_API });

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
  chat: '/api/chat',
  kanban: 'http://localhost:9443/api/comercial/board',
  calendar: '/api/calendar',
  auth: {
    signIn: 'http://localhost:9443/api/users/authenticate',
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
    list: 'http://localhost:9443/api/clientes',
    leads: 'http://localhost:9443/api/clientes/leads/all',
    create: 'http://localhost:9443/api/financeiro/invoice/create',
    update: 'http://localhost:9443/api/clientes',
  },
  invoices: {
    list: 'http://localhost:9443/api/financeiro/invoices',
    create: 'http://localhost:9443/api/financeiro/invoice/create',
    update: 'http://localhost:9443/api/financeiro/invoice/update',
    delete: 'http://localhost:9443/api/financeiro/invoice/',
    checkout: 'http://localhost:9443/api/checkout/orcamento',
  },
  contasPagar: {
    criar: 'http://localhost:9443/api/financeiro/contas-pagar',
    mes: 'http://localhost:9443/api/financeiro/contas-a-pagar/periodo',
    get: 'http://localhost:9443/api/financeiro/contas-pagar',
    update: 'http://localhost:9443/api/financeiro/contas-pagar',
    delete: 'http://localhost:9443/api/financeiro/contas-pagar',
    registrar: 'http://localhost:9443/api/financeiro/contas-pagar',
    agendamentoInter: 'http://localhost:9443/api/financeiro/contas-pagar',
    dashboard: 'http://localhost:9443/api/financeiro/infos/dashboard',
  },
  contratos: {
    list: 'http://localhost:9443/api/contratos/all',
    new: 'http://localhost:9443/api/contratos/criar',
    get: 'http://localhost:9443/api/contratos/id',
    update: 'http://localhost:9443/api/contratos',
    delete: 'http://localhost:9443/api/contratos/delete',
    faturasMesAno: 'http://localhost:9443/api/contratos/cobrancas/faturas/mesano',
    faturasDatas: 'http://localhost:9443/api/contratos/cobrancas/faturas/datas',
    cliente: 'http://localhost:9443/api/contratos/cliente/id',
    criarCobranca: 'http://localhost:9443/api/contratos/cobrancas/criar',
    deleteCobranca: 'http://localhost:9443/api/contratos/cobrancas/delete',
    gerarBoleto: 'http://localhost:9443/api/contratos/cobrancas/boleto',
    fatura: 'http://localhost:9443/api/contratos/cobrancas/fatura',
    enviarMensagem: 'http://localhost:9443/api/contratos/cobrancas/mensagem',
    subscription: 'http://localhost:9443/api/contratos/subscription',
  },
  marketing: {
    create: 'http://localhost:9443/api/marketing/criar/lead',
    update: 'http://localhost:9443/api/marketing/atualizar/lead',
    dashboard: 'http://localhost:9443/api/marketing/dashboard-data',
  },
};
