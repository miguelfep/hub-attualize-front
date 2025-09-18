import { Contact, ContactFilters, ContactStats } from 'src/types/contact';

const API_BASE = 'http://localhost:9443/api';

export const contactApi = {
  // Buscar contatos com filtros
  getContacts: async (filters: ContactFilters = {}): Promise<Contact[]> => {
    const params = new URLSearchParams();
    
    if (filters.instanceType && filters.instanceType !== 'all') {
      params.append('instanceType', filters.instanceType);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    if (filters.hasClient !== undefined) {
      params.append('hasClient', filters.hasClient.toString());
    }

    const response = await fetch(`${API_BASE}/contact?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar contatos');
    }
    
    const data = await response.json();
    return data.data || [];
  },

  // Buscar contatos por instância
  getContactsByInstance: async (instanceType: 'operacional' | 'financeiro-comercial'): Promise<Contact[]> => {
    const response = await fetch(`${API_BASE}/contact/instance/${instanceType}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar contatos por instância');
    }
    
    const data = await response.json();
    return data.data || [];
  },

  // Iniciar conversa com contato
  startConversation: async (contactId: string, instanceType: 'operacional' | 'financeiro-comercial', userId: string): Promise<any> => {
    const response = await fetch(`${API_BASE}/contact/${contactId}/start-conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instanceType,
        userId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao iniciar conversa');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Enviar mensagem para contato
  sendMessageToContact: async (contactId: string, content: string, userId: string): Promise<any> => {
    const response = await fetch(`${API_BASE}/contact/${contactId}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        userId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao enviar mensagem');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Atualizar contato
  updateContact: async (contactId: string, updateData: {
    name?: string;
    tags?: string[];
    notes?: string;
    clienteId?: string;
  }): Promise<Contact> => {
    const response = await fetch(`${API_BASE}/contact/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar contato');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Deletar contato
  deleteContact: async (contactId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/contact/${contactId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao deletar contato');
    }
  },

  // Buscar contatos por tags
  getContactsByTags: async (tags: string[], instanceType?: string): Promise<Contact[]> => {
    const params = new URLSearchParams();
    params.append('tags', tags.join(','));
    
    if (instanceType) {
      params.append('instanceType', instanceType);
    }

    const response = await fetch(`${API_BASE}/contact/tags/${instanceType || 'all'}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar contatos por tags');
    }
    
    const data = await response.json();
    return data.data || [];
  },

  // Obter estatísticas de contatos
  getContactStats: async (instanceType?: string): Promise<ContactStats> => {
    const params = new URLSearchParams();
    if (instanceType) {
      params.append('instanceType', instanceType);
    }

    const response = await fetch(`${API_BASE}/contact/stats?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas de contatos');
    }
    
    const data = await response.json();
    return data.data;
  }
}; 