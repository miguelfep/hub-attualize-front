'use client';

import { useState, useEffect, useCallback } from 'react';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { EmptyContent } from 'src/components/empty-content';

import { useMockedUser } from 'src/auth/hooks';

// Importar hooks da API real
import { useChats, useChatMessages, useChatActions, useInstanceStats } from 'src/hooks/useChat';

import { Layout } from '../layout';
import { ChatNav } from '../chat-nav';
import { ChatRoom } from '../chat-room';
import { ChatMessageList } from '../chat-message-list';
import { ChatMessageInput } from '../chat-message-input';
import { ChatHeaderDetail } from '../chat-header-detail';
import { ChatHeaderCompose } from '../chat-header-compose';
import { useCollapseNav } from '../hooks/use-collapse-nav';

// ----------------------------------------------------------------------

export function ChatView() {
  const router = useRouter();

  const { user } = useMockedUser();

  const searchParams = useSearchParams();

  const selectedConversationId = searchParams.get('id') || '';

  const [recipients, setRecipients] = useState([]);
  const [instanceFilter, setInstanceFilter] = useState('all'); // 'all', 'operacional', 'financeiro-comercial'

  const roomNav = useCollapseNav();

  const conversationsNav = useCollapseNav();

  // Usar hooks da API real
  const { chats, chatsLoading, chatsError } = useChats(instanceFilter);
  const { messages, messagesLoading, messagesError } = useChatMessages(selectedConversationId);
  const { stats, statsLoading } = useInstanceStats();
  const { sendMessage } = useChatActions();

  // Converter chats da API para formato esperado pelo tema
  const conversations = chats.map(chat => ({
    id: chat._id,
    instanceType: chat.instanceType,
    status: chat.status,
    participants: [
      {
        id: chat.whatsappNumber,
        name: chat.clienteName || 'Cliente',
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

  // Criar objeto byId para o formato esperado pelo ChatNav
  const conversationsById = {};
  conversations.forEach(conv => {
    conversationsById[conv.id] = conv;
  });

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);
  
  // Garantir que sempre temos participants válidos
  const participants = selectedConversation && selectedConversation.participants
    ? selectedConversation.participants.filter((participant) => participant.id !== `${user?.id}`)
    : [];

  const handleAddRecipients = useCallback((selected) => {
    setRecipients(selected);
  }, []);

  const handleInstanceFilterChange = useCallback((newFilter) => {
    setInstanceFilter(newFilter);
  }, []);

  // Tratar erros da API
  if (chatsError) {
    console.error('Erro ao carregar chats:', chatsError);
  }

  if (messagesError) {
    console.error('Erro ao carregar mensagens:', messagesError);
  }

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}
    >
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Chat WhatsApp - 2 Instâncias
      </Typography>

      <Layout
        sx={{
          minHeight: 0,
          flex: '1 1 0',
          borderRadius: 2,
          position: 'relative',
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows.card,
        }}
        slots={{
          header: selectedConversationId ? (
            <ChatHeaderDetail
              collapseNav={roomNav}
              participants={participants}
              loading={messagesLoading}
              chatId={selectedConversationId}
              chatStatus={selectedConversation?.status}
              instanceType={selectedConversation?.instanceType}
            />
          ) : (
            <ChatHeaderCompose contacts={[]} onAddRecipients={handleAddRecipients} />
          ),
          nav: (
            <ChatNav
              contacts={[]}
              conversations={{ byId: conversationsById, allIds: conversations.map(c => c.id) }}
              loading={chatsLoading}
              selectedConversationId={selectedConversationId}
              collapseNav={conversationsNav}
              instanceFilter={instanceFilter}
              onInstanceFilterChange={handleInstanceFilterChange}
              showStats={true}
              stats={stats}
            />
          ),
          main: (
            <>
              {selectedConversationId ? (
                <ChatMessageList
                  messages={messages}
                  participants={participants}
                  loading={messagesLoading}
                />
              ) : (
                <EmptyContent
                  imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-chat-active.svg`}
                  title="Bem-vindo ao Chat WhatsApp!"
                  description="Selecione uma conversa para começar..."
                />
              )}

              <ChatMessageInput
                recipients={recipients}
                onAddRecipients={handleAddRecipients}
                selectedConversationId={selectedConversationId}
                disabled={!recipients.length && !selectedConversationId}
              />
            </>
          ),
          details: selectedConversationId && (
            <ChatRoom
              collapseNav={roomNav}
              participants={participants}
              loading={messagesLoading}
              messages={messages}
            />
          ),
        }}
      />
    </DashboardContent>
  );
}
