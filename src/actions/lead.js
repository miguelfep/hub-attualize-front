import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// FUNÇÕES EXISTENTES (mantidas)
// ----------------------------------------------------------------------

export async function criarLead(leadData) {
  const res = await axios.post(endpoints.marketing.create, leadData);
  return res.data;
}

export async function buscarDadosDashboard(params = {}) {
  const res = await axios.get(endpoints.marketing.dashboard, {
    params
  });
  return res.data;
}

export async function atualizarLead(id, leadData) {
  const res = await axios.put(`${endpoints.marketing.update}/${id}`, leadData);
  return res.data;
}

/**
 * Buscar leads
 * @param {Object} params - Parâmetros de busca
 * @param {boolean} params.incluirConvertidos - Incluir leads convertidos (default: false)
 * @param {string} params.statusLead - Filtrar por status específico ('novo', 'contatado', 'convertido', etc.)
 * @returns {Promise<Object>} Resposta com lista de leads
 */
export async function getLeads(params = {}) {
  const queryParams = {};
  
  if (params.incluirConvertidos) {
    queryParams.incluirConvertidos = 'true';
  }
  
  if (params.statusLead) {
    queryParams.statusLead = params.statusLead;
  }

  try {
    const res = await axios.get(`${endpoints.marketing.getLeads}`, { params: queryParams });
    
    // Normalizar resposta da API (pode vir em diferentes formatos)
    const data = res.data || res;
    
    // Se for array direto, retornar
    if (Array.isArray(data)) {
      return data;
    }
    
    // Se for objeto com success e leads
    if (data?.success && Array.isArray(data.leads)) {
      return data.leads;
    }
    
    // Se for objeto com leads
    if (Array.isArray(data?.leads)) {
      return data.leads;
    }
    
    // Se for objeto com data
    if (Array.isArray(data?.data)) {
      return data.data;
    }
    
    // Se não conseguir normalizar, retornar array vazio
    console.warn('Formato de resposta inesperado da API de leads:', data);
    return [];
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    
    // Se o erro vier do interceptor (já processado), pode ser string
    if (typeof error === 'string') {
      console.error('Erro do interceptor:', error);
      return [];
    }
    
    // Se for objeto de erro, logar detalhes
    if (error?.response) {
      console.error('Erro HTTP:', error.response.status, error.response.data);
    }
    
    // Retornar array vazio em caso de erro para não quebrar o código
    return [];
  }
}

export async function buscarDashboardFinanceiroPagar(params = {}) {
  try {
    const response = await axios.get(endpoints.marketing.financeiro.pagar, {
      params
    });
    return response.data;
  } catch (error) {
    console.log('Erro ao buscar dados financeiros', error);
    return error;
  }
}

export async function buscarDashboardFinanceiroReceber(params = {}) {
  try {
    const response = await axios.get(endpoints.marketing.financeiro.receber, {
      params
    });
    return response.data;
  } catch (error) {
    console.log('Erro ao buscar dados financeiros', error);
    return error;
  }
}

// ----------------------------------------------------------------------
// NOVAS FUNÇÕES - Stepper de Abertura de CNPJ
// ----------------------------------------------------------------------

/**
 * Salvar ou atualizar progresso do lead (upsert progressivo)
 * @param {Object} leadData - Dados do lead
 * @returns {Promise<Object>} - Resposta da API com leadId
 */
export async function saveLeadProgress(leadData) {
  try {
    console.log('📤 Enviando para:', endpoints.marketing.progress);
    console.log('📦 Dados:', leadData);

    const response = await axios.post(endpoints.marketing.progress, leadData);

    console.log('📡 Status da resposta:', response.status);
    console.log('✅ Resposta da API:', response.data);

    return {
      success: true,
      leadId: response.data.leadId,
      lead: response.data.lead,
    };
  } catch (error) {
    console.error('❌ Erro ao salvar lead:', error);
    console.error('🔍 Endpoint usado:', endpoints.marketing.progress);

    // Axios coloca a resposta de erro em error.response
    const errorMessage = error.response?.data?.message || error.message || 'Erro ao salvar progresso do lead';

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Criar lead inicial (primeira etapa)
 * @param {Object} dadosIniciais - nome, email, telefone, origem
 * @returns {Promise<Object>}
 */
export async function createLead(dadosIniciais) {
  const leadData = {
    nome: dadosIniciais.nome,
    email: dadosIniciais.email,
    telefone: dadosIniciais.telefone,
    origem: dadosIniciais.origem || 'landing-psicologo',
    segment: 'psicologo',
    paginasVisitadas: dadosIniciais.paginasVisitadas || ['/contabilidade-para-psicologos'],
    additionalInfo: {
      etapa: 'dados-pessoais',
      dataNascimento: dadosIniciais.dataNascimento,
    },
  };

  return saveLeadProgress(leadData);
}

/**
 * Atualizar lead existente (etapas seguintes)
 * @param {string} leadId - ID do lead
 * @param {Object} dados - Dados a atualizar
 * @param {string} etapa - Nome da etapa atual
 * @returns {Promise<Object>}
 */
export async function updateLeadProgress(leadId, dados, etapa) {
  const leadData = {
    id: leadId,
    ...dados,
    additionalInfo: {
      ...(dados.additionalInfo || {}),
      etapa,
      ultimaAtualizacao: new Date().toISOString(),
    },
  };

  return saveLeadProgress(leadData);
}

/**
 * Adicionar contato ao histórico do lead
 * @param {string} leadId - ID do lead
 * @param {Object} contato - Dados do contato
 * @returns {Promise<Object>}
 */
export async function addLeadContact(leadId, contato) {
  try {
    const url = endpoints.marketing.contacts(leadId);
    console.log('📞 Adicionando contato ao lead:', url);

    const response = await axios.post(url, contato);

    console.log('✅ Contato adicionado:', response.data);

    return {
      success: true,
      leadId: response.data.leadId,
      lead: response.data.lead,
    };
  } catch (error) {
    console.error('❌ Erro ao adicionar contato:', error);

    const errorMessage = error.response?.data?.message || error.message || 'Erro ao adicionar contato';

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Atualizar status/follow-up do lead
 * @param {string} leadId - ID do lead
 * @param {Object} updates - { statusLead, nextFollowUpAt, owner }
 * @returns {Promise<Object>}
 */
export async function updateLeadStatus(leadId, updates) {
  try {
    const url = endpoints.marketing.contactStatus(leadId);
    console.log('📝 Atualizando status do lead:', url);

    const response = await axios.patch(url, updates);

    console.log('✅ Status atualizado:', response.data);

    return {
      success: true,
      leadId: response.data.leadId,
      lead: response.data.lead,
    };
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);

    const errorMessage = error.response?.data?.message || error.message || 'Erro ao atualizar status';

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Buscar histórico de contatos do lead
 * @param {string} leadId - ID do lead
 * @returns {Promise<Object>}
 */
export async function getLeadContacts(leadId) {
  try {
    const url = endpoints.marketing.contacts(leadId);
    console.log('📋 Buscando histórico de contatos:', url);

    const response = await axios.get(url);

    console.log('✅ Contatos encontrados:', response.data.contatos?.length || 0);

    return {
      success: true,
      lead: response.data.lead,
      contatos: response.data.contatos || [],
    };
  } catch (error) {
    console.error('❌ Erro ao buscar contatos:', error);

    const errorMessage = error.response?.data?.message || error.message || 'Erro ao buscar contatos';

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Buscar todos os leads (lista completa)
 * @returns {Promise<Object>}
 */
export async function getLeadById(id) {
  try {
    const response = await axios.get(`${endpoints.marketing.getLeads}/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar lead:', error);
    return error;
  }
}

export async function getAllLeadsOrigens() {
  try {
    const res = await axios.get(endpoints.marketing.getLeadOrigens);
    const { data } = res;
    if (Array.isArray(data)) {
      return data;
    }
    return data?.data || data?.origens || data?.items || [];
  } catch (error) {
    console.error('❌ Erro ao buscar origens:', error);
    return [];
  }
}

// ----------------------------------------------------------------------

/**
 * Buscar leads convertidos com paginação
 * @param {Object} params - Parâmetros de paginação
 * @param {number} params.page - Número da página (default: 1)
 * @param {number} params.limit - Itens por página (default: 50)
 * @returns {Promise<Object>} Resposta com leads convertidos e paginação
 */
export async function buscarLeadsConvertidos(params = {}) {
  const queryParams = {
    page: params.page || 1,
    limit: params.limit || 50,
  };

  const res = await axios.get(`${endpoints.marketing.getLeads}/convertidos`, {
    params: queryParams,
  });
  return res.data;
}

/**
 * Buscar contatos de todos os leads convertidos
 * @returns {Promise<Object>} Resposta com contatos de todos os leads convertidos
 */
export async function buscarContatosLeadsConvertidos() {
  try {
    const res = await axios.get(`${endpoints.marketing.getLeads.replace('/leads', '/lead')}/convertidos/contacts`);
    return res.data;
  } catch (error) {
    console.error('❌ Erro ao buscar contatos de leads convertidos:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Erro ao buscar contatos';
    return {
      success: false,
      error: errorMessage,
      data: [],
      total: 0,
    };
  }
}

/**
 * Buscar invoices de todos os leads convertidos
 * @returns {Promise<Object>} Resposta com invoices de todos os leads convertidos
 */
export async function buscarInvoicesLeadsConvertidos() {
  try {
    // Usar a URL completa da API conforme documentação
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await axios.get(`${baseUrl}financeiro/invoices/lead/convertidos`);
    return res.data;
  } catch (error) {
    console.error('❌ Erro ao buscar invoices de leads convertidos:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Erro ao buscar invoices';
    return {
      success: false,
      error: errorMessage,
      invoices: [],
      total: 0,
      totalLeads: 0,
    };
  }
}
