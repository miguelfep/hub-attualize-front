# 🔌 Integração com Backend - Sistema de Apuração

## ✅ Status da Integração

### Já Integrado
- ✅ Busca de clientes (`useGetAllClientes`)
- ✅ Histórico de folha (`useHistorico12Meses`)
- ✅ Cálculo de apuração (`calcularApuracao`)
- ✅ Listagem de apurações (`useApuracoes`)
- ✅ Listagem de DAS (`useDas`)
- ✅ Download de PDF do DAS (`baixarDasPdf`)
- ✅ Helpers de formatação (JavaScript puro)

---

## 📡 Endpoints Configurados

### Histórico de Folha
```javascript
historicoFolha: {
  listar: (clienteId) => `${baseUrl}historico-folha-faturamento/${clienteId}`,
  criar: (clienteId) => `${baseUrl}historico-folha-faturamento/${clienteId}`,
  uploadCsv: (clienteId) => `${baseUrl}historico-folha-faturamento/${clienteId}/upload-csv`,
  totais12Meses: (clienteId) => `${baseUrl}historico-folha-faturamento/${clienteId}/12-meses`,
  buscar: (historicoId) => `${baseUrl}historico-folha-faturamento/historico/${historicoId}`,
  atualizar: (historicoId) => `${baseUrl}historico-folha-faturamento/historico/${historicoId}`,
  cancelar: (historicoId) => `${baseUrl}historico-folha-faturamento/historico/${historicoId}/cancelar`,
}
```

### Apuração
```javascript
apuracao: {
  calcular: (empresaId) => `${baseUrl}apuracao/${empresaId}/calcular`,
  listar: (empresaId) => `${baseUrl}apuracao/${empresaId}/apuracoes`,
  detalhes: (apuracaoId) => `${baseUrl}apuracao/apuracao/${apuracaoId}`,
  cancelar: (apuracaoId) => `${baseUrl}apuracao/apuracao/${apuracaoId}/cancelar`,
  recalcular: (apuracaoId) => `${baseUrl}apuracao/apuracao/${apuracaoId}/recalcular`,
  gerarDas: (apuracaoId) => `${baseUrl}apuracao/apuracao/${apuracaoId}/gerar-das`,
  gerarDasDireto: (empresaId) => `${baseUrl}apuracao/${empresaId}/gerar-das`,
  listarDas: (empresaId) => `${baseUrl}apuracao/${empresaId}/das`,
  dasDetalhes: (dasId) => `${baseUrl}apuracao/das/${dasId}`,
  dasPdf: (dasId) => `${baseUrl}apuracao/das/${dasId}/pdf`,
  dasPagar: (dasId) => `${baseUrl}apuracao/das/${dasId}/pagar`,
  dasCancelar: (dasId) => `${baseUrl}apuracao/das/${dasId}/cancelar`,
}
```

---

## 🔧 Correções Realizadas

### 1. Criação de Helpers JavaScript
**Problema:** Importar funções TypeScript em arquivos `.jsx` causava erro  
**Solução:** Criado `src/utils/apuracao-helpers.js` com:
- `formatarPeriodo(periodo)`
- `validarPeriodo(periodo)`
- `calcularAliquotaEfetiva(receita, tabela)`
- `FATOR_R_MINIMO`
- `TABELA_ANEXO_III`
- `TABELA_ANEXO_V`

### 2. Integração com Hook de Clientes
**Antes:** Mock estático de clientes  
**Depois:** `useGetAllClientes({ status: true, apurarHub: true })`

**Código:**
```javascript
const { data: clientes, isLoading: loadingClientes } = useGetAllClientes({
  status: true,
  apurarHub: true, // Apenas clientes com apuração habilitada
});
```

### 3. Integração com Apurações
**Antes:** Array mockado  
**Depois:** `useApuracoes(empresaId, filtros)`

**Código:**
```javascript
const { data: apuracoesData, isLoading, mutate } = useApuracoes(null, {});
const apuracoesArray = apuracoesData?.apuracoes || [];
```

---

## 📝 Como Usar as APIs

### Calcular Apuração
```javascript
import { calcularApuracao } from 'src/actions/apuracao';

const resultado = await calcularApuracao(clienteId, {
  periodoApuracao: '202412',
  calcularFatorR: true,
  folhaPagamentoMes: 10500,
  inssCppMes: 2310,
});

// Retorna:
// {
//   _id: '...',
//   periodoApuracao: '202412',
//   fatorR: { percentual: 24.4, ... },
//   notasPorAnexo: [...],
//   totalReceitaBruta: 52000,
//   totalImpostos: 8060,
//   aliquotaEfetivaTotal: 15.5,
//   status: 'calculada',
//   ...
// }
```

### Upload de CSV
```javascript
import { uploadCSVHistorico } from 'src/actions/historico-folha';

const result = await uploadCSVHistorico(clienteId, file, sobrescrever);

// Retorna:
// {
//   sucesso: true,
//   totalLinhas: 12,
//   inseridos: 10,
//   atualizados: 2,
//   erros: [{ linha: 5, erro: '...' }],
//   registros: [...]
// }
```

### Buscar Histórico 12 Meses
```javascript
import { useHistorico12Meses } from 'src/actions/historico-folha';

const { data, isLoading } = useHistorico12Meses(clienteId, '202412');

// Retorna:
// {
//   periodoReferencia: '202412',
//   mesesEncontrados: 12,
//   historicos: [...],
//   totais: {
//     folhaTotal: 120000,
//     inssTotal: 26400,
//     faturamentoTotal: 600000,
//     folhaComEncargosTotal: 146400,
//     fatorRMedio: 24.4,
//     atingeFatorRMinimo: false
//   }
// }
```

### Download de DAS (PDF)
```javascript
import { baixarDasPdf } from 'src/actions/apuracao';

const response = await baixarDasPdf(dasId);
const blob = new Blob([response.data], { type: 'application/pdf' });
const url = window.URL.createObjectURL(blob);

// Criar link de download
const link = document.createElement('a');
link.href = url;
link.download = `DAS_${numeroDocumento}.pdf`;
link.click();
window.URL.revokeObjectURL(url);
```

---

## 🔄 Fluxo de Dados

### 1. Calcular Impostos
```
Frontend                              Backend
   |                                     |
   | POST /apuracao/{empresaId}/calcular |
   |------------------------------------>|
   | Body: {                             |
   |   periodoApuracao: "202412",        |
   |   calcularFatorR: true,             |
   |   folhaPagamentoMes: 10500,         |
   |   inssCppMes: 2310                  |
   | }                                   |
   |                                     |
   |                    Backend processa:|
   |                    1. Busca notas   |
   |                    2. Calcula Fator R|
   |                    3. Determina anexo|
   |                    4. Calcula impostos|
   |                                     |
   |<------------------------------------|
   | Response: {                         |
   |   _id: "...",                       |
   |   totalReceitaBruta: 52000,         |
   |   totalImpostos: 8060,              |
   |   fatorR: {...},                    |
   |   notasPorAnexo: [...]              |
   | }                                   |
```

### 2. Upload de Histórico
```
Frontend                              Backend
   |                                     |
   | POST /historico-folha/.../upload-csv|
   |------------------------------------>|
   | FormData:                           |
   |   - arquivo: CSV                    |
   |   - sobrescrever: false             |
   |                                     |
   |                    Backend processa:|
   |                    1. Valida CSV    |
   |                    2. Parse linhas  |
   |                    3. Calcula Fator R|
   |                    4. Salva registros|
   |                                     |
   |<------------------------------------|
   | Response: {                         |
   |   sucesso: true,                    |
   |   inseridos: 10,                    |
   |   erros: [...]                      |
   | }                                   |
```

---

## 🎯 Próximas Integrações

### Upload de DAS (Manual)
**Status:** Estrutura pronta, aguardando endpoint do backend

**Endpoint esperado:**
```
POST /apuracao/apuracao/{apuracaoId}/upload-das
Content-Type: multipart/form-data

Body:
- pdf: arquivo
- numeroDocumento: string
- dataVencimento: string (AAAAMMDD)
```

**Função preparada:**
```javascript
// src/actions/apuracao.js (a criar)
export async function uploadDasPdf(apuracaoId, formData) {
  const response = await axios.post(
    `${baseUrl}apuracao/apuracao/${apuracaoId}/upload-das`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}
```

### Geração Automática via SERPRO (Futuro)
**Status:** Estrutura pronta, aguardando implementação no backend

**Endpoint já mapeado:**
```javascript
gerarDas: (apuracaoId) => `${baseUrl}apuracao/apuracao/${apuracaoId}/gerar-das`
```

**Uso:**
```javascript
import { gerarDasDeApuracao } from 'src/actions/apuracao';

const das = await gerarDasDeApuracao(apuracaoId, {
  ambiente: 'producao', // ou 'teste'
  dataConsolidacao: '20241231',
});
```

---

## 🐛 Troubleshooting

### Erro: "formatarPeriodo is not a function"
**Solução:** Importar de `src/utils/apuracao-helpers.js` ao invés de `src/types/apuracao.ts`

```javascript
// ❌ Errado
import { formatarPeriodo } from 'src/types/apuracao';

// ✅ Correto
import { formatarPeriodo } from 'src/utils/apuracao-helpers';
```

### Erro: "Cannot read properties of undefined"
**Causa:** Backend retornou estrutura diferente do esperado  
**Solução:** Usar optional chaining e valores padrão

```javascript
// ✅ Sempre use optional chaining
const apuracoesArray = apuracoesData?.apuracoes || [];
const clienteNome = apuracao.clienteNome || apuracao.cliente?.nome || 'N/A';
```

### Erro: "Network Error" ou "401 Unauthorized"
**Causa:** Token de autenticação não está sendo enviado  
**Solução:** Verificar `getAuthHeaders()` nas actions

```javascript
// Todas as chamadas devem incluir:
const response = await axios.post(url, data, {
  headers: getAuthHeaders(),
});
```

---

## ✅ Checklist de Integração

### Backend
- [x] Endpoints de histórico criados
- [x] Endpoint de cálculo de apuração criado
- [x] Endpoint de listagem de apurações criado
- [x] Endpoint de DAS criado
- [ ] Endpoint de upload de PDF do DAS
- [ ] Endpoint de geração via SERPRO

### Frontend
- [x] Helpers JavaScript criados
- [x] Integração com hook de clientes
- [x] Integração com histórico
- [x] Integração com apurações
- [x] Integração com DAS
- [x] Download de PDF funcionando
- [ ] Upload de PDF (aguardando endpoint)
- [ ] Geração via SERPRO (aguardando endpoint)

---

## 📚 Arquivos Importantes

**Actions (APIs):**
- `src/actions/apuracao.js` - Apuração e DAS
- `src/actions/historico-folha.js` - Histórico
- `src/actions/clientes.js` - Clientes

**Utils:**
- `src/utils/apuracao-helpers.js` - Helpers JavaScript
- `src/utils/axios.js` - Endpoints configurados

**Types:**
- `src/types/apuracao.ts` - Tipos TypeScript (referência)

---

**Status:** ✅ Integração Principal Completa  
**Pendente:** Upload de DAS e geração via SERPRO  
**Versão:** 1.0  
**Data:** Novembro 2024

