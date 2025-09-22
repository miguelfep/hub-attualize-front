import { useState, useEffect, useCallback } from 'react';

import { socketService } from 'src/lib/socket';

/**
 * Hook para gerenciar conexão WebSocket conforme documentação
 * @returns {Object} Objeto com estado e métodos do WebSocket
 */
export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    // Verificar se há token no cookie (sistema existente)
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('access_token=')
    );
    
    if (!tokenCookie) return;

    socketService.connect();
    setSocket(socketService.getSocket());
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();

    // Listeners para eventos de conexão
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = () => {
      setIsConnected(false);
    };

    socketService.addEventListener('socketConnected', handleConnect);
    socketService.addEventListener('socketDisconnected', handleDisconnect);
    socketService.addEventListener('socketError', handleError);

    return () => {
      socketService.removeEventListener('socketConnected', handleConnect);
      socketService.removeEventListener('socketDisconnected', handleDisconnect);
      socketService.removeEventListener('socketError', handleError);
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
};

// Hook específico para eventos de chat
export const useChatEvents = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatStatus, setChatStatus] = useState(null);

  useEffect(() => {
    if (!chatId) return;

    const handleNewMessage = (event) => {
      const data = event.detail;
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    const handleUserTyping = (event) => {
      const data = event.detail;
      if (data.chatId === chatId) {
        setTypingUsers(prev => {
          const filtered = prev.filter(user => user.userId !== data.userId);
          return [...filtered, { userId: data.userId, name: data.userName }];
        });
      }
    };

    const handleUserStoppedTyping = (event) => {
      const data = event.detail;
      if (data.chatId === chatId) {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
      }
    };

    const handleMessageRead = (event) => {
      const data = event.detail;
      if (data.chatId === chatId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, read: true, readAt: data.readAt }
              : msg
          )
        );
      }
    };

    const handleChatUpdated = (event) => {
      const data = event.detail;
      if (data.chatId === chatId) {
        setChatStatus(data.status);
      }
    };

    const handleChatClosed = (event) => {
      const data = event.detail;
      if (data.chatId === chatId) {
        setChatStatus('closed');
      }
    };

    const handleChatTransferred = (event) => {
      const data = event.detail;
      if (data.chatId === chatId) {
        setChatStatus('transferred');
      }
    };

    socketService.addEventListener('newMessage', handleNewMessage);
    socketService.addEventListener('userTyping', handleUserTyping);
    socketService.addEventListener('userStoppedTyping', handleUserStoppedTyping);
    socketService.addEventListener('messageRead', handleMessageRead);
    socketService.addEventListener('chatUpdated', handleChatUpdated);
    socketService.addEventListener('chatClosed', handleChatClosed);
    socketService.addEventListener('chatTransferred', handleChatTransferred);

    return () => {
      socketService.removeEventListener('newMessage', handleNewMessage);
      socketService.removeEventListener('userTyping', handleUserTyping);
      socketService.removeEventListener('userStoppedTyping', handleUserStoppedTyping);
      socketService.removeEventListener('messageRead', handleMessageRead);
      socketService.removeEventListener('chatUpdated', handleChatUpdated);
      socketService.removeEventListener('chatClosed', handleChatClosed);
      socketService.removeEventListener('chatTransferred', handleChatTransferred);
    };
  }, [chatId]);

  const startTyping = useCallback(() => {
    if (chatId && !isTyping) {
      setIsTyping(true);
      socketService.startTyping(chatId);
    }
  }, [chatId, isTyping]);

  const stopTyping = useCallback(() => {
    if (chatId && isTyping) {
      setIsTyping(false);
      socketService.stopTyping(chatId);
    }
  }, [chatId, isTyping]);

  return {
    messages,
    typingUsers,
    isTyping,
    chatStatus,
    startTyping,
    stopTyping,
  };
};

// Hook para eventos de fila
export const useQueueEvents = (sector, instanceType) => {
  const [queueStats, setQueueStats] = useState({});
  const [queueUpdates, setQueueUpdates] = useState([]);
  const [newMessagesInQueue, setNewMessagesInQueue] = useState([]);

  useEffect(() => {
    if (!sector || !instanceType) return;

    const handleQueueUpdated = (event) => {
      const data = event.detail;
      if (data.sector === sector && data.instanceType === instanceType) {
        setQueueUpdates(prev => [...prev, data]);
      }
    };

    const handleNewMessageInQueue = (event) => {
      const data = event.detail;
      if (data.sector === sector && data.instanceType === instanceType) {
        setNewMessagesInQueue(prev => [...prev, data]);
      }
    };

    const handleQueueStats = (event) => {
      const data = event.detail;
      if (data.sector === sector && data.instanceType === instanceType) {
        setQueueStats(data.stats);
      }
    };

    socketService.addEventListener('queueUpdated', handleQueueUpdated);
    socketService.addEventListener('newMessageInQueue', handleNewMessageInQueue);
    socketService.addEventListener('queueStats', handleQueueStats);

    // Entrar no setor e instância
    socketService.joinSector(sector);
    socketService.joinInstance(instanceType);

    return () => {
      socketService.removeEventListener('queueUpdated', handleQueueUpdated);
      socketService.removeEventListener('newMessageInQueue', handleNewMessageInQueue);
      socketService.removeEventListener('queueStats', handleQueueStats);
      socketService.leaveSector(sector);
      socketService.leaveInstance(instanceType);
    };
  }, [sector, instanceType]);

  return {
    queueStats,
    queueUpdates,
    newMessagesInQueue,
  };
};

// Hook para notificações
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (event) => {
      const data = event.detail;
      setNotifications(prev => [...prev, { ...data, id: Date.now(), timestamp: new Date() }]);
    };

    socketService.addEventListener('notification', handleNotification);

    return () => {
      socketService.removeEventListener('notification', handleNotification);
    };
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    clearNotification,
    clearAllNotifications,
  };
};
