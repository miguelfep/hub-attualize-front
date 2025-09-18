export interface Contact {
  _id: string;
  whatsappNumber: string;
  name: string;
  pushName?: string;
  profilePicture?: string;
  isBusiness: boolean;
  isGroup: boolean;
  instanceType: 'operacional' | 'financeiro-comercial';
  lastSeen?: string;
  status?: string;
  tags?: string[];
  notes?: string;
  clienteId?: {
    _id: string;
    nome: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactFilters {
  instanceType?: 'operacional' | 'financeiro-comercial' | 'all';
  search?: string;
  tags?: string[];
  hasClient?: boolean;
}

export interface ContactStats {
  total: number;
  withClient: number;
  withoutClient: number;
  byTags: Array<{
    _id: string;
    count: number;
  }>;
} 