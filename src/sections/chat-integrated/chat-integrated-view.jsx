'use client';

import { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useSocket, useChatEvents } from 'src/hooks/use-socket';

import { 
  closeChat, 
  pauseChat, 
  resumeChat, 
  sendMessage, 
  transferChat, 
  useGetUserChats, 
  useGetChatMessages 
} from 'src/actions/chat';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { MessageRenderer } from 'src/components/chat/MessageRenderer';
import { CloseChatDialog } from 'src/components/chat/CloseChatDialog';
import { TransferChatDialog } from 'src/components/chat/TransferChatDialog';

import { useMockedUser } from 'src/auth/hooks';

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

export function ChatIntegratedView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useMockedUser();

  const [selectedChatId, setSelectedChatId] = useState(searchParams.get('id'));
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const fileInputRef = useRef(null);

  // Hooks para dados
  const { chats, chatsLoading } = useGetUserChats(user?.id);
  const { messages, messagesLoading } = useGetChatMessages(selectedChatId);

  // Hooks para WebSocket
  const { isConnected } = useSocket();
  const { typingUsers, startTyping, stopTyping, chatStatus } = useChatEvents(selectedChatId);

  const selectedChat = chats.find(chat => chat._id === selectedChatId);

  // Enviar mensagem
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !selectedChatId || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(selectedChatId, message);
      setMessage('');
      stopTyping();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Aqui você pode adicionar uma notificação de erro
    } finally {
      setIsSending(false);
    }
  }, [message, selectedChatId, isSending, stopTyping]);

  // Gerenciar digitação
  const handleTyping = useCallback(() => {
    if (message.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  }, [message, startTyping, stopTyping]);

  // Transferir chat
  const handleTransferChat = useCallback(async (chatId, targetUserId, targetSector) => {
    try {
      await transferChat(chatId, targetUserId, targetSector);
      setSelectedChatId(null);
      // Aqui você pode adicionar uma notificação de sucesso
      console.log('Chat transferido com sucesso');
    } catch (error) {
      console.error('Erro ao transferir chat:', error);
      // Aqui você pode adicionar uma notificação de erro
    }
  }, []);

  // Fechar chat
  const handleCloseChat = useCallback(async (chatId, reason) => {
    try {
      await closeChat(chatId);
      setSelectedChatId(null);
      // Aqui você pode adicionar uma notificação de sucesso
      console.log('Chat fechado com sucesso', reason ? `Motivo: ${reason}` : '');
    } catch (error) {
      console.error('Erro ao fechar chat:', error);
      // Aqui você pode adicionar uma notificação de erro
    }
  }, []);

  // Pausar chat
  const handlePauseChat = useCallback(async () => {
    if (!selectedChatId) return;

    try {
      await pauseChat(selectedChatId);
    } catch (error) {
      console.error('Erro ao pausar chat:', error);
    }
  }, [selectedChatId]);

  // Retomar chat
  const handleResumeChat = useCallback(async () => {
    if (!selectedChatId) return;

    try {
      await resumeChat(selectedChatId);
    } catch (error) {
      console.error('Erro ao retomar chat:', error);
    }
  }, [selectedChatId]);

  // Iniciar gravação de áudio
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setAudioRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  }, []);

  // Parar gravação de áudio
  const stopRecording = useCallback(() => {
    if (audioRecorder) {
      audioRecorder.stop();
      setIsRecording(false);
      setAudioRecorder(null);
    }
  }, [audioRecorder]);

  // Enviar áudio gravado
  const sendAudio = useCallback(async () => {
    if (!audioBlob || !selectedChatId) return;

    try {
      setIsSending(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.ogg');
      formData.append('chatId', selectedChatId);
      
      // Aqui você faria a chamada para a API de envio de áudio
      console.log('Enviando áudio:', audioBlob);
      setAudioBlob(null);
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
    } finally {
      setIsSending(false);
    }
  }, [audioBlob, selectedChatId]);

  // Adicionar emoji à mensagem
  const addEmoji = useCallback((emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  }, []);

  // Enviar arquivo
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && selectedChatId) {
      // Aqui você faria a chamada para a API de envio de arquivo
      console.log('Enviando arquivo:', file);
    }
  }, [selectedChatId]);

  // Emojis disponíveis
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];


  // Renderizar lista de chats
  const renderChatList = (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Chats</Typography>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: isConnected ? 'success.main' : 'error.main',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {chatsLoading ? (
          <LinearProgress />
        ) : chats.length === 0 ? (
          <EmptyContent
            title="Nenhum chat"
            description="Não há chats disponíveis no momento"
            sx={{ py: 5 }}
          />
        ) : (
          <Stack spacing={0}>
            {chats.map((chat) => (
              <Box
                key={chat._id}
                onClick={() => setSelectedChatId(chat._id)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: selectedChatId === chat._id ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={!chat.unreadCount || chat.unreadCount === 0}
                  >
                    <Avatar>
                      {chat.clienteName?.charAt(0) || 'C'}
                    </Avatar>
                  </Badge>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {chat.clienteName || 'Cliente'}
                      </Typography>
                      
                      <Chip
                        label={CHAT_STATUS_LABELS[chat.status]}
                        color={CHAT_STATUS_COLORS[chat.status]}
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {chat.whatsappNumber}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      {new Date(chat.lastMessageAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Card>
  );

  // Renderizar área de chat
  const renderChatArea = (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {selectedChat ? (
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Área principal do chat */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header do chat */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {selectedChat.clienteName?.charAt(0) || 'C'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {selectedChat.clienteName || 'Cliente'}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={CHAT_STATUS_LABELS[selectedChat.status]}
                        color={CHAT_STATUS_COLORS[selectedChat.status]}
                        size="small"
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                  {selectedChat.status === 'em_atendimento' && (
                    <Tooltip title="Pausar chat">
                      <IconButton size="small" onClick={handlePauseChat}>
                        <Iconify icon="ph:pause" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {selectedChat.status === 'pausado' && (
                    <Tooltip title="Retomar chat">
                      <IconButton size="small" onClick={handleResumeChat}>
                        <Iconify icon="ph:play" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Transferir chat">
                    <IconButton size="small" onClick={() => setTransferDialogOpen(true)}>
                      <Iconify icon="ph:arrows-left-right" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Fechar chat">
                    <IconButton size="small" onClick={() => setCloseDialogOpen(true)}>
                      <Iconify icon="ph:x" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>

          {/* Mensagens */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messagesLoading ? (
              <LinearProgress />
            ) : messages.length === 0 ? (
              <EmptyContent
                title="Nenhuma mensagem"
                description="Inicie a conversa enviando uma mensagem"
                sx={{ py: 5 }}
              />
            ) : (
              <Stack spacing={2}>
                {messages.map((msg) => (
                  <Box
                    key={msg._id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.direction === 'outbound' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Box sx={{ maxWidth: '70%' }}>
                      <MessageRenderer 
                        message={msg} 
                        isOwn={msg.direction === 'outbound'} 
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.7,
                          textAlign: msg.direction === 'outbound' ? 'right' : 'left',
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}

            {/* Indicador de digitação */}
            {typingUsers.length > 0 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {typingUsers.map(user => user.name).join(', ')} está digitando...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Input de mensagem */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            {/* Área de gravação de áudio */}
            {audioBlob && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Iconify icon="ph:microphone" width={20} color="primary.main" />
                  <Typography variant="body2">
                    Áudio gravado - {Math.round(audioBlob.size / 1024)}KB
                  </Typography>
                  <Button size="small" onClick={sendAudio} disabled={isSending}>
                    Enviar
                  </Button>
                  <Button size="small" onClick={() => setAudioBlob(null)}>
                    Cancelar
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Seletor de emojis */}
            <Collapse in={showEmojiPicker}>
              <Paper sx={{ p: 2, mb: 2, maxHeight: 200, overflow: 'auto' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Escolha um emoji:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {emojis.map((emoji, index) => (
                    <IconButton
                      key={index}
                      size="small"
                      onClick={() => addEmoji(emoji)}
                      sx={{ fontSize: '1.2rem' }}
                    >
                      {emoji}
                    </IconButton>
                  ))}
                </Box>
              </Paper>
            </Collapse>

            <Stack direction="row" spacing={1} alignItems="flex-end">
              {/* Botões de ação */}
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Anexar arquivo">
                  <IconButton 
                    size="small" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isConnected || chatStatus === 'closed'}
                  >
                    <Iconify icon="ph:paperclip" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Enviar áudio">
                  <IconButton 
                    size="small" 
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!isConnected || chatStatus === 'closed'}
                    color={isRecording ? 'error' : 'default'}
                  >
                    <Iconify icon={isRecording ? "ph:stop" : "ph:microphone"} />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Emojis">
                  <IconButton 
                    size="small" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    color={showEmojiPicker ? 'primary' : 'default'}
                  >
                    <Iconify icon="ph:smiley" />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Campo de texto */}
              <Box sx={{ flex: 1 }}>
                <TextField
                  multiline
                  maxRows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  onFocus={startTyping}
                  onBlur={stopTyping}
                  placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
                  disabled={!isConnected || chatStatus === 'closed'}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              {/* Botão de enviar */}
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending || !isConnected || chatStatus === 'closed'}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                {isSending ? (
                  <Iconify icon="eos-icons:loading" />
                ) : (
                  <Iconify icon="ph:paper-plane-tilt" />
                )}
              </Button>
            </Stack>

            {/* Input oculto para arquivos */}
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
            
            {/* Status do chat */}
            {chatStatus === 'closed' && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                ⚠️ Este chat foi fechado
              </Typography>
            )}
            
            {!isConnected && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                ⚠️ Conecte-se ao WebSocket para enviar mensagens
              </Typography>
            )}

            {isRecording && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                🎤 Gravando áudio... Clique no botão de parar para finalizar
              </Typography>
            )}
          </Box>

          {/* Painel de informações do contato */}
          <Box sx={{ width: 300, borderLeft: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            {/* Header do contato */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Informações do Contato
              </Typography>
              
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ width: 60, height: 60 }}>
                  {selectedChat.clienteName?.charAt(0) || 'C'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {selectedChat.clienteName || 'Cliente'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedChat.whatsappNumber}
                  </Typography>
                  <Chip
                    label={CHAT_STATUS_LABELS[selectedChat.status]}
                    color={CHAT_STATUS_COLORS[selectedChat.status]}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Detalhes do contato */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <Stack spacing={3}>
                {/* Informações básicas */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                    Informações Básicas
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Nome Completo
                      </Typography>
                      <Typography variant="body2">
                        {selectedChat.clienteName || 'Não informado'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        WhatsApp
                      </Typography>
                      <Typography variant="body2">
                        {selectedChat.whatsappNumber}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Setor
                      </Typography>
                      <Typography variant="body2">
                        {selectedChat.sector || 'Não definido'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                {/* Informações do atendimento */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                    Atendimento
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Atendente Responsável
                      </Typography>
                      <Typography variant="body2">
                        {selectedChat.assignedTo?.name || 'Não atribuído'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Status do Chat
                      </Typography>
                      <Chip
                        label={CHAT_STATUS_LABELS[selectedChat.status]}
                        color={CHAT_STATUS_COLORS[selectedChat.status]}
                        size="small"
                      />
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                {/* Informações temporais */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                    Histórico
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Chat Iniciado
                      </Typography>
                      <Typography variant="body2">
                        {new Date(selectedChat.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Última Mensagem
                      </Typography>
                      <Typography variant="body2">
                        {new Date(selectedChat.lastMessageAt).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Duração do Chat
                      </Typography>
                      <Typography variant="body2">
                        {(() => {
                          const start = new Date(selectedChat.createdAt);
                          const now = new Date();
                          const diff = now - start;
                          const hours = Math.floor(diff / (1000 * 60 * 60));
                          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                          return `${hours}h ${minutes}m`;
                        })()}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                {/* Estatísticas */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                    Estatísticas
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total de Mensagens
                      </Typography>
                      <Typography variant="body2">
                        {messages.length} mensagens
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Mensagens Não Lidas
                      </Typography>
                      <Typography variant="body2">
                        {selectedChat.unreadCount || 0} mensagens
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Ações rápidas */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Ações Rápidas
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="ph:phone" />}
                  fullWidth
                >
                  Ligar
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="ph:whatsapp-logo" />}
                  fullWidth
                >
                  WhatsApp
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyContent
            title="Selecione um chat"
            description="Escolha um chat da lista para começar a conversar"
            sx={{ py: 5 }}
          />
        </Box>
      )}
    </Card>
  );


  return (
    <Card sx={{ p: 3, height: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Chat Integrado
      </Typography>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 120px)' }}>
        <Grid item xs={12} md={4}>
          {renderChatList}
        </Grid>
        
        <Grid item xs={12} md={8}>
          {renderChatArea}
        </Grid>
      </Grid>

      {/* Diálogos */}
      <TransferChatDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        onTransfer={handleTransferChat}
        chatId={selectedChatId}
        currentSector={selectedChat?.sector}
      />

      <CloseChatDialog
        open={closeDialogOpen}
        onClose={() => setCloseDialogOpen(false)}
        onCloseChat={handleCloseChat}
        chatId={selectedChatId}
        clienteName={selectedChat?.clienteName}
      />
    </Card>
  );


}
