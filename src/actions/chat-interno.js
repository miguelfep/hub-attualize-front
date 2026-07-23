import Cookies from 'js-cookie';

import axios, { endpoints } from 'src/utils/axios';

import { STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------
// Chat interno estilo Slack — camada de acesso à API (/api/chat).
// Contrato: docs/chat-interno-api-frontend.md (repo ms-me).
//
// Conceitos:
// - Canal (tipo 'canal'): público/privado; gestores criam e gerenciam membros.
// - DM (tipo 'dm'): 1:1, idempotente (pedir de novo devolve a mesma).
// - Mensagem: texto | sistema | wa_card; threads (threadDe), reações, anexos.
// As rotas REST são a fonte da verdade; o SSE só entrega ao vivo.
// ----------------------------------------------------------------------

const ep = endpoints.chatInterno;

/** Token JWT atual (mesma sessão do axios). */
export function getChatToken() {
  return typeof window !== 'undefined' ? Cookies.get(STORAGE_KEY) : null;
}

/** URL do stream SSE com o token na query (EventSource não manda header). */
export function getChatStreamUrl(token = getChatToken()) {
  if (!token) return null;
  return `${ep.stream}?token=${encodeURIComponent(token)}`;
}

// ---------------- Conversas (canais + DMs) ----------------

/** Minhas conversas: [{ _id, tipo, nome, slug, privado, membros, ultimaMensagem*, naoLidas }]. */
export async function getCanaisChat() {
  const res = await axios.get(ep.canais);
  return Array.isArray(res.data) ? res.data : [];
}

/** Cria canal (gestor). { nome, descricao?, privado?, membros?: [userId] } */
export async function criarCanalChat(payload) {
  const res = await axios.post(ep.canais, payload);
  return res.data;
}

/** Canais públicos para "entrar": [{ _id, nome, slug, descricao, totalMembros, souMembro }]. */
export async function getBrowseCanais() {
  const res = await axios.get(ep.browse);
  return Array.isArray(res.data) ? res.data : [];
}

/** Detalhe de um canal (membros populados) — só membros. */
export async function getCanalChat(id) {
  const res = await axios.get(ep.canal(id));
  return res.data;
}

export async function editarCanalChat(id, payload) {
  const res = await axios.patch(ep.canal(id), payload);
  return res.data;
}

export async function arquivarCanalChat(id) {
  const res = await axios.post(ep.arquivar(id));
  return res.data;
}

/** Desarquiva um canal (só criador ou admin/superadmin). */
export async function desarquivarCanalChat(id) {
  const res = await axios.post(ep.desarquivar(id));
  return res.data;
}

/** Exclui o canal DEFINITIVAMENTE (mensagens + anexos). Só criador ou admin/superadmin. */
export async function deletarCanalChat(id) {
  const res = await axios.delete(ep.canal(id));
  return res.data;
}

/** Canais arquivados visíveis a mim (admins veem todos). */
export async function getCanaisArquivados() {
  const res = await axios.get(ep.arquivados);
  return Array.isArray(res.data) ? res.data : [];
}

export async function adicionarMembroChat(id, usuario) {
  const res = await axios.post(ep.membros(id), { usuario });
  return res.data;
}

export async function removerMembroChat(id, userId) {
  const res = await axios.delete(ep.membro(id, userId));
  return res.data;
}

export async function entrarCanalChat(id) {
  const res = await axios.post(ep.entrar(id));
  return res.data;
}

export async function sairCanalChat(id) {
  const res = await axios.post(ep.sair(id));
  return res.data;
}

/** Obtém/cria a DM com um usuário interno (idempotente). */
export async function criarDmChat(usuario) {
  const res = await axios.post(ep.dms, { usuario });
  return res.data;
}

/** Marca lido (chamar ao abrir a conversa). → { lastReadAt } */
export async function marcarLidoChat(id, ate) {
  const res = await axios.post(ep.lido(id), ate ? { ate } : {});
  return res.data;
}

/** Usuários internos ativos (autocomplete de menção/DM). */
export async function getUsuariosChat() {
  const res = await axios.get(ep.usuarios);
  return Array.isArray(res.data) ? res.data : [];
}

// ---------------- Mensagens ----------------

/** Feed principal (asc). Cursor: use o createdAt do 1º item como `antesDe`. */
export async function getMensagensChat(canalId, { antesDe, limit = 50 } = {}) {
  const res = await axios.get(ep.mensagens(canalId), {
    params: { ...(antesDe ? { antesDe } : {}), limit },
  });
  return res.data; // { itens, temMais }
}

/** Envia texto (threadDe opcional para responder numa thread). → 201 Mensagem */
export async function enviarMensagemChat(canalId, texto, threadDe) {
  const res = await axios.post(ep.mensagens(canalId), {
    texto,
    ...(threadDe ? { threadDe } : {}),
  });
  return res.data;
}

/** Envia um GIF do Giphy (o backend só aceita URLs media*.giphy.com/i.giphy.com). */
export async function enviarGifChat(canalId, gifUrl, threadDe) {
  const res = await axios.post(ep.mensagens(canalId), {
    gifUrl,
    ...(threadDe ? { threadDe } : {}),
  });
  return res.data;
}

/** Cria uma enquete simples. { pergunta, opcoes: string[] (2 a 10) } */
export async function criarEnqueteChat(canalId, { pergunta, opcoes }) {
  const res = await axios.post(ep.mensagens(canalId), { enquete: { pergunta, opcoes } });
  return res.data;
}

/** Vota numa opção (índice). Toggle/troca — 1 voto por pessoa. → Mensagem atualizada */
export async function votarEnqueteChat(mensagemId, opcao) {
  const res = await axios.post(`${ep.mensagem(mensagemId)}/votar`, { opcao });
  return res.data;
}

/** Envia anexo (multipart 'arquivo'; caption/threadDe opcionais). */
export async function enviarAnexoChat(canalId, file, { caption, threadDe } = {}) {
  const fd = new FormData();
  fd.append('arquivo', file);
  if (caption) fd.append('caption', caption);
  if (threadDe) fd.append('threadDe', threadDe);
  const res = await axios.post(ep.anexos(canalId), fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function editarMensagemChat(id, texto) {
  const res = await axios.patch(ep.mensagem(id), { texto });
  return res.data;
}

export async function removerMensagemChat(id) {
  const res = await axios.delete(ep.mensagem(id));
  return res.data;
}

/** Thread: { raiz, respostas[] }. */
export async function getThreadChat(mensagemId) {
  const res = await axios.get(ep.thread(mensagemId));
  return res.data;
}

/** Toggle de reação. → { reacoes } (estado final) */
export async function reagirChat(mensagemId, emoji) {
  const res = await axios.post(ep.reacoes(mensagemId), { emoji });
  return res.data;
}

/**
 * Baixa um anexo autenticado e devolve um objectURL (blob:). Revogue com
 * URL.revokeObjectURL quando não precisar mais.
 */
export async function baixarAnexoBlobUrl(mensagemId, indice) {
  const res = await axios.get(ep.anexo(mensagemId, indice), { responseType: 'blob' });
  return URL.createObjectURL(res.data);
}

// ---------------- Integração WhatsApp ----------------

/** Inicia um atendimento WA a partir do canal e posta o card. → { conversa, mensagem } */
export async function chatWaIniciar(canalId, payload) {
  const res = await axios.post(ep.waIniciar(canalId), payload);
  return res.data;
}
