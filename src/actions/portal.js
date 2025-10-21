import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

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

export async function portalDeleteServico(id) {
  const res = await axios.delete(endpoints.portal.servicos.delete(id));
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


