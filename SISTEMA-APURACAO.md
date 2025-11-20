# 📊 Sistema de Apuração - Frontend

Documentação do sistema de apuração de impostos e cálculo de Fator R no frontend.

## 📁 Estrutura de Arquivos

```
src/
├── types/
│   └── apuracao.ts          # Tipos TypeScript completos
├── actions/
│   ├── historico-folha.js   # Actions para histórico de folha
│   ├── apuracao.js          # Actions para apuração
│   └── index.js             # Exportações centralizadas
└── utils/
    └── axios.js             # Endpoints da API
```

## 🔧 Tipos Disponíveis

### HistoricoFolhaFaturamento

```typescript
import type { IHistoricoFolhaFaturamento } from 'src/types/apuracao';

const historico: IHistoricoFolhaFaturamento = {
  _id: '64abc123...',
  clienteId: '64abc...',
  cnpj: '12345678000190',
  periodoApuracao: '202401',
  mesReferencia: 1,
  anoReferencia: 2024,
  folhaPagamento: 10000,
  inssCpp: 2200,
  folhaComEncargos: 12200,
  faturamentoBruto: 50000,
  deducoes: 0,
  faturamentoLiquido: 50000,
  fatorRPercentual: 24.4,
  origem: 'manual',
  status: 'ativo',
};
```

### Apuracao

```typescript
import type { IApuracao } from 'src/types/apuracao';

const apuracao: IApuracao = {
  _id: '64def789...',
  clienteId: '64abc...',
  cnpj: '12345678000190',
  periodoApuracao: '202412',
  mesReferencia: 12,
  anoReferencia: 2024,
  regimeTributario: 'simples',
  anexoPrincipal: ['V'],
  fatorR: {
    percentual: 24.4,
    aplicavelAnexoIII: false,
    aplicavelAnexoV: true,
    // ... outros campos
  },
  notasPorAnexo: [
    {
      anexo: 'V',
      usaFatorR: false,
      quantidadeNotas: 15,
      totalNotas: 52000,
      aliquotaEfetiva: 15.5,
      impostoCalculado: 8060,
      notas: [],
    },
  ],
  totalReceitaBruta: 52000,
  totalImpostos: 8060,
  aliquotaEfetivaTotal: 15.5,
  tributos: [],
  dasGerado: false,
  status: 'calculada',
  observacoes: [],
  alertas: [],
};
```

### DAS

```typescript
import type { IDas } from 'src/types/apuracao';

const das: IDas = {
  _id: '64ghi012...',
  clienteId: '64abc...',
  cnpj: '12345678000190',
  ambiente: 'teste',
  periodoApuracao: '202412',
  numeroDocumento: '000000000000000-8',
  dataVencimento: '20250120',
  dataLimiteAcolhimento: '20250131',
  valores: {
    principal: 8060,
    multa: 0,
    juros: 0,
    total: 8060,
  },
  composicao: [],
  observacoes: [],
  status: 'gerado',
};
```

## 📡 Actions - Histórico de Folha

### Hooks (useSWR)

```javascript
import { useHistoricosFolha, useHistorico12Meses } from 'src/actions/historico-folha';

// Listar todos os históricos
const { data, isLoading, error } = useHistoricosFolha(clienteId, {
  status: 'ativo',
  periodoInicio: '202401',
  periodoFim: '202412',
});

// Buscar totais dos últimos 12 meses
const { data: totais12Meses } = useHistorico12Meses(clienteId, '202412');

console.log(totais12Meses?.totais.fatorRMedio); // 24.4
console.log(totais12Meses?.totais.atingeFatorRMinimo); // false
```

### Funções Assíncronas

```javascript
import {
  criarHistoricoFolha,
  uploadCSVHistorico,
  atualizarHistoricoFolha,
  cancelarHistoricoFolha,
} from 'src/actions/historico-folha';

// Criar histórico manual
const resultado = await criarHistoricoFolha(clienteId, {
  periodo: '202412',
  folhaPagamento: 10000,
  inssCpp: 2200,
  faturamentoBruto: 50000,
  deducoes: 0,
  observacoes: 'Dados de dezembro',
});

// Upload de CSV
const file = document.querySelector('input[type="file"]').files[0];
const uploadResult = await uploadCSVHistorico(clienteId, file, false);

console.log(`Inseridos: ${uploadResult.inseridos}`);
console.log(`Erros: ${uploadResult.erros.length}`);

// Atualizar histórico
await atualizarHistoricoFolha(historicoId, {
  folhaPagamento: 10500,
  observacoes: 'Valor corrigido',
});

// Cancelar histórico
await cancelarHistoricoFolha(historicoId, 'Dados informados incorretamente');
```

## 📡 Actions - Apuração

### Hooks (useSWR)

```javascript
import { useApuracoes, useApuracao, useDas, useDasDetalhes } from 'src/actions/apuracao';

// Listar apurações
const { data: apuracoes } = useApuracoes(empresaId, {
  status: 'calculada',
  periodoInicio: '202401',
  periodoFim: '202412',
});

// Buscar apuração específica
const { data: apuracao } = useApuracao(apuracaoId);

// Listar DAS
const { data: dasList } = useDas(empresaId, {
  ambiente: 'producao',
  status: 'gerado',
});

// Buscar DAS com PDF
const { data: das } = useDasDetalhes(dasId, true);
```

### Funções Assíncronas

```javascript
import {
  calcularApuracao,
  recalcularApuracao,
  cancelarApuracao,
  gerarDasDeApuracao,
  gerarDasDireto,
  baixarDasPdf,
  marcarDasComoPago,
  cancelarDas,
} from 'src/actions/apuracao';

// Calcular apuração
const apuracao = await calcularApuracao(empresaId, {
  periodoApuracao: '202412',
  calcularFatorR: true,
  folhaPagamentoMes: 10500,
  inssCppMes: 2310,
});

console.log(`Fator R: ${apuracao.fatorR.percentual}%`);
console.log(`Total Impostos: R$ ${apuracao.totalImpostos}`);

// Recalcular apuração existente
const apuracaoRecalculada = await recalcularApuracao(apuracaoId, {
  calcularFatorR: true,
});

// Cancelar apuração
await cancelarApuracao(apuracaoId, 'Dados incorretos');

// Gerar DAS de uma apuração
const das = await gerarDasDeApuracao(apuracaoId, {
  ambiente: 'teste',
  dataConsolidacao: '20241231',
});

console.log(`DAS gerado: ${das.numeroDocumento}`);

// Baixar PDF do DAS
const pdfResponse = await baixarDasPdf(dasId);
const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
const url = window.URL.createObjectURL(blob);

// Criar link de download
const a = document.createElement('a');
a.href = url;
a.download = `DAS_${das.numeroDocumento}.pdf`;
a.click();

// Marcar DAS como pago
await marcarDasComoPago(dasId, {
  valorPago: 8060,
  dataPagamento: new Date(),
});

// Cancelar DAS
await cancelarDas(dasId, 'DAS gerado incorretamente');
```

## 🎨 Helpers e Utilitários

```javascript
import {
  calcularAliquotaEfetiva,
  formatarPeriodo,
  validarPeriodo,
  TABELA_ANEXO_III,
  TABELA_ANEXO_V,
  FATOR_R_MINIMO,
} from 'src/types/apuracao';

// Calcular alíquota efetiva
const aliquota = calcularAliquotaEfetiva(600000, TABELA_ANEXO_III);
console.log(`Alíquota efetiva: ${aliquota.toFixed(2)}%`);

// Formatar período
const periodoFormatado = formatarPeriodo('202412'); // "12/2024"

// Validar período
const isValido = validarPeriodo('202412'); // true
const isInvalido = validarPeriodo('202413'); // false (mês inválido)

// Verificar se atinge Fator R mínimo
const fatorR = 29.5;
const atingeMinimo = fatorR >= FATOR_R_MINIMO; // true
console.log(`Usa Anexo III: ${atingeMinimo ? 'Sim' : 'Não'}`);
```

## 🧩 Exemplo Completo: Tela de Apuração

```jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
} from '@mui/material';

import { useApuracoes, calcularApuracao, gerarDasDeApuracao } from 'src/actions/apuracao';
import { useHistorico12Meses } from 'src/actions/historico-folha';
import { formatarPeriodo, FATOR_R_MINIMO } from 'src/types/apuracao';

export default function ApuracaoPage({ empresaId }) {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('202412');
  const [calculando, setCalculando] = useState(false);
  const [gerandoDas, setGerandoDas] = useState(false);

  // Buscar apurações existentes
  const { data: apuracoesData, mutate } = useApuracoes(empresaId, {
    status: 'calculada',
  });

  // Buscar histórico dos últimos 12 meses
  const { data: historico12Meses } = useHistorico12Meses(empresaId, periodoSelecionado);

  const handleCalcular = async () => {
    try {
      setCalculando(true);

      const resultado = await calcularApuracao(empresaId, {
        periodoApuracao: periodoSelecionado,
        calcularFatorR: true,
        folhaPagamentoMes: historico12Meses?.historicos[0]?.folhaPagamento,
        inssCppMes: historico12Meses?.historicos[0]?.inssCpp,
      });

      toast.success('Apuração calculada com sucesso!');
      mutate(); // Revalidar lista de apurações
    } catch (error) {
      toast.error(error.message || 'Erro ao calcular apuração');
    } finally {
      setCalculando(false);
    }
  };

  const handleGerarDas = async (apuracaoId) => {
    try {
      setGerandoDas(true);

      const das = await gerarDasDeApuracao(apuracaoId, {
        ambiente: 'teste',
      });

      toast.success(`DAS gerado: ${das.numeroDocumento}`);
      mutate();
    } catch (error) {
      toast.error(error.message || 'Erro ao gerar DAS');
    } finally {
      setGerandoDas(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Apuração de Impostos</Typography>

        {/* Resumo do Histórico 12 Meses */}
        {historico12Meses && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Histórico dos Últimos 12 Meses
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Faturamento Total:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    R$ {historico12Meses.totais.faturamentoTotal.toLocaleString('pt-BR')}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Folha + INSS Total:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    R$ {historico12Meses.totais.folhaComEncargosTotal.toLocaleString('pt-BR')}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Fator R Médio:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {historico12Meses.totais.fatorRMedio.toFixed(2)}%
                  </Typography>
                </Stack>
                {historico12Meses.totais.atingeFatorRMinimo ? (
                  <Alert severity="success">
                    ✅ Fator R ≥ {FATOR_R_MINIMO}% - Empresa enquadrada no Anexo III
                  </Alert>
                ) : (
                  <Alert severity="info">
                    ℹ️ Fator R &lt; {FATOR_R_MINIMO}% - Empresa enquadrada no Anexo V
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Botão Calcular */}
        <Button
          variant="contained"
          size="large"
          onClick={handleCalcular}
          disabled={calculando || !historico12Meses}
        >
          {calculando ? 'Calculando...' : 'Calcular Apuração'}
        </Button>

        {/* Lista de Apurações */}
        {apuracoesData?.apuracoes?.map((apuracao) => (
          <Card key={apuracao._id}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">
                  Período: {formatarPeriodo(apuracao.periodoApuracao)}
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Receita Bruta:</Typography>
                  <Typography variant="body1">
                    R$ {apuracao.totalReceitaBruta.toLocaleString('pt-BR')}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Total Impostos:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="error">
                    R$ {apuracao.totalImpostos.toLocaleString('pt-BR')}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Alíquota Efetiva:</Typography>
                  <Typography variant="body1">
                    {apuracao.aliquotaEfetivaTotal.toFixed(2)}%
                  </Typography>
                </Stack>
                {!apuracao.dasGerado && (
                  <Button
                    variant="outlined"
                    onClick={() => handleGerarDas(apuracao._id)}
                    disabled={gerandoDas}
                  >
                    {gerandoDas ? 'Gerando DAS...' : 'Gerar DAS'}
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
```

## 📋 Formato CSV para Upload

O sistema aceita CSV com as seguintes colunas (case insensitive):

```csv
periodo,folha_pagamento,inss_cpp,faturamento_bruto,deducoes,observacoes
202401,10000.00,2200.00,50000.00,0,Janeiro 2024
202402,10500.00,2310.00,52000.00,0,Fevereiro 2024
202403,11000.00,2420.00,54000.00,0,Março 2024
```

**Delimitadores aceitos:** vírgula (`,`) ou ponto-e-vírgula (`;`)

**Formatos de número aceitos:**
- `10000` (sem separador)
- `10000.00` (ponto como decimal)
- `10.000,00` (formato brasileiro)
- `R$ 10.000,00` (com símbolo de moeda)

## 🔐 Autenticação

Todas as actions incluem automaticamente o token JWT no header:

```javascript
Authorization: Bearer {token}
```

O token é buscado de:
1. Cookie (`accessToken`)
2. LocalStorage (`accessToken`)

## ⚠️ Tratamento de Erros

```javascript
try {
  await calcularApuracao(empresaId, payload);
} catch (error) {
  // error.message contém a mensagem de erro da API
  console.error(error.message);
  
  // error.response?.data contém mais detalhes
  console.error(error.response?.data);
}
```

## 📝 Próximos Passos

- [ ] Implementar componentes visuais (tabelas, gráficos)
- [ ] Criar wizard de configuração inicial
- [ ] Adicionar validações de formulário
- [ ] Implementar download de relatórios
- [ ] Criar dashboard de métricas

---

**Versão:** 1.0  
**Última atualização:** Novembro 2024

