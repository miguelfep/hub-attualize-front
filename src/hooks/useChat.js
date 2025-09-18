import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { chatApi } from 'src/services/chatApi';

// Função auxiliar para garantir que os dados sejam um array
const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.chats && Array.isArray(data.chats)) return data.chats;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

// Hook para buscar chats com filtro por instância
export function useChats(instanceFilter = 'all') {
  const { data: operacionalData, error: operacionalError, isLoading: operacionalLoading } = useSWR(
    instanceFilter === 'all' || instanceFilter === 'operacional' ? 'chats-operacional' : null,
    () => chatApi.getChatsByInstance('operacional')
  );

  const { data: financeiroData, error: financeiroError, isLoading: financeiroLoading } = useSWR(
    instanceFilter === 'all' || instanceFilter === 'financeiro-comercial' ? 'chats-financeiro' : null,
    () => chatApi.getChatsByInstance('financeiro-comercial')
  );

  const memoizedValue = useMemo(() => {
    // Garantir que os dados sejam arrays
    const operacionalChats = ensureArray(operacionalData);
    const financeiroChats = ensureArray(financeiroData);
    
    let allChats = [];
    
    if (instanceFilter === 'all') {
      allChats = [...operacionalChats, ...financeiroChats];
    } else if (instanceFilter === 'operacional') {
      allChats = operacionalChats;
    } else if (instanceFilter === 'financeiro-comercial') {
      allChats = financeiroChats;
    }

    return {
      chats: allChats,
      chatsLoading: operacionalLoading || financeiroLoading,
      chatsError: operacionalError || financeiroError,
      mutateChats: () => {
        mutate('chats-operacional');
        mutate('chats-financeiro');
      },
    };
  }, [operacionalData, financeiroData, operacionalLoading, financeiroLoading, operacionalError, financeiroError, instanceFilter]);

  return memoizedValue;
}

// Hook para buscar chats do usuário com filtro por instância
export function useUserChats(userId, instanceFilter = 'all') {
  const { data: operacionalData, error: operacionalError, isLoading: operacionalLoading } = useSWR(
    userId && (instanceFilter === 'all' || instanceFilter === 'operacional') ? `user-chats-operacional-${userId}` : null,
    () => chatApi.getUserChats(userId, 'operacional')
  );

  const { data: financeiroData, error: financeiroError, isLoading: financeiroLoading } = useSWR(
    userId && (instanceFilter === 'all' || instanceFilter === 'financeiro-comercial') ? `user-chats-financeiro-${userId}` : null,
    () => chatApi.getUserChats(userId, 'financeiro-comercial')
  );

  const memoizedValue = useMemo(() => {
    // Garantir que os dados sejam arrays
    const operacionalChats = ensureArray(operacionalData);
    const financeiroChats = ensureArray(financeiroData);
    
    let allChats = [];
    
    if (instanceFilter === 'all') {
      allChats = [...operacionalChats, ...financeiroChats];
    } else if (instanceFilter === 'operacional') {
      allChats = operacionalChats;
    } else if (instanceFilter === 'financeiro-comercial') {
      allChats = financeiroChats;
    }

    return {
      chats: allChats,
      chatsLoading: operacionalLoading || financeiroLoading,
      chatsError: operacionalError || financeiroError,
      mutateChats: () => {
        mutate(`user-chats-operacional-${userId}`);
        mutate(`user-chats-financeiro-${userId}`);
      },
    };
  }, [operacionalData, financeiroData, operacionalLoading, financeiroLoading, operacionalError, financeiroError, instanceFilter, userId]);

  return memoizedValue;
}

// Hook para buscar chats do setor com filtro por instância
export function useSectorChats(sector, instanceFilter = 'all') {
  const { data: operacionalData, error: operacionalError, isLoading: operacionalLoading } = useSWR(
    sector && (instanceFilter === 'all' || instanceFilter === 'operacional') ? `sector-chats-operacional-${sector}` : null,
    () => chatApi.getSectorChats(sector, 'operacional')
  );

  const { data: financeiroData, error: financeiroError, isLoading: financeiroLoading } = useSWR(
    sector && (instanceFilter === 'all' || instanceFilter === 'financeiro-comercial') ? `sector-chats-financeiro-${sector}` : null,
    () => chatApi.getSectorChats(sector, 'financeiro-comercial')
  );

  const memoizedValue = useMemo(() => {
    // Garantir que os dados sejam arrays
    const operacionalChats = ensureArray(operacionalData);
    const financeiroChats = ensureArray(financeiroData);
    
    let allChats = [];
    
    if (instanceFilter === 'all') {
      allChats = [...operacionalChats, ...financeiroChats];
    } else if (instanceFilter === 'operacional') {
      allChats = operacionalChats;
    } else if (instanceFilter === 'financeiro-comercial') {
      allChats = financeiroChats;
    }

    return {
      chats: allChats,
      chatsLoading: operacionalLoading || financeiroLoading,
      chatsError: operacionalError || financeiroError,
      mutateChats: () => {
        mutate(`sector-chats-operacional-${sector}`);
        mutate(`sector-chats-financeiro-${sector}`);
      },
    };
  }, [operacionalData, financeiroData, operacionalLoading, financeiroLoading, operacionalError, financeiroError, instanceFilter, sector]);

  return memoizedValue;
}

// Hook para buscar mensagens do chat
export function useChatMessages(chatId, limit = 50, offset = 0) {
  const { data, error, isLoading, mutate: mutateMessages } = useSWR(
    chatId ? `chat-messages-${chatId}-${limit}-${offset}` : null,
    () => chatApi.getChatMessages(chatId, limit, offset)
  );

  const memoizedValue = useMemo(() => {
    // Garantir que as mensagens sejam um array
    const messages = ensureArray(data);
    
    return {
      messages,
      messagesLoading: isLoading,
      messagesError: error,
      mutateMessages,
    };
  }, [data, error, isLoading, mutateMessages]);

  return memoizedValue;
}

// Hook para estatísticas das instâncias
export function useInstanceStats() {
  const { data, error, isLoading, mutate } = useSWR(
    'instance-stats',
    () => chatApi.getInstanceStats()
  );

  const memoizedValue = useMemo(() => {
    // Se não há dados, retornar estrutura padrão
    if (!data) {
      return {
        stats: {
          operacional: { total: 0, naFila: 0, emAtendimento: 0, fechados: 0 },
          financeiroComercial: { total: 0, naFila: 0, emAtendimento: 0, fechados: 0 }
        },
        statsLoading: isLoading,
        statsError: error,
        mutateStats: mutate,
      };
    }

    return {
      stats: data,
      statsLoading: isLoading,
      statsError: error,
      mutateStats: mutate,
    };
  }, [data, error, isLoading, mutate]);

  return memoizedValue;
}

// Hook para ações do chat
export function useChatActions() {
  const sendMessage = async (chatId, data) => {
    try {
      const newMessage = await chatApi.sendMessage(chatId, data);
      
      // Atualizar cache das mensagens
      mutate(`chat-messages-${chatId}-50-0`);
      
      return newMessage;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  };

  const transferChat = async (chatId, data) => {
    try {
      const updatedChat = await chatApi.transferChat(chatId, data);
      
      // Atualizar caches relevantes
      mutate((key) => typeof key === 'string' && key.includes('chats'));
      
      return updatedChat;
    } catch (error) {
      console.error('Erro ao transferir chat:', error);
      throw error;
    }
  };

  const closeChat = async (chatId, userId) => {
    try {
      const updatedChat = await chatApi.closeChat(chatId, userId);
      
      // Atualizar caches relevantes
      mutate((key) => typeof key === 'string' && key.includes('chats'));
      
      return updatedChat;
    } catch (error) {
      console.error('Erro ao fechar chat:', error);
      throw error;
    }
  };

  return {
    sendMessage,
    transferChat,
    closeChat,
  };
} 