'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { baseUrl, fetcher, endpoints } from 'src/utils/axios';

// ─── Constantes de Status ─────────────────────────────────────────────────────

export const IR_STATUS_LABELS = {
  iniciada: 'Iniciada',
  pendente_pagamento: 'Aguardando Pagamento',
  paga: 'Pago',
  coletando_documentos: 'Enviando Documentos',
  em_validacao: 'Em Validação',
  em_processo: 'Em Processo',
  finalizada: 'Finalizado',
};

export const IR_STATUS_COLORS = {
  iniciada: 'default',
  pendente_pagamento: 'warning',
  paga: 'info',
  coletando_documentos: 'secondary',
  em_validacao: 'info',
  em_processo: 'primary',
  finalizada: 'success',
};

export const IR_STATUS_ORDER = [
  'iniciada',
  'pendente_pagamento',
  'paga',
  'coletando_documentos',
  'em_validacao',
  'em_processo',
  'finalizada',
];

// ─── Planos (público) ─────────────────────────────────────────────────────────

/**
 * Hook SWR para buscar os planos/modalidades disponíveis com preço do lote atual.
 * Não requer autenticação.
 */
export function useGetPlanosIr() {
  const { data, isLoading, error, mutate } = useSWR(
    endpoints.ir.planos,
    async (url) => {
      const res = await axios.get(url, { headers: { Authorization: '' } });
      return res.data;
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return useMemo(
    () => ({
      data: Array.isArray(data) ? data : [],
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

// ─── Cliente ──────────────────────────────────────────────────────────────────

/**
 * Inicia o checkout criando um pedido IR (cliente autenticado)
 * @param {{ ano: string, year: number, modalidade: string, valor: number, paymentType: 'boleto'|'pix' }} dados
 */
export async function iniciarCheckout(dados) {
  const res = await axios.post(endpoints.ir.checkout, dados);
  return res.data;
}

/**
 * Checkout público (POST /api/ir/public/checkout) — sem autenticação.
 * A API vincula ao cliente existente via e-mail/CPF, se encontrado.
 * @param {{
 *   modalidade: 'basica'|'intermediaria'|'completa',
 *   planId?: string,
 *   ano: string, year: number,
 *   paymentType: 'boleto'|'pix'|'credit_card',
 *   nome: string, email: string, cpfCnpj: string, telefone: string,
 *   cep: string, endereco: string, numero: string, bairro: string,
 *   cidade: string, uf: string, tipoPessoa: 'FISICA'|'JURIDICA'
 * }} dados
 */
export async function iniciarCheckoutPublico(dados) {
  const res = await axios.post(endpoints.ir.checkoutPublico, dados, {
    headers: { Authorization: '' },
  });
  return res.data;
}

/**
 * Nova API ms-me: gera cobrança para um pedido IR já existente (usuário autenticado).
 * POST /api/ir/:irOrderId/checkout
 * @param {string} irOrderId - ID do pedido IR
 * @param {{
 *   paymentType: 'boleto'|'pix'|'credit_card',
 *   cpf: string,
 *   nome: string,
 *   email: string,
 *   endereco?: { rua: string, numero: string, bairro: string, cidade: string, estado: string, cep: string }
 * }} body
 * @returns {Promise<{ message: string, irOrder: object }>}
 */
export async function gerarCobrancaIr(irOrderId, body) {
  const res = await axios.post(endpoints.ir.checkoutByOrderId(irOrderId), body);
  const {data} = res;
  return {
    message: data.message,
    irOrder: data.irOrder ?? data.order ?? data,
  };
}

/**
 * Nova API ms-me: gera cobrança para um pedido IR já existente (checkout público, sem auth).
 * POST /api/ir/:irOrderId/checkout-publico
 * @param {string} irOrderId - ID do pedido IR
 * @param {{
 *   paymentType: 'boleto'|'pix'|'credit_card',
 *   cpf: string,
 *   nome: string,
 *   email: string,
 *   endereco?: { rua: string, numero: string, bairro: string, cidade: string, estado: string, cep: string }
 * }} body
 * @returns {Promise<{ message: string, irOrder: object }>}
 */
export async function gerarCobrancaIrPublico(irOrderId, body) {
  const res = await axios.post(endpoints.ir.checkoutPublicoByOrderId(irOrderId), body, {
    headers: { Authorization: '' },
  });
  const {data} = res;
  return {
    message: data.message,
    irOrder: data.irOrder ?? data.order ?? data,
  };
}

/**
 * Hook SWR para listar pedidos IR do cliente logado
 */
export function useGetMeusPedidosIr() {
  const { data, isLoading, error, mutate } = useSWR(
    endpoints.ir.orders,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return useMemo(
    () => ({
      data: data?.orders || data || [],
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

/**
 * Hook SWR para obter um pedido IR do cliente por ID
 * @param {string} id
 */
export function useGetMeuPedidoIr(id) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? endpoints.ir.order(id) : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return useMemo(
    () => ({
      data: data?.order || data || null,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

/**
 * Busca um pedido IR do cliente por ID (imperativo)
 * @param {string} id
 */
export async function obterMeuPedidoIr(id) {
  const res = await axios.get(endpoints.ir.order(id));
  return res.data?.order || res.data;
}

/**
 * Obtém o link permanente de coleta de documentos do pedido
 * @param {string} id
 */
export async function obterLinkColeta(id) {
  const res = await axios.get(endpoints.ir.collectionLink(id));
  return res.data;
}

/**
 * Faz upload de um documento para o pedido IR (cliente)
 * @param {string} id
 * @param {FormData} formData - campos: file, tipo_documento
 */
export async function uploadDocumentoIr(id, formData) {
  const res = await axios.post(endpoints.ir.documents(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/**
 * Hook SWR para listar documentos de um pedido IR
 * @param {string} id
 */
export function useGetDocumentosIr(id) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? endpoints.ir.documents(id) : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return useMemo(
    () => ({
      data: data?.documents || data || [],
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

/**
 * Faz download da declaração finalizada do pedido IR
 * @param {string} id
 * @param {string} nomeArquivo
 */
export async function downloadDeclaracao(id, nomeArquivo = 'declaracao-ir.pdf') {
  const res = await axios.get(endpoints.ir.declaration(id), {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nomeArquivo);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return res.data;
}

// ─── Portal Público (sem auth) ────────────────────────────────────────────────

/**
 * Obtém dados do pedido via token de coleta (sem autenticação)
 * @param {string} token
 */
export async function obterPedidoPorToken(token) {
  const res = await axios.get(endpoints.ir.coleta.get(token), {
    headers: { Authorization: '' },
  });
  return res.data;
}

/**
 * Hook SWR para obter pedido por token de coleta
 * @param {string} token
 */
export function useGetPedidoPorToken(token) {
  const url = token ? endpoints.ir.coleta.get(token) : null;

  const { data, isLoading, error, mutate } = useSWR(
    url,
    async (u) => {
      const res = await axios.get(u, { headers: { Authorization: '' } });
      return res.data;
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return useMemo(
    () => ({
      data: data?.order || data || null,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

/**
 * Salva (ou atualiza parcialmente) o questionário do cliente no portal de coleta.
 * Todos os campos são opcionais — a API mescla com o que já existe.
 * @param {string} token
 * @param {object} dados - campos do formulário
 */
export async function salvarFormularioColeta(token, dados) {
  const res = await axios.post(endpoints.ir.coleta.formulario(token), dados, {
    headers: { Authorization: '' },
  });
  return res.data;
}

/**
 * Faz upload de documento via token de coleta (sem autenticação)
 * @param {string} token
 * @param {FormData} formData - campos: file, tipo_documento
 * @param {object} [opts]
 * @param {(progress: number) => void} [opts.onProgress] - 0–100
 */
export async function uploadDocumentoPorToken(token, formData, opts = {}) {
  const res = await axios.post(endpoints.ir.coleta.upload(token), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: '',
    },
    onUploadProgress: (e) => {
      if (opts.onProgress && e.total) {
        opts.onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return res.data;
}

/**
 * Finaliza/envia a coleta para o back (marca como enviado)
 * POST /api/ir/coleta/:token/enviar
 * @param {string} token
 */
export async function enviarColetaPorToken(token) {
  const res = await axios.post(endpoints.ir.coleta.enviar(token), {}, {
    headers: { Authorization: '' },
  });
  return res.data;
}

/**
 * Submete o formulário para validação — status do pedido passa para em_validacao.
 * POST /api/ir/coleta/:token/submeter-validacao
 * Body: mesmo do formulário (todos os campos opcionais).
 * @param {string} token
 * @param {object} dados - campos do formulário (nome, email, dependentesDetalhes, despesas, etc.)
 */
export async function submeterValidacaoPorToken(token, dados) {
  const res = await axios.post(endpoints.ir.coleta.submeterValidacao(token), dados || {}, {
    headers: { Authorization: '' },
  });
  return res.data;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * Hook SWR para listar pedidos IR (admin) com filtros e paginação
 * @param {{ status?: string, year?: number, userId?: string, page?: number, limit?: number }} filtros
 */
export function useGetPedidosIrAdmin(filtros = {}) {
  const cleanFiltros = Object.fromEntries(
    Object.entries(filtros).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const queryString = new URLSearchParams(cleanFiltros).toString();
  const url = queryString
    ? `${endpoints.ir.admin.orders}?${queryString}`
    : endpoints.ir.admin.orders;

  const { data, isLoading, error, mutate } = useSWR(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return useMemo(
    () => ({
      data: data || { orders: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

/**
 * Hook SWR para obter pedido IR por ID (admin)
 * @param {string} id
 */
export function useGetPedidoIrAdmin(id) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? endpoints.ir.admin.order(id) : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return useMemo(
    () => ({
      data: data?.order || data || null,
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

/**
 * Altera o status de um pedido IR (admin)
 * @param {string} id
 * @param {string} status
 * @param {string} [nota]
 */
export async function alterarStatusIrAdmin(id, status, nota) {
  const payload = { status };
  if (nota) payload.nota = nota;
  const res = await axios.patch(endpoints.ir.admin.status(id), payload);
  return res.data;
}

/**
 * Faz upload de documento em um pedido IR (admin)
 * @param {string} id
 * @param {FormData} formData - campos: file, tipo_documento
 */
export async function uploadDocumentoIrAdmin(id, formData, opts = {}) {
  const res = await axios.post(endpoints.ir.admin.documents(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (opts.onProgress && e.total) {
        opts.onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return res.data;
}

/**
 * Envia notificação WhatsApp manual para o cliente
 * @param {string} id
 * @param {string} mensagem
 */
export async function notificarClienteIrAdmin(id, mensagem) {
  const res = await axios.post(endpoints.ir.admin.notify(id), { mensagem });
  return res.data;
}

/**
 * Gera análise do pedido por IA (Gemini). Resultado salvo em order.analiseIa.
 * POST /api/ir/admin/orders/:id/analise-ia
 * @param {string} id - ID do pedido IR
 * @returns {Promise<{ message: string, analiseIa: { texto: string, geradoEm: string, modelo: string }, orderId: string }>}
 */
export async function gerarAnaliseIaIrAdmin(id) {
  const url =
    typeof endpoints.ir.admin.analiseIa === 'function'
      ? endpoints.ir.admin.analiseIa(id)
      : `${baseUrl}ir/admin/orders/${id}/analise-ia`;
  const res = await axios.post(url);
  return res.data;
}

/**
 * Hook SWR — lista usuários internos para seleção de responsável
 */
export function useGetUsuariosInternosIr() {
  const { data, isLoading, error } = useSWR(
    endpoints.ir.admin.usuariosInternos,
    fetcher,
    { revalidateOnFocus: false, revalidateIfStale: false }
  );
  return useMemo(
    () => ({ data: Array.isArray(data) ? data : [], isLoading, error }),
    [data, isLoading, error]
  );
}

/**
 * Atribui ou remove o responsável de um pedido IR
 * @param {string} id - ID do pedido
 * @param {string|null} responsavelId - ID do usuário ou null para remover
 * @param {string} [nota] - Nota opcional no histórico
 */
/**
 * Registra pagamento recebido fora do sistema (dinheiro, transferência, PIX avulso, cartão)
 * Válido para pedidos com status 'iniciada' ou 'pendente_pagamento'.
 * Avança automaticamente para 'coletando_documentos' e notifica o cliente.
 * @param {string} id - ID do pedido
 * @param {{ formaPagamento: string, valor?: number, nota?: string }} dados
 */
export async function registrarPagamentoManualIr(id, dados) {
  const res = await axios.post(endpoints.ir.admin.pagamentoManual(id), dados);
  return res.data;
}

export async function atribuirResponsavelIr(id, responsavelId, nota) {
  const payload = { responsavelId };
  if (nota) payload.nota = nota;
  const res = await axios.patch(endpoints.ir.admin.responsavel(id), payload);
  return res.data;
}

/**
 * Exporta pedidos IR como CSV (admin)
 * @param {{ status?: string, year?: number }} [filtros]
 */
export async function exportarPedidosIrAdmin(filtros = {}) {
  const cleanFiltros = Object.fromEntries(
    Object.entries(filtros).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const queryString = new URLSearchParams(cleanFiltros).toString();
  const url = queryString
    ? `${endpoints.ir.admin.export}?${queryString}`
    : endpoints.ir.admin.export;

  const res = await axios.get(url, { responseType: 'blob' });

  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', `pedidos-ir-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);

  return res.data;
}

/**
 * Faz download de um documento do pedido (admin)
 * @param {string} id
 * @param {string} tipo
 * @param {string} filename
 */
export async function downloadDocumentoAdmin(id, tipo, filename) {
  const res = await axios.get(endpoints.ir.admin.downloadDoc(id, tipo, filename), {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return res.data;
}
