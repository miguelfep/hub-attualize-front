// Tipos para o sistema de chat conforme documentação da API

/**
 * @typedef {Object} Chat
 * @property {string} _id - ID único do chat
 * @property {string} [clienteId] - ID do cliente
 * @property {string} whatsappNumber - Número do WhatsApp
 * @property {string} clienteName - Nome do cliente
 * @property {'NA_FILA'|'EM_ATENDIMENTO'|'FECHADO'|'PAUSADO'} status - Status do chat
 * @property {'atendimento'|'financeiro'|'comercial'|'societario'|'contabil'} [setor] - Setor do chat
 * @property {'operacional'|'financeiro-comercial'} instanceType - Tipo da instância
 * @property {Object} [assignedUserId] - Usuário atribuído
 * @property {string} assignedUserId._id - ID do usuário
 * @property {string} assignedUserId.name - Nome do usuário
 * @property {string} assignedUserId.email - Email do usuário
 * @property {string} lastMessageAt - Data da última mensagem
 * @property {string} createdAt - Data de criação
 * @property {string} updatedAt - Data de atualização
 */

/**
 * @typedef {Object} Message
 * @property {string} _id - ID único da mensagem
 * @property {string} chatId - ID do chat
 * @property {string} messageId - ID da mensagem
 * @property {string} remoteJid - JID remoto
 * @property {'inbound'|'outbound'} direction - Direção da mensagem
 * @property {'text'|'image'|'audio'|'video'|'document'|'sticker'|'location'|'contact'} type - Tipo da mensagem
 * @property {string} content - Conteúdo da mensagem
 * @property {string} [mediaUrl] - URL da mídia
 * @property {string} [mediaBase64] - Mídia em base64
 * @property {string} [fileName] - Nome do arquivo
 * @property {string} [mimeType] - Tipo MIME
 * @property {boolean} fromMe - Se a mensagem é do usuário atual
 * @property {string} timestamp - Timestamp da mensagem
 * @property {Object} [userId] - Usuário que enviou
 * @property {string} userId._id - ID do usuário
 * @property {string} userId.name - Nome do usuário
 * @property {string} userId.email - Email do usuário
 * @property {string} [pushName] - Nome de exibição
 * @property {string} [messageType] - Tipo da mensagem
 * @property {string} [instanceId] - ID da instância
 * @property {string} [source] - Fonte da mensagem
 */

/**
 * @typedef {Object} ChatStats
 * @property {number} total - Total de chats
 * @property {number} naFila - Chats na fila
 * @property {number} emAtendimento - Chats em atendimento
 * @property {number} fechados - Chats fechados
 * @property {number} pausados - Chats pausados
 */

/**
 * @typedef {Object} InstanceStats
 * @property {ChatStats} operacional - Estatísticas da instância operacional
 * @property {ChatStats} 'financeiro-comercial' - Estatísticas da instância financeiro-comercial
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Se a operação foi bem-sucedida
 * @property {*} data - Dados da resposta
 * @property {string} [message] - Mensagem da resposta
 */

/**
 * @typedef {Object} ChatFilters
 * @property {'operacional'|'financeiro-comercial'} [instanceType] - Tipo da instância
 * @property {'NA_FILA'|'EM_ATENDIMENTO'|'FECHADO'|'PAUSADO'} [status] - Status do chat
 * @property {'atendimento'|'financeiro'|'comercial'|'societario'|'contabil'} [sector] - Setor
 * @property {number} [limit] - Limite de resultados
 * @property {number} [offset] - Offset para paginação
 */

/**
 * @typedef {Object} TransferChatData
 * @property {string} [targetUserId] - ID do usuário destino
 * @property {'atendimento'|'financeiro'|'comercial'|'societario'|'contabil'} [targetSector] - Setor destino
 */

/**
 * @typedef {Object} SendMessageData
 * @property {string} content - Conteúdo da mensagem
 */

// Exportar tipos para uso em outros arquivos
export const ChatTypes = {
  STATUS: {
    NA_FILA: 'NA_FILA',
    EM_ATENDIMENTO: 'EM_ATENDIMENTO',
    FECHADO: 'FECHADO',
    PAUSADO: 'PAUSADO'
  },
  SECTOR: {
    ATENDIMENTO: 'atendimento',
    FINANCEIRO: 'financeiro',
    COMERCIAL: 'comercial',
    SOCIETARIO: 'societario',
    CONTABIL: 'contabil'
  },
  INSTANCE_TYPE: {
    OPERACIONAL: 'operacional',
    FINANCEIRO_COMERCIAL: 'financeiro-comercial'
  },
  MESSAGE_TYPE: {
    TEXT: 'text',
    IMAGE: 'image',
    AUDIO: 'audio',
    VIDEO: 'video',
    DOCUMENT: 'document',
    STICKER: 'sticker',
    LOCATION: 'location',
    CONTACT: 'contact'
  },
  MESSAGE_DIRECTION: {
    INBOUND: 'inbound',
    OUTBOUND: 'outbound'
  }
};
