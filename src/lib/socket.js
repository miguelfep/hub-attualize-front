import { io } from 'socket.io-client';

// Função para obter o token do cookie (mantendo sistema existente)
const getTokenFromCookie = () => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => 
    cookie.trim().startsWith('access_token=')
  );
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  
  return null;
};

class SocketService {
  constructor() {
    this.socket = null;
    this.token = null;
    this.eventListeners = new Map();
  }

  connect() {
    this.token = getTokenFromCookie();
    
    if (!this.token) {
      console.warn('Token não encontrado no cookie access_token');
      return;
    }
    
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9443', {
      auth: { token: this.token },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Conectado ao WebSocket');
      window.dispatchEvent(new CustomEvent('socketConnected'));
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado do WebSocket');
      window.dispatchEvent(new CustomEvent('socketDisconnected'));
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error);
      window.dispatchEvent(new CustomEvent('socketError', { detail: error }));
    });

    // Eventos de chat
    this.socket.on('new_message', (data) => {
      console.log('📨 Nova mensagem recebida:', data);
      window.dispatchEvent(new CustomEvent('newMessage', { detail: data }));
    });

    this.socket.on('new_chat', (data) => {
      console.log('💬 Novo chat criado:', data);
      window.dispatchEvent(new CustomEvent('newChat', { detail: data }));
    });

    this.socket.on('chat_updated', (data) => {
      console.log('🔄 Chat atualizado:', data);
      window.dispatchEvent(new CustomEvent('chatUpdated', { detail: data }));
    });

    this.socket.on('chat_assigned', (data) => {
      console.log('👤 Chat atribuído:', data);
      window.dispatchEvent(new CustomEvent('chatAssigned', { detail: data }));
    });

    this.socket.on('chat_transferred', (data) => {
      console.log('🔄 Chat transferido:', data);
      window.dispatchEvent(new CustomEvent('chatTransferred', { detail: data }));
    });

    this.socket.on('chat_closed', (data) => {
      console.log('❌ Chat fechado:', data);
      window.dispatchEvent(new CustomEvent('chatClosed', { detail: data }));
    });

    this.socket.on('user_typing', (data) => {
      window.dispatchEvent(new CustomEvent('userTyping', { detail: data }));
    });

    this.socket.on('user_stopped_typing', (data) => {
      window.dispatchEvent(new CustomEvent('userStoppedTyping', { detail: data }));
    });

    this.socket.on('message_read', (data) => {
      window.dispatchEvent(new CustomEvent('messageRead', { detail: data }));
    });

    // Eventos de fila conforme documentação
    this.socket.on('queue_updated', (data) => {
      console.log('📊 Fila atualizada:', data);
      window.dispatchEvent(new CustomEvent('queueUpdated', { detail: data }));
    });

    this.socket.on('new_message_in_queue', (data) => {
      console.log('📨 Nova mensagem na fila:', data);
      window.dispatchEvent(new CustomEvent('newMessageInQueue', { detail: data }));
    });

    this.socket.on('queue_stats', (data) => {
      window.dispatchEvent(new CustomEvent('queueStats', { detail: data }));
    });

    // Notificações
    this.socket.on('notification', (data) => {
      console.log('🔔 Notificação:', data);
      window.dispatchEvent(new CustomEvent('notification', { detail: data }));
    });
  }

  // Métodos para emitir eventos
  joinChat(chatId) {
    this.socket?.emit('join_chat', chatId);
  }

  leaveChat(chatId) {
    this.socket?.emit('leave_chat', chatId);
  }

  startTyping(chatId) {
    this.socket?.emit('typing_start', { chatId });
  }

  stopTyping(chatId) {
    this.socket?.emit('typing_stop', { chatId });
  }

  markAsRead(chatId, messageId) {
    this.socket?.emit('mark_as_read', { chatId, messageId });
  }

  // Métodos para gerenciar setores e instâncias
  joinSector(sector) {
    this.socket?.emit('join_sector', sector);
  }

  leaveSector(sector) {
    this.socket?.emit('leave_sector', sector);
  }

  joinInstance(instanceType) {
    this.socket?.emit('join_instance', instanceType);
  }

  leaveInstance(instanceType) {
    this.socket?.emit('leave_instance', instanceType);
  }

  // Métodos para gerenciar listeners customizados
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
    window.addEventListener(event, callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    window.removeEventListener(event, callback);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
