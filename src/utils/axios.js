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

const baseUrl = process.env.NEXT_PUBLIC_API_URL;


export const endpoints = {
  chat: '/api/chat',  
  kanban: `${baseUrl}comercial/board`,
  calendar: '/api/calendar',
  auth: {
    signIn: `${baseUrl}users/authenticate`,
    signUp: '/api/auth/sign-up',
    resetPassword: `${baseUrl}users/reset-password`,
    updatePassword: `${baseUrl}users/update-password`,
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
    list: `${baseUrl}/clientes`,
    leads: `${baseUrl}clientes/leads/all`,
    create: `${baseUrl}financeiro/invoice/create`,
    update: `${baseUrl}clientes`,
    historico: `${baseUrl}clientes/historico`,
  },
  invoices: {
    list: `${baseUrl}financeiro/invoices`,
    create: `${baseUrl}financeiro/invoice/create`,
    update: `${baseUrl}financeiro/invoice/update`,
    delete: `${baseUrl}financeiro/invoice/`,
    checkout: `${baseUrl}checkout/orcamento`,
  },
  contasPagar: {
    criar: `${baseUrl}financeiro/contas-pagar`,
    mes: `${baseUrl}financeiro/contas-a-pagar/periodo`,
    get: `${baseUrl}financeiro/contas-pagar`,
    update: `${baseUrl}financeiro/contas-pagar`,
    delete: `${baseUrl}financeiro/contas-pagar`,
    registrar: `${baseUrl}financeiro/contas-pagar`,
    agendamentoInter: `${baseUrl}financeiro/contas-pagar`,
    dashboard: `${baseUrl}financeiro/infos/dashboard`,
  },
  contratos: {
    list: `${baseUrl}contratos/all`,
    new: `${baseUrl}contratos/criar`,
    get: `${baseUrl}contratos/id`,
    update: `${baseUrl}contratos`,
    delete: `${baseUrl}contratos/delete`,
    faturasMesAno: `${baseUrl}contratos/cobrancas/faturas/mesano`,
    faturasDatas: `${baseUrl}contratos/cobrancas/faturas/datas`,
    cliente: `${baseUrl}contratos/cliente/id`,
    criarCobranca: `${baseUrl}contratos/cobrancas/criar`,
    deleteCobranca: `${baseUrl}contratos/cobrancas/delete`,
    gerarBoleto: `${baseUrl}contratos/cobrancas/boleto`,
    fatura: `${baseUrl}contratos/cobrancas/fatura`,
    enviarMensagem: `${baseUrl}contratos/cobrancas/mensagem`,
    subscription: `${baseUrl}contratos/subscription`,
  },
  marketing: {
    create: `${baseUrl}marketing/criar/lead`,
    update: `${baseUrl}marketing/atualizar/lead`,
    dashboard: `${baseUrl}marketing/dashboard-data`,
    financeiro: {
      pagar: `${baseUrl}marketing/dashboard-contas-a-pagar`,
      receber: `${baseUrl}marketing/dashboard-contas-a-receber`,
    }
  },
  // Settings (Admin)
  settings: {
    base: `${baseUrl}settings`,
    byClienteId: (clienteId) => `${baseUrl}settings/${clienteId}`,
    check: (clienteId, funcionalidade) => `${baseUrl}settings/${clienteId}/check/${funcionalidade}`,
  },
  // Portal do Cliente
  portal: {
    base: `${baseUrl}portal`,
    clientes: {
      list: (clienteProprietarioId) => `${baseUrl}portal/clientes/${clienteProprietarioId}`,
      get: (clienteProprietarioId, id) => `${baseUrl}portal/clientes/${clienteProprietarioId}/${id}`,
      create: (clienteProprietarioId) => `${baseUrl}portal/clientes/${clienteProprietarioId}`,
      update: (clienteProprietarioId, id) => `${baseUrl}portal/clientes/${clienteProprietarioId}/${id}`,
      delete: (clienteProprietarioId, id) => `${baseUrl}portal/clientes/${clienteProprietarioId}/${id}`,
    },
    servicos: {
      list: (clienteProprietarioId) => `${baseUrl}portal/servicos/${clienteProprietarioId}`,
      categorias: (clienteProprietarioId) => `${baseUrl}portal/servicos/${clienteProprietarioId}/categorias`,
      get: (clienteProprietarioId, id) => `${baseUrl}portal/servicos/${clienteProprietarioId}/${id}`,
      create: `${baseUrl}portal/servicos`,
      update: (id) => `${baseUrl}portal/servicos/${id}`,
      delete: (id) => `${baseUrl}portal/servicos/${id}`,
    },
    orcamentos: {
      list: (clienteProprietarioId) => `${baseUrl}portal/orcamentos/${clienteProprietarioId}`,
      stats: (clienteProprietarioId) => `${baseUrl}portal/orcamentos/${clienteProprietarioId}/estatisticas`,
      get: (clienteProprietarioId, id) => `${baseUrl}portal/orcamentos/${clienteProprietarioId}/${id}`,
      create: `${baseUrl}portal/orcamentos`,
      update: (id) => `${baseUrl}portal/orcamentos/${id}`,
      updateStatus: (id) => `${baseUrl}portal/orcamentos/${id}/status`,
      delete: (id) => `${baseUrl}portal/orcamentos/${id}`,
      pdf: (id) => `${baseUrl}portal/orcamentos/${id}/pdf`,
    },
  },
};
