import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { chatApi } from 'src/services/chatApi';
import { useMockedUser } from 'src/auth/hooks';

// Função auxiliar para garantir que os dados sejam um array
const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.chats && Array.isArray(data.chats)) return data.chats;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

// ----------------------------------------------------------------------

// Hook para buscar chats (combinando usuário e setor)
export function useGetChats() {
  const { user } = useMockedUser();
  
  // Buscar chats do usuário e do setor
  const userChatsKey = user?.id ? `user-chats-${user.id}` : null;
  const sectorChatsKey = user?.sector ? `sector-chats-${user.sector}` : null;

  const { data: userChatsData, isLoading: userChatsLoading, error: userChatsError } = useSWR(
    userChatsKey,
    () => chatApi.getUserChats(user.id)
  );

  const { data: sectorChatsData, isLoading: sectorChatsLoading, error: sectorChatsError } = useSWR(
    sectorChatsKey,
    () => chatApi.getSectorChats(user.sector)
  );

  const memoizedValue = useMemo(() => {
    // Garantir que os dados sejam arrays
    const userChats = ensureArray(userChatsData);
    const sectorChats = ensureArray(sectorChatsData);
    
    // Combinar chats do usuário e setor, removendo duplicatas
    const allChats = [...userChats, ...sectorChats];
    const uniqueChats = allChats.filter((chat, index, self) => 
      index === self.findIndex(c => c._id === chat._id)
    );

    // Converter para formato esperado pelo tema
    const conversations = uniqueChats.map(chat => ({
      id: chat._id,
      instanceType: chat.instanceType,
      status: chat.status,
      participants: [
        {
          id: chat.whatsappNumber,
          name: chat.clienteName,
          avatarUrl: null,
          address: chat.whatsappNumber,
          phoneNumber: chat.whatsappNumber,
          lastActivity: chat.lastMessageAt,
          status: chat.status === 'em_atendimento' ? 'online' : 'offline',
        }
      ],
      type: 'ONE_TO_ONE',
      unreadCount: 0,
      messages: [],
    }));

    const byId = {};
    conversations.forEach(conv => {
      byId[conv.id] = conv;
    });

    return {
      conversations: { byId, allIds: Object.keys(byId) },
      conversationsLoading: userChatsLoading || sectorChatsLoading,
      conversationsError: userChatsError || sectorChatsError,
      conversationsEmpty: !userChatsLoading && !sectorChatsLoading && uniqueChats.length === 0,
    };
  }, [userChatsData, sectorChatsData, userChatsLoading, sectorChatsLoading, userChatsError, sectorChatsError]);

  return memoizedValue;
}

// Hook para buscar mensagens de um chat específico
export function useGetChatMessages(chatId) {
  const { user } = useMockedUser();
  
  const { data, isLoading, error } = useSWR(
    chatId ? `chat-messages-${chatId}` : null,
    () => chatApi.getChatMessages(chatId)
  );

  const memoizedValue = useMemo(() => {
    // Garantir que as mensagens sejam um array
    const messages = ensureArray(data);
    
    // Converter mensagens para formato esperado pelo tema
    const formattedMessages = messages.map(message => ({
      id: message._id,
      body: message.content || message.body || 'Mensagem sem conteúdo',
      contentType: message.type || 'text',
      attachments: message.mediaUrl ? [{ 
        name: message.fileName || 'file',
        size: 0,
        type: message.mimeType || 'application/octet-stream',
        path: message.mediaUrl,
        preview: message.mediaUrl,
        createdAt: message.timestamp,
      }] : [],
      createdAt: new Date(message.timestamp || message.createdAt || new Date()),
      senderId: message.fromMe ? `${user?.id}` : message.remoteJid || message.senderId,
    }));

    return {
      messages: formattedMessages,
      messagesLoading: isLoading,
      messagesError: error,
    };
  }, [data, isLoading, error, user?.id]);

  return memoizedValue;
}

// Hook para buscar conversação específica
export function useGetConversation(conversationId) {
  const { messages, messagesLoading, messagesError } = useGetChatMessages(conversationId);
  
  const { data: chatData, isLoading: chatLoading, error: chatError } = useSWR(
    conversationId ? `chat-${conversationId}` : null,
    async () => {
      // Buscar dados do chat específico
      const operacionalChats = await chatApi.getChatsByInstance('operacional');
      const financeiroChats = await chatApi.getChatsByInstance('financeiro-comercial');
      const allChats = [...ensureArray(operacionalChats), ...ensureArray(financeiroChats)];
      return allChats.find(chat => chat._id === conversationId);
    }
  );

  const memoizedValue = useMemo(() => {
    if (!chatData) {
      return {
        conversation: null,
        conversationLoading: chatLoading || messagesLoading,
        conversationError: chatError || messagesError,
      };
    }

    const conversation = {
      id: chatData._id,
      instanceType: chatData.instanceType,
      status: chatData.status,
      participants: [
        {
          id: chatData.whatsappNumber,
          name: chatData.clienteName,
          avatarUrl: null,
          address: chatData.whatsappNumber,
          phoneNumber: chatData.whatsappNumber,
          status: chatData.status === 'em_atendimento' ? 'online' : 'offline',
        }
      ],
      type: 'ONE_TO_ONE',
      unreadCount: 0,
      messages,
    };

    return {
      conversation,
      conversationLoading: chatLoading || messagesLoading,
      conversationError: chatError || messagesError,
    };
  }, [chatData, messages, chatLoading, messagesLoading, chatError, messagesError]);

  return memoizedValue;
}

// Função para enviar mensagem
export async function sendMessage(conversationId, messageData) {
  const { user } = useMockedUser();
  
  try {
    await chatApi.sendMessage(conversationId, {
      content: messageData.body,
      userId: user.id,
    });

    // Atualizar cache das mensagens
    mutate(`chat-messages-${conversationId}`);
    
    // Atualizar cache das conversações
    mutate((key) => typeof key === 'string' && key.includes('chats'));
    
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}

// Manter compatibilidade com funções existentes
export function useGetContacts() {
  return {
    contacts: [],
    contactsLoading: false,
    contactsError: null,
    contactsValidating: false,
    contactsEmpty: true,
  };
}

export function useGetConversations() {
  return useGetChats();
}

export async function createConversation() {
  // Implementar se necessário
  throw new Error('createConversation não implementado para WhatsApp');
}

export async function clickConversation() {
  // Implementar se necessário (marcar como lido)
}
