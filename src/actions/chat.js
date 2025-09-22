import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { chatAPI } from 'src/lib/api';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: true,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
};

// ----------------------------------------------------------------------

// Hook para buscar todos os chats (dashboard)
export function useGetAllChats(filters = {}) {
  const { status, instanceType, sector, limit, offset } = filters;
  
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (instanceType) params.append('instanceType', instanceType);
  if (sector) params.append('sector', sector);
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  
  const url = `/api/chat/all?${params.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR(url, async () => {
    console.log('🔍 useGetAllChats - Fetching:', url);
    const response = await chatAPI.getAllChats(filters);
    console.log('🔍 useGetAllChats - Response:', response);
    return response;
  }, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      chats: data?.data?.chats || [],
      chatsLoading: isLoading,
      chatsError: error,
      chatsValidating: isValidating,
      chatsEmpty: !isLoading && !data?.data?.chats?.length,
    }),
    [data?.data?.chats, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

// Hook para buscar chats do usuário
export function useGetUserChats(instanceType) {
  const url = instanceType ? `/api/chat/user?instanceType=${instanceType}` : '/api/chat/user';

  const { data, isLoading, error, isValidating } = useSWR(url, async () => {
    const response = await chatAPI.getUserChats(instanceType);
    return response;
  }, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      chats: data?.data?.chats || [],
      chatsLoading: isLoading,
      chatsError: error,
      chatsValidating: isValidating,
      chatsEmpty: !isLoading && !data?.data?.chats?.length,
    }),
    [data?.data?.chats, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

// Hook para buscar chats por setor
export function useGetSectorChats(sector, instanceType) {
  const url = instanceType ? `/api/chat/sector/${sector}?instanceType=${instanceType}` : `/api/chat/sector/${sector}`;

  const { data, isLoading, error, isValidating } = useSWR(url, async () => {
    const response = await chatAPI.getSectorChats(sector, instanceType);
    return response;
  }, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      chats: data?.data?.chats || [],
      chatsLoading: isLoading,
      chatsError: error,
      chatsValidating: isValidating,
      chatsEmpty: !isLoading && !data?.data?.chats?.length,
    }),
    [data?.data?.chats, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

// Hook para buscar mensagens de um chat específico
export function useGetChatMessages(chatId, limit = 50, offset = 0) {
  const url = chatId ? `/api/chat/messages/${chatId}?limit=${limit}&offset=${offset}` : '';

  const { data, isLoading, error, isValidating } = useSWR(url, async () => {
    console.log('📥 useGetChatMessages - Buscando mensagens:', { chatId, url });
    const response = await chatAPI.getChatMessages(chatId, limit, offset);
    console.log('📥 useGetChatMessages - Resposta:', response);
    return response;
  }, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      messages: data?.data || [], // API retorna data como array direto
      messagesLoading: isLoading,
      messagesError: error,
      messagesValidating: isValidating,
      messagesEmpty: !isLoading && !data?.data?.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  console.log('📥 useGetChatMessages - Estado:', {
    chatId,
    messagesCount: memoizedValue.messages.length,
    isLoading,
    isValidating,
    hasData: !!data
  });

  return memoizedValue;
}

// ----------------------------------------------------------------------

// Hook para buscar estatísticas
export function useGetChatStats() {
  const url = '/api/chat/stats';

  const { data, isLoading, error, isValidating } = useSWR(url, async () => {
    const response = await chatAPI.getInstanceStats();
    return response;
  }, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      stats: data?.data || {},
      statsLoading: isLoading,
      statsError: error,
      statsValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ===== HOOKS ESPECÍFICOS DA FILA =====

// Hook para buscar estatísticas da fila
export function useGetQueueStats(sector, instanceType) {
  const url = sector && instanceType 
    ? `/api/chat/queue/stats?sector=${sector}&instanceType=${instanceType}`
    : '/api/chat/queue/stats';

  const { data, isLoading, error, isValidating } = useSWR(url, async () => {
    const response = await chatAPI.getQueueStats(sector, instanceType);
    return response;
  }, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      queueStats: data?.data || {},
      queueStatsLoading: isLoading,
      queueStatsError: error,
      queueStatsValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// Hook para buscar chats ativos do usuário
export function useGetActiveUserChats() {
  const url = '/api/chat/user/active';

  const { data, isLoading, error, isValidating } = useSWR(url, async () => {
    const response = await chatAPI.getActiveUserChats();
    return response;
  }, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      activeChats: data?.data || [],
      activeChatsLoading: isLoading,
      activeChatsError: error,
      activeChatsValidating: isValidating,
      activeChatsEmpty: !isLoading && !data?.data?.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

// Funções para ações
export async function getNextChatFromQueue(sector, instanceType) {
  try {
    const response = await chatAPI.assignNextFromQueue(sector, instanceType);
    
    // Invalidate relevant caches
    mutate('/api/chat/all');
    mutate('/api/chat/user');
    mutate('/api/chat/user/active');
    mutate('/api/chat/queue/stats');
    
    return response;
  } catch (error) {
    console.error('Erro ao pegar próximo chat da fila:', error);
    throw error;
  }
}

export async function assignChat(chatId) {
  try {
    const response = await chatAPI.assignChatToUser(chatId);
    
    // Invalidate relevant caches
    mutate('/api/chat/all');
    mutate('/api/chat/user');
    
    return response;
  } catch (error) {
    console.error('Erro ao atribuir chat:', error);
    throw error;
  }
}

export async function transferChat(chatId, targetUserId, targetSector) {
  try {
    const response = await chatAPI.transferChat(chatId, targetUserId, targetSector);
    
    // Invalidate relevant caches
    mutate('/api/chat/all');
    mutate('/api/chat/user');
    
    return response;
  } catch (error) {
    console.error('Erro ao transferir chat:', error);
    throw error;
  }
}

export async function closeChat(chatId) {
  try {
    const response = await chatAPI.closeChat(chatId);
    
    // Invalidate relevant caches
    mutate('/api/chat/all');
    mutate('/api/chat/user');
    
    return response;
  } catch (error) {
    console.error('Erro ao fechar chat:', error);
    throw error;
  }
}

export async function sendMessage(chatId, content) {
  try {
    console.log('📤 sendMessage - Enviando:', { chatId, content });
    const response = await chatAPI.sendMessage(chatId, content);
    console.log('📤 sendMessage - Resposta:', response);

    // Invalidate messages cache
    console.log('🔄 Invalidando cache SWR...');
    
    // Invalidar e revalidar cache de mensagens
    mutate(`/api/chat/messages/${chatId}`, undefined, { revalidate: true });
    mutate('/api/chat/all', undefined, { revalidate: true });
    
    // Aguardar um pouco para garantir que a API processou a mensagem
    setTimeout(() => {
      console.log('🔄 Revalidando cache após delay...');
      mutate(`/api/chat/messages/${chatId}`, undefined, { revalidate: true });
    }, 500);
    
    console.log('✅ Cache SWR invalidado e revalidado');

    return response;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

// Funções de compatibilidade com o sistema existente
export function useGetContacts() {
  return useGetAllChats();
}

export function useGetConversations() {
  return useGetUserChats();
}

export function useGetConversation(conversationId) {
  return useGetChatMessages(conversationId);
}

export async function clickConversation(conversationId) {
  try {
    // Implementar se necessário
    return { success: true };
  } catch (error) {
    console.error('Erro ao marcar conversa como lida:', error);
    throw error;
  }
}

export async function createConversation(conversationData) {
  try {
    // Implementar se necessário
    return { success: true, data: { _id: 'temp-id' } };
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    throw error;
  }
}

export async function getConversationMessages(conversationId, page = 1, limit = 50) {
  try {
    const response = await chatAPI.getChatMessages(conversationId, limit, (page - 1) * limit);
    return response;
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    throw error;
  }
}

export async function deleteMessage(conversationId, messageId) {
  try {
    // Implementar se necessário
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    throw error;
  }
}

// ===== FUNÇÕES ESPECÍFICAS DA FILA =====

export async function returnChatToQueue(chatId) {
  try {
    const response = await chatAPI.returnChatToQueue(chatId);
    
    // Invalidate relevant caches
    mutate('/api/chat/all');
    mutate('/api/chat/user');
    mutate('/api/chat/user/active');
    mutate('/api/chat/queue/stats');
    
    return response;
  } catch (error) {
    console.error('Erro ao retornar chat para fila:', error);
    throw error;
  }
}

export async function pauseChat(chatId) {
  try {
    // Implementar se necessário - pode usar a mesma lógica de pausar
    const response = await chatAPI.closeChat(chatId);
    
    // Invalidate relevant caches
    mutate('/api/chat/all');
    mutate('/api/chat/user');
    mutate('/api/chat/user/active');
    
    return response;
  } catch (error) {
    console.error('Erro ao pausar chat:', error);
    throw error;
  }
}

export async function resumeChat(chatId) {
  try {
    // Implementar se necessário - pode usar a mesma lógica de reativar
    const response = await chatAPI.assignChatToUser(chatId);
    
    // Invalidate relevant caches
    mutate('/api/chat/all');
    mutate('/api/chat/user');
    mutate('/api/chat/user/active');
    
    return response;
  } catch (error) {
    console.error('Erro ao retomar chat:', error);
    throw error;
  }
}
