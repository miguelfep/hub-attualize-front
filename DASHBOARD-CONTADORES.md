# 👨‍💼 Dashboard de Apuração para Contadores

## 🎯 Visão Geral

Sistema completo de gestão de apuração de impostos para contadores, com cálculo automático baseado em notas fiscais, consideração do Fator R, e upload/geração de DAS.

---

## 📍 Páginas Implementadas

### 1. Dashboard Principal
**Rota:** `/dashboard/fiscal/apuracao`

**Funcionalidades:**
- 4 cards de métricas (Clientes com Pendência, Apurações do Mês, DAS Gerados, Valor Total)
- Ações rápidas (Upload CSV, Calcular Impostos, Ver Apurações, Gerenciar Clientes)
- Explicação visual do fluxo de trabalho em 4 passos

---

### 2. Calcular Impostos ⭐ **PRINCIPAL**
**Rota:** `/dashboard/fiscal/apuracao/calcular`

**Funcionalidades:**
- Seleção de cliente
- Seleção de período (AAAAMM)
- Busca automática do histórico de 12 meses
- Exibição do Fator R calculado
- Indicação do anexo aplicável (III ou V)
- Busca automática de notas fiscais do período
- Cálculo de impostos por anexo
- Detalhamento por nota fiscal
- Geração do resultado completo

**Fluxo:**
1. Contador seleciona cliente e período
2. Sistema busca histórico dos últimos 12 meses
3. Calcula Fator R automaticamente
4. Determina anexo (III se ≥28%, V se <28%)
5. Busca notas fiscais emitidas no período
6. Agrupa notas por anexo e CNAE
7. Calcula alíquota efetiva por faixa
8. Gera resultado com totais

**Resultado Exibido:**
- Receita Bruta Total
- Total de Impostos
- Alíquota Efetiva
- Detalhamento por Anexo (accordion)
- Lista de notas fiscais por anexo
- Observações do cálculo
- Botão para gerar/upload DAS

---

### 3. Upload de DAS
**Rota:** `/dashboard/fiscal/apuracao/upload-das`

**Funcionalidades:**
- Seleção da apuração calculada
- Informação do número do documento
- Data de vencimento
- Upload do arquivo PDF
- Disponibilização imediata no portal do cliente

**Campos:**
- Apuração (select com lista)
- Número do Documento
- Data de Vencimento
- Arquivo PDF

**Futuro:** Integração com SERPRO para geração automática

---

### 4. Histórico de Folha
**Rota:** `/dashboard/fiscal/apuracao/historico`

**Funcionalidades:**
- Upload de CSV em massa
- Cadastro manual mês a mês
- Download de template CSV
- Tabela com todos os históricos
- Cálculo automático de Fator R por período
- Visualização de folha + encargos
- Edição de registros

---

### 5. Lista de Apurações
**Rota:** `/dashboard/fiscal/apuracao/list`

**Funcionalidades:**
- Tabela completa de apurações
- Filtros por período e cliente
- Tabs (Todas, Sem DAS, Com DAS)
- Exibição de Fator R
- Status do DAS
- Ações rápidas (Ver, Editar, Upload DAS)

**Colunas:**
- Cliente
- Período
- Receita Bruta
- Total Impostos
- Alíquota
- Fator R
- DAS (status)
- Status
- Ações

---

## 🔄 Fluxo Completo de Trabalho

### Passo 1: Preparação
```
1. Acesse /dashboard/fiscal/apuracao/historico
2. Faça upload do CSV com dados dos últimos 12 meses
   - Folha de pagamento (sem encargos)
   - INSS/CPP
   - Faturamento bruto
   - Deduções (opcional)
```

### Passo 2: Cálculo
```
1. Acesse /dashboard/fiscal/apuracao/calcular
2. Selecione o cliente
3. Informe o período (AAAAMM)
4. Sistema mostra:
   - Fator R calculado
   - Anexo aplicável
   - Histórico dos 12 meses
5. Clique em "Calcular Impostos"
6. Sistema processa:
   - Busca notas fiscais
   - Calcula impostos por anexo
   - Gera resultado detalhado
```

### Passo 3: Gerar DAS
```
1. Após calcular, clique em "Gerar/Upload DAS"
2. Na página de upload:
   - Selecione a apuração
   - Informe número do documento
   - Informe data de vencimento
   - Faça upload do PDF
3. Clique em "Criar e Disponibilizar DAS"
4. DAS fica imediatamente disponível no portal do cliente
```

### Passo 4: Cliente Visualiza
```
1. Cliente acessa /portal-cliente/impostos
2. Vê o DAS disponível
3. Baixa o PDF
4. Efetua pagamento
```

---

## 📊 Como Funciona o Cálculo

### Fator R
```
Fator R = (Folha12m + INSS12m) / RBT12m * 100

Onde:
- Folha12m: Soma da folha dos últimos 12 meses
- INSS12m: Soma do INSS/CPP dos últimos 12 meses
- RBT12m: Receita Bruta Total dos últimos 12 meses
```

### Regra de Anexo
```
Se Fator R >= 28% → Anexo III (alíquotas reduzidas)
Se Fator R < 28%  → Anexo V (alíquotas padrão)
```

### Alíquota Efetiva

**Anexo III (com Fator R):**
```
Alíquota Efetiva = [(RBT12m × Alíquota) - Dedução] / RBT12m
```

**Anexo V (sem Fator R):**
```
Alíquota = Fixa por faixa de faturamento
```

### Tabelas de Alíquotas

**Anexo III:**
| Receita Bruta 12m       | Alíquota | Dedução    |
|-------------------------|----------|------------|
| Até R$ 180.000          | 6,00%    | R$ 0       |
| R$ 180.000 a 360.000    | 11,20%   | R$ 9.360   |
| R$ 360.000 a 720.000    | 13,50%   | R$ 17.640  |
| R$ 720.000 a 1.800.000  | 16,00%   | R$ 35.640  |
| R$ 1.800.000 a 3.600.000| 21,00%   | R$ 125.640 |
| R$ 3.600.000 a 4.800.000| 33,00%   | R$ 648.000 |

**Anexo V:**
| Receita Bruta 12m       | Alíquota |
|-------------------------|----------|
| Até R$ 180.000          | 15,50%   |
| R$ 180.000 a 360.000    | 18,00%   |
| R$ 360.000 a 720.000    | 19,50%   |
| R$ 720.000 a 1.800.000  | 20,50%   |
| R$ 1.800.000 a 3.600.000| 23,00%   |
| R$ 3.600.000 a 4.800.000| 30,50%   |

---

## 📋 Formato do CSV para Upload

### Estrutura
```csv
periodo,folha_pagamento,inss_cpp,faturamento_bruto,deducoes,observacoes
202401,10000.00,2200.00,50000.00,0,Janeiro 2024
202402,10500.00,2310.00,52000.00,0,Fevereiro 2024
```

### Colunas (case insensitive)
- **periodo** (obrigatório): Formato AAAAMM
- **folha_pagamento** (obrigatório): Valor SEM encargos
- **inss_cpp** (obrigatório): INSS/CPP total
- **faturamento_bruto** (obrigatório): Receita bruta
- **deducoes** (opcional): Deduções
- **observacoes** (opcional): Texto livre

### Validações
- Período no formato AAAAMM
- Mês entre 01-12
- Valores numéricos não negativos
- Tamanho máximo: 5MB

---

## 🎨 Features Implementadas

### Cálculo de Impostos
✅ Busca automática de notas fiscais  
✅ Cálculo de Fator R (12 meses)  
✅ Determinação automática de anexo  
✅ Cálculo de alíquota efetiva por faixa  
✅ Agrupamento de notas por anexo  
✅ Detalhamento completo  
✅ Observações contextuais  

### Upload de DAS
✅ Seleção de apuração  
✅ Upload de PDF  
✅ Validações de campos  
✅ Disponibilização imediata  
✅ Estrutura pronta para SERPRO  

### Histórico
✅ Upload CSV em massa  
✅ Cadastro manual  
✅ Cálculo automático de Fator R  
✅ Tabela completa  
✅ Filtros e busca  

### Lista de Apurações
✅ Tabela completa  
✅ Filtros avançados  
✅ Tabs de status  
✅ Ações rápidas  
✅ Indicadores visuais  

---

## 🔮 Próximas Implementações

### Integração SERPRO (Futuro)
```javascript
// Função preparada para futura implementação
async function gerarDasSerpro(apuracaoId, payload) {
  const response = await axios.post(
    endpoints.apuracao.gerarDas(apuracaoId),
    {
      ambiente: 'producao', // ou 'teste'
      dataConsolidacao: '20241231',
    }
  );
  
  return response.data; // Retorna PDF em base64
}
```

### Melhorias Sugeridas
- [ ] Notificação automática ao cliente quando DAS é gerado
- [ ] Relatório mensal em PDF
- [ ] Dashboard analytics avançado
- [ ] Export para Excel
- [ ] Histórico de alterações
- [ ] Logs de auditoria

---

## 📁 Estrutura de Arquivos

```
src/
├── app/dashboard/fiscal/apuracao/
│   ├── page.jsx                    → Dashboard
│   ├── calcular/
│   │   └── page.jsx                → Calcular impostos
│   ├── list/
│   │   └── page.jsx                → Lista de apurações
│   ├── historico/
│   │   └── page.jsx                → Histórico de folha
│   └── upload-das/
│       └── page.jsx                → Upload de DAS
│
├── sections/apuracao-admin/
│   └── view/
│       ├── index.js
│       ├── apuracao-dashboard-admin-view.jsx
│       ├── calcular-impostos-admin-view.jsx (⭐ PRINCIPAL)
│       ├── historico-folha-admin-view.jsx
│       ├── apuracao-list-admin-view.jsx
│       └── upload-das-admin-view.jsx
│
├── actions/
│   ├── apuracao.js                 → Actions de apuração
│   └── historico-folha.js          → Actions de histórico
│
└── types/
    └── apuracao.ts                 → Tipos TypeScript
```

---

## 🔐 Permissões

**Quem pode acessar:**
- Perfis: `admin` e `operacional` (contadores)

**O que podem fazer:**
- ✅ Cadastrar histórico
- ✅ Calcular apurações
- ✅ Fazer upload de DAS
- ✅ Ver todas as empresas
- ✅ Editar dados

---

## 💡 Dicas de Uso

### Melhor Fluxo
1. **No início do mês:** Cadastre o histórico do mês anterior
2. **Após fechamento:** Calcule a apuração
3. **Após calcular:** Faça upload do DAS
4. **Cliente paga:** Marque como pago no sistema

### Evite Erros
- ❌ Não calcule sem histórico dos 12 meses
- ❌ Não esqueça de verificar as notas fiscais
- ❌ Não faça upload de DAS sem revisar valores
- ✅ Sempre confira o Fator R antes de calcular
- ✅ Revise o resultado antes de gerar DAS

---

## 🎯 Resultado Final

### Para o Contador
- Sistema completo de gestão
- Cálculos automáticos
- Upload simples de DAS
- Controle total do processo

### Para o Cliente
- Visualização clara e simples
- Download direto de PDF
- Acompanhamento de Fator R
- Transparência total

---

**Status:** ✅ Implementação Completa  
**Versão:** 1.0  
**Data:** Novembro 2024

