import Cookies from 'js-cookie';

import axios, { endpoints } from 'src/utils/axios';

import { STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------
// Atendimento WhatsApp (WhatsApp Cloud API oficial da Meta) — camada de acesso
// à API (/api/wa). A fonte da verdade são estas rotas REST; o SSE (ver
// `use-wa-stream`) apenas entrega atualizações ao vivo (best-effort).
//
// Conceitos:
// - Conversa: thread de um contato. status: pendente → aberta → resolvida.
// - Mensagem: direcao inbound (do cliente) | outbound (do atendente).
// - Janela de 24h: fora dela só é possível enviar templates (HSM).
// ----------------------------------------------------------------------

/** Remove chaves vazias/nulas dos filtros antes de virar query params. */
function limparParams(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );
}

// ----------------------------------------------------------------------
// URLs que precisam do token embutido (o browser não manda o header sozinho).
// ----------------------------------------------------------------------

/** Token JWT atual (mesma sessão do axios). */
export function getWaToken() {
  return typeof window !== 'undefined' ? Cookies.get(STORAGE_KEY) : null;
}

/** URL do stream SSE com o token na query string (EventSource não manda header). */
export function getWaStreamUrl(token = getWaToken()) {
  if (!token) return null;
  return `${endpoints.wa.stream}?token=${encodeURIComponent(token)}`;
}

// ----------------------------------------------------------------------
// Conversas
// ----------------------------------------------------------------------

/**
 * Lista conversas com filtros e paginação.
 * @param {{ status?: 'aberta'|'pendente'|'resolvida', setor?: string,
 *   atendente?: string, semAtendente?: boolean, page?: number, limit?: number }} [filters]
 * @returns {Promise<{ itens: any[], total: number, page: number, limit: number, totalPages: number }>}
 */
export async function getConversas(filters = {}) {
  const res = await axios.get(endpoints.wa.conversas, { params: limparParams(filters) });
  return res.data;
}

/**
 * Inicia uma conversa nova enviando um template aprovado (HSM) — usado quando o
 * contato ainda não tem thread ou está fora da janela de 24h. Informe `telefone`
 * (dígitos com DDI, ex.: "5541999999999") e/ou `cliente` (ObjectId), mais o
 * `template` ({ name, language, components }).
 * @param {{ telefone?: string, cliente?: string, template: object }} payload
 * @returns {Promise<{ conversa: object, mensagem: object }>}
 */
export async function iniciarConversa(payload) {
  const res = await axios.post(endpoints.wa.iniciar, payload);
  return res.data;
}

/** Obtém uma conversa por id. `403` fora do escopo, `404` inexistente. */
export async function getConversa(id) {
  const res = await axios.get(endpoints.wa.conversa(id));
  return res.data;
}

/**
 * Lista mensagens de uma conversa, em ordem cronológica (mais antigas primeiro).
 * @returns {Promise<{ itens: any[], total: number, page: number, limit: number, totalPages: number }>}
 */
export async function getMensagens(
  id,
  { page = 1, limit = 50, contato = false, ultimas = false, antesDe } = {}
) {
  // contato=true → histórico completo do contato (todas as conversas dele),
  // estilo WhatsApp; cada mensagem traz `conversa` para marcar as fronteiras.
  // ultimas=true → só as últimas `limit` mensagens (+ `temMais` na resposta);
  // antesDe=<ISO> → "carregar mais": mensagens anteriores a essa data.
  const res = await axios.get(endpoints.wa.mensagens(id), {
    params: {
      page,
      limit,
      ...(contato ? { contato: 'true' } : {}),
      ...(ultimas ? { ultimas: 'true' } : {}),
      ...(antesDe ? { antesDe } : {}),
    },
  });
  return res.data;
}

/**
 * Envia texto ou template (JSON). Retorna a Mensagem criada (nasce
 * `status: 'enviando'`, evolui via SSE `mensagem_status`).
 *
 * Texto (só dentro da janela de 24h): `{ tipo: 'text', texto }`.
 * Template (permitido inclusive fora da janela): `{ tipo: 'template', name,
 * language, components }`.
 *
 * Erros: 409 fora da janela (oferecer template), 403 contato bloqueado,
 * 400 validação, 502 Meta rejeitou (mensagem fica `falha`).
 */
export async function enviarMensagem(id, payload) {
  const res = await axios.post(endpoints.wa.mensagens(id), payload);
  return res.data;
}

/** Atalho para envio de texto. `responderA` = _id da mensagem citada (reply). */
export function enviarTexto(id, texto, { responderA } = {}) {
  return enviarMensagem(id, { tipo: 'text', texto, ...(responderA ? { responderA } : {}) });
}

/** Atalho para envio de template. */
export function enviarTemplate(id, { name, language, components }) {
  return enviarMensagem(id, { tipo: 'template', name, language, components });
}

/**
 * Envia mídia (multipart). `arquivo` obrigatório; `caption` opcional (ignorada
 * para áudio). Tipo inferido do mimetype. Limite 16 MB. Só dentro da janela 24h.
 */
export async function enviarMidia(id, file, caption) {
  const fd = new FormData();
  fd.append('arquivo', file);
  if (caption) fd.append('caption', caption);
  const res = await axios.post(endpoints.wa.midia(id), fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/**
 * Atribui setor/atendente (ao menos um). Conversa `pendente` vira `aberta`.
 * @param {{ setores?: string[], atendente?: string }} payload
 */
export async function atribuirConversa(id, payload) {
  const res = await axios.patch(endpoints.wa.atribuir(id), payload);
  return res.data;
}

/**
 * Transfere a conversa (grava histórico auditável; dispara `transferencia`).
 * @param {{ setores?: string[], atendente?: string, motivo?: string }} payload
 */
export async function transferirConversa(id, payload) {
  const res = await axios.post(endpoints.wa.transferir(id), payload);
  return res.data;
}

/** Muda o status: aberta | pendente | resolvida. */
export async function mudarStatusConversa(id, status) {
  const res = await axios.patch(endpoints.wa.status(id), { status });
  return res.data;
}

/** Marca como lida (zera naoLidas). Chamar quando o atendente abre a conversa. */
export async function marcarLida(id) {
  const res = await axios.post(endpoints.wa.lida(id));
  return res.data;
}

// ----------------------------------------------------------------------
// Mídia (download autenticado) — a mídia NÃO é pública; exige o Bearer e
// respeita o escopo por setor. Buscamos como blob e criamos um objectURL.
// ----------------------------------------------------------------------

/**
 * Baixa o binário da mídia de uma mensagem e devolve um objectURL (`blob:`).
 * Lembre de revogar o URL quando não precisar mais (URL.revokeObjectURL).
 * `404` se a mídia inbound ainda não terminou de baixar — aguarde `mensagem_midia`.
 */
export async function baixarMidiaBlobUrl(mensagemId) {
  const res = await axios.get(endpoints.wa.mensagemMidia(mensagemId), { responseType: 'blob' });
  return URL.createObjectURL(res.data);
}

// ----------------------------------------------------------------------
// Templates
// ----------------------------------------------------------------------

/**
 * Lista templates aprovados e ativos (`?todos=true` inclui todos).
 * Cada template: { name, language, category, status, bodyPreview, variaveis, components }.
 */
export async function getTemplates({ todos = false } = {}) {
  const res = await axios.get(endpoints.wa.templates, {
    params: limparParams({ todos: todos || undefined }),
  });
  return res.data;
}

/** Sincroniza os templates com a Meta (apenas admin). */
export async function sincronizarTemplates() {
  const res = await axios.post(endpoints.wa.templatesSincronizar);
  return res.data;
}

// ----------------------------------------------------------------------
// Administração (apenas admin)
// ----------------------------------------------------------------------

/**
 * Cria um template na Meta (fica `status: 'PENDING'` até a aprovação).
 * @param {{ name: string, category: string, language: string, components: any[],
 *   canalId?: string }} payload
 */
export async function criarTemplate(payload) {
  const res = await axios.post(endpoints.wa.templates, payload);
  return res.data;
}

/** Exclui um template pelo nome (remove na Meta e no espelho local). */
export async function deletarTemplate(name, params = {}) {
  const res = await axios.delete(endpoints.wa.template(name), { params: limparParams(params) });
  return res.data;
}

// --- Canais / números -------------------------------------------------

/**
 * Lista os canais (números) cadastrados. Cada canal:
 * { _id, nome, phoneNumberId, wabaId, phoneDisplay, ativo, padrao }.
 */
export async function getCanais() {
  const res = await axios.get(endpoints.wa.canais);
  const {data} = res;
  return Array.isArray(data) ? data : data?.itens ?? data?.canais ?? data?.data ?? [];
}

/** Cria um canal (número). */
export async function criarCanal(payload) {
  const res = await axios.post(endpoints.wa.canais, payload);
  return res.data;
}

/** Atualiza um canal. */
export async function atualizarCanal(id, payload) {
  const res = await axios.put(endpoints.wa.canal(id), payload);
  return res.data;
}

/** Remove um canal. */
export async function deletarCanal(id) {
  const res = await axios.delete(endpoints.wa.canal(id));
  return res.data;
}

// --- Configuração global ---------------------------------------------

/**
 * Lê a configuração da API oficial (sem devolver segredos em claro).
 * Ex.: { graphApiVersion, webhookUrl, verifyToken, appSecretDefinido }.
 */
export async function getConfig() {
  const res = await axios.get(endpoints.wa.config);
  return res.data;
}

/** Salva a configuração global (admin). */
export async function salvarConfig(payload) {
  const res = await axios.put(endpoints.wa.config, payload);
  return res.data;
}

/**
 * Testa a conexão com a Meta (valida token/ids). Opcionalmente por canal.
 * @param {{ canalId?: string }} [payload]
 */
export async function testarConfig(payload = {}) {
  const res = await axios.post(endpoints.wa.configTestar, payload);
  return res.data;
}

/**
 * Config do agente de IA (bot) do atendimento (admin).
 * Ex.: { habilitado, provider: 'claude'|'gemini', modelo, instrucoes,
 *        claudeDisponivel, geminiDisponivel, modelosSugeridos }.
 */
export async function getAgenteConfig() {
  const res = await axios.get(endpoints.wa.agente);
  return res.data;
}

/** Salva a config do agente de IA (admin). Campos omitidos são mantidos. */
export async function salvarAgenteConfig(payload) {
  const res = await axios.put(endpoints.wa.agente, payload);
  return res.data;
}

// ----------------------------------------------------------------------
// Base de conhecimento pesquisável do bot (admin). Diferente das instruções:
// os itens NÃO entram inteiros no prompt — o bot busca os relevantes (RAG).
// ----------------------------------------------------------------------

/** Lista itens da base ({ itens, total, ... }). `q` filtra por texto. */
export async function getConhecimento({ q, page = 1, limit = 50 } = {}) {
  const res = await axios.get(endpoints.wa.conhecimento, {
    params: limparParams({ q, page, limit }),
  });
  return res.data;
}

/** Testa a busca semântica (a mesma que o bot usa). → { itens: [{titulo, conteudo, relevancia}] } */
export async function buscarConhecimento(q) {
  const res = await axios.get(endpoints.wa.conhecimentoBuscar, { params: { q } });
  return res.data;
}

export async function criarConhecimento(payload) {
  const res = await axios.post(endpoints.wa.conhecimento, payload);
  return res.data;
}

export async function atualizarConhecimento(id, payload) {
  const res = await axios.put(endpoints.wa.conhecimentoItem(id), payload);
  return res.data;
}

export async function removerConhecimento(id) {
  await axios.delete(endpoints.wa.conhecimentoItem(id));
}

/** Re-gera embeddings pendentes/desatualizados. → { processados, falhas, total } */
export async function reindexarConhecimento() {
  const res = await axios.post(endpoints.wa.conhecimentoReindexar);
  return res.data;
}
