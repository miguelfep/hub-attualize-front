import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints, baseUrl } from 'src/utils/axios';

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// Util: monta query string ignorando valores vazios
function buildQuery(params) {
  if (!params) return '';
  const cleaned = Object.entries(params).reduce((acc, [k, v]) => {
    if (v !== '' && v !== undefined && v !== null) acc[k] = v;
    return acc;
  }, {});
  const qs = new URLSearchParams(cleaned).toString();
  return qs ? `?${qs}` : '';
}

// Clientes do Cliente
export function usePortalClientes(clienteProprietarioId, params) {
  const qs = buildQuery(params);
  const url = clienteProprietarioId ? `${endpoints.portal.clientes.list(clienteProprietarioId)}${qs}` : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);
  return useMemo(() => ({ data: data || [], isLoading, error, isValidating, mutate }), [data, error, isLoading, isValidating, mutate]);
}

export async function portalGetCliente(clienteProprietarioId, id) {
  const res = await axios.get(endpoints.portal.clientes.get(clienteProprietarioId, id));
  return res.data;
}

export async function portalCreateCliente(payload) {
  const res = await axios.post(endpoints.portal.clientes.create(payload.clienteProprietarioId), payload);
  return res.data;
}

export async function portalUpdateCliente(clienteProprietarioId, id, payload) {
  const res = await axios.put(endpoints.portal.clientes.update(clienteProprietarioId, id), payload);
  return res.data;
}

export async function portalDeleteCliente(clienteProprietarioId, id) {
  const res = await axios.delete(endpoints.portal.clientes.delete(clienteProprietarioId, id));
  return res.data;
}

// Serviços
export function usePortalServicos(clienteProprietarioId, params) {
  const qs = buildQuery(params);
  const url = clienteProprietarioId ? `${endpoints.portal.servicos.list(clienteProprietarioId)}${qs}` : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);
  return useMemo(() => ({ data: data || [], isLoading, error, isValidating, mutate }), [data, error, isLoading, isValidating, mutate]);
}

export function usePortalCategorias(clienteProprietarioId) {
  const url = clienteProprietarioId ? endpoints.portal.servicos.categorias(clienteProprietarioId) : null;
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);
  return useMemo(() => ({ data: data || [], isLoading, error, isValidating }), [data, error, isLoading, isValidating]);
}

export async function portalCreateServico(payload) {
  const res = await axios.post(endpoints.portal.servicos.create, payload);
  return res.data;
}

export async function portalUpdateServico(id, payload) {
  const res = await axios.put(endpoints.portal.servicos.update(id), payload);
  return res.data;
}

export async function portalDeleteServico(id, clienteProprietarioId) {
  // Backend aceita tanto em params quanto body; enviaremos no body para garantir
  const res = await axios.delete(endpoints.portal.servicos.delete(id), {
    data: { clienteProprietarioId },
  });
  return res.data;
}

export async function portalGetServico(clienteProprietarioId, id) {
  const url = endpoints.portal.servicos.get(clienteProprietarioId, id);
  const res = await axios.get(url);
  
  return res.data;
}

// Orçamentos
export function usePortalOrcamentos(clienteProprietarioId, params) {
  const qs = buildQuery(params);
  const url = clienteProprietarioId ? `${endpoints.portal.orcamentos.list(clienteProprietarioId)}${qs}` : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);
  return useMemo(() => ({ data: data || [], isLoading, error, isValidating, mutate }), [data, error, isLoading, isValidating, mutate]);
}

export function usePortalOrcamentosStats(clienteProprietarioId) {
  const url = clienteProprietarioId ? endpoints.portal.orcamentos.stats(clienteProprietarioId) : null;
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);
  return useMemo(() => ({ data: data || null, isLoading, error, isValidating }), [data, error, isLoading, isValidating]);
}

export async function portalGetOrcamento(clienteProprietarioId, id) {
  const res = await axios.get(endpoints.portal.orcamentos.get(clienteProprietarioId, id));
  return res.data;
}

export async function portalCreateOrcamento(payload) {
  const res = await axios.post(endpoints.portal.orcamentos.create, payload);
  return res.data;
}

export async function portalUpdateOrcamento(id, payload) {
  const res = await axios.put(endpoints.portal.orcamentos.update(id), payload);
  return res.data;
}

export async function portalUpdateOrcamentoStatus(id, payload) {
  const res = await axios.patch(endpoints.portal.orcamentos.updateStatus(id), payload);
  return res.data;
}

export async function portalDeleteOrcamento(id) {
  const res = await axios.delete(endpoints.portal.orcamentos.delete(id));
  return res.data;
}

export async function portalDownloadOrcamentoPDF(id) {
  const url = endpoints.portal.orcamentos.pdf(id);
  const res = await axios.get(url, { responseType: 'blob' });
  return res;
}

// Cobranças/Boleto (Portal) — `baseUrl` e fallbacks evitam `undefined` no bundle (Turbopack).

/**
 * ID do `Payment` no retorno de emissão de boleto (201) ou resposta 200 (documento do pagamento).
 * @param {*} body  Corpo resolvido `res.data` da API
 * @returns {string|null}
 */
export function extractPaymentIdFromBoletoResponse(body) {
  if (body == null) return null;
  const pay = body?.data != null && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : body;
  const id = pay?.paymentId ?? pay?._id;
  if (id == null || id === '') return null;
  return String(id);
}

// Cobranças/Boleto (Portal)
export async function portalEmitirBoletoClienteDoCliente(
  clienteProprietarioId,
  clienteDoClienteId,
  payload
) {
  const ep = endpoints?.portal?.cobrancas?.emitirBoletoClienteDoCliente;
  const url =
    typeof ep === 'function'
      ? ep(clienteProprietarioId, clienteDoClienteId)
      : `${baseUrl}portal/cobrancas/${clienteProprietarioId}/clientes/${clienteDoClienteId}/boleto`;
  const res = await axios.post(url, payload);
  return { status: res.status, data: res.data };
}

/**
 * Boleto da venda. Body opcional: `{ dueDate? }` (ou `dataVencimento`, conforme API).
 * Retorno: `{ status, data }` — **201** novo/reemitido, **200** já existe boleto (corpo = Payment).
 */
export async function portalEmitirBoletoOrcamento(clienteProprietarioId, orcamentoId, requestBody) {
  const emitirBoletoOrcamentoEndpoint = endpoints?.portal?.vendas?.emitirBoletoOrcamento;
  const url =
    typeof emitirBoletoOrcamentoEndpoint === 'function'
      ? emitirBoletoOrcamentoEndpoint(clienteProprietarioId, orcamentoId)
      : `${baseUrl}portal/vendas/${clienteProprietarioId}/${orcamentoId}/boleto`;
  const res = await axios.post(
    url,
    requestBody && Object.keys(requestBody).length ? requestBody : undefined
  );
  return { status: res.status, data: res.data };
}

export async function portalListarBoletosOrcamento(clienteProprietarioId, orcamentoId) {
  const boletosOrcamentoEndpoint = endpoints?.portal?.vendas?.boletosOrcamento;
  const url =
    typeof boletosOrcamentoEndpoint === 'function'
      ? boletosOrcamentoEndpoint(clienteProprietarioId, orcamentoId)
      : `${baseUrl}portal/vendas/${clienteProprietarioId}/${orcamentoId}/boletos`;
  const res = await axios.get(url);
  return res.data;
}

export async function portalCancelarBoletoOrcamento(clienteProprietarioId, orcamentoId) {
  const cancelarBoletoOrcamentoEndpoint = endpoints?.portal?.vendas?.cancelarBoletoOrcamento;
  const url =
    typeof cancelarBoletoOrcamentoEndpoint === 'function'
      ? cancelarBoletoOrcamentoEndpoint(clienteProprietarioId, orcamentoId)
      : `${baseUrl}portal/vendas/${clienteProprietarioId}/${orcamentoId}/boleto/cancelar`;
  const res = await axios.post(
    url
  );
  return res.data;
}

export async function portalAtualizarBoletoOrcamento(clienteProprietarioId, orcamentoId, payload) {
  const atualizarBoletoOrcamentoEndpoint = endpoints?.portal?.vendas?.atualizarBoletoOrcamento;
  const url =
    typeof atualizarBoletoOrcamentoEndpoint === 'function'
      ? atualizarBoletoOrcamentoEndpoint(clienteProprietarioId, orcamentoId)
      : `${baseUrl}portal/vendas/${clienteProprietarioId}/${orcamentoId}/boleto`;
  const res = await axios.patch(
    url,
    payload
  );
  return res.data;
}

export async function portalEmitirBoletosRecorrencia(clienteProprietarioId, grupoId) {
  const ep = endpoints?.portal?.vendas?.emitirBoletosRecorrencia;
  const url =
    typeof ep === 'function'
      ? ep(clienteProprietarioId, grupoId)
      : `${baseUrl}portal/vendas/${clienteProprietarioId}/recorrencias/${grupoId}/boletos`;
  const res = await axios.post(url);
  return { status: res.status, data: res.data };
}

export async function portalListarCobrancasClienteDoCliente(clienteProprietarioId, clienteDoClienteId) {
  const ep = endpoints?.portal?.cobrancas?.byClienteDoCliente;
  const url =
    typeof ep === 'function'
      ? ep(clienteProprietarioId, clienteDoClienteId)
      : `${baseUrl}portal/clientes/${clienteProprietarioId}/${clienteDoClienteId}/cobrancas`;
  const res = await axios.get(url);
  return res.data;
}

export async function portalGetCobranca(clienteProprietarioId, paymentId) {
  const g = endpoints?.portal?.cobrancas?.get;
  const url =
    typeof g === 'function'
      ? g(clienteProprietarioId, paymentId)
      : `${baseUrl}portal/cobrancas/${clienteProprietarioId}/${paymentId}`;
  const res = await axios.get(url);
  return res.data;
}

export async function portalBaixarPdfBoleto(clienteProprietarioId, paymentId) {
  const g = endpoints?.portal?.cobrancas?.pdf;
  const url =
    typeof g === 'function'
      ? g(clienteProprietarioId, paymentId)
      : `${baseUrl}portal/cobrancas/${clienteProprietarioId}/${paymentId}/pdf`;
  const res = await axios.get(url, { responseType: 'blob' });
  return res;
}


