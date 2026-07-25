# WhatsApp — agente de IA da Meta (BizAI) integrado à api-node

> **Status (25/07/2026): namespace `/bot/v1/` IMPLEMENTADO no ms-me** (branch `feature/whatsapp`): `src/routes/botRoutes.ts`, `src/controllers/botController.ts`, `src/middlewares/botAuthMiddleware.ts` + `botResolveCliente.ts`, `src/models/BotDownloadToken.ts`. Envs novas: `BOT_API_TOKEN` (≥32 chars; sem ela o namespace responde 404), `BOT_USER_ID` (User interno de serviço p/ solicitar-atualização e handoff), `BOT_PUBLIC_URL` (base dos links de download), `BOT_RATE_LIMIT_MAX` (default 60/min). Restam: configuração na Meta (connector/tools/skills) — ver seção 7.

Objetivo: ativar o **Meta Business AI** (Enterprise API, capability `bizai_wa_enterprise_api_3p_access`) no WhatsApp da Attualize, com o agente conseguindo **identificar o cliente, tirar dúvidas, reenviar/atualizar guias, consultar pagamentos e emitir 2ª via de boletos** e, quando não resolver, **transferir para atendimento humano**. A IA da Meta chama a nossa API diretamente via **`agent_connectors`** — não precisamos de serviço intermediário próprio.

## 1. Visão geral da integração

| Recurso da Meta (`api.facebook.com/{phone_number_id}/...`) | Uso |
|---|---|
| `agent_config/business_info` | Dados institucionais (descrição, contato, horários) |
| `agent_config/faq` | FAQs de dúvidas gerais — CRUD via API, sincronizável por job |
| `agent_config/websites` | Crawl do site (blog attualize.com.br como base de conhecimento) |
| `agent_config/files` | PDFs/documentos de conhecimento (ex.: cartilhas, políticas) |
| `agent_config/skills` | Instruções de comportamento ("quando pedir guia, use tool X; se não resolver, transfira") |
| `agent_connectors` | **A ponte com a api-node**: base_url + autenticação + tools |
| `agent_test` | Teste do agente sem número real (tokens de teste não são cobrados; resposta traz `handoff_reason`) |

O connector aponta para a api-node e as "tools" do agente são endpoints nossos. **Pendência de doc:** ainda não temos a especificação de como as tools são declaradas no connector (os logs referenciam `tool_id`); provavelmente é um cadastro de operações (método/path/parâmetros) ou import de OpenAPI. Ao obter essa doc, revisar a seção 3.

## 2. Autenticação do connector (novo na api-node)

O connector suporta `OAUTH2_CLIENT_CREDENTIALS`, `API_KEY` e mTLS opcional.

**Recomendado: `OAUTH2_CLIENT_CREDENTIALS`**
- Novo token endpoint: `POST /oauth/token` (grant `client_credentials`, `client_id`/`client_secret`, scopes) — a Meta renova o token sozinha e o secret é rotacionável via `upsertOAuth`.
- Alternativa mais simples se não quisermos OAuth agora: `API_KEY` em header (ex.: `X-Bot-Api-Key`), rotacionável via `upsertApiKey`.

Em ambos os casos:
- Credencial com **escopo restrito ao namespace `/bot/v1/`** — nenhum outro endpoint aceita essa credencial.
- Rate limit próprio (sugestão: 60 req/min) e **audit log de toda chamada** (a Meta só retém logs de erro por 7 dias; a auditoria completa tem que ser nossa).
- Opcional: mTLS (o connector suporta certificado de cliente) para uma camada extra.

## 3. Namespace novo: `/bot/v1/` (tools do agente)

Endpoints dedicados ao bot — não reaproveitar os endpoints do portal diretamente. Respostas enxutas (a IA paga token por byte) e descrições claras em cada operação (o agente escolhe a tool pela descrição).

### 3.1 Identificação do cliente
`GET /bot/v1/clientes/contexto?telefone={e164}`
- Resolve telefone → cliente e devolve um **resumo agregado**: razão social, CNPJ mascarado, regime, guias em aberto (competência, tipo, vencimento, status), pendências.
- Uma chamada só cobre a maioria das conversas ("tem guia para pagar esse mês?").
- `404` se o telefone não estiver cadastrado → a skill instrui a IA a orientar o cadastro ou transferir.

### 3.2 Guias
- `GET /bot/v1/guias?telefone={e164}&status=&competencia=` — lista resumida (id, tipo, competência, vencimento, valor, status).
- `GET /bot/v1/guias/{id}/link` — gera **link de download temporário e assinado** (o WhatsApp não autentica no nosso domínio; link com expiração curta, ex. 15 min, escopado à guia).
- `POST /bot/v1/guias/{id}/solicitar-atualizacao` — mesmo fluxo do portal (`guias-fiscais/portal/:id/solicitar-atualizacao`), validando que a guia pertence ao cliente do telefone.

### 3.3 Financeiro (honorários / cobranças da Attualize)
- `GET /bot/v1/cobrancas?telefone={e164}&status=` — faturas/cobranças do cliente (competência, valor, vencimento, status de pagamento). Base: fluxos existentes de `contratos/cobrancas` e `portal/cobrancas`.
- `GET /bot/v1/cobrancas/{id}/boleto` — **2ª via**: link assinado/temporário do boleto (mesmo padrão do link de guia) + linha digitável e copia-e-cola PIX no corpo da resposta (o cliente resolve sem nem abrir o PDF).
- `POST /bot/v1/cobrancas/{id}/atualizar-boleto` — boleto vencido → gera atualizado (fluxo existente `contratos/financeiro/atualizar-boleto`).
- `GET /bot/v1/pagamentos?telefone={e164}` — histórico/status de pagamentos ("meu pagamento caiu?"), base `mercado-pago/cliente/:id/pagamentos` + conciliação.

### 3.4 Handoff
`POST /bot/v1/atendimento/handoff`
- Body: `{ telefone, motivo, resumoConversa, setorSugerido? }`.
- Cria **tarefa** no setor adequado (aproveita tarefas + setores existentes) com o resumo do que o bot já tentou, e retorna confirmação para a IA informar o cliente.
- A skill correspondente instrui: "se não conseguir resolver, chame esta tool e informe que um atendente vai continuar".

## 4. Segurança e LGPD (crítico)

1. **A identidade tem que vir do canal, não do texto.** O parâmetro `telefone` deve ser preenchido pela plataforma com o número real da conversa do WhatsApp — nunca por um número/CNPJ que o cliente digitou. Como garantir isso depende da doc das tools (se houver variável de contexto tipo "número do consumidor", usar; o `user_auth_injection_config` do connector sugere suporte a token por usuário — cenário ideal). **Enquanto não confirmarmos esse mecanismo, não expor dado sensível via bot.**
2. **Minimizar dados na resposta**: tudo que a API devolver pode ser reproduzido pela IA no chat. Nada de dados bancários completos, senhas, documentos de terceiros; CNPJ/CPF sempre mascarados.
3. **Sem escrita destrutiva**: o namespace `/bot/v1/` só tem leitura + solicitar atualização + abrir tarefa. Nenhum update/delete de cadastro.
4. **Auditoria**: logar telefone, tool, parâmetros e resposta (resumida) de cada chamada, com retenção nossa.

## 5. Operação

- **Sync de conhecimento**: job no hub para publicar/atualizar FAQs sazonais (ex.: prazos de impostos do mês) via CRUD de `agent_config/faq`; cadastrar `https://www.attualize.com.br` em `websites` para o crawl do blog.
- **Monitoramento**: `GET /agent_connectors/{id}/logs` (com `include_stats=true`) dá taxa de sucesso e latência p95/p99 das tools — vale um painel/alerta no Grafana espelhando com as métricas RED da api-node.
- **Homologação**: usar `POST /agent_test` (multi-turn via `conversation_id`) para validar skills + tools antes de ligar no número real; conferir `handoff_reason` nos cenários de transferência.

## 6. O que o front (hub) fará depois

- Tela de administração do agente (editar FAQs/skills, ver status do connector e logs) — só depois do backend pronto.
- Exibição das tarefas de handoff já cai no fluxo existente de tarefas/setores, sem mudança.

## 7. Pendências para fechar o contrato

1. **Doc da API de tools do connector** (como declarar as operações e como o número do consumidor/token de usuário entra na chamada) — bloqueia a seção 3/4.
2. Doc de configuração de **handoff/escalation** (para onde a Meta encaminha a conversa ao transferir — inbox do WhatsApp Business? webhook?).
3. Definir tom de voz e limites do agente nas `skills` (com o time de atendimento).
