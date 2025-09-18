// Interfaces para o sistema de chat com suporte a 2 instâncias
export interface Chat {
  _id: string;
  clienteId?: string;
  whatsappNumber: string;
  clienteName: string;
  status: 'na_fila' | 'em_atendimento' | 'fechado' | 'pausado';
  assignedUserId?: string;
  assignedSectorId?: 'atendimento' | 'financeiro' | 'comercial' | 'societario' | 'contabil';
  lastMessageAt: string;
  createdAt: string;
  closedAt?: string;
  evolutionInstanceId: string; // 'operacional' ou 'financeiro-comercial'
  remoteJid: string;
  instanceType: 'operacional' | 'financeiro-comercial'; // Campo adicional para facilitar filtros
}

export interface Message {
  _id: string;
  chatId: string;
  messageId: string;
  remoteJid: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker' | 'location' | 'contact';
  content: string;
  mediaUrl?: string;
  fileName?: string;
  mimeType?: string;
  fromMe: boolean;
  timestamp: string;
  status?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  evolutionMessageId?: string;
}

export interface TransferChatData {
  targetUserId?: string;
  targetSector?: string;
  targetInstance?: 'operacional' | 'financeiro-comercial';
}

export interface SendMessageData {
  content: string;
  userId: string;
}

export interface InstanceStats {
  operacional: {
    total: number;
    naFila: number;
    emAtendimento: number;
    fechados: number;
  };
  financeiroComercial: {
    total: number;
    naFila: number;
    emAtendimento: number;
    fechados: number;
  };
}

export type InstanceType = 'operacional' | 'financeiro-comercial';
export type InstanceFilter = 'all' | InstanceType; 