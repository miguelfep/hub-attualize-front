# Leads CRM — pendências de backend

O frontend já está pronto para estes recursos; faltam ajustes no backend (hub/API) para funcionarem 100%.

## 1. Responsável por usuário (ownerId)

Hoje o lead guarda só `owner` (string com o nome). O frontend passou a enviar **também `ownerId`** (id do usuário) ao atualizar status/responsável.

- **Endpoint:** `PATCH marketing/lead/:id/contact-status` (já usado por `updateLeadStatus`).
- **Novo campo no body:** `ownerId: string | null` (além de `owner`, `statusLead`, `nextFollowUpAt`).
- **Pedidos:**
  - Persistir `ownerId` no documento do lead.
  - Retornar `ownerId` em `getLeads` e `getLeadById` (para o select pré-selecionar e as permissões compararem por id).

> Sem isso, o responsável continua funcionando por **nome** (já compatível), mas a comparação por id e a notificação direcionada ficam menos precisas.

## 2. Permissões de responsável (regra de negócio)

A UI já aplica, mas o **backend deve validar** (não confiar só no front):

- **Comercial** (`role = 'comercial'`): só pode atribuir responsável a um lead **sem responsável**, e somente **a si mesmo** ("Pegar lead"). Não pode trocar responsável já atrelado.
- **Gestor** (`role ∈ {admin, gerencial, superadmin}`): pode atribuir/trocar qualquer responsável a qualquer momento.

Sugestão: validar no handler do `contact-status` comparando o `req.user` com o `owner/ownerId` atual do lead.

## 3. Notificações de lead (sino, igual Tarefas)

O frontend já sabe **exibir e linkar** notificações de lead. Falta o backend **criar** as notificações (são server-side, como nas tarefas).

Reaproveitar a mesma coleção/feed de `tarefas/notificacoes`, apenas incluindo uma referência ao lead:

```jsonc
{
  "tipo": "lead_responsavel_mudou" | "lead_prazo_vencimento" | "lead_prazo_digest",
  "titulo": "Você é o responsável por um lead",
  "mensagem": "Lead João da Silva foi atribuído a você",
  "lead": { "_id": "<leadId>", "nome": "João da Silva" }, // ou apenas "lead": "<leadId>"
  "destinatario": "<userId>"
}
```

Gatilhos esperados:
- **`lead_responsavel_mudou`**: quando o `owner/ownerId` de um lead muda → notificar o **novo responsável**.
- **`lead_prazo_vencimento`** (ou digest diário): job agendado que, para leads com `nextFollowUpAt` vencendo **hoje** ou **atrasado**, notifica o **responsável** — espelhando o `tarefa_prazo_digest`.

O frontend já mapeia os ícones desses tipos e resolve o deep-link para `/dashboard/comercial/leads/:id` quando a notificação tem `lead`. O sino atualiza por polling SWR (até ~60s).

## Resumo do que o frontend já entrega
- Select de responsável (comerciais + gestores) no detalhe; botão "Pegar lead" para comercial.
- Envio de `owner` + `ownerId` no save.
- Aba "Follow-ups" (agenda Atrasado/Hoje/Próximos 7 dias) + destaque de atrasados no kanban e na lista.
- Suporte a notificações de lead no sino (ícone + deep-link).
