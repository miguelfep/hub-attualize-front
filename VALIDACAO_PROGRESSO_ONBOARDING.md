# 📋 Guia de Validação - Atualização de Progresso do Onboarding

## 🎯 Objetivo

Este documento fornece orientações específicas para validar se a atualização de progresso das aulas está funcionando corretamente no frontend.

---

## ✅ Checklist de Validação

### 1. **Validação na Rede (Network Tab)**

#### Ao marcar uma aula como concluída, verifique:

1. **Requisição PUT enviada:**
   ```
   PUT /api/onboarding/cliente/aula/{indice}/progresso
   ```

2. **Headers da requisição:**
   - ✅ `Authorization: Bearer {token}` presente
   - ✅ `Content-Type: application/json`

3. **Body da requisição:**
   ```json
   {
     "concluida": true,
     "tempoAssistido": 300  // (opcional, em segundos)
   }
   ```

4. **Resposta da API (Status 200):**
   ```json
   {
     "success": true,
     "data": {
       "aulaId": "...",
       "concluida": true,
       "dataConclusao": "2024-01-01T00:00:00.000Z",
       "tempoAssistido": 300
     },
     "message": "Progresso atualizado com sucesso"
   }
   ```

5. **Requisição GET após atualização:**
   ```
   GET /api/onboarding/cliente/aulas
   ```
   - Deve retornar a aula com `concluida: true`

---

### 2. **Validação no Console do Navegador**

#### Logs esperados:

1. **Ao concluir uma aula:**
   ```
   ✅ "Atualizando progresso da aula: {indice}"
   ✅ "Progresso atualizado com sucesso"
   ✅ "Recarregando aulas..."
   ✅ "Aulas recarregadas: {total} aulas"
   ```

2. **Se houver erro:**
   ```
   ❌ "Erro ao atualizar progresso: {erro}"
   ```

---

### 3. **Validação Visual no Frontend**

#### O que deve acontecer imediatamente:

1. **Bolinha verde na sidebar:**
   - ✅ Ícone muda de `radio-button-off-outline` para `checkmark-circle-2-fill`
   - ✅ Cor muda para `success.main` (verde)

2. **Badge de status:**
   - ✅ Chip muda de "Pendente" para "Concluída"
   - ✅ Cor muda para `success`

3. **Data de conclusão:**
   - ✅ Aparece abaixo do título: "Concluída em DD/MM/AAAA"

4. **Barra de progresso:**
   - ✅ Percentual aumenta
   - ✅ Barra visual atualiza

5. **Botão "Marcar como Concluída":**
   - ✅ Fica desabilitado
   - ✅ Badge verde aparece abaixo

---

## 🔄 Fluxo Completo Esperado

### Passo a Passo:

```
1. Usuário assiste vídeo ou completa quiz
   ↓
2. Sistema detecta conclusão (vídeo termina OU botão clicado)
   ↓
3. [OTIMISTA] Frontend atualiza estado local IMEDIATAMENTE
   - Bolinha verde aparece
   - Badge muda para "Concluída"
   ↓
4. [API] PUT /api/onboarding/cliente/aula/{indice}/progresso
   - Body: { concluida: true, tempoAssistido: X }
   ↓
5. [RESPOSTA] API retorna success: true
   ↓
6. [SINCRONIZAÇÃO] Frontend recarrega dados da API
   - GET /api/onboarding/cliente/aulas
   ↓
7. [ATUALIZAÇÃO] Estado é atualizado com dados da API
   - Garante consistência
   ↓
8. [NAVEGAÇÃO] Se todas as aulas concluídas:
   - Mostra tela de agradecimento
   - Senão: avança para próxima aula não concluída
```

---

## 🐛 Problemas Comuns e Soluções

### Problema 1: Bolinha verde não aparece

**Causas possíveis:**
- Estado local não está sendo atualizado
- `aulasData` não está sendo atualizado corretamente
- Índice da aula está incorreto

**Solução:**
```javascript
// Verificar no console:
console.log('Aula atual:', aulaAtual);
console.log('Aulas data:', aulasData);
console.log('Aula específica:', aulasData?.aulas?.[aulaAtual]);
```

---

### Problema 2: API retorna erro 400/404

**Causas possíveis:**
- Índice da aula está incorreto
- Token de autenticação inválido
- Aula não existe no onboarding atual

**Solução:**
```javascript
// Verificar:
- Token está presente? (Network tab > Headers)
- Índice está correto? (deve ser 0, 1, 2...)
- Aula existe no array? (verificar aulasData.aulas)
```

---

### Problema 3: Progresso não persiste após recarregar página

**Causas possíveis:**
- API não está salvando corretamente
- Dados não estão sendo recarregados

**Solução:**
```javascript
// Verificar:
1. Network tab: resposta da API tem success: true?
2. Após recarregar: GET /api/onboarding/cliente/aulas retorna concluida: true?
3. Console: há erros ao recarregar?
```

---

## 📊 Estrutura de Dados Esperada

### Resposta de `GET /api/onboarding/cliente/aulas`:

```json
{
  "success": true,
  "data": {
    "temOnboarding": true,
    "onboarding": {
      "_id": "...",
      "nome": "Onboarding Inicial"
    },
    "progressoPercentual": 50,
    "concluido": false,
    "aulas": [
      {
        "_id": "aula_id_1",
        "titulo": "Aula 1",
        "tipo": "video",
        "ordem": 0,
        "concluida": true,  // ← Deve ser true após conclusão
        "dataConclusao": "2024-01-01T00:00:00.000Z",  // ← Deve aparecer
        "tentativas": 1,
        "tempoAssistido": 300
      },
      {
        "_id": "aula_id_2",
        "titulo": "Aula 2",
        "tipo": "quiz",
        "ordem": 1,
        "concluida": false,  // ← Ainda não concluída
        "tentativas": 0
      }
    ]
  }
}
```

---

## 🔍 Como Testar Manualmente

### Teste 1: Concluir uma aula de vídeo

1. Acesse `/portal-cliente/onboarding`
2. Abra o DevTools (F12)
3. Vá para a aba **Network**
4. Filtre por "progresso"
5. Assista um vídeo até o final OU clique em "Marcar como Concluída"
6. **Verifique:**
   - ✅ Requisição PUT aparece
   - ✅ Status 200
   - ✅ Resposta tem `success: true`
   - ✅ Bolinha verde aparece imediatamente
   - ✅ Requisição GET `/aulas` é feita após
   - ✅ Dados são atualizados

### Teste 2: Concluir um quiz

1. Responda todas as perguntas
2. Clique em "Enviar Respostas"
3. Se acertar todas, deve marcar como concluída automaticamente
4. **Verifique:**
   - ✅ Mesmas validações do Teste 1
   - ✅ Respostas são salvas no `respostasQuiz`

### Teste 3: Persistência

1. Conclua uma aula
2. Recarregue a página (F5)
3. **Verifique:**
   - ✅ Aula continua marcada como concluída
   - ✅ Bolinha verde permanece
   - ✅ Data de conclusão aparece

---

## 💻 Código de Validação (Adicionar ao Frontend)

### Adicionar logs para debug:

```javascript
// Em handleAulaConcluida, adicionar:
console.log('🎯 Concluindo aula:', {
  indice: aulaIdOrIndex,
  aula: aulasData?.aulas?.[aulaIdOrIndex],
  dados: dadosAdicionais
});

// Após resposta da API:
console.log('✅ Resposta da API:', response.data);

// Após atualizar estado:
console.log('🔄 Estado atualizado:', {
  antes: aulasData?.aulas?.[aulaIdOrIndex]?.concluida,
  depois: aulasDataAtualizado?.aulas?.[aulaIdOrIndex]?.concluida
});
```

---

## 📝 Checklist Final

Antes de considerar que está funcionando, verifique:

- [ ] Requisição PUT é enviada corretamente
- [ ] Resposta da API tem `success: true`
- [ ] Bolinha verde aparece IMEDIATAMENTE (otimista)
- [ ] Dados são recarregados da API após atualização
- [ ] Estado final está sincronizado com a API
- [ ] Progresso persiste após recarregar página
- [ ] Barra de progresso atualiza corretamente
- [ ] Navegação para próxima aula funciona
- [ ] Tela de agradecimento aparece quando todas concluídas

---

## 🚨 Se algo não estiver funcionando:

1. **Abra o Console do navegador** (F12 > Console)
2. **Verifique erros** em vermelho
3. **Abra a aba Network** (F12 > Network)
4. **Filtre por "progresso" ou "aulas"**
5. **Verifique:**
   - Status code das requisições
   - Body das requisições
   - Resposta da API
6. **Compare com este documento** para identificar o problema

---

**Última atualização:** 2024

