# Sistema de Mensagens Integrado

Este sistema de mensagens foi criado para integrar com a API do backend, permitindo gerenciar contatos e iniciar conversas no chat existente.

## Componentes Criados

### 1. ContactList (`contact-list.jsx`)
- Lista todos os contatos disponíveis
- Filtros por tipo de instância (operacional/financeiro-comercial)
- Busca por nome ou número
- Ações para iniciar chat ou enviar mensagem rápida

### 2. ContactForm (`contact-form.jsx`)
- Formulário para criar novos contatos
- Campos: nome, número WhatsApp, push name, instância, observações, tags
- Validação de campos obrigatórios
- Sistema de tags dinâmico

### 3. ChatIntegration (`chat-integration.jsx`)
- Integração com o chat existente
- Lista conversas recentes
- Modal para seleção de contatos
- Redirecionamento para o chat

## Actions (`src/actions/contacts.js`)

### Hooks disponíveis:
- `useGetContacts(filters)` - Buscar contatos com filtros
- `useGetContact(contactId)` - Buscar contato específico

### Funções disponíveis:
- `createContact(contactData)` - Criar novo contato
- `updateContact(contactId, contactData)` - Atualizar contato
- `deleteContact(contactId)` - Deletar contato
- `startConversation(contactId, userId, instanceType)` - Iniciar conversa
- `sendQuickMessage(contactId, message, userId)` - Enviar mensagem rápida

## Páginas Criadas

### 1. `/dashboard/contacts` - Lista de contatos
- Exibe todos os contatos
- Filtros e busca
- Botão para criar novo contato

### 2. `/dashboard/contacts/new` - Criar novo contato
- Formulário completo para criação
- Validação e feedback

## Rotas Adicionadas

```javascript
contacts: {
  root: '/dashboard/contacts',
  new: '/dashboard/contacts/new',
  edit: (id) => `/dashboard/contacts/${id}/edit`,
}
```

## Endpoints da API

```javascript
contacts: {
  list: baseUrl + "/contacts",
  create: baseUrl + "/contacts",
  update: baseUrl + "/contacts",
  delete: baseUrl + "/contacts",
  conversation: baseUrl + "/contacts",
  message: baseUrl + "/contacts",
}
```

## Como Usar

### 1. Listar Contatos
```jsx
import { ContactList } from 'src/sections/contacts';

function MyPage() {
  return <ContactList />;
}
```

### 2. Criar Contato
```jsx
import { ContactForm } from 'src/sections/contacts';

function NewContactPage() {
  return <ContactForm />;
}
```

### 3. Integração com Chat
```jsx
import { ChatIntegration } from 'src/sections/contacts';

function ChatPage() {
  return <ChatIntegration />;
}
```

### 4. Usar Actions
```jsx
import { useGetContacts, createContact } from 'src/actions/contacts';

function MyComponent() {
  const { contacts, contactsLoading } = useGetContacts({ instanceType: 'operacional' });
  
  const handleCreateContact = async (data) => {
    try {
      await createContact(data);
      // Sucesso
    } catch (error) {
      // Erro
    }
  };
}
```

## Estrutura de Dados

### Contato
```javascript
{
  _id: string,
  whatsappNumber: string,
  name: string,
  pushName?: string,
  instanceType: 'operacional' | 'financeiro-comercial',
  tags?: string[],
  lastSeen?: Date,
  clienteId?: {
    nome: string,
    email: string
  }
}
```

## Próximos Passos

1. **Implementar WebSocket** para mensagens em tempo real
2. **Adicionar notificações** push
3. **Implementar upload de arquivos** (imagens, documentos)
4. **Criar dashboard** com estatísticas de contatos
5. **Adicionar histórico** de mensagens
6. **Implementar busca** avançada de mensagens

## Integração com Chat Existente

O sistema foi projetado para integrar perfeitamente com o chat existente:
- Usa as mesmas rotas (`/dashboard/chat`)
- Mantém a estrutura de dados compatível
- Reutiliza componentes existentes quando possível
- Adiciona funcionalidades sem quebrar o sistema atual
