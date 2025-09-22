import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

const CONTACTS_ENDPOINT = endpoints.contacts.list;

const swrOptions = {
  revalidateIfStale: true,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
};

// ----------------------------------------------------------------------

export function useGetContacts(filters = {}) {
  const { instanceType, search, tags } = filters;
  
  const params = new URLSearchParams();
  if (instanceType) params.append('instanceType', instanceType);
  if (search) params.append('search', search);
  if (tags && tags.length > 0) params.append('tags', tags.join(','));
  
  const url = params.toString() ? `${CONTACTS_ENDPOINT}?${params}` : CONTACTS_ENDPOINT;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      contacts: data?.data || [],
      contactsLoading: isLoading,
      contactsError: error,
      contactsValidating: isValidating,
      contactsEmpty: !isLoading && !data?.data?.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetContact(contactId) {
  const url = contactId ? `${CONTACTS_ENDPOINT}/${contactId}` : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      contact: data?.data,
      contactLoading: isLoading,
      contactError: error,
      contactValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetContactStats() {
  const url = `${CONTACTS_ENDPOINT}/stats`;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

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

// ----------------------------------------------------------------------

export async function createContact(contactData) {
  try {
    const response = await axios.post(CONTACTS_ENDPOINT, contactData);
    
    // Invalidate contacts list
    mutate(CONTACTS_ENDPOINT);
    
    return response.data;
  } catch (error) {
    console.error('Erro ao criar contato:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function updateContact(contactId, contactData) {
  try {
    const response = await axios.put(`${CONTACTS_ENDPOINT}/${contactId}`, contactData);
    
    // Invalidate contacts list and specific contact
    mutate(CONTACTS_ENDPOINT);
    mutate(`${CONTACTS_ENDPOINT}/${contactId}`);
    
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar contato:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function deleteContact(contactId) {
  try {
    const response = await axios.delete(`${CONTACTS_ENDPOINT}/${contactId}`);
    
    // Invalidate contacts list
    mutate(CONTACTS_ENDPOINT);
    
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar contato:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function startConversation(contactId, userId, instanceType) {
  try {
    const response = await axios.post(`${CONTACTS_ENDPOINT}/${contactId}/conversation`, {
      userId,
      instanceType
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao iniciar conversa:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function sendQuickMessage(contactId, message, userId) {
  try {
    const response = await axios.post(`${CONTACTS_ENDPOINT}/${contactId}/message`, {
      content: message,
      userId
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem rápida:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function addContactTag(contactId, tag) {
  try {
    const response = await axios.post(`${CONTACTS_ENDPOINT}/${contactId}/tags`, { tag });
    
    // Invalidate contacts list and specific contact
    mutate(CONTACTS_ENDPOINT);
    mutate(`${CONTACTS_ENDPOINT}/${contactId}`);
    
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar tag:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function removeContactTag(contactId, tag) {
  try {
    const response = await axios.delete(`${CONTACTS_ENDPOINT}/${contactId}/tags/${tag}`);
    
    // Invalidate contacts list and specific contact
    mutate(CONTACTS_ENDPOINT);
    mutate(`${CONTACTS_ENDPOINT}/${contactId}`);
    
    return response.data;
  } catch (error) {
    console.error('Erro ao remover tag:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function getContactChatHistory(contactId) {
  try {
    const response = await axios.get(`${CONTACTS_ENDPOINT}/${contactId}/chats`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar histórico de chats:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function blockContact(contactId) {
  try {
    const response = await axios.post(`${CONTACTS_ENDPOINT}/${contactId}/block`);
    
    // Invalidate contacts list and specific contact
    mutate(CONTACTS_ENDPOINT);
    mutate(`${CONTACTS_ENDPOINT}/${contactId}`);
    
    return response.data;
  } catch (error) {
    console.error('Erro ao bloquear contato:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function unblockContact(contactId) {
  try {
    const response = await axios.post(`${CONTACTS_ENDPOINT}/${contactId}/unblock`);
    
    // Invalidate contacts list and specific contact
    mutate(CONTACTS_ENDPOINT);
    mutate(`${CONTACTS_ENDPOINT}/${contactId}`);
    
    return response.data;
  } catch (error) {
    console.error('Erro ao desbloquear contato:', error);
    throw error;
  }
}
