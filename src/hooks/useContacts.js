import { useState, useEffect, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { contactApi } from 'src/services/contactApi';

// Função auxiliar para garantir que os dados sejam um array
const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.contacts && Array.isArray(data.contacts)) return data.contacts;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
};

// Hook para buscar contatos com filtros
export function useContacts(filters = {}) {
  const { data, error, isLoading } = useSWR(
    ['contacts', filters],
    () => contactApi.getContacts(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Atualizar a cada 30 segundos
    }
  );

  const contacts = ensureArray(data);

  return {
    contacts,
    isLoading,
    error,
    refetch: () => mutate(['contacts', filters])
  };
}

// Hook para buscar contatos por instância
export function useContactsByInstance(instanceType) {
  const { data, error, isLoading } = useSWR(
    ['contacts', 'instance', instanceType],
    () => contactApi.getContactsByInstance(instanceType),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
    }
  );

  const contacts = ensureArray(data);

  return {
    contacts,
    isLoading,
    error,
    refetch: () => mutate(['contacts', 'instance', instanceType])
  };
}

// Hook para estatísticas de contatos
export function useContactStats(instanceType) {
  const { data, error, isLoading } = useSWR(
    ['contacts', 'stats', instanceType],
    () => contactApi.getContactStats(instanceType),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Atualizar a cada minuto
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    refetch: () => mutate(['contacts', 'stats', instanceType])
  };
}

// Hook para ações de contatos
export function useContactActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startConversation = useCallback(async (contactId, instanceType, userId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contactApi.startConversation(contactId, instanceType, userId);
      
      // Invalidar cache de chats
      mutate(['chats']);
      mutate(['contacts']);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessageToContact = useCallback(async (contactId, content, userId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contactApi.sendMessageToContact(contactId, content, userId);
      
      // Invalidar cache de chats e mensagens
      mutate(['chats']);
      mutate(['messages']);
      mutate(['contacts']);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateContact = useCallback(async (contactId, updateData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contactApi.updateContact(contactId, updateData);
      
      // Invalidar cache de contatos
      mutate(['contacts']);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteContact = useCallback(async (contactId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await contactApi.deleteContact(contactId);
      
      // Invalidar cache de contatos
      mutate(['contacts']);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    startConversation,
    sendMessageToContact,
    updateContact,
    deleteContact,
    isLoading,
    error
  };
} 