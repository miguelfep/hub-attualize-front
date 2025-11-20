# 📊 Sistema de Impostos - Estrutura Final

## 🎯 Visão Geral

O sistema de impostos e apuração está dividido em **duas áreas distintas**:

### 👥 Portal do Cliente (Visualização)
**Objetivo:** Permitir que o empresário acompanhe seus impostos e entenda seu Fator R

**Acesso:** `/portal-cliente/impostos`

**Funcionalidades:**
- ✅ Visualizar DAS gerados
- ✅ Baixar PDF dos DAS
- ✅ Acompanhar status de pagamento
- ✅ Verificar Fator R
- ✅ Ver evolução do Fator R (gráfico)

### 👨‍💼 Dashboard Interno (Gestão)
**Objetivo:** Permitir que os contadores gerenciem todo o processo de apuração

**Acesso:** `/dashboard/fiscal/apuracao`

**Funcionalidades:**
- ✅ Cadastrar histórico de folha e faturamento
- ✅ Upload de CSV em massa
- ✅ Calcular apurações
- ✅ Gerar DAS via SERPRO
- ✅ Gerenciar status

---

## 📁 Estrutura de Arquivos

### Portal do Cliente (`/portal-cliente/impostos`)

```
src/
├── app/portal-cliente/impostos/
│   ├── page.jsx                      → Lista de DAS (visualização)
│   └── fator-r/
│       └── page.jsx                  → Acompanhamento Fator R
│
├── sections/impostos-cliente/
│   └── view/
│       ├── index.js
│       ├── impostos-cliente-view.jsx  → View da lista de DAS
│       └── fator-r-cliente-view.jsx   → View do Fator R
```

### Dashboard Interno (`/dashboard/fiscal/apuracao`)

```
src/
├── app/dashboard/fiscal/apuracao/
│   ├── page.jsx                        → Dashboard de apuração (admin)
│   ├── list/
│   │   └── page.jsx                    → Lista de apurações
│   ├── historico/
│   │   └── page.jsx                    → Gestão de histórico
│   └── calcular/
│       └── page.jsx                    → Calcular nova apuração
│
├── sections/apuracao/
│   ├── view/
│   │   ├── index.js
│   │   ├── apuracao-dashboard-view.jsx
│   │   ├── historico-folha-view.jsx
│   │   ├── calcular-apuracao-view.jsx
│   │   ├── apuracao-detalhes-view.jsx
│   │   └── das-list-view.jsx
│   ├── apuracao-card.jsx
│   ├── das-card.jsx
│   └── historico-chart.jsx
```

---

## 🗺️ Rotas

### Portal do Cliente

```javascript
paths.cliente.impostos = {
  root: '/portal-cliente/impostos',        // Lista de DAS
  fatorR: '/portal-cliente/impostos/fator-r', // Acompanhamento Fator R
}
```

### Dashboard Interno

```javascript
paths.dashboard.fiscal = {
  apuracao: '/dashboard/fiscal/apuracao',              // Dashboard
  apuracaoList: '/dashboard/fiscal/apuracao/list',     // Lista de apurações
  historicoFolha: '/dashboard/fiscal/apuracao/historico', // Gestão histórico
  calcular: '/dashboard/fiscal/apuracao/calcular',     // Calcular apuração
}
```

---

## 🔄 Fluxo de Trabalho

### 1️⃣ Contador (Dashboard Interno)

```
1. Acessa /dashboard/fiscal/apuracao/historico
2. Faz upload do CSV com dados de folha e faturamento
   OU cadastra manualmente mês a mês
3. Acessa /dashboard/fiscal/apuracao/calcular
4. Calcula a apuração do período
5. Sistema gera DAS automaticamente (ou manualmente)
6. DAS fica disponível para o cliente
```

### 2️⃣ Cliente (Portal)

```
1. Acessa /portal-cliente/impostos
2. Visualiza DAS pendentes de pagamento
3. Baixa PDF do DAS
4. Efetua pagamento via banco
5. (Opcional) Acessa /portal-cliente/impostos/fator-r
6. Acompanha evolução do Fator R
```

---

## 🎨 Páginas do Portal do Cliente

### 1. Lista de Impostos (`/portal-cliente/impostos`)

**Componentes Principais:**
- 3 cards de métricas:
  - DAS Pendentes
  - Total a Pagar
  - DAS Pagos
- Tabs de filtro (Pendentes / Pagos / Todos)
- Cards de DAS com:
  - Informações do documento
  - Data de vencimento
  - Valores
  - Alerta se vencido
  - Botão de download PDF

**Features:**
- ✅ Download individual de PDF
- ✅ Detecção automática de vencimento
- ✅ Alertas visuais
- ✅ Filtros por status
- ✅ Badge de ambiente (TESTE/PRODUÇÃO)

### 2. Acompanhamento Fator R (`/portal-cliente/impostos/fator-r`)

**Componentes Principais:**
- Card de status do Fator R:
  - Percentual atual
  - Anexo aplicável (III ou V)
  - Explicação clara
- Cards de métricas:
  - Folha + INSS (12 meses)
  - Faturamento (12 meses)
  - Meses registrados
- Gráfico de evolução (ApexCharts):
  - Linha do Fator R mensal
  - Linha de referência (28%)
- Card explicativo "Como melhorar o Fator R"

**Features:**
- ✅ Gráfico interativo
- ✅ Explicações em linguagem clara
- ✅ Dicas práticas
- ✅ Alertas contextuais
- ✅ Indicadores visuais (cores)

---

## 📊 Componentes Reutilizáveis

### DasCard (usado no portal)
```javascript
<DasCard
  das={dasData}
  onDownload={() => handleDownload(das)}
/>
```

**Props:**
- `das`: Objeto com dados do DAS
- `onDownload`: Callback para download

**Features:**
- Detecção automática de vencimento
- Formatação de datas
- Indicadores visuais
- Badge de ambiente

---

## 🔐 Permissões

### Portal do Cliente
- ✅ Visualizar DAS da própria empresa
- ✅ Baixar PDF dos DAS
- ✅ Ver Fator R da própria empresa
- ❌ Criar/editar apurações
- ❌ Gerar DAS
- ❌ Cadastrar histórico

### Dashboard Interno
- ✅ Visualizar todas as empresas
- ✅ Cadastrar histórico
- ✅ Calcular apurações
- ✅ Gerar DAS
- ✅ Gerenciar status
- ✅ Upload de CSV

---

## 💡 Benefícios da Nova Estrutura

### Para o Cliente
1. **Interface Simplificada**: Apenas o essencial
2. **Informações Claras**: Sem jargões técnicos
3. **Acesso Rápido**: Download direto dos DAS
4. **Transparência**: Acompanha Fator R em tempo real
5. **Educacional**: Entende como funciona o cálculo

### Para os Contadores
1. **Controle Total**: Gestão centralizada
2. **Eficiência**: Upload em massa via CSV
3. **Automatização**: DAS gerado automaticamente
4. **Histórico Completo**: Todos os dados em um lugar
5. **Flexibilidade**: Pode ajustar antes de disponibilizar

---

## 🚀 Como Usar

### Para Contadores

**1. Cadastrar Histórico:**
```
1. Acesse /dashboard/fiscal/apuracao/historico
2. Clique em "Upload CSV"
3. Faça upload do arquivo com dados dos últimos 12 meses
4. Ou cadastre manualmente mês a mês
```

**2. Calcular Apuração:**
```
1. Acesse /dashboard/fiscal/apuracao/calcular
2. Selecione o período (AAAAMM)
3. Confirme os dados
4. Clique em "Calcular"
5. Sistema gera apuração e DAS automaticamente
```

**3. Revisar e Liberar:**
```
1. Acesse /dashboard/fiscal/apuracao/list
2. Revise a apuração calculada
3. DAS estará disponível automaticamente no portal do cliente
```

### Para Clientes

**1. Visualizar Impostos:**
```
1. Acesse /portal-cliente/impostos
2. Veja todos os DAS pendentes
3. Baixe o PDF
4. Efetue o pagamento
```

**2. Acompanhar Fator R:**
```
1. No menu, clique em "Ver Fator R"
2. Veja o percentual atual
3. Acompanhe o gráfico de evolução
4. Entenda se está no Anexo III ou V
```

---

## 📝 Checklist de Implementação

### Portal do Cliente ✅
- [x] Página de lista de DAS
- [x] Download de PDF
- [x] Filtros por status
- [x] Alertas de vencimento
- [x] Página de Fator R
- [x] Gráfico de evolução
- [x] Explicações educacionais

### Dashboard Interno (Próximos Passos)
- [ ] Mover páginas de gestão
- [ ] Criar permissões por perfil
- [ ] Integrar com navegação do dashboard
- [ ] Adicionar ao menu lateral

---

## 🎯 Próximos Passos

1. **Mover para Dashboard Interno:**
   - Copiar views de apuração para `/dashboard/fiscal/apuracao`
   - Adicionar verificação de permissões
   - Integrar no menu de navegação

2. **Melhorias no Portal:**
   - Adicionar histórico de pagamentos
   - Notificações de novos DAS
   - Export de relatórios

3. **Automações:**
   - Email quando DAS é gerado
   - Alerta de vencimento próximo
   - Resumo mensal automático

---

## 📚 Documentação Relacionada

- `SISTEMA-APURACAO.md` - Documentação técnica completa
- `QUICK-START-APURACAO.md` - Guia rápido de uso
- `src/types/apuracao.ts` - Tipos TypeScript

---

**Status:** ✅ Portal do Cliente Concluído  
**Versão:** 2.0  
**Data:** Novembro 2024

