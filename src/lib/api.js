import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9443';

// Configuração do Axios conforme documentação
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Interceptor para adicionar token JWT (usando sistema existente)
api.interceptors.request.use((config) => {
  const token = getTokenFromCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros (usando sistema existente)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Usar o sistema de logout existente
      if (typeof window !== 'undefined') {
        // Limpar cookies
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // Redirecionar para login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Função para obter o token do cookie (mantendo sistema existente)
const getTokenFromCookie = () => {
  if (typeof document === 'undefined') return null;
  
  // Usar js-cookie para obter o token
  const token = Cookies.get('access_token');
  
  if (token) {
    console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
    return token;
  }
  
  console.log('🔑 Token não encontrado nos cookies');
  return null;
};

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = getTokenFromCookie();
    
    console.log('🌐 API Request:', {
      endpoint: `${API_BASE_URL}${endpoint}`,
      hasToken: !!token,
      method: options.method || 'GET'
    });
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    console.log('🌐 API Response:', {
      status: response.status,
      ok: response.ok,
      endpoint
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🌐 API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        endpoint
      });
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
};

// Funções específicas para chat seguindo o guia
export const chatAPI = {
  // GET /all
  async getAllChats(filters = {}) {
    const params = new URLSearchParams();
    if (filters.instanceType) params.append('instanceType', filters.instanceType);
    if (filters.status) params.append('status', filters.status);
    if (filters.sector) params.append('sector', filters.sector);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    return apiClient.request(`/api/chat/all?${params.toString()}`);
  },

  // GET /user/:userId?
  async getUserChats(instanceType) {
    const params = instanceType ? `?instanceType=${instanceType}` : '';
    return apiClient.request(`/api/chat/user${params}`);
  },

  // GET /sector/:sector
  async getSectorChats(sector, instanceType) {
    const params = instanceType ? `?instanceType=${instanceType}` : '';
    return apiClient.request(`/api/chat/sector/${sector}${params}`);
  },

  // POST /queue/next/:sector/:instanceType
  async getNextChatFromQueue(sector, instanceType) {
    return apiClient.request(`/api/chat/queue/next/${sector}/${instanceType}`, {
      method: 'POST'
    });
  },

  // POST /assign/:chatId
  async assignChatToUser(chatId) {
    return apiClient.request(`/api/chat/assign/${chatId}`, {
      method: 'POST'
    });
  },

  // POST /transfer/:chatId
  async transferChat(chatId, targetUserId, targetSector) {
    return apiClient.request(`/api/chat/transfer/${chatId}`, {
      method: 'POST',
      body: JSON.stringify({
        targetUserId,
        targetSector
      })
    });
  },

  // POST /close/:chatId
  async closeChat(chatId) {
    return apiClient.request(`/api/chat/close/${chatId}`, {
      method: 'POST'
    });
  },

  // POST /message/:chatId
  async sendMessage(chatId, content) {
    console.log('📤 API sendMessage - Enviando:', {
      chatId,
      content,
      contentLength: content?.length,
      contentType: typeof content
    });
    
    const response = await apiClient.request(`/api/chat/message/${chatId}`, {
      method: 'POST',
      body: JSON.stringify({
        content
      })
    });
    
    console.log('📤 API sendMessage - Resposta:', response);
    return response;
  },

  // GET /messages/:chatId
  async getChatMessages(chatId, limit = 50, offset = 0) {
    console.log('📥 API getChatMessages - Buscando:', { chatId, limit, offset });
    
    const response = await apiClient.request(`/api/chat/messages/${chatId}?limit=${limit}&offset=${offset}`);
    
    console.log('📥 API getChatMessages - Resposta:', {
      success: response.success,
      dataLength: response.data?.length,
      firstMessage: response.data?.[0] ? {
        id: response.data[0]._id,
        content: response.data[0].content,
        type: response.data[0].type,
        direction: response.data[0].direction
      } : null
    });
    
    return response;
  },

  // GET /stats
  async getInstanceStats() {
    return apiClient.request('/api/chat/stats');
  },

  // ===== ENDPOINTS ESPECÍFICOS DA FILA =====
  
  // GET /queue/stats - Estatísticas da fila
  async getQueueStats(sector, instanceType) {
    const params = new URLSearchParams();
    if (sector) params.append('sector', sector);
    if (instanceType) params.append('instanceType', instanceType);
    
    const queryString = params.toString();
    return apiClient.request(`/api/chat/queue/stats${queryString ? `?${queryString}` : ''}`);
  },

  // GET /queue/assign-next/:sector/:instanceType - Pegar próximo chat da fila
  async assignNextFromQueue(sector, instanceType) {
    return apiClient.request(`/api/chat/queue/assign-next/${sector}/${instanceType}`);
  },

  // GET /user/active - Chats ativos do usuário
  async getActiveUserChats() {
    return apiClient.request('/api/chat/user/active');
  },

  // POST /close/:chatId - Fechar chat (nova versão)
  async closeChatNew(chatId) {
    return apiClient.request(`/api/chat/close/${chatId}`, {
      method: 'POST'
    });
  },

  // POST /return-to-queue/:chatId - Retornar chat para fila
  async returnChatToQueue(chatId) {
    return apiClient.request(`/api/chat/return-to-queue/${chatId}`, {
      method: 'POST'
    });
  }
};
