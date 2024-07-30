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
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    signIn: 'https://api.attualizecontabil.com.br/api/users/authenticate',
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
    list: 'https://api.attualizecontabil.com.br/api/clientes',
    create: 'https://api.attualizecontabil.com.br/api/financeiro/invoice/create',
    update: 'https://api.attualizecontabil.com.br/api/clientes',
  },
  invoices: {
    list: 'https://api.attualizecontabil.com.br/api/financeiro/invoices',
    create: 'https://api.attualizecontabil.com.br/api/financeiro/invoice/create',
    update: 'https://api.attualizecontabil.com.br/api/financeiro/invoice/update',
    delete: 'https://api.attualizecontabil.com.br/api/financeiro/invoice/',
    checkout: 'https://api.attualizecontabil.com.br/api/checkout/orcamento',
  },
};
