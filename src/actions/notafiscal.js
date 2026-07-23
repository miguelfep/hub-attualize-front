import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function criarNFSeInvoice({ invoiceId, ...data }) {
  return axios.post(`${baseUrl}nota-fiscal/invoice/${invoiceId}/emitir`, { invoiceId, ...data });
}

export async function cancelarNFSeInvoice({ nfseId, motivo }) {
  return axios.post(`${baseUrl}nota-fiscal/${nfseId}/cancelar`, { nfseId, motivo });
}

export async function gerarNotaCobrancaContratos({ cobrancaId }) {
  return axios.post(`${baseUrl}nota-fiscal/cobranca/${cobrancaId}/emitir`);
}

export async function getNfsesByInvoice(invoiceId) {
  return axios.get(`${baseUrl}nota-fiscal/invoice/${invoiceId}`);
}

// NFSe para Orçamento (Portal Cliente)
export async function criarNFSeOrcamento({ clienteId, orcamentoId, ...data }) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/orcamento/${orcamentoId}/emitir`, { clienteId, orcamentoId, ...data });
}

export async function getNfsesByOrcamento(clienteId, orcamentoId) {
  return axios.get(`${baseUrl}nota-fiscal/${clienteId}/orcamento/${orcamentoId}`);
}

export async function listarNotasFiscaisPorCliente({
  clienteId,
  page = 1,
  limit = 100,
  status,
  inicio,
  fim,
  numeroNota,
  cpfCnpj,
  tipoNota,
  tipoMovimento,
  origem,
  comRetencao,
}) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (status) params.status = status;
  if (inicio) params.inicio = inicio;
  if (fim) params.fim = fim;
  if (numeroNota) params.numeroNota = numeroNota;
  if (cpfCnpj) params.cpfCnpj = cpfCnpj;
  if (tipoNota) params.tipoNota = tipoNota;
  if (tipoMovimento) params.tipoMovimento = tipoMovimento; // 'entrada' | 'saida'
  if (origem) params.origem = origem; // 'enotas' | 'sieg' | 'nacional' | 'sefaz'
  if (comRetencao === true || comRetencao === false) params.comRetencao = comRetencao;
  return axios.get(`${baseUrl}nota-fiscal/${clienteId}`, { params });
}

/**
 * Cancelar nota fiscal
 * @param {string} notaFiscalId - ID da nota fiscal
 * @param {string} motivoCancelamento - Motivo do cancelamento
 * @param {string} dataCancelamento - Data do cancelamento (ISO string)
 * @returns {Promise}
 */
export async function cancelarNotaFiscal(notaFiscalId, motivoCancelamento, dataCancelamento) {
  return axios.put(`${baseUrl}nota-fiscal/${notaFiscalId}/status`, {
    status: 'cancelada',
    motivoCancelamento,
    dataCancelamento,
  });
}

// ----------------------------------------------------------------------
// Emissor Nacional (Sefin/ADN)
// ----------------------------------------------------------------------

export function isNotaNacional(nota) {
  return nota?.origem === 'nacional';
}

/**
 * Status/checklist da configuração do Emissor Nacional do cliente.
 * @param {string} clienteId
 * @param {{ testarConexao?: boolean }} [options] - testarConexao valida mTLS + convênio no Sefin
 */
export async function getNacionalStatus(clienteId, { testarConexao = false } = {}) {
  return axios.get(`${baseUrl}nota-fiscal/${clienteId}/nacional/status`, {
    params: testarConexao ? { testarConexao: true } : {},
  });
}

/** Sincronização incremental ADN (a partir do último NSU salvo). */
export async function sincronizarDfeNacional(clienteId) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/nacional/sincronizar-dfe`);
}

/**
 * Importação de notas históricas por período (ADN).
 * @param {string} clienteId
 * @param {{ competencia?: string, ano?: number, mesInicio?: number, mesFim?: number, desdeNSU?: number }} body
 */
export async function sincronizarPeriodoNacional(clienteId, body) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/nacional/sincronizar-periodo`, body);
}

/** Importação ADN por período para TODOS os clientes (somente admin). */
export async function importarPeriodoNacionalAdmin(body) {
  return axios.post(`${baseUrl}nota-fiscal/nacional/importar-periodo`, body);
}

/** Movimento da nota: 'entrada' (recebida) | 'saida' (emitida). Notas antigas sem o campo são saída. */
export function tipoMovimentoNota(nota) {
  return nota?.tipoMovimento || nota?.siegTipo || 'saida';
}

const decodeXmlEntities = (str) =>
  String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&(?:apos|#39);/g, "'");

const emitenteCache = new Map();

/**
 * Dados de quem emitiu a nota (para notas de entrada): o `tomador` persistido é o
 * destinatário, então nome/CNPJ do emitente só existem no XML salvo (<emit>/<prest>).
 * Fallback: CNPJ persistido (siegCnpjEmitente/nacionalCnpjEmitente) sem nome.
 */
export function dadosEmitenteNota(nota) {
  const cnpjSalvo =
    nota?.siegCnpjEmitente || nota?.nacionalCnpjEmitente || nota?.sefazCnpjEmitente || '';
  const xmlBase64 = nota?.siegXmlBase64 || nota?.nacionalXmlBase64;
  if (!xmlBase64) return { nome: '', cpfCnpj: cnpjSalvo };

  const cacheKey = nota?._id || nota?.id;
  if (cacheKey && emitenteCache.has(cacheKey)) return emitenteCache.get(cacheKey);

  let resultado = { nome: '', cpfCnpj: cnpjSalvo };
  try {
    const bytes = Uint8Array.from(atob(xmlBase64), (c) => c.charCodeAt(0));
    const xml = new TextDecoder('utf-8').decode(bytes);
    const blocoEmit =
      xml.match(/<emit[^>]*>([\s\S]*?)<\/emit>/)?.[1] ||
      xml.match(/<prest[^>]*>([\s\S]*?)<\/prest>/)?.[1] ||
      '';
    const nome =
      blocoEmit.match(/<xNome>([\s\S]*?)<\/xNome>/)?.[1]?.trim() ||
      blocoEmit.match(/<xFant>([\s\S]*?)<\/xFant>/)?.[1]?.trim() ||
      '';
    const cpfCnpj =
      blocoEmit.match(/<CNPJ>(\d+)<\/CNPJ>/)?.[1] ||
      blocoEmit.match(/<CPF>(\d+)<\/CPF>/)?.[1] ||
      cnpjSalvo;
    resultado = { nome: decodeXmlEntities(nome), cpfCnpj };
  } catch {
    // XML inválido/corrompido — mantém o fallback com o CNPJ persistido
  }
  if (cacheKey) emitenteCache.set(cacheKey, resultado);
  return resultado;
}

/** True quando a nota tem qualquer retenção de tributos na fonte (notas antigas sem o campo contam como sem). */
export function notaPossuiRetencao(nota) {
  return nota?.retencao?.possuiRetencao === true;
}

/**
 * Backfill do campo `retencao` nas notas nacionais já importadas/emitidas,
 * reaproveitando o XML salvo (não consulta o ADN). Idempotente.
 */
export async function reprocessarRetencoesNacional(clienteId) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/nacional/reprocessar-retencoes`);
}

/**
 * Cancela a nota no provedor (eNotas ou Emissor Nacional — o backend ramifica por `origem`).
 * Para notas nacionais dispara o evento e101101 no Sefin (síncrono).
 */
export async function cancelarNotaNoProvedor(notaFiscalId, motivo) {
  return axios.post(`${baseUrl}nota-fiscal/${notaFiscalId}/cancelar`, { motivo });
}

// ----------------------------------------------------------------------
// NF-e (modelo 55) — Busca/importação via SEFAZ / Ambiente Nacional
// (web service NFeDistribuicaoDFe). Escopo atual: apenas busca.
// ----------------------------------------------------------------------

export function isNotaSefaz(nota) {
  // NF-e (modelo 55) da SEFAZ — NFC-e também usa origem 'sefaz', mas tipoNota 'nfce'
  return nota?.origem === 'sefaz' && (nota?.tipoNota || 'nfe') !== 'nfce';
}

/** NFC-e (modelo 65) emitida no SEFAZ-PR — origem 'sefaz' + tipoNota 'nfce'. */
export function isNotaNfcePr(nota) {
  return nota?.origem === 'sefaz' && nota?.tipoNota === 'nfce';
}

/** True enquanto só temos o resumo (resNFe) — XML completo ainda não liberado. */
export function isNotaSefazResumo(nota) {
  return isNotaSefaz(nota) && nota?.sefazResumo === true;
}

/**
 * Status/checklist da configuração de busca de NF-e na SEFAZ do cliente.
 * @param {string} clienteId
 * @param {{ testarConexao?: boolean }} [options] - testarConexao valida o mTLS com a SEFAZ
 */
export async function getNfeStatus(clienteId, { testarConexao = false } = {}) {
  return axios.get(`${baseUrl}nota-fiscal/${clienteId}/nfe/status`, {
    params: testarConexao ? { testarConexao: true } : {},
  });
}

/**
 * Sincronização incremental de NF-e (a partir do último NSU salvo na SEFAZ).
 * @param {string} clienteId
 * @param {{ forcarSync?: boolean }} [options] - forcarSync bypassa o intervalo
 *   mínimo de 15 min entre syncs (somente admin). Ainda respeita o bloqueio 656.
 */
export async function sincronizarNfeSefaz(clienteId, { forcarSync = false } = {}) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/nfe/sincronizar`, undefined, {
    params: forcarSync ? { forcarSync: true } : {},
  });
}

/** Sincroniza NF-e de TODOS os clientes habilitados (somente admin). */
export async function sincronizarTodosNfeSefaz() {
  return axios.post(`${baseUrl}nota-fiscal/nfe/sincronizar-todos`);
}

/**
 * Baixa o XML da NF-e (procNFe completo, ou o resumo resNFe se ainda for
 * `sefazResumo`). Sempre via rota autenticada, retornando blob.
 */
export async function baixarXmlNfeSefaz(nota) {
  const id = nota._id || nota.id;
  const res = await axios.get(`${baseUrl}nota-fiscal/${id}/sefaz/xml`, {
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: 'application/xml' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `NFe-${nota.chaveAcesso || id}.xml`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------
// NFC-e (modelo 65) — emissão direta no SEFAZ-PR (nfce.sefa.pr.gov.br)
// ----------------------------------------------------------------------

/**
 * Status/checklist da configuração de NFC-e (SEFAZ-PR) do cliente.
 * @param {string} clienteId
 * @param {{ testarSefaz?: boolean }} [options] - testarSefaz consulta o NFeStatusServico4 real
 */
export async function getNfcePrStatus(clienteId, { testarSefaz = false } = {}) {
  return axios.get(`${baseUrl}nota-fiscal/${clienteId}/nfce-pr/status`, {
    params: testarSefaz ? { testarSefaz: true } : {},
  });
}

/** Configura os parâmetros de emissão de NFC-e (CSC, ambiente, série, etc.). */
export async function configurarNfcePr(clienteId, payload) {
  return axios.put(`${baseUrl}nota-fiscal/${clienteId}/nfce-pr/configurar`, payload);
}

/** Emite (gera e transmite) uma NFC-e ao SEFAZ-PR. */
export async function emitirNfcePr(clienteId, body) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/nfce-pr/emitir`, body);
}

/** Status do serviço NF-e PR (SEFAZ-PR — consulta direta por chave). Sem configuração própria; usa cert/ambiente de nfeConfig. */
export async function getNfePrStatus(clienteId, { testarSefaz = false } = {}) {
  return axios.get(`${baseUrl}nota-fiscal/${clienteId}/nfe-pr/status`, {
    params: testarSefaz ? { testarSefaz: true } : {},
  });
}

/**
 * Registra a empresa no eNotas em uma única chamada:
 * cria/atualiza o registro com dados do cliente, envia a alíquota ISS e demais
 * configs NFSe, e salva o empresaId retornado nas Settings do cliente.
 * O certificado ativo é vinculado automaticamente pelo backend.
 * @param {string} clienteId
 * @param {{ ambiente: string, configuracaoNFSe: { aliquotaIss: number, codigoMunicipio: string, codigoServico: string, discriminacao?: string } }} payload
 */
export async function configurarEnotas(clienteId, payload) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/configurar-enotas`, payload);
}

/** Configura o Emissor Nacional (download e/ou emissão de NFS-e). Todos os campos são opcionais — apenas os informados são atualizados. */
export async function configurarNacional(clienteId, payload) {
  return axios.put(`${baseUrl}nota-fiscal/${clienteId}/nacional/configurar`, payload);
}

/** Configura os parâmetros de busca/importação de NF-e via SEFAZ Ambiente Nacional (modelo 55). */
export async function configurarNfe(clienteId, payload) {
  return axios.put(`${baseUrl}nota-fiscal/${clienteId}/nfe/configurar`, payload);
}

/**
 * Rota unificada — dispara todos os provedores habilitados em uma única chamada.
 * Sem período: incremental (NF-e + Nacional). Com período: inclui SIEG por competência.
 * @param {string} clienteId
 * @param {{ competencia?: string, ano?: number, mesInicio?: number, mesFim?: number, tipos?: string[], forcarSync?: boolean }} body
 */
export async function sincronizarUnificado(clienteId, body = {}) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/sincronizar`, body);
}

/** Cancela uma NFC-e (evento 110111) — prazo de 30 min; motivo com no mín. 15 caracteres. */
export async function cancelarNfcePr(notaFiscalId, motivo) {
  return axios.post(`${baseUrl}nota-fiscal/${notaFiscalId}/nfce-pr/cancelar`, { motivo });
}

/** Consulta a situação atual da NFC-e no SEFAZ-PR (NFeConsultaProtocolo4). */
export async function consultarNfcePr(notaFiscalId) {
  return axios.get(`${baseUrl}nota-fiscal/${notaFiscalId}/nfce-pr/consultar`);
}

/** Baixa o XML autorizado (nfeProc) da NFC-e. */
export async function baixarXmlNfcePr(nota) {
  const id = nota._id || nota.id;
  const res = await axios.get(`${baseUrl}nota-fiscal/${id}/nfce-pr/xml`, {
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: 'application/xml' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `NFCe-${nota.chaveAcesso || id}.xml`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------
// Integração Domínio Sistemas (Onvio / Thomson Reuters) — envio de XML de
// NFS-e emitidas ao escritório de contabilidade. Tudo passa pelo hub; o front
// nunca chama a API Domínio diretamente.
// ----------------------------------------------------------------------

/**
 * Valida a chave do contador na API Domínio (activation/info) ANTES de ativar.
 * Retorna os dados do escritório/cliente para conferência (inclui clienteCnpj).
 * @param {string} clienteId
 * @param {string} chaveContador
 */
export async function validarChaveDominio(clienteId, chaveContador) {
  return axios.get(`${baseUrl}nota-fiscal/${clienteId}/dominio/info`, {
    params: { chaveContador },
  });
}

/**
 * Ativa a integração Domínio: gera e persiste a integrationKey (criptografada).
 * Após ativar, a integração fica com `habilitado: false` até ligar o toggle.
 * @param {string} clienteId
 * @param {string} chaveContador
 */
export async function ativarDominio(clienteId, chaveContador) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/dominio/ativar`, { chaveContador });
}

/**
 * Envia em lote as NFS-e de saída ainda não enviadas ao Domínio (máx. 200/chamada).
 * Sem filtro: usa todas as elegíveis. Com `notaFiscalIds`, ignora as datas.
 * Exige `dominioConfig.habilitado === true`.
 * @param {string} clienteId
 * @param {{ dataInicio?: string, dataFim?: string, notaFiscalIds?: string[] }} [body]
 */
export async function enviarLoteDominio(clienteId, body = {}) {
  return axios.post(`${baseUrl}nota-fiscal/${clienteId}/dominio/enviar`, body);
}

/**
 * Força o reenvio de uma NFS-e específica ao Domínio. Idempotente: se já está
 * `enviado`, o backend retorna 200 sem reenviar.
 * @param {string} notaFiscalId
 */
export async function reenviarNotaDominio(notaFiscalId) {
  return axios.post(`${baseUrl}nota-fiscal/${notaFiscalId}/dominio/reenviar`);
}

/**
 * Força o reenvio do evento de cancelamento (e101101) de uma NFS-e nacional ao
 * Domínio. Use quando `dominioEnvioCancelamento.status === 'erro'`. Escopo atual:
 * apenas notas `origem: 'nacional'` (temos o XML assinado do evento).
 * @param {string} notaFiscalId
 */
export async function reenviarCancelamentoDominio(notaFiscalId) {
  return axios.post(`${baseUrl}nota-fiscal/${notaFiscalId}/dominio/reenviar-cancelamento`);
}

/**
 * Resumo/dashboard de envios ao Domínio do cliente (config + contagem por status).
 * @param {string} clienteId
 * @param {{ dataInicio?: string, dataFim?: string }} [options]
 */
export async function getDominioStatus(clienteId, { dataInicio, dataFim } = {}) {
  const params = {};
  if (dataInicio) params.dataInicio = dataInicio;
  if (dataFim) params.dataFim = dataFim;
  return axios.get(`${baseUrl}nota-fiscal/${clienteId}/dominio/status`, { params });
}

/** Remove tudo que não for dígito (para comparar CNPJs com/sem máscara). */
export function normalizarCnpj(cnpj) {
  return String(cnpj ?? '').replace(/\D/g, '');
}

/**
 * Rótulo/cor do status de envio ao Domínio de uma nota. Sem `dominioEnvio`
 * significa que ainda não houve tentativa (integração off ou nota anterior).
 * @param {{ status?: string }} [dominioEnvio]
 * @param {boolean} [integracaoHabilitada]
 * @returns {{ label: string, color: 'default'|'warning'|'success'|'error' }}
 */
export function labelStatusDominio(dominioEnvio, integracaoHabilitada) {
  if (!integracaoHabilitada) return { label: 'Integração off', color: 'default' };
  if (!dominioEnvio?.status) return { label: 'Não enviado', color: 'default' };
  const map = {
    pendente: { label: 'Pendente', color: 'default' },
    enviando: { label: 'Enviando...', color: 'warning' },
    processando: { label: 'Processando', color: 'warning' },
    enviado: { label: 'Enviado ao Domínio', color: 'success' },
    erro: { label: 'Erro no envio', color: 'error' },
  };
  return map[dominioEnvio.status] || { label: 'Não enviado', color: 'default' };
}

/**
 * Extrai uma mensagem legível do campo `erro` de um envio ao Domínio. O backend
 * pode mandar uma string OU um objeto (ex.: resposta bruta da API Domínio, com
 * `message`/`error`/`mensagem`/array de erros), que sem tratamento vira
 * "[object Object]" na UI.
 * @param {string|object} erro
 * @returns {string}
 */
export function mensagemErroDominio(erro) {
  if (!erro) return '';
  if (typeof erro === 'string') return erro;
  if (Array.isArray(erro)) {
    return erro.map((e) => mensagemErroDominio(e)).filter(Boolean).join(' · ');
  }
  if (typeof erro === 'object') {
    const direta =
      erro.message ||
      erro.mensagem ||
      erro.error ||
      erro.erro ||
      erro.detail ||
      erro.descricao ||
      erro.description;
    if (direta) return mensagemErroDominio(direta);
    // Domínio às vezes devolve { errors: [...] } ou { motivos: [...] }
    if (Array.isArray(erro.errors)) return mensagemErroDominio(erro.errors);
    if (Array.isArray(erro.motivos)) return mensagemErroDominio(erro.motivos);
    try {
      return JSON.stringify(erro);
    } catch {
      return 'Erro no envio';
    }
  }
  return String(erro);
}

/** True quando a nota pode ser reenviada manualmente ao Domínio (erro/pendente/sem tentativa). */
export function podeReenviarDominio(dominioEnvio) {
  if (!dominioEnvio) return true;
  return dominioEnvio.status === 'erro' || dominioEnvio.status === 'pendente';
}

/**
 * True quando o evento de cancelamento de uma nota pode ser reenviado ao Domínio.
 * Só faz sentido para NFS-e nacional cancelada com tentativa de envio em erro/pendente.
 * @param {{ status?: string, origem?: string }} nota
 */
export function podeReenviarCancelamentoDominio(nota) {
  if (!nota) return false;
  const cancelada = String(nota.status || '').toLowerCase() === 'cancelada';
  const nacional = nota.origem === 'nacional';
  const env = nota.dominioEnvioCancelamento;
  if (!cancelada || !nacional || !env) return false;
  return env.status === 'erro' || env.status === 'pendente';
}

/** True quando a nota é elegível para envio ao Domínio (NFS-e de saída emitida via enotas/nacional). */
export function isNotaElegivelDominio(nota) {
  if (!nota) return false;
  const origemOk = nota.origem === 'enotas' || nota.origem === 'nacional' || !nota.origem;
  const tipoOk = !nota.tipoNota || nota.tipoNota === 'nfse';
  const saida = tipoMovimentoNota(nota) !== 'entrada';
  const emitida = String(nota.status || '').toLowerCase() === 'emitida';
  return origemOk && tipoOk && saida && emitida;
}

/**
 * Abre o PDF (DANFSe) da nota. Notas nacionais exigem download autenticado
 * (linkNota é caminho relativo da API), as demais abrem o link externo direto.
 */
export async function abrirPdfNota(nota) {
  if (!isNotaNacional(nota)) {
    if (nota?.linkNota && nota.linkNota !== 'Processando...') {
      window.open(nota.linkNota, '_blank', 'noopener,noreferrer');
    }
    return;
  }
  const id = nota._id || nota.id;
  const res = await axios.get(`${baseUrl}nota-fiscal/${id}/nacional/pdf`, {
    responseType: 'blob',
  });

  // 202 = gov.br ainda gerando o DANFSe (corpo é JSON, não PDF) — não é erro definitivo
  if (res.status === 202) {
    let message =
      'O PDF da nota está sendo gerado pelo gov.br. Tente novamente em alguns instantes.';
    try {
      const parsed = JSON.parse(await res.data.text());
      if (parsed?.message) ({ message } = parsed);
    } catch {
      // mantém a mensagem padrão
    }
    throw new Error(message);
  }

  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
}

/**
 * Baixa o XML autorizado da nota. Notas nacionais usam a rota autenticada;
 * as demais abrem o linkXml externo.
 */
export async function baixarXmlNota(nota) {
  if (isNotaNfcePr(nota)) {
    await baixarXmlNfcePr(nota);
    return;
  }
  if (isNotaSefaz(nota)) {
    await baixarXmlNfeSefaz(nota);
    return;
  }
  if (!isNotaNacional(nota)) {
    if (nota?.linkXml) window.open(nota.linkXml, '_blank', 'noopener,noreferrer');
    return;
  }
  const id = nota._id || nota.id;
  const res = await axios.get(`${baseUrl}nota-fiscal/${id}/nacional/xml`, {
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: 'application/xml' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `NFSe-${nota.chaveAcesso || nota.numeroNota || id}.xml`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
