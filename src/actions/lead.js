import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// FUNÇÕES EXISTENTES (mantidas)
// ----------------------------------------------------------------------

export async function criarLead(leadData) {
  const res = await axios.post(endpoints.marketing.create, leadData);
  return res.data;
}

export async function buscarDadosDashboard(params = {}  ) {
  const res = await axios.get(endpoints.marketing.dashboard, {
    params
  });
  return res.data;
}

export async function atualizarLead(id, leadData) {
  const res = await axios.put(`${endpoints.marketing.update}/${id}`, leadData);
  return res.data;
}

export async function getLeads() {
  const res = await axios.get(`${endpoints.marketing.getLeads}`);
  return res.data;
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
