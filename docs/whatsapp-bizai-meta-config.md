# WhatsApp BizAI — guia de configuração na Meta

Roteiro para ativar o agente de IA da Meta apontando para o `/bot/v1/` do ms-me (já implementado na branch `feature/whatsapp`). Executar na ordem: **connector → credencial → tools → skills → conhecimento → teste**.

## Pré-requisitos

- Capability `bizai_wa_enterprise_api_3p_access` aprovada no WABA (ou permission `whatsapp_business_messaging`).
- `ENTITY_ID` = **WhatsApp Business Phone Number ID** do número.
- `META_TOKEN` = access token de system user do Business Manager com a permission acima.
- Backend em produção com `BOT_API_TOKEN`, `BOT_USER_ID` e `BOT_PUBLIC_URL` definidos.

Base de tudo: `https://api.facebook.com/{ENTITY_ID}/...`, headers comuns:

```bash
export ENTITY_ID="<phone_number_id>"
export META_TOKEN="<token>"
export API="https://api.facebook.com/$ENTITY_ID"
export H_AUTH="Authorization: Bearer $META_TOKEN"
export H_VER="X-API-Version: 2.0.0"
export API_NODE="https://<dominio-publico-da-api>"   # mesmo valor de BOT_PUBLIC_URL
```

## 1. Connector → api-node

```bash
curl -X POST "$API/agent_connectors" -H "$H_AUTH" -H "$H_VER" -H "Content-Type: application/json" -d '{
  "name": "Attualize Hub API",
  "description": "API do hub da Attualize Contábil: consulta de guias de impostos do cliente, segunda via e atualização de boletos de honorários, histórico de pagamentos e transferência de atendimento para a equipe. Todas as operações exigem o telefone do cliente da conversa.",
  "base_url": "'"$API_NODE"'/bot/v1",
  "auth_type": "API_KEY"
}'
# → guardar o "id" retornado:
export CONNECTOR_ID="<id>"
```

Credencial (o valor de `BOT_API_TOKEN` do backend):

```bash
curl -X POST "$API/agent_connectors/$CONNECTOR_ID/upsertApiKey" -H "$H_AUTH" -H "$H_VER" -H "Content-Type: application/json" -d '{
  "api_key_config": {
    "headers": [
      { "field_name": "Authorization", "value": "<BOT_API_TOKEN>", "prefix": "Bearer " }
    ]
  }
}'
```

Conferir: `GET $API/agent_connectors/$CONNECTOR_ID` → `connection_status.status` deve ficar `ACTIVE`.

## 2. Tools (⚠️ doc pendente)

As operações são declaradas sobre o connector — a doc dessa API ainda não chegou. As 9 operações a declarar, com o contrato do backend:

| Tool | Método/Path | Parâmetros |
|---|---|---|
| consultar_contexto_cliente | `GET /clientes/contexto` | `telefone` (query) |
| listar_guias | `GET /guias` | `telefone`, `status` (`a_pagar\|pago\|vencido`), `competencia` (`MM/AAAA`) |
| gerar_link_guia | `POST /guias/{id}/link` | `telefone` (body) |
| solicitar_atualizacao_guia | `POST /guias/{id}/solicitar-atualizacao` | `telefone`, `motivo` (body) |
| listar_cobrancas | `GET /cobrancas` | `telefone`, `situacao` (`abertas\|pagas`) |
| obter_boleto | `GET /cobrancas/{id}/boleto` | `telefone` (query) |
| atualizar_boleto | `POST /cobrancas/{id}/atualizar-boleto` | `telefone` (body) |
| listar_pagamentos | `GET /pagamentos` | `telefone` (query) |
| transferir_atendimento | `POST /atendimento/handoff` | `telefone`, `motivo`, `resumoConversa`, `setor`, `prioridade` (body) |

**Regra inegociável ao declarar as tools:** o parâmetro `telefone` deve ser preenchido pela **variável de contexto da plataforma** com o número da conversa (ou via `user_auth_injection_config`) — nunca como parâmetro livre que a IA preenche com texto do cliente. Se a doc de tools não oferecer isso, NÃO ativar as tools de dados e escalar com a Meta.

## 3. Skills

```bash
curl -X POST "$API/agent_config/skills" -H "$H_AUTH" -H "$H_VER" -H "Content-Type: application/json" -d '{
  "title": "identificar-cliente",
  "description": "Aplicar no início de qualquer conversa em que o cliente pergunte sobre guias, impostos, boletos, faturas ou pagamentos.",
  "skill": "Antes de responder sobre guias, boletos ou pagamentos, chame a tool consultar_contexto_cliente. Se o telefone não estiver cadastrado, explique com gentileza que não localizou o cadastro e ofereça transferir para um atendente (tool transferir_atendimento, setor comercial). Nunca peça CPF/CNPJ para localizar cadastro — a identificação é apenas pelo número do WhatsApp da conversa."
}'

curl -X POST "$API/agent_config/skills" -H "$H_AUTH" -H "$H_VER" -H "Content-Type: application/json" -d '{
  "title": "guias-de-impostos",
  "description": "Aplicar quando o cliente pedir guia de imposto (DAS, DARF, INSS, FGTS, ISS), boleto de imposto, segunda via de guia ou disser que a guia venceu.",
  "skill": "Para reenviar uma guia: localize-a com listar_guias e gere o link com gerar_link_guia; avise que o link expira em 15 minutos. Se a guia estiver com statusPagamento vencido, use solicitar_atualizacao_guia e explique que a equipe vai disponibilizar a guia atualizada e o cliente será avisado. Nunca invente valores ou datas de vencimento: use somente os dados retornados pelas tools. Se a guia não aparecer nas tools, transfira para o setor fiscal."
}'

curl -X POST "$API/agent_config/skills" -H "$H_AUTH" -H "$H_VER" -H "Content-Type: application/json" -d '{
  "title": "boletos-e-pagamentos",
  "description": "Aplicar quando o cliente falar de honorários, fatura da Attualize, boleto vencido, segunda via de boleto ou perguntar se um pagamento foi confirmado.",
  "skill": "Para segunda via de boleto de honorários: use listar_cobrancas e depois obter_boleto; envie a linha digitável e o PIX copia-e-cola diretamente na mensagem, além do link do PDF (validade de 15 minutos). Se o boleto estiver vencido ou expirado, use atualizar_boleto — ele gera um novo com vencimento no próximo dia útil. Para confirmar pagamento, use listar_pagamentos. Dúvidas de valores, descontos ou negociação: transferir para o setor financeiro."
}'

curl -X POST "$API/agent_config/skills" -H "$H_AUTH" -H "$H_VER" -H "Content-Type: application/json" -d '{
  "title": "transferir-para-humano",
  "description": "Aplicar quando o cliente pedir para falar com atendente, quando uma tool retornar erro, ou quando o assunto estiver fora do escopo (abertura de empresa, contratos, folha de pagamento, questões jurídicas, reclamações).",
  "skill": "Chame transferir_atendimento com um resumo objetivo do que o cliente precisa e do que você já tentou (tools chamadas e resultados). Escolha o setor: fiscal (guias e impostos), financeiro (boletos e honorários), departamento_pessoal (folha e funcionários), societario (abertura e alterações de empresa), comercial (novos serviços) ou geral quando não tiver certeza. Depois informe ao cliente que a equipe recebeu o atendimento com todo o contexto e dará continuidade em horário comercial. Nunca prometa prazo específico de resposta."
}'
```

## 4. Conhecimento

```bash
# Informações da empresa
curl -X PUT "$API/agent_config/business_info" -H "$H_AUTH" -H "$H_VER" -H "Content-Type: application/json" -d '{
  "business_description": "A Attualize é uma contabilidade digital e inteligente, especializada em profissionais e empresas de beleza, saúde e bem-estar, com atendimento humanizado em todo o Brasil.",
  "purchase_info": "Planos e contratação em https://www.attualize.com.br ou com o time comercial pelo WhatsApp.",
  "contact_info": {
    "email": "contato@attualize.com.br",
    "hours_of_operation": "Segunda a sexta, das 8h às 18h (horário de Brasília)"
  }
}'

# Site (crawl do blog inteiro vira base de conhecimento)
curl -X POST "$API/agent_config/websites" -H "$H_AUTH" -H "$H_VER" -H "Content-Type: application/json" \
  -d '{ "url": "https://www.attualize.com.br" }'

# FAQs iniciais (exemplos — cadastrar as reais com o time de atendimento)
curl -X POST "$API/agent_config/faq" -H "$H_AUTH" -H "$H_VER" -H "Content-Type: application/json" -d '{
  "question": "Quando vence o DAS do Simples Nacional?",
  "answer": "O DAS vence todo dia 20 de cada mês (ou no próximo dia útil quando cai em fim de semana ou feriado). A guia do mês fica disponível no portal do cliente e pode ser solicitada aqui pelo WhatsApp."
}'
```

## 5. Homologação (sem número real, tokens não cobrados)

```bash
curl -X POST "$API/agent_test" -H "$H_AUTH" -H "$H_VER" -H "Content-Type: application/json" \
  -d '{ "user_msg": "Oi, preciso da segunda via do meu boleto" }'
# → usar o conversation_id retornado para continuar a conversa multi-turno
```

Cenários mínimos antes de ligar no número:
1. Cliente cadastrado pede guia do mês → link chega e funciona.
2. Guia vencida → solicitação registrada + mensagem correta.
3. Boleto vencido → atualizar_boleto → nova linha digitável/PIX.
4. "Quero falar com atendente" → `handoff_reason` presente + tarefa criada no hub.
5. Telefone não cadastrado → resposta educada + oferta de transferência (sem vazar nada).
6. Pergunta institucional ("como funciona a Attualize?") → responde por FAQ/site sem chamar tool.

## 6. Operação

- Monitorar: `GET $API/agent_connectors/$CONNECTOR_ID/logs?include_stats=true` (success rate, p95/p99; retenção de 7 dias — a auditoria completa é o log do ms-me).
- Rotação do segredo: gerar novo `BOT_API_TOKEN` → `upsertApiKey` de novo → trocar no `.env` → restart.
- Desligar em emergência: remover `BOT_API_TOKEN` do `.env` e reiniciar (namespace inteiro volta a responder 404).
