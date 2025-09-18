import axios from 'axios';
import { endpoints } from 'src/utils/axios';
import type { 
  Chat, 
  Message, 
  TransferChatData, 
  SendMessageData, 
  InstanceStats,
  InstanceType 
} from 'src/types/chat';

// Serviço de API para o sistema de chat com suporte a 2 instâncias
export const chatApi = {
  // Buscar chats do usuário (com filtro opcional por instância)
  getUserChats: async (userId: string, instanceType?: InstanceType): Promise<Chat[]> => {
    const url = instanceType 
      ? `${endpoints.chat.userChats}/${userId}?instance=${instanceType}`
      : `${endpoints.chat.userChats}/${userId}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Buscar chats do setor (com filtro opcional por instância)
  getSectorChats: async (sector: string, instanceType?: InstanceType): Promise<Chat[]> => {
    const url = instanceType 
      ? `${endpoints.chat.sectorChats}/${sector}?instance=${instanceType}`
      : `${endpoints.chat.sectorChats}/${sector}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Buscar chats por instância específica
  getChatsByInstance: async (instanceType: InstanceType): Promise<Chat[]> => {
    const response = await axios.get(`${endpoints.chat.chatsByInstance}/${instanceType}`);
    return response.data;
  },

  // Buscar mensagens do chat
  getChatMessages: async (
    chatId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> => {
    const response = await axios.get(
      `${endpoints.chat.messages}/${chatId}?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  // Enviar mensagem
  sendMessage: async (chatId: string, data: SendMessageData): Promise<Message> => {
    const response = await axios.post(`${endpoints.chat.message}/${chatId}`, data);
    return response.data;
  },

  // Transferir chat (com suporte a transferência entre instâncias)
  transferChat: async (chatId: string, data: TransferChatData): Promise<Chat> => {
    const response = await axios.post(`${endpoints.chat.transfer}/${chatId}`, data);
    return response.data;
  },

  // Fechar chat
  closeChat: async (chatId: string, userId: string): Promise<Chat> => {
    const response = await axios.post(`${endpoints.chat.close}/${chatId}`, { userId });
    return response.data;
  },

  // Buscar estatísticas por instância
  getInstanceStats: async (): Promise<InstanceStats> => {
    const response = await axios.get(endpoints.chat.instanceStats);
    return response.data;
  },
}; 