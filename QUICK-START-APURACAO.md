# 🚀 Quick Start - Sistema de Apuração

Guia rápido para começar a usar o Sistema de Apuração de Impostos no Portal do Cliente.

---

## 📍 Acessando o Sistema

### Para Clientes (Portal)
```
/portal-cliente/apuracao
```

### URLs Disponíveis
```
/portal-cliente/apuracao              → Dashboard principal
/portal-cliente/apuracao/historico    → Gestão de histórico
/portal-cliente/apuracao/das          → Lista de DAS
```

---

## 🎯 Fluxo de Uso Básico

### 1️⃣ Primeiro Acesso - Cadastrar Histórico

**Opção A: Upload de CSV**

1. Acesse `/portal-cliente/apuracao/historico`
2. Clique em **"Upload CSV"**
3. Baixe o template CSV (opcional)
4. Faça upload do arquivo
5. Aguarde processamento

**Formato CSV:**
```csv
periodo,folha_pagamento,inss_cpp,faturamento_bruto,deducoes,observacoes
202401,10000.00,2200.00,50000.00,0,Janeiro 2024
202402,10500.00,2310.00,52000.00,0,Fevereiro 2024
```

**Opção B: Cadastro Manual**

1. Acesse `/portal-cliente/apuracao/historico`
2. Clique em **"Novo Registro"**
3. Preencha os campos:
   - Período (AAAAMM)
   - Folha de Pagamento (sem encargos)
   - INSS/CPP
   - Faturamento Bruto
   - Deduções (opcional)
   - Observações (opcional)
4. Clique em **"Salvar"**

---

### 2️⃣ Verificar Fator R

1. Acesse `/portal-cliente/apuracao`
2. Visualize o card **"Fator R Médio"**
3. Confira o status:
   - 🟢 **Verde (≥28%)**: Anexo III (alíquotas reduzidas)
   - 🟠 **Laranja (<28%)**: Anexo V (alíquotas padrão)

---

### 3️⃣ Calcular Apuração

1. No dashboard, clique em **"Calcular Apuração"**
2. Selecione o período (AAAAMM)
3. Confirme os dados de folha (se necessário)
4. Clique em **"Calcular"**
5. Aguarde o processamento

**O que acontece:**
- Sistema busca notas fiscais do período
- Calcula Fator R dos últimos 12 meses
- Determina anexo (III ou V)
- Calcula impostos por nota
- Gera objeto de apuração

---

### 4️⃣ Gerar DAS

**Após calcular a apuração:**

1. Acesse a apuração calculada
2. Clique em **"Gerar DAS"**
3. Escolha o ambiente:
   - ⚠️ **Teste**: Para validação (NÃO é válido para pagamento)
   - ✅ **Produção**: DAS oficial válido para pagamento
4. Aguarde geração

---

### 5️⃣ Baixar e Pagar DAS

1. Acesse `/portal-cliente/apuracao/das`
2. Localize o DAS gerado
3. Clique em **"Baixar PDF"**
4. Pague o DAS via código de barras/PIX
5. Opcionalmente, marque como **"Pago"** no sistema

---

## 💡 Dicas Importantes

### ✅ Melhores Práticas

1. **Mantenha o histórico atualizado**
   - Cadastre dados mensalmente
   - Use os últimos 12 meses completos

2. **Verifique o Fator R regularmente**
   - Monitore se está próximo de 28%
   - Pequenas mudanças podem alterar o anexo

3. **Gere DAS em ambiente de teste primeiro**
   - Valide os valores
   - Confirme os cálculos
   - Só então gere em produção

4. **Fique atento aos prazos**
   - DAS vencidos têm juros e multa
   - Sistema alerta automaticamente

### ⚠️ Cuidados

- ❌ **NÃO** use DAS de teste para pagamento
- ❌ **NÃO** apague históricos sem backup
- ❌ **NÃO** deixe períodos sem registro
- ✅ **SEMPRE** verifique os valores antes de gerar DAS em produção

---

## 🎨 Navegação Rápida

### Dashboard Principal
```javascript
import { paths } from 'src/routes/paths';

// Ir para dashboard
router.push(paths.cliente.apuracao.root);
```

### Cadastrar Histórico
```javascript
// Ir para histórico
router.push(paths.cliente.apuracao.historico);
```

### Ver DAS
```javascript
// Ir para lista de DAS
router.push(paths.cliente.apuracao.das);

// Ir para DAS específico
router.push(paths.cliente.apuracao.dasDetalhes(dasId));
```

---

## 📊 Interpretando o Dashboard

### Card "Fator R Médio"
- **≥28%**: 🎉 Empresa enquadrada no Anexo III (melhor alíquota)
- **<28%**: 📊 Empresa enquadrada no Anexo V (alíquota padrão)

### Gráfico de Evolução
- **Colunas Azuis**: Faturamento bruto mensal
- **Colunas Laranjas**: Folha + INSS mensal
- **Linha Verde**: Percentual do Fator R
- **Linha Vermelha**: Referência de 28%

---

## 🔧 Usando as Actions (Desenvolvedores)

### Exemplo: Buscar Histórico 12 Meses
```javascript
import { useHistorico12Meses } from 'src/actions/historico-folha';

function MeuComponente() {
  const { data, isLoading, error } = useHistorico12Meses(
    empresaId,
    '202412' // Período de referência
  );

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <div>
      <p>Fator R: {data.totais.fatorRMedio}%</p>
      <p>Anexo: {data.totais.atingeFatorRMinimo ? 'III' : 'V'}</p>
    </div>
  );
}
```

### Exemplo: Upload CSV
```javascript
import { uploadCSVHistorico } from 'src/actions/historico-folha';

async function handleUpload(file) {
  try {
    const result = await uploadCSVHistorico(empresaId, file, false);
    console.log(`Inseridos: ${result.inseridos}`);
    console.log(`Erros: ${result.erros.length}`);
  } catch (error) {
    console.error(error.message);
  }
}
```

### Exemplo: Calcular Apuração
```javascript
import { calcularApuracao } from 'src/actions/apuracao';

async function handleCalcular() {
  try {
    const apuracao = await calcularApuracao(empresaId, {
      periodoApuracao: '202412',
      calcularFatorR: true,
      folhaPagamentoMes: 10500,
      inssCppMes: 2310,
    });
    
    console.log(`Fator R: ${apuracao.fatorR.percentual}%`);
    console.log(`Total Impostos: R$ ${apuracao.totalImpostos}`);
  } catch (error) {
    console.error(error.message);
  }
}
```

### Exemplo: Baixar DAS
```javascript
import { baixarDasPdf } from 'src/actions/apuracao';

async function handleDownload(dasId) {
  try {
    const response = await baixarDasPdf(dasId);
    
    // Criar blob e download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DAS_${numeroDocumento}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error.message);
  }
}
```

---

## 🐛 Troubleshooting

### Problema: "Empresa não selecionada"
**Solução:** Selecione uma empresa no seletor do header

### Problema: "Nenhum histórico encontrado"
**Solução:** Cadastre o histórico dos últimos 12 meses primeiro

### Problema: "Erro ao calcular apuração"
**Solução:** 
1. Verifique se há histórico cadastrado
2. Confirme que há notas fiscais no período
3. Verifique os logs de erro

### Problema: "DAS não baixa"
**Solução:**
1. Verifique sua conexão
2. Confirme que o DAS foi gerado
3. Tente novamente após alguns segundos

---

## 📚 Mais Informações

- **Documentação Completa:** `SISTEMA-APURACAO.md`
- **Detalhes da Implementação:** `IMPLEMENTACAO-APURACAO.md`
- **Tipos TypeScript:** `src/types/apuracao.ts`

---

## 🎯 Checklist de Primeiro Uso

- [ ] Cadastrar histórico dos últimos 12 meses
- [ ] Verificar Fator R calculado
- [ ] Calcular primeira apuração
- [ ] Gerar DAS em ambiente de teste
- [ ] Validar valores calculados
- [ ] Gerar DAS em produção
- [ ] Baixar PDF do DAS
- [ ] Efetuar pagamento

---

**Pronto! 🎉**

Seu sistema de apuração está configurado e pronto para uso.

Em caso de dúvidas, consulte a documentação completa ou entre em contato com o suporte técnico.

