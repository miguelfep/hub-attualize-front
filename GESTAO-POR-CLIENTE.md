# 🎯 Gestão de Apuração POR CLIENTE

## ✅ Novo Fluxo Implementado

O sistema agora está **centrado no cliente**, facilitando o trabalho do time fiscal.

---

## 📍 Fluxo Completo

### 1. Dashboard Principal
**Rota:** `/dashboard/fiscal/apuracao`

**O que tem:**
- Visão geral das métricas
- Botão principal: **"Gerenciar por Cliente"**

---

### 2. Lista de Clientes ⭐
**Rota:** `/dashboard/fiscal/apuracao/clientes`

**O que tem:**
- Grid visual com todos os clientes com apuração habilitada
- Busca por nome, razão social ou CNPJ
- Cards clicáveis com:
  - Avatar do cliente
  - Nome/Razão Social
  - CNPJ
  - Regime tributário
  - Atividade principal

**Como usar:**
```
1. Acessar a lista de clientes
2. Usar a busca se necessário
3. Clicar em qualquer cliente
4. Ir para a página detalhada daquele cliente
```

---

### 3. Página Detalhada do Cliente ⭐⭐⭐ **PRINCIPAL**
**Rota:** `/dashboard/fiscal/apuracao/cliente/{id}`

Esta é a **página mais importante** - tudo sobre o cliente em um só lugar!

#### 🎯 4 Abas Principais:

### **ABA 1: RESUMO** 📊
O que o contador vê:
- **4 cards de métricas:**
  - Histórico (quantos meses cadastrados de 12)
  - Fator R (percentual e se atinge mínimo)
  - Apurações (quantas calculadas)
  - DAS Gerados (quantos documentos)

- **Status do Fator R:**
  - Alert colorido mostrando se atinge ou não o mínimo
  - Indica qual anexo será aplicado (III ou V)

- **Ações Rápidas:**
  - Upload Histórico → vai para aba 2
  - Calcular Impostos → vai para aba 3
  - Ver Apurações → vai para aba 4

---

### **ABA 2: HISTÓRICO 12 MESES** 📁
O que o contador faz:

#### Upload de CSV ✅ **RESOLVIDO**
```
1. Arrasta o CSV para a área de upload
2. Clica em "Processar CSV"
3. Sistema envia para o backend do CLIENTE selecionado
4. Mostra sucesso com quantidade de registros
5. Atualiza a tabela automaticamente
```

**✅ Não precisa mais selecionar empresa - já está no contexto do cliente!**

#### Visualização
- Tabela com os 12 meses cadastrados
- Colunas: Período, Folha, INSS/CPP, Faturamento, Fator R
- Dados formatados e organizados

---

### **ABA 3: CALCULAR IMPOSTOS** 🧮
O que o contador faz:

```
1. Informa o período (AAAAMM)
2. Sistema mostra:
   - Fator R calculado do cliente
   - Anexo que será aplicado
   - Faturamento 12 meses
   - Meses cadastrados
3. Clica em "Calcular Impostos"
4. Backend processa:
   - Busca notas fiscais do cliente no período
   - Calcula impostos por anexo
   - Gera resultado
5. Apuração criada e salva
6. Vai automaticamente para aba 4
```

---

### **ABA 4: APURAÇÕES** 📄
O que o contador vê:

#### Se não tem apuração:
- Mensagem explicativa
- Botão para ir calcular

#### Se tem apurações:
Para cada apuração, mostra:
- Período formatado (MM/AAAA)
- Status (calculada, DAS gerado, etc)
- Receita Bruta
- Total de Impostos (em vermelho)
- Alíquota efetiva
- Fator R usado

**Ações:**
- Botão "Upload DAS" (se ainda não tem)
- Botão "Ver Detalhes"

---

## 🎨 Vantagens do Novo Fluxo

### Para o Time Fiscal

✅ **Tudo sobre o cliente em um lugar**
- Não precisa ficar navegando entre páginas
- Histórico, cálculo e apurações na mesma tela

✅ **Upload de CSV direto no cliente**
- Não precisa selecionar empresa
- Sistema já sabe qual cliente está sendo gerenciado

✅ **Contexto sempre claro**
- Nome e CNPJ do cliente sempre visíveis
- Breadcrumbs mostrando onde está

✅ **Visualização completa**
- Vê quantos meses de histórico tem
- Vê o Fator R calculado
- Vê todas as apurações já feitas
- Vê quais têm DAS gerado

✅ **Ações rápidas**
- 1 clique para fazer upload
- 1 clique para calcular
- 1 clique para ver apurações

---

## 📂 Estrutura de Arquivos Criados

```
src/
├── app/dashboard/fiscal/apuracao/
│   ├── clientes/
│   │   └── page.jsx ✅ Lista de clientes
│   └── cliente/[id]/
│       └── page.jsx ✅ Detalhe do cliente (dinâmico)
│
├── sections/apuracao-admin/view/
│   ├── clientes-apuracao-list-view.jsx ✅ View lista
│   └── cliente-apuracao-detalhe-view.jsx ✅ View detalhe (4 abas)
│
└── routes/paths.js
    ├── apuracaoClientes ✅ nova rota
    └── apuracaoCliente(id) ✅ nova rota dinâmica
```

---

## 🔄 Fluxo Passo a Passo Completo

### Cenário: Contador vai apurar impostos de um cliente

```
PASSO 1: Dashboard
/dashboard/fiscal/apuracao
→ Clica em "Gerenciar por Cliente"

PASSO 2: Lista de Clientes
/dashboard/fiscal/apuracao/clientes
→ Vê todos os clientes
→ Busca se necessário
→ Clica no cliente

PASSO 3: Página do Cliente
/dashboard/fiscal/apuracao/cliente/ABC123
→ Vê resumo do cliente

PASSO 4: Upload Histórico
→ Clica na aba "Histórico 12 Meses"
→ Faz upload do CSV
→ Sistema processa ✅ (já sabe qual cliente!)
→ Tabela atualiza com os 12 meses

PASSO 5: Calcular
→ Clica na aba "Calcular Impostos"
→ Vê o Fator R calculado
→ Informa o período (ex: 202412)
→ Clica em "Calcular Impostos"
→ Sistema busca notas do cliente
→ Calcula impostos
→ Vai para aba "Apurações"

PASSO 6: Ver Resultado
→ Vê a apuração calculada
→ Valores, alíquota, Fator R
→ Clica em "Upload DAS"

PASSO 7: Upload DAS
→ Vai para /upload-das?id=...
→ Faz upload do PDF
→ DAS disponível para o cliente
✅ CONCLUÍDO
```

---

## 💡 Casos de Uso

### Caso 1: Cliente Novo (sem histórico)
```
1. Seleciona o cliente na lista
2. Resumo mostra "0/12" meses
3. Alerta: "Cadastre o histórico primeiro"
4. Vai para aba Histórico
5. Faz upload do CSV
6. Agora pode calcular
```

### Caso 2: Cliente com Histórico (calcular novo período)
```
1. Seleciona o cliente
2. Resumo mostra "12/12" meses ✓
3. Fator R: 24.5% (Anexo V)
4. Vai para aba Calcular
5. Informa período 202412
6. Calcula
7. Apuração criada
8. Faz upload do DAS
```

### Caso 3: Consultar apurações antigas
```
1. Seleciona o cliente
2. Vai para aba Apurações
3. Vê histórico de todas as apurações
4. Filtra por período se necessário
5. Verifica quais têm DAS gerado
```

---

## 🎯 Features Implementadas

### Lista de Clientes
✅ Grid visual com cards  
✅ Busca por nome/CNPJ  
✅ Avatar com iniciais  
✅ Badges de regime e atividade  
✅ Hover effects  
✅ Click para ir ao detalhe  

### Página Detalhada do Cliente
✅ Header com info do cliente  
✅ 4 abas organizadas  
✅ Cards de métricas no resumo  
✅ Upload CSV direto (sem seleção de empresa)  
✅ Tabela de histórico formatada  
✅ Cálculo de impostos integrado  
✅ Lista de apurações com ações  
✅ Status visual do Fator R  
✅ Navegação entre abas  
✅ Breadcrumbs contextuais  

---

## 🔧 Tecnologias Usadas

### Integração com Backend
- `useGetAllClientes()` - Lista clientes
- `useHistorico12Meses(clienteId, periodo)` - Busca histórico do cliente
- `uploadCSVHistorico(clienteId, file)` - Upload CSV para o cliente específico
- `calcularApuracao(clienteId, payload)` - Calcula para o cliente
- `useApuracoes(clienteId)` - Lista apurações do cliente

### UI/UX
- Tabs do Material-UI
- Cards responsivos
- Alerts informativos
- Upload component
- Tabelas formatadas
- Loading states
- Toast notifications

---

## 📊 Comparação: Antes vs Agora

### ANTES ❌
```
- Páginas separadas
- Tinha que selecionar empresa toda hora
- Upload CSV genérico (erro: "Empresa não selecionada")
- Calcular sem contexto do cliente
- Ver apurações de todos misturado
```

### AGORA ✅
```
- Tudo em uma página por cliente
- Cliente já selecionado (contexto mantido)
- Upload CSV direto no cliente ✅
- Calcular com contexto do cliente ✅
- Ver só apurações daquele cliente ✅
- Histórico daquele cliente ✅
- Fator R daquele cliente ✅
```

---

## 🚀 Como Usar (Resumo)

### Para o Contador:

1. **Acessa:** `/dashboard/fiscal/apuracao/clientes`
2. **Seleciona:** Clica no cliente
3. **Gerencia:** Tudo sobre o cliente em 4 abas
4. **Upload:** CSV direto na aba Histórico
5. **Calcula:** Na aba Calcular Impostos
6. **Confere:** Na aba Apurações
7. **Finaliza:** Upload do DAS

**Simples, rápido e organizado por cliente!** 🎯

---

## 📝 Notas Importantes

### Upload de CSV Resolvido ✅
- **Problema:** "Empresa não selecionada"
- **Solução:** Upload agora é na página do cliente
- **Como:** Cliente já está selecionado (ID na URL)
- **Resultado:** `uploadCSVHistorico(clienteId, file)` funciona perfeitamente

### Fator R por Cliente
- Calculado automaticamente ao fazer upload
- Visível no resumo e no cálculo
- Atualizado sempre que histórico muda

### Apurações por Cliente
- Filtradas automaticamente
- Só mostra daquele cliente
- Histórico completo visível

---

**Status:** ✅ **IMPLEMENTADO E FUNCIONANDO**  
**Foco:** Gestão por Cliente  
**Problema Resolvido:** Upload de CSV ✅  
**Versão:** 2.0  
**Data:** Novembro 2024

