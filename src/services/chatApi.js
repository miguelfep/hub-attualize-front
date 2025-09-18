import axios from 'axios';
import { endpoints } from 'src/utils/axios';

// Serviço de API para o sistema de chat com suporte a 2 instâncias
export const chatApi = {
  // Buscar chats do usuário (com filtro opcional por instância)
  getUserChats: async (userId, instanceType) => {
    const url = instanceType 
      ? `${endpoints.chat.userChats}/${userId}?instance=${instanceType}`
      : `${endpoints.chat.userChats}/${userId}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Buscar chats do setor (com filtro opcional por instância)
  getSectorChats: async (sector, instanceType) => {
    const url = instanceType 
      ? `${endpoints.chat.sectorChats}/${sector}?instance=${instanceType}`
      : `${endpoints.chat.sectorChats}/${sector}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Buscar chats por instância específica
  getChatsByInstance: async (instanceType) => {
    const response = await axios.get(`${endpoints.chat.chatsByInstance}/${instanceType}`);
    return response.data;
  },

  // Buscar mensagens do chat
  getChatMessages: async (chatId, limit = 50, offset = 0) => {
    const response = await axios.get(
      `${endpoints.chat.messages}/${chatId}?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  // Enviar mensagem
  sendMessage: async (chatId, data) => {
    const response = await axios.post(`${endpoints.chat.message}/${chatId}`, data);
    return response.data;
  },

  // Transferir chat (com suporte a transferência entre instâncias)
  transferChat: async (chatId, data) => {
    const response = await axios.post(`${endpoints.chat.transfer}/${chatId}`, data);
    return response.data;
  },

  // Fechar chat
  closeChat: async (chatId, userId) => {
    const response = await axios.post(`${endpoints.chat.close}/${chatId}`, { userId });
    return response.data;
  },

  // Buscar estatísticas por instância
  getInstanceStats: async () => {
    const response = await axios.get(endpoints.chat.instanceStats);
    return response.data;
  },
}; 