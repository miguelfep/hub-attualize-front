# 📊 Conciliação Bancária - Portal do Cliente

Interface de conciliação bancária que permite aos clientes importar extratos bancários e conciliá-los automaticamente com transações do sistema.

## ✅ Status: CONCLUÍDO

**Data**: 16/01/2026  
**Localização**: Portal do Cliente  
**Público**: Clientes finais

---

## 📁 Estrutura de Arquivos

```
portal-cliente/conciliacao-bancaria/
├── page.jsx                          # Página principal
├── components/
│   ├── conciliacao-upload.jsx        # Upload com drag & drop
│   ├── conciliacao-revisao.jsx       # Revisão de transações
│   └── index.js                      # Barrel export
└── README.md                         # Esta documentação
```

---

## 🎯 Funcionalidades

### 1. Upload de Arquivos
- ✅ **Drag & Drop** para facilitar o upload
- ✅ **Formatos aceitos**: `.OFX`, `.PDF`, `.XLSX`
- ✅ **Barra de progresso** durante o upload
- ✅ **Validação** de formato de arquivo
- ✅ **Feedback visual** de sucesso/erro

### 2. Processamento Automático
- ✅ Extração automática de transações do arquivo
- ✅ Identificação de dados: data, descrição, valor, tipo
- ✅ **Sugestões de conciliação via IA**
- ✅ Status automático para transações identificadas

### 3. Revisão de Transações
- ✅ Tabela com todas as transações processadas
- ✅ **Código de cores**:
  - **🟢 Verde**: Conciliação automática confirmada
  - **🟡 Amarelo**: Sugestões da IA que precisam de revisão
- ✅ **Campos editáveis**:
  - Conta Contábil
  - Centro de Custo
  - Observações
- ✅ **Resumo com estatísticas**:
  - Total de transações
  - Transações confirmadas
  - Transações pendentes
  - Valor total

### 4. Ações Disponíveis
- ✅ **Confirmar Transação**: Aceitar ou editar sugestões da IA
- ✅ **Finalizar Conciliação**: Marcar conciliação como concluída
- ✅ **Baixar CSV**: Exportar relatório em formato CSV
- ✅ **Histórico**: Visualizar conciliações anteriores

---

## 🔌 API Endpoints

```javascript
// Upload de arquivo
POST /api/reconciliation/upload

// Listar conciliações do cliente
GET /api/reconciliation/cliente/:clienteId

// Detalhes da conciliação
GET /api/reconciliation/:conciliacaoId

// Confirmar transação manualmente
POST /api/reconciliation/:conciliacaoId/confirm

// Exportar CSV
POST /api/reconciliation/:conciliacaoId/export

// Download CSV
GET /api/reconciliation/download/:fileName
```

---

## 🚀 Como Usar

### 1. Acessar a Página

**URL**: `/portal-cliente/conciliacao-bancaria`

**Código**:
```javascript
import { paths } from 'src/routes/paths';

// Navegar para a página
paths.cliente.conciliacaoBancaria
```

### 2. Fluxo de Uso

```
1. Cliente acessa a página (já autenticado)
   ↓
2. Faz upload do extrato (.ofx, .pdf ou .xlsx)
   ↓
3. Sistema processa e extrai transações
   ↓
4. Cliente visualiza tabela com transações
   ↓
5. Revisa transações amarelas (sugestões IA)
   ↓
6. Confirma ou edita informações
   ↓
7. Finaliza a conciliação
   ↓
8. Baixa relatório CSV (opcional)
```

### 3. Autenticação

O sistema usa automaticamente o ID do cliente logado:

```javascript
const { user } = useAuthContext();
const clienteId = user?.clienteProprietarioId || user?.cliente?._id;
```

---

## 🎨 Componentes

### ConciliacaoUpload

Componente de upload de arquivos com drag & drop.

**Props:**
- `clienteId` (string): ID do cliente (automático via auth)
- `onSuccess` (function): Callback após upload bem-sucedido

**Recursos:**
- Validação de tipo de arquivo
- Progresso de upload em tempo real
- Mensagens de erro amigáveis
- Instruções de uso

### ConciliacaoRevisao

Componente de revisão e confirmação de transações.

**Props:**
- `conciliacao` (object): Dados da conciliação
- `onVoltar` (function): Voltar para tela de upload
- `onFinalizar` (function): Callback após finalizar

**Recursos:**
- DataGrid com paginação
- Filtros e ordenação
- Dialog para edição de transações
- Exportação de CSV
- Resumo estatístico

---

## 🎨 Design e UX

### Cores e Status

| Cor | Status | Descrição |
|-----|--------|-----------|
| 🟢 **Verde** | Confirmada/Automática | Transação já conciliada |
| 🟡 **Amarelo** | Sugestão/Pendente | Requer revisão do cliente |
| 🔵 **Azul** | Ações | Botões principais |
| 🔴 **Vermelho** | Erro | Mensagens de erro |

### Feedback Visual
- ✅ Toast notifications para sucesso/erro
- ⏳ Loading states durante operações
- 📊 Progress bar durante upload
- 🏷️ Chips coloridos para status

### Responsividade
- 📱 Mobile-first design
- 💻 Adaptativo para tablet e desktop
- 👆 Touch-friendly para dispositivos móveis

---

## 📋 Estrutura de Dados

### Conciliação

```javascript
{
  _id: string,
  clienteId: string,
  nomeArquivo: string,
  status: 'pendente' | 'revisao' | 'concluida' | 'cancelada',
  transacoes: Array<Transacao>,
  createdAt: Date,
  updatedAt: Date
}
```

### Transação

```javascript
{
  id: string,
  data: Date,
  descricao: string,
  valor: number,
  tipo: 'entrada' | 'saida',
  statusConciliacao: 'automatica' | 'sugestao' | 'confirmada' | 'pendente',
  contaContabil: string,
  centroCusto: string,
  observacoes: string
}
```

---

## 🔧 Tecnologias

- **React 18** - Framework UI
- **Material-UI (MUI) v5** - Componentes UI
- **MUI X DataGrid v7** - Tabela avançada
- **react-dropzone v14** - Upload de arquivos
- **SWR v2** - Data fetching e cache
- **axios v1** - Cliente HTTP
- **file-saver v2** - Download de arquivos
- **dayjs v1** - Manipulação de datas

---

## 🔐 Segurança e Permissões

### Autenticação
- Cliente deve estar logado no portal
- ID do cliente é obtido automaticamente do contexto
- Não é possível acessar dados de outros clientes

### Validações
- Formato de arquivo validado
- Tamanho máximo de arquivo respeitado
- Apenas o próprio cliente vê suas conciliações

---

## 💡 Dicas de Uso

### Para Clientes

1. **Organize seus extratos**
   - Faça conciliações mensalmente
   - Nomeie os arquivos de forma clara
   - Mantenha backup dos extratos originais

2. **Revise com atenção**
   - Transações verdes estão corretas
   - Transações amarelas precisam de revisão
   - Adicione observações quando necessário

3. **Baixe os relatórios**
   - Mantenha backup dos CSVs gerados
   - Use para conferência futura
   - Facilita auditorias

### Para Suporte

1. **Orientar clientes**
   - Mostrar como exportar extratos do banco
   - Explicar o significado das cores
   - Ajudar na revisão de transações

2. **Troubleshooting comum**
   - Verificar formato do arquivo
   - Confirmar autenticação do cliente
   - Validar conexão com backend

---

## 📊 Exemplos de Uso

### Upload Simples

```jsx
// Cliente arrasta arquivo .ofx
// Sistema processa automaticamente
// Retorna dados estruturados

Resultado:
{
  nomeArquivo: "extrato_janeiro_2026.ofx",
  transacoes: [
    { 
      data: "2026-01-15",
      descricao: "PIX Recebido",
      valor: 5000.00,
      statusConciliacao: "automatica" // 🟢 Verde
    },
    {
      data: "2026-01-14",
      descricao: "Pagamento Fornecedor",
      valor: -1500.00,
      statusConciliacao: "sugestao" // 🟡 Amarelo
    }
  ]
}
```

### Revisão de Transação

```
Cliente clica no ícone de edição (lápis amarelo)
↓
Dialog abre com campos:
- Conta Contábil: [2.1.01.001]
- Centro de Custo: [Administrativo]
- Observações: [Nota fiscal 12345]
↓
Cliente confirma
↓
Transação fica verde ✅
```

---

## 🐛 Troubleshooting

### Erro: "Não foi possível identificar o cliente"

**Causa**: Usuário não autenticado ou sessão expirada  
**Solução**: Fazer logout e login novamente

### Erro: "Formato de arquivo não suportado"

**Causa**: Arquivo com extensão inválida  
**Solução**: Usar apenas .OFX, .PDF ou .XLSX

### Erro: "Nenhuma transação encontrada"

**Causa**: Arquivo vazio ou formato não reconhecido  
**Solução**: Verificar se o arquivo contém transações válidas

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte esta documentação
2. Entre em contato com o suporte técnico
3. Verifique os logs do console para erros

---

## 🎯 Próximas Melhorias

- [ ] Filtros avançados na tabela
- [ ] Busca de transações por texto
- [ ] Exportação em múltiplos formatos (PDF, Excel)
- [ ] Dashboard de conciliações
- [ ] Notificações por email após processamento
- [ ] Regras de conciliação personalizáveis
- [ ] Integração com plano de contas do cliente
- [ ] Upload múltiplo de arquivos

---

**Desenvolvido para Hub Attualize**  
**Janeiro 2026**
