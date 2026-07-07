import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Feature Tarefas — camada de acesso à API (/api/tarefas).
// Todas as rotas exigem JWT (injetado pelo interceptor do axios) e são
// exclusivamente internas (o papel `cliente` é negado no backend).
// ----------------------------------------------------------------------

/**
 * Remove chaves vazias/nulas dos filtros antes de enviar como query params.
 * @param {Record<string, any>} [filters]
 * @returns {Record<string, any>}
 */
function limparParams(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );
}

// ----------------------------------------------------------------------

/**
 * Lista tarefas (gestão) com filtros e paginação.
 * Retorna `{ data, total, page, limit }`.
 */
export async function getTarefas(filters = {}) {
  const res = await axios.get(endpoints.tarefas.root, { params: limparParams(filters) });
  return res.data;
}

/**
 * Lista as tarefas do usuário autenticado (sempre escopadas ao responsável logado).
 * Retorna `{ data, total, page, limit }`.
 */
export async function getMinhasTarefas(filters = {}) {
  const res = await axios.get(endpoints.tarefas.minhas, { params: limparParams(filters) });
  return res.data;
}

/**
 * Busca uma tarefa por id (populada).
 */
export async function getTarefaById(id) {
  const res = await axios.get(endpoints.tarefas.details(id));
  return res.data;
}

// ----------------------------------------------------------------------
// Mutações — apenas Gestores (admin/gerencial)
// ----------------------------------------------------------------------

/**
 * Cria uma tarefa. Campos: titulo*, responsavel*, prazo*, descricao?, cliente?,
 * competencia? (YYYY-MM), prioridade? (alta|media|baixa).
 */
export async function criarTarefa(payload) {
  const res = await axios.post(endpoints.tarefas.root, payload);
  return res.data;
}

/**
 * Edita campos da tarefa (titulo, descricao, cliente, prazo, competencia,
 * prioridade, responsabilidadeEmpresa). Para remover o cliente envie `cliente: null`.
 * Reatribuição NÃO é feita aqui — use `reatribuirTarefa`.
 */
export async function atualizarTarefa(id, payload) {
  const res = await axios.patch(endpoints.tarefas.details(id), payload);
  return res.data;
}

/**
 * Exclui a tarefa definitivamente (somente admin/gerencial). Remove também
 * comentários, anexos e checklist embutidos.
 */
export async function deletarTarefa(id) {
  const res = await axios.delete(endpoints.tarefas.details(id));
  return res.data;
}

/**
 * Reatribui a tarefa para outro responsável.
 */
export async function reatribuirTarefa(id, responsavel) {
  const res = await axios.patch(endpoints.tarefas.responsavel(id), { responsavel });
  return res.data;
}

// ----------------------------------------------------------------------
// Mutações — Internos
// ----------------------------------------------------------------------

/**
 * Altera o status da tarefa. Ao cancelar, `motivo` é obrigatório.
 * @param {string} id
 * @param {'pendente'|'em_andamento'|'concluida'|'cancelada'} status
 * @param {string} [motivo] obrigatório quando status === 'cancelada'
 */
export async function alterarStatusTarefa(id, status, motivo) {
  const body = { status };
  if (status === 'cancelada') body.motivo = motivo;
  const res = await axios.patch(endpoints.tarefas.status(id), body);
  return res.data;
}

/**
 * Adiciona um comentário à tarefa.
 * @param {string}   id
 * @param {string}   texto
 * @param {string[]} [mencionados] ids dos usuários mencionados (@) — enviado como
 *   dica. O backend reparsea o `@handle` do texto e notifica cada usuário casado
 *   (notificação in-app tipo `tarefa_mencionada`).
 */
export async function adicionarComentario(id, texto, mencionados = []) {
  const res = await axios.post(endpoints.tarefas.comentarios(id), { texto, mencionados });
  return res.data;
}

/**
 * Remove um comentário (somente o autor ou um admin).
 */
export async function removerComentario(id, comentarioId) {
  const res = await axios.delete(endpoints.tarefas.comentario(id, comentarioId));
  return res.data;
}

// ----------------------------------------------------------------------
// Checklist — a composição dos itens é definida na criação da tarefa (ou vem
// do template recorrente) e não muda depois; aqui só marca/desmarca.
// ----------------------------------------------------------------------

/**
 * Marca/desmarca um item do checklist. O backend grava quem concluiu e quando.
 * Itens obrigatórios pendentes impedem finalizar a tarefa.
 * @param {string} id
 * @param {string} itemId
 * @param {boolean} concluido
 */
export async function alternarChecklistItem(id, itemId, concluido) {
  const res = await axios.patch(endpoints.tarefas.checklistConcluir(id, itemId), { concluido });
  return res.data;
}

/**
 * Faz upload de um anexo (multipart/form-data, campo `arquivo`). Limite 20MB.
 */
export async function adicionarAnexo(id, file) {
  const formData = new FormData();
  formData.append('arquivo', file);
  const res = await axios.post(endpoints.tarefas.anexos(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/**
 * Remove um anexo da tarefa.
 */
export async function removerAnexo(id, anexoId) {
  const res = await axios.delete(endpoints.tarefas.anexo(id, anexoId));
  return res.data;
}

// ----------------------------------------------------------------------
// Anexos — view/download/thumbnail são endpoints AUTENTICADOS (exigem o
// Bearer). Por isso não dá para usá-los direto em <img>/<a>: buscamos via
// axios (que injeta o token) como blob e criamos um object URL.
// ----------------------------------------------------------------------

function urlAnexo(tarefaId, anexoId, tipo) {
  if (tipo === 'download') return endpoints.tarefas.anexoDownload(tarefaId, anexoId);
  if (tipo === 'thumbnail') return endpoints.tarefas.anexoThumbnail(tarefaId, anexoId);
  return endpoints.tarefas.anexoView(tarefaId, anexoId);
}

/**
 * Busca o anexo (view/download/thumbnail) como blob e devolve um object URL.
 * O chamador é responsável por `URL.revokeObjectURL` quando não precisar mais.
 * @param {'view'|'download'|'thumbnail'} [tipo]
 */
export async function getAnexoBlobUrl(tarefaId, anexoId, tipo = 'view') {
  const res = await axios.get(urlAnexo(tarefaId, anexoId, tipo), { responseType: 'blob' });
  return URL.createObjectURL(res.data);
}

/**
 * Baixa um anexo (dispara o download com o nome original).
 */
export async function baixarAnexo(tarefaId, anexoId, nomeArquivo) {
  const objectUrl = await getAnexoBlobUrl(tarefaId, anexoId, 'download');
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = nomeArquivo || 'arquivo';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

/**
 * Abre o anexo inline em uma nova aba (ex.: PDF). A janela é aberta de forma
 * síncrona (preserva o gesto do usuário) e a URL é setada após o fetch.
 */
export async function abrirAnexoInline(tarefaId, anexoId) {
  const win = window.open('', '_blank');
  try {
    const objectUrl = await getAnexoBlobUrl(tarefaId, anexoId, 'view');
    if (win) win.location = objectUrl;
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch (e) {
    if (win) win.close();
    throw e;
  }
}

/**
 * Histórico de auditoria da tarefa (somente Gestores).
 */
export async function getHistoricoTarefa(id) {
  const res = await axios.get(endpoints.tarefas.historico(id));
  return res.data;
}

// ----------------------------------------------------------------------
// Templates recorrentes — apenas Gestores
// ----------------------------------------------------------------------

/**
 * Lista templates recorrentes.
 * @param {{ ativo?: boolean, flowId?: string }} [filtros]
 */
export async function getTemplates(filtros = {}) {
  const res = await axios.get(endpoints.tarefas.templates, { params: limparParams(filtros) });
  const {data} = res;
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function getTemplateById(id) {
  const res = await axios.get(endpoints.tarefas.template(id));
  return res.data;
}

/**
 * Cria um template recorrente. Campos: nome*, titulo*, descricao?,
 * responsavelPadrao?, diaPrazo (1–28), prioridade?, tipoEmpresa[], planoEmpresa[],
 * flowId?, stepOrder?, nextTemplateId?, ativo?.
 */
export async function criarTemplate(payload) {
  const res = await axios.post(endpoints.tarefas.templates, payload);
  return res.data;
}

export async function atualizarTemplate(id, payload) {
  const res = await axios.patch(endpoints.tarefas.template(id), payload);
  return res.data;
}

/**
 * Dispara a geração recorrente manual por competência.
 * @param {{ competencia: string, templateId?: string }} payload
 * @returns resumo { competencia, templatesConsiderados, clientesElegiveis, tarefasCriadas, tarefasExistentes }
 */
export async function gerarTarefasRecorrentes(payload) {
  const res = await axios.post(endpoints.tarefas.gerarRecorrentes, payload);
  return res.data;
}
