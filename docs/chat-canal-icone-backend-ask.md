# Chat interno — ícone de imagem no canal (pendência de backend)

O frontend já diferencia canais visualmente com **emoji no prefixo do nome** (ex.: `🚀 marketing`) — isso funciona hoje sem mudança de contrato. Este documento especifica o passo seguinte: **imagem própria do canal** (upload), que exige campos e endpoints novos no ms-me.

Contrato base: `docs/chat-interno-api-frontend.md` (repo ms-me).

## 1. Novo campo no modelo de canal: `iconeUrl`

- **Campo:** `iconeUrl: string | null` — URL (ou caminho relativo, como no `linkNota` da NFSe) da imagem do canal.
- **Retornar em:** `GET chat/canais`, `GET chat/canais/:id` e `GET chat/canais/browse`.
- Aplica-se somente a `tipo: 'canal'` (DMs continuam usando o avatar do outro participante).

## 2. Upload do ícone

- **Endpoint:** `POST chat/canais/:id/icone` — multipart, campo `arquivo`.
- **Permissão:** mesma do `PATCH chat/canais/:id` (criador ou admin/superadmin — igual arquivar/excluir).
- **Validações sugeridas:** só imagem (`image/png`, `image/jpeg`, `image/webp`), limite ~2 MB; redimensionar/cortar para quadrado pequeno (ex.: 128×128) no servidor, se possível.
- **Resposta:** o canal atualizado (com `iconeUrl`).
- **Remoção:** `DELETE chat/canais/:id/icone` → `iconeUrl: null`.

Se a imagem ficar atrás de autenticação (como os anexos do chat), manter o mesmo padrão dos anexos: o front baixa via axios com token e monta um object URL.

## 3. Evento SSE

Após upload/remoção, emitir o já existente **`chat.canal.atualizado`** para os membros — o front já recarrega a lista nesse evento, nada novo é necessário.

## 4. O que o front já tem pronto

- Render do "ícone" do canal na sidebar (`chat-nav-item.jsx`) e no cabeçalho (`chat-header.jsx`) — hoje mostra o emoji do prefixo do nome; trocar para priorizar `iconeUrl` quando existir é uma mudança pontual nesses dois componentes.
- Diálogo **Editar canal** (`chat-dialogs.jsx` → `ChatEditarCanalDialog`) usando `PATCH chat/canais/:id` — é onde entraria o botão de upload da imagem.

## 5. Prioridade

Baixa/nice-to-have: o emoji cobre a diferenciação visual no dia a dia. A imagem só agrega para identidade de times/projetos (logos).
