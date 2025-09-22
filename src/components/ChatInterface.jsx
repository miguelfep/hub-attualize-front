import React, { useRef, useState, useEffect } from 'react';

import {
  Box, Menu, Chip, Paper, Avatar, Button,
  MenuItem, TextField, IconButton, Typography
} from '@mui/material';

import { chatAPI } from 'src/lib/api';
import { socketService } from 'src/lib/socket';

import { Iconify } from 'src/components/iconify';
import { MessageRenderer } from 'src/components/chat/MessageRenderer';

export default function ChatInterface({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      loadChatData();
      loadMessages();
      socketService.joinChat(chatId);
    }

    return () => {
      if (chatId) {
        socketService.leaveChat(chatId);
      }
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    try {
      const response = await chatAPI.getAllChats();
      const chat = response.data.chats.find(c => c._id === chatId);
      setCurrentChat(chat);
    } catch (error) {
      console.error('Erro ao carregar dados do chat:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getChatMessages(chatId);
      
      // A API retorna data como array direto, não data.messages
      const messagesData = response.data || [];
      setMessages(messagesData.reverse());
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      await chatAPI.sendMessage(chatId, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleTransfer = async (sector) => {
    try {
      await chatAPI.transferChat(chatId, null, sector);
      setAnchorEl(null);
    } catch (error) {
      console.error('Erro ao transferir chat:', error);
    }
  };

  const handleClose = async () => {
    try {
      await chatAPI.closeChat(chatId);
      setAnchorEl(null);
    } catch (error) {
      console.error('Erro ao fechar chat:', error);
    }
  };

  // WebSocket event listeners
  useEffect(() => {
    const handleNewMessage = (event) => {
      const { chatId: eventChatId, message } = event.detail;
      if (eventChatId === chatId) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleChatUpdated = (event) => {
      const { chatId: eventChatId, chat } = event.detail;
      if (eventChatId === chatId) {
        setCurrentChat(prev => ({ ...prev, ...chat }));
      }
    };

    window.addEventListener('newMessage', handleNewMessage);
    window.addEventListener('chatUpdated', handleChatUpdated);

    return () => {
      window.removeEventListener('newMessage', handleNewMessage);
      window.removeEventListener('chatUpdated', handleChatUpdated);
    };
  }, [chatId]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header do Chat */}
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2 }}>
            {currentChat?.clienteName?.charAt(0) || 'C'}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {currentChat?.clienteName || 'Chat'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentChat?.whatsappNumber}
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <Chip label={currentChat?.status || 'desconhecido'} color="primary" sx={{ mr: 1 }} />
          <Chip label={currentChat?.instanceType || 'operacional'} variant="outlined" sx={{ mr: 1 }} />
          
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
          
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => handleTransfer('financeiro')}>
              <Iconify icon="eva:swap-fill" sx={{ mr: 1 }} />
              Transferir para Financeiro
            </MenuItem>
            <MenuItem onClick={() => handleTransfer('comercial')}>
              <Iconify icon="eva:swap-fill" sx={{ mr: 1 }} />
              Transferir para Comercial
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Iconify icon="eva:close-fill" sx={{ mr: 1 }} />
              Fechar Chat
            </MenuItem>
          </Menu>
        </Box>
      </Paper>

      {/* Mensagens */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body1" color="text.secondary">
              Nenhuma mensagem ainda
            </Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <Box
              key={message._id}
              sx={{
                display: 'flex',
                justifyContent: message.direction === 'outbound' ? 'flex-end' : 'flex-start',
                mb: 2
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
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input de Mensagem */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
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
            disabled={!messageText.trim()}
            startIcon={<Iconify icon="eva:send-fill" />}
          >
            Enviar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
