import api from 'src/lib/api';

/**
 * Serviço de Chat conforme documentação da API
 * Implementa todos os endpoints necessários para o sistema de chat
 */

// ============================================================================
// DASHBOARD - ESTATÍSTICAS
// ============================================================================

/**
 * Buscar estatísticas das instâncias
 * @returns {Promise<InstanceStats>} Estatísticas das instâncias
 */
export const getInstanceStats = async () => {
  const { data } = await api.get('/chat/stats');
  return data.data;
};

// ============================================================================
// LISTAR CHATS
// ============================================================================

/**
 * Buscar todos os chats com filtros
 * @param {ChatFilters} params - Filtros para busca
 * @returns {Promise<{success: boolean, data: Chat[]}>} Lista de chats
 */
export const getAllChats = async (params = {}) => {
  const { data } = await api.get('/chat/all', { params });
  return data;
};

/**
 * Buscar chats do usuário
 * @param {string} [userId] - ID do usuário (opcional)
 * @returns {Promise<{success: boolean, data: Chat[]}>} Lista de chats do usuário
 */
export const getUserChats = async (userId) => {
  const endpoint = userId ? `/chat/user/${userId}` : '/chat/user';
  const { data } = await api.get(endpoint);
  return data;
};

/**
 * Buscar chats por setor
 * @param {string} sector - Setor para filtrar
 * @returns {Promise<{success: boolean, data: Chat[]}>} Lista de chats do setor
 */
export const getSectorChats = async (sector) => {
  const { data } = await api.get(`/chat/sector/${sector}`);
  return data;
};

/**
 * Buscar chats por instância
 * @param {string} instanceType - Tipo da instância
 * @returns {Promise<{success: boolean, data: Chat[]}>} Lista de chats da instância
 */
export const getInstanceChats = async (instanceType) => {
  const { data } = await api.get(`/chat/instance/${instanceType}`);
  return data;
};

// ============================================================================
// PEGAR CHAT DA FILA
// ============================================================================

/**
 * Pegar próximo chat da fila
 * @param {string} sector - Setor da fila
 * @param {string} instanceType - Tipo da instância
 * @returns {Promise<{success: boolean, data: Chat}>} Chat atribuído
 */
export const getNextChatFromQueue = async (sector, instanceType) => {
  const { data } = await api.get(`/chat/queue/next/${sector}/${instanceType}`);
  return data;
};

// ============================================================================
// INTERFACE DE CHAT
// ============================================================================

/**
 * Buscar mensagens de um chat
 * @param {string} chatId - ID do chat
 * @param {number} [limit=50] - Limite de mensagens
 * @param {number} [offset=0] - Offset para paginação
 * @returns {Promise<{success: boolean, data: Message[]}>} Lista de mensagens
 */
export const getChatMessages = async (chatId, limit = 50, offset = 0) => {
  const { data } = await api.get(`/chat/messages/${chatId}`, {
    params: { limit, offset }
  });
  return data;
};

/**
 * Enviar mensagem para um chat
 * @param {string} chatId - ID do chat
 * @param {string} content - Conteúdo da mensagem
 * @returns {Promise<{success: boolean, data: Message}>} Mensagem enviada
 */
export const sendMessage = async (chatId, content) => {
  const { data } = await api.post(`/chat/message/${chatId}`, { content });
  return data;
};

// ============================================================================
// TRANSFERIR CHAT
// ============================================================================

/**
 * Transferir chat para outro usuário/setor
 * @param {string} chatId - ID do chat
 * @param {string} [targetUserId] - ID do usuário destino
 * @param {string} [targetSector] - Setor destino
 * @returns {Promise<{success: boolean, data: Chat}>} Chat transferido
 */
export const transferChat = async (chatId, targetUserId, targetSector) => {
  const { data } = await api.post(`/chat/transfer/${chatId}`, {
    targetUserId,
    targetSector
  });
  return data;
};

// ============================================================================
// FECHAR CHAT
// ============================================================================

/**
 * Fechar um chat
 * @param {string} chatId - ID do chat
 * @returns {Promise<{success: boolean, data: Chat}>} Chat fechado
 */
export const closeChat = async (chatId) => {
  const { data } = await api.post(`/chat/close/${chatId}`);
  return data;
};

// ============================================================================
// ATRIBUIR CHAT
// ============================================================================

/**
 * Atribuir chat ao usuário atual
 * @param {string} chatId - ID do chat
 * @returns {Promise<{success: boolean, data: Chat}>} Chat atribuído
 */
export const assignChat = async (chatId) => {
  const { data } = await api.post(`/chat/assign/${chatId}`);
  return data;
};

// ============================================================================
// PAUSAR/RETOMAR CHAT
// ============================================================================

/**
 * Pausar um chat
 * @param {string} chatId - ID do chat
 * @returns {Promise<{success: boolean, data: Chat}>} Chat pausado
 */
export const pauseChat = async (chatId) => {
  const { data } = await api.post(`/chat/pause/${chatId}`);
  return data;
};

/**
 * Retomar um chat pausado
 * @param {string} chatId - ID do chat
 * @returns {Promise<{success: boolean, data: Chat}>} Chat retomado
 */
export const resumeChat = async (chatId) => {
  const { data } = await api.post(`/chat/resume/${chatId}`);
  return data;
};

// ============================================================================
// WEBHOOK (Para Evolution API)
// ============================================================================

/**
 * Endpoint de webhook para receber mensagens da Evolution API
 * @param {Object} webhookData - Dados do webhook
 * @returns {Promise<{success: boolean}>} Confirmação de recebimento
 */
export const webhook = async (webhookData) => {
  const { data } = await api.post('/chat/webhook', webhookData);
  return data;
};
