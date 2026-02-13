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

export const baseUrl = process.env.NEXT_PUBLIC_API_URL;


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
    atualizarDados: `${baseUrl}clientes/atualizar-dados`,
    servicos: {
      admin: `${baseUrl}clientes/servicos/admin/all`,
    },
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
  fiscal: {
    atividades: {
      list: `${baseUrl}fiscal/atividades`,
      create: `${baseUrl}fiscal/atividades`,
      update: `${baseUrl}fiscal/atividades`,
      delete: `${baseUrl}fiscal/atividades`,
    },
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
    getLeads: `${baseUrl}marketing/leads`,
    getLeadOrigens: `${baseUrl}marketing/lead/origens`,
    create: `${baseUrl}marketing/criar/lead`,
    update: (leadId) => `${baseUrl}marketing/atualizar/lead/${leadId}`,
    progress: `${baseUrl}marketing/lead/progress`,
    contacts: (leadId) => `${baseUrl}marketing/lead/${leadId}/contacts`,
    contactStatus: (leadId) => `${baseUrl}marketing/lead/${leadId}/contact-status`,
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
      admin: `${baseUrl}servicos`,
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
  avaliacoes: {
    root: `${baseUrl}avaliacoes`,
    byId: (id) => `${baseUrl}avaliacoes/${id}`,
    estatisticas: (clienteProprietarioId) => `${baseUrl}avaliacoes/estatisticas/${clienteProprietarioId}`,
    tiposFeedback: `${baseUrl}avaliacoes/tipos-feedback/lista`,
    responder: (id) => `${baseUrl}avaliacoes/${id}/responder`,
    status: (id) => `${baseUrl}avaliacoes/${id}/status`,
    delete: (id) => `${baseUrl}avaliacoes/${id}`,
  },
  // Mercado Pago
  mercadoPago: {
    pagamentoUnico: `${baseUrl}mercado-pago/pagamento-unico`,
    parcelamento: `${baseUrl}mercado-pago/parcelamento`,
    assinatura: `${baseUrl}mercado-pago/assinatura`,
    assinaturaDetalhes: (contratoId) => `${baseUrl}mercado-pago/assinatura/${contratoId}`,
    assinaturaPausar: (contratoId) => `${baseUrl}mercado-pago/assinatura/${contratoId}/pausar`,
    assinaturaReativar: (contratoId) => `${baseUrl}mercado-pago/assinatura/${contratoId}/reativar`,
    assinaturaCancelar: (contratoId) => `${baseUrl}mercado-pago/assinatura/${contratoId}/cancelar`,
    pagamento: (pagamentoId) => `${baseUrl}mercado-pago/pagamento/${pagamentoId}`,
    pagamentosCliente: (clienteId) => `${baseUrl}mercado-pago/cliente/${clienteId}/pagamentos`,
  },
  // Conciliação Bancária
  conciliacao: {
    upload: `${baseUrl}reconciliation/upload`,
    listar: (clienteId) => `${baseUrl}reconciliation/cliente/${clienteId}`,
    detalhes: (conciliacaoId) => `${baseUrl}reconciliation/${conciliacaoId}`,
    confirmar: (conciliacaoId) => `${baseUrl}reconciliation/${conciliacaoId}/confirm`,
    exportar: (conciliacaoId) => `${baseUrl}reconciliation/${conciliacaoId}/export`,
    download: (fileName) => `${baseUrl}reconciliation/download/${fileName}`,
  },
  // Plano de Contas
  planoContas: {
    importar: `${baseUrl}plano-contas/importar`,
    listar: (clienteId) => `${baseUrl}plano-contas/${clienteId}`,
    analiticas: (clienteId) => `${baseUrl}plano-contas/${clienteId}/analiticas`,
    porCodigo: (clienteId, codigo) => `${baseUrl}plano-contas/${clienteId}/codigo/${codigo}`,
    buscar: (clienteId, termo, limite = 20) => `${baseUrl}plano-contas/${clienteId}/buscar?termo=${termo}&limite=${limite}`,
    sugerir: (clienteId, descricao) => `${baseUrl}plano-contas/${clienteId}/sugerir?descricao=${descricao}`,
    verificar: (clienteId) => `${baseUrl}plano-contas/${clienteId}/verificar`,
    estatisticas: (clienteId) => `${baseUrl}plano-contas/${clienteId}/estatisticas`,
    atualizar: (clienteId, codigo) => `${baseUrl}plano-contas/${clienteId}/${codigo}`,
    desativar: (clienteId, codigo) => `${baseUrl}plano-contas/${clienteId}/${codigo}`,
  },
  // PIX
  pix: {
    qrcode: {
      gerar: `${baseUrl}pix/qrcode`,
      consultar: (txid) => `${baseUrl}pix/qrcode/${txid}`,
    },
    cobranca: {
      consultar: (txid) => `${baseUrl}pix/cob/${txid}`,
      listar: `${baseUrl}pix/cob`,
    },
    recebidos: {
      listar: `${baseUrl}pix/recebidos`,
      consultar: (e2eid) => `${baseUrl}pix/recebidos/${e2eid}`,
      devolver: (e2eid, idDevolucao) => `${baseUrl}pix/recebidos/${e2eid}/devolucao/${idDevolucao}`,
    },
    logs: {
      listar: `${baseUrl}pix/logs`,
      estatisticas: `${baseUrl}pix/logs/estatisticas`,
    },
    relatorios: {
      recebidos: `${baseUrl}pix/relatorios/recebidos`,
    },
  },
  // Guias Fiscais
  guiasFiscais: {
    upload: `${baseUrl}guias-fiscais/upload`,
    list: `${baseUrl}guias-fiscais`,
    get: (id) => `${baseUrl}guias-fiscais/${id}`,
    update: (id) => `${baseUrl}guias-fiscais/${id}`,
    delete: (id) => `${baseUrl}guias-fiscais/${id}`,
    batch: `${baseUrl}guias-fiscais/batch`,
    download: (id) => `${baseUrl}guias-fiscais/${id}/download`,
    portal: {
      list: `${baseUrl}portal/guias-fiscais`,
      get: (id) => `${baseUrl}portal/guias-fiscais/${id}`,
      download: (id) => `${baseUrl}portal/guias-fiscais/${id}/download`,
    },
  },
  // Indicação
  indicacao: {
    codigo: `${baseUrl}indicacao/codigo`,
    link: `${baseUrl}indicacao/link`,
    criar: `${baseUrl}indicacao/criar`,
    minhas: `${baseUrl}indicacao/minhas`,
    detalhes: (id) => `${baseUrl}indicacao/${id}`,
    validarCodigo: (codigo) => `${baseUrl}indicacao/validar/${codigo}`,
  },
  // Recompensa
  recompensa: {
    conta: `${baseUrl}recompensa/conta`,
    solicitarDesconto: `${baseUrl}recompensa/solicitar-desconto`,
    solicitarPix: `${baseUrl}recompensa/solicitar-pix`,
    transacoes: `${baseUrl}recompensa/transacoes`,
    pixPendentes: `${baseUrl}recompensa/pix/pendentes`,
    descontosPendentes: '/recompensa/descontos/pendentes',
    aprovarTransacao: (id) => `${baseUrl}recompensa/transacao/${id}/aprovar`,
    rejeitarTransacao: (id) => `${baseUrl}recompensa/transacao/${id}/rejeitar`,
    aprovarDesconto: (id) => `${baseUrl}recompensa/desconto/${id}/aprovar`,
    aplicarDescontoManual: `${baseUrl}recompensa/desconto/aplicar-manual`,
  },
};
