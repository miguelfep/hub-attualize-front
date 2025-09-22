'use client';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import { useAuthContext } from 'src/auth/hooks';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { 
  useGetAllChats, 
  useGetUserChats,
  useGetSectorChats,
  useGetChatMessages, 
  useGetQueueStats,
  sendMessage, 
  transferChat, 
  closeChat, 
  assignChat
} from 'src/actions/chat';
import { mutate } from 'swr';
import { useGetContacts, startConversation } from 'src/actions/contacts';
import { useSocket, useChatEvents, useQueueEvents, useNotifications } from 'src/hooks/use-socket';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { MessageRenderer } from 'src/components/chat/MessageRenderer';

// import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const CHAT_STATUS_COLORS = {
  na_fila: 'warning',
  em_atendimento: 'success',
  fechado: 'error',
  pausado: 'info',
};

const CHAT_STATUS_LABELS = {
  na_fila: 'Na Fila',
  em_atendimento: 'Em Atendimento',
  fechado: 'Fechado',
  pausado: 'Pausado',
};

// ----------------------------------------------------------------------

export function ChatDashboardUnified() {
  const router = useRouter();

  const { user } = useAuthContext();
  console.log('🔍 User Debug:', {
    user,
    instanceType: user?.instanceType,
    sector: user?.sector,
    id: user?.id,
    userKeys: user ? Object.keys(user) : [],
    userFull: user
  });
  

  // Usar dados reais do usuário autenticado
  const currentUser = user ? {
    id: user.id || user._id || user.userId,
    name: user.name || user.nome || user.displayName,
    sector: user.sector || user.setor || user.department || 'atendimento',
    instanceType: user.instanceType || user.tipoInstancia || user.type || 'operacional'
  } : {
    id: 'user123',
    name: 'Operador',
    sector: 'atendimento',
    instanceType: 'operacional'
  };

  // Estados
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('geral'); // 'pessoal', 'setor', 'geral', 'contatos'
  const [isLoading, setIsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  // Hooks para dados
  const { chats: allChats, chatsLoading, chatsError } = useGetAllChats({ limit: 50 });
  const { chats: userChats, chatsLoading: userChatsLoading, chatsError: userChatsError } = useGetUserChats();
  const { chats: sectorChats, chatsLoading: sectorChatsLoading, chatsError: sectorChatsError } = useGetSectorChats(currentUser?.sector || 'atendimento');
  const { contacts, contactsLoading, contactsError } = useGetContacts({ 
    instanceType: currentUser?.instanceType || 'operacional',
    search: contactSearch 
  });
  const { messages, messagesLoading } = useGetChatMessages(selectedChatId);
  const { queueStats } = useGetQueueStats(currentUser?.sector || 'atendimento', currentUser?.instanceType || 'operacional');

  // Debug dos dados
  console.log('🔍 Debug Dados:', {
    allChats: allChats.length,
    userChats: userChats.length,
    sectorChats: sectorChats.length,
    contacts: contacts?.length || 0,
    currentUser: currentUser,
    activeTab,
    geralCount: allChats.filter(chat => chat.instanceType === currentUser?.instanceType).length,
    allChatsInstanceTypes: allChats.map(chat => chat.instanceType),
    allChatsData: allChats.map(chat => ({
      id: chat._id,
      name: chat.name || chat.clienteName,
      status: chat.status,
      instanceType: chat.instanceType,
      assignedUserId: chat.assignedUserId
    })),
    chatsLoading,
    chatsError
  });

  // Hooks para WebSocket
  const { isConnected } = useSocket();
  const { typingUsers, startTyping, stopTyping, chatStatus } = useChatEvents(selectedChatId);
  const { queueStats: realtimeStats, newMessagesInQueue } = useQueueEvents(currentUser?.sector || 'atendimento', currentUser?.instanceType || 'operacional');
  const { notifications } = useNotifications();

  // Listener para mensagens em tempo real
  useEffect(() => {
    const handleNewMessage = (event) => {
      const data = event.detail;
      console.log('📨 Nova mensagem recebida via WebSocket:', data);
      
      // Se a mensagem é para o chat atual, invalidar cache
      if (data.chatId === selectedChatId) {
        console.log('🔄 Invalidando cache para chat atual...');
        mutate(`/api/chat/messages/${selectedChatId}`, undefined, { revalidate: true });
      }
    };

    window.addEventListener('newMessage', handleNewMessage);
    
    return () => {
      window.removeEventListener('newMessage', handleNewMessage);
    };
  }, [selectedChatId]);

  // Filtrar chats por categoria conforme documentação do backend
  const getChatsByCategory = () => {
    console.log('🔍 getChatsByCategory - activeTab:', activeTab);
    
    switch (activeTab) {
      case 'pessoal':
        // Fila Pessoal - Chats atribuídos ao usuário (incluindo fechados)
        const pessoalChats = userChats.filter(chat => {
          const assignedUserId = typeof chat.assignedUserId === 'object' 
            ? chat.assignedUserId?._id 
            : chat.assignedUserId;
          return assignedUserId === currentUser?.id;
        });
        console.log('🔍 Pessoal chats:', pessoalChats.length);
        return pessoalChats;
      case 'setor':
        // Fila do Setor - Chats do setor do usuário (incluindo na fila)
        const setorChats = sectorChats.filter(chat => 
          chat.assignedSectorId === currentUser?.sector && 
          (chat.status !== 'fechado' || !chat.assignedUserId)
        );
        console.log('🔍 Setor chats:', setorChats.length);
        return setorChats;
      case 'geral':
        // Fila Geral - Todos os chats da instância (incluindo fechados)
        console.log('🔍 Geral - ANTES do filtro:', {
          allChats: allChats.length,
          allChatsData: allChats.map(chat => ({
            id: chat._id,
            name: chat.name || chat.clienteName,
            instanceType: chat.instanceType,
            status: chat.status
          })),
          currentUserInstanceType: currentUser?.instanceType
        });
        
        // Temporariamente mostrar TODOS os chats para debug
        const geralChats = allChats; // Removendo filtro temporariamente
        
        console.log('🔍 Geral - DEPOIS do filtro:', {
          filtered: geralChats.length,
          chats: geralChats.map(chat => ({
            id: chat._id,
            name: chat.name || chat.clienteName,
            instanceType: chat.instanceType,
            status: chat.status
          }))
        });
        return geralChats;
      case 'contatos':
        // Contatos - Todos os contatos disponíveis para iniciar conversa
        console.log('🔍 Contatos:', contacts?.length || 0);
        return contacts || [];
      default:
        console.log('🔍 Default case - returning empty array');
        return [];
    }
  };

  const currentChats = getChatsByCategory();

  // Chat selecionado
  const selectedChat = activeTab === 'contatos' 
    ? contacts?.find(contact => contact._id === selectedChatId)
    : allChats.find(chat => chat._id === selectedChatId);


  // Atribuir chat a si mesmo
  const handleAssignToMe = useCallback(async (chatId) => {
    try {
      await assignChat(chatId);
      setSelectedChatId(chatId);
      setActiveTab('pessoal');
    } catch (error) {
      console.error('Erro ao atribuir chat:', error);
    }
  }, []);

  // Selecionar chat
  const handleSelectChat = useCallback((chatId) => {
    setSelectedChatId(chatId);
  }, []);

  // Selecionar contato
  const handleSelectContact = useCallback((contact) => {
    setSelectedChatId(contact._id);
  }, []);

  // Selecionar item (chat ou contato)
  const handleSelectItem = useCallback((item) => {
    if (activeTab === 'contatos') {
      handleSelectContact(item);
    } else {
      handleSelectChat(item._id);
    }
  }, [activeTab, handleSelectContact, handleSelectChat]);

  // Enviar mensagem
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !selectedChatId || isSending) return;

    console.log('📤 Enviando mensagem:', {
      chatId: selectedChatId,
      message: message,
      messageLength: message?.length,
      messageType: typeof message,
      isSending
    });

    try {
      setIsSending(true);
      const response = await sendMessage(selectedChatId, message);
      console.log('📤 Mensagem enviada com sucesso:', response);
      setMessage('');
      stopTyping();
      
      // Forçar atualização das mensagens via SWR
      setTimeout(() => {
        console.log('🔄 Forçando atualização das mensagens...');
        // Invalidar cache SWR para forçar revalidação
        mutate(`/api/chat/messages/${selectedChatId}`, undefined, { revalidate: true });
      }, 500);
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  }, [message, selectedChatId, isSending, stopTyping]);

  // Fechar chat
  const handleCloseChat = useCallback(async (chatId) => {
    try {
      await closeChat(chatId);
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
    } catch (error) {
      console.error('Erro ao fechar chat:', error);
    }
  }, [selectedChatId]);

  // Reabrir chat
  const handleReopenChat = useCallback(async (chatId) => {
    try {
      // Reabrir chat atribuindo ao usuário atual
      await assignChat(chatId);
      setSelectedChatId(chatId);
      setActiveTab('pessoal');
    } catch (error) {
      console.error('Erro ao reabrir chat:', error);
    }
  }, []);

  // Iniciar conversa com contato
  const handleStartConversation = useCallback(async (contact) => {
    try {
      // Verificar se já existe um chat com este contato
      const existingChat = allChats.find(chat => 
        chat.whatsappNumber === contact.whatsappNumber || 
        chat.clienteName === contact.name
      );

      if (existingChat) {
        // Se já existe, atribuir a si mesmo e abrir
        await assignChat(existingChat._id);
        setSelectedChatId(existingChat._id);
        setActiveTab('pessoal');
      } else {
        // Criar novo chat/chamado usando a função startConversation
        const data = await startConversation(contact._id, currentUser?.id, currentUser?.instanceType || 'operacional');
        if (data.success) {
          // O chat foi criado e atribuído ao usuário
          setActiveTab('pessoal');
          setSelectedChatId(data.data._id);
        }
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    }
  }, [allChats, currentUser]);

  // Verificar se pode interagir com o chat/contato
  const canInteractWithChat = (item) => {
    // Verificar se item existe
    if (!item) return 'indisponivel';
    
    // Se é um contato (aba contatos), pode iniciar conversa
    if (activeTab === 'contatos') return 'iniciar';
    
    // Se é um chat (abas pessoal, setor, geral)
    // Se chat está fechado, pode reabrir
    if (item.status === 'fechado') return 'reabrir';
    
    // Se chat está atribuído ao usuário (assignedUserId pode ser string ou objeto)
    const assignedUserId = typeof item.assignedUserId === 'object' 
      ? item.assignedUserId?._id 
      : item.assignedUserId;
    
    if (assignedUserId === currentUser?.id) return 'conversar';
    
    // Se chat está na fila (sem usuário atribuído), pode pegar
    if (!assignedUserId && item.status !== 'fechado') return 'pegar';
    
    // Se chat está com outro usuário, está ocupado
    if (assignedUserId && assignedUserId !== currentUser?.id) return 'ocupado';
    
    return 'indisponivel';
  };

  // Usar estatísticas em tempo real se disponíveis
  const currentStats = realtimeStats && Object.keys(realtimeStats).length > 0 ? realtimeStats : queueStats;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">
          Dashboard de Chats
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip 
            label={isConnected ? 'Conectado' : 'Desconectado'} 
            color={isConnected ? 'success' : 'error'} 
            size="small" 
          />
          
          {notifications.length > 0 && (
            <Badge badgeContent={notifications.length} color="error">
              <Iconify icon="eva:bell-fill" />
            </Badge>
          )}
          
        </Stack>
      </Paper>

      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* Sidebar - Lista de Chats */}
        <Box sx={{ width: 400, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          {/* Tabs */}
          <Paper sx={{ p: 1 }}>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant={activeTab === 'pessoal' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('pessoal')}
              >
                Pessoal ({userChats.filter(chat => {
                  const assignedUserId = typeof chat.assignedUserId === 'object' 
                    ? chat.assignedUserId?._id 
                    : chat.assignedUserId;
                  return assignedUserId === currentUser?.id;
                }).length})
              </Button>
              <Button
                size="small"
                variant={activeTab === 'setor' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('setor')}
              >
                Setor ({sectorChats.filter(chat => chat.assignedSectorId === currentUser?.sector).length})
              </Button>
              <Button
                size="small"
                variant={activeTab === 'geral' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('geral')}
              >
                Geral ({allChats.filter(chat => chat.instanceType === currentUser?.instanceType).length})
              </Button>
              <Button
                size="small"
                variant={activeTab === 'contatos' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('contatos')}
              >
                Contatos ({contacts?.length || 0})
              </Button>
            </Stack>
          </Paper>

          {/* Estatísticas ou Busca de Contatos */}
          {activeTab === 'contatos' ? (
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>
                Buscar Contatos
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Digite o nome ou número do contato..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          ) : (
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>
                Estatísticas do Setor
              </Typography>
              <Stack direction="row" spacing={2}>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {currentStats?.naFila || 0}
                  </Typography>
                  <Typography variant="caption">Na Fila</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {currentStats?.emAtendimento || 0}
                  </Typography>
                  <Typography variant="caption">Atendendo</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="info.main">
                    {currentStats?.tempoMedioEspera || 0}min
                  </Typography>
                  <Typography variant="caption">Tempo Médio</Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Lista de Chats */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {currentChats.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Iconify 
                  icon={activeTab === 'contatos' ? "eva:person-outline" : "eva:message-circle-outline"} 
                  width={48} 
                  sx={{ color: 'text.secondary', mb: 2 }} 
                />
                <Typography variant="body2" color="text.secondary">
                  {activeTab === 'contatos' 
                    ? contactSearch 
                      ? 'Nenhum contato encontrado' 
                      : 'Nenhum contato disponível'
                    : 'Nenhum chat encontrado'
                  }
                </Typography>
                {activeTab === 'contatos' && contactSearch && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Tente buscar por nome ou número do WhatsApp
                  </Typography>
                )}
              </Box>
            ) : (
              <List>
                {currentChats.filter(item => item).map((item) => {
                  const interaction = canInteractWithChat(item);
                  const isSelected = selectedChatId === item._id;
                  
                  return (
                    <ListItem key={item._id || item.whatsappNumber} disablePadding>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => handleSelectItem(item)}
                        sx={{ flexDirection: 'column', alignItems: 'flex-start', p: 2 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {activeTab === 'contatos' 
                              ? item.name?.charAt(0)?.toUpperCase() || 'C'
                              : item.pushName?.charAt(0) || item.name?.charAt(0) || 'C'
                            }
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap>
                              {activeTab === 'contatos' 
                                ? item.name 
                                : item.name || item.clienteName
                              }
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {item.whatsappNumber}
                            </Typography>
                          </Box>
                          {activeTab !== 'contatos' && (
                            <Chip 
                              label={
                                (() => {
                                  const assignedUserId = typeof item.assignedUserId === 'object' 
                                    ? item.assignedUserId?._id 
                                    : item.assignedUserId;
                                  return !assignedUserId && item.status !== 'fechado' 
                                    ? 'Na Fila' 
                                    : CHAT_STATUS_LABELS[item.status] || item.status;
                                })()
                              } 
                              size="small" 
                              color={
                                (() => {
                                  const assignedUserId = typeof item.assignedUserId === 'object' 
                                    ? item.assignedUserId?._id 
                                    : item.assignedUserId;
                                  return !assignedUserId && item.status !== 'fechado'
                                    ? 'warning'
                                    : CHAT_STATUS_COLORS[item.status] || 'default';
                                })()
                              }
                            />
                          )}
                        </Stack>
                        
                        <Stack direction="row" spacing={1} sx={{ mt: 1, width: '100%' }}>
                          {activeTab === 'contatos' ? (
                            <Chip label="Contato" size="small" color="info" variant="outlined" />
                          ) : (
                            <>
                              {item.instanceType && (
                                <Chip label={item.instanceType} size="small" variant="outlined" />
                              )}
                              {item.assignedSectorId && (
                                <Chip label={item.assignedSectorId} size="small" variant="outlined" />
                              )}
                            </>
                          )}
                        </Stack>

                        {/* Ações baseadas no status */}
                        <Stack direction="row" spacing={1} sx={{ mt: 1, width: '100%' }}>
                          {interaction === 'conversar' && (
                            <Chip 
                              label="Conversar" 
                              size="small" 
                              color="success" 
                              icon={<Iconify icon="eva:message-circle-fill" />}
                            />
                          )}
                          {interaction === 'pegar' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignToMe(item._id);
                              }}
                              startIcon={<Iconify icon="eva:user-plus-fill" />}
                            >
                              Pegar Chat
                            </Button>
                          )}
                          {interaction === 'reabrir' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReopenChat(item._id);
                              }}
                              startIcon={<Iconify icon="eva:refresh-fill" />}
                            >
                              Reabrir Chat
                            </Button>
                          )}
                          {interaction === 'iniciar' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartConversation(item);
                              }}
                              startIcon={<Iconify icon="eva:message-circle-fill" />}
                            >
                              Abrir Chamado
                            </Button>
                          )}
                          {interaction === 'ocupado' && (
                            <Chip 
                              label="Ocupado" 
                              size="small" 
                              color="warning" 
                              icon={<Iconify icon="eva:user-fill" />}
                            />
                          )}
                        </Stack>
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Box>

        {/* Main Content - Chat */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedChatId ? (
            <>
              {/* Chat Header */}
              <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar>
                    {selectedChat?.clienteName?.charAt(0) || selectedChat?.name?.charAt(0) || 'C'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedChat?.clienteName || selectedChat?.name || 'Chat'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedChat?.whatsappNumber}
                    </Typography>
                    {selectedChat?.clienteId && (
                      <Typography variant="caption" color="primary.main">
                        Cliente: {selectedChat.clienteId.nome}
                      </Typography>
                    )}
                  </Box>
                </Stack>
                
                <Stack direction="row" spacing={1} alignItems="center">
                  {activeTab === 'contatos' ? (
                    <Chip 
                      label="Contato" 
                      color="info" 
                      size="small" 
                    />
                  ) : (
                    <Chip 
                      label={CHAT_STATUS_LABELS[selectedChat?.status] || selectedChat?.status} 
                      color={CHAT_STATUS_COLORS[selectedChat?.status] || 'default'} 
                      size="small" 
                    />
                  )}
                  {selectedChat?.instanceType && (
                    <Chip label={selectedChat.instanceType} size="small" variant="outlined" />
                  )}
                  {selectedChat?.assignedSectorId && (
                    <Chip label={selectedChat.assignedSectorId} size="small" variant="outlined" />
                  )}
                  
                  {activeTab !== 'contatos' && (
                    <Tooltip title="Fechar Chat">
                      <IconButton 
                        onClick={() => handleCloseChat(selectedChatId)}
                        color="error"
                      >
                        <Iconify icon="eva:close-fill" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Paper>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {activeTab === 'contatos' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 3, p: 3 }}>
                    <Avatar sx={{ width: 80, height: 80, fontSize: '2rem' }}>
                      {selectedChat?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </Avatar>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" gutterBottom>
                        {selectedChat?.name || 'Contato'}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {selectedChat?.whatsappNumber}
                      </Typography>
                      {selectedChat?.clienteId && (
                        <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
                          Cliente: {selectedChat.clienteId.nome}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleStartConversation(selectedChat)}
                      startIcon={<Iconify icon="eva:message-circle-fill" />}
                      sx={{ mt: 2 }}
                    >
                      Abrir Chamado
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center', maxWidth: 300 }}>
                      Clique em "Abrir Chamado" para iniciar uma nova conversa com este contato
                    </Typography>
                  </Box>
                ) : messagesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                      Nenhuma mensagem ainda
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {messages.map((message) => {
                      console.log('📝 Renderizando mensagem:', {
                        id: message._id,
                        content: message.content,
                        type: message.type,
                        direction: message.direction,
                        contentLength: message.content?.length
                      });
                      
                      return (
                        <Box
                          key={message._id}
                          sx={{
                            display: 'flex',
                            justifyContent: message.direction === 'outbound' ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <Box sx={{ maxWidth: '70%' }}>
                            <MessageRenderer 
                              message={message} 
                              isOwn={message.direction === 'outbound'} 
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                opacity: 0.7,
                                textAlign: message.direction === 'outbound' ? 'right' : 'left',
                              }}
                            >
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              {/* Message Input */}
              {canInteractWithChat(selectedChat) === 'conversar' && (
                <Paper sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      placeholder="Digite sua mensagem..."
                      variant="outlined"
                      size="small"
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending}
                      startIcon={
                        isSending ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <Iconify icon="eva:send-fill" />
                        )
                      }
                    >
                      Enviar
                    </Button>
                  </Stack>
                </Paper>
              )}

              {canInteractWithChat(selectedChat) !== 'conversar' && (
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Alert 
                    severity={canInteractWithChat(selectedChat) === 'reabrir' ? 'warning' : 'info'}
                    action={
                      canInteractWithChat(selectedChat) === 'reabrir' && (
                        <Button
                          color="inherit"
                          size="small"
                          onClick={() => handleReopenChat(selectedChatId)}
                          startIcon={<Iconify icon="eva:refresh-fill" />}
                        >
                          Reabrir Chat
                        </Button>
                      )
                    }
                  >
                    {canInteractWithChat(selectedChat) === 'atribuir' && 
                      'Este chat está no seu setor. Clique em "Atribuir a Mim" para começar a conversar.'
                    }
                    {canInteractWithChat(selectedChat) === 'reabrir' && 
                      'Este chat está fechado. Clique em "Reabrir Chat" para continuar a conversa.'
                    }
                    {canInteractWithChat(selectedChat) === 'ocupado' && 
                      'Este chat está sendo atendido por outro usuário.'
                    }
                    {canInteractWithChat(selectedChat) === 'indisponivel' && 
                      'Este chat não está disponível para interação.'
                    }
                  </Alert>
                </Paper>
              )}
            </>
          ) : (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}>
              <Iconify icon="eva:message-circle-outline" width={64} sx={{ color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary">
                Selecione um chat para começar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Escolha um chat da lista ao lado ou clique em "Pegar Próximo" para atender a fila
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
