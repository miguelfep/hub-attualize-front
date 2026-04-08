import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { endpoints } from 'src/utils/axios';

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

function buildQuery(params) {
  if (!params) return '';
  const cleaned = Object.entries(params).reduce((acc, [k, v]) => {
    if (v !== '' && v !== undefined && v !== null) acc[k] = v;
    return acc;
  }, {});
  const qs = new URLSearchParams(cleaned).toString();
  return qs ? `?${qs}` : '';
}

/** @param {unknown} payload */
export function unwrapApi(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.success !== false) {
    return payload.data;
  }
  return payload;
}

async function fetcherUnwrap(url) {
  const res = await axios.get(url);
  return unwrapApi(res.data);
}

// --- Portal -----------------------------------------------------------------

export function usePortalFuncionarios(clienteProprietarioId, params) {
  const qs = buildQuery(params);
  const url = clienteProprietarioId
    ? `${endpoints.departamentoPessoal.portal.funcionarios(clienteProprietarioId)}${qs}`
    : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcherUnwrap, swrOptions);
  const list = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  return useMemo(
    () => ({ data: list, isLoading, error, isValidating, mutate }),
    [list, error, isLoading, isValidating, mutate]
  );
}

export function usePortalFuncionario(clienteProprietarioId, funcionarioId) {
  const url =
    clienteProprietarioId && funcionarioId
      ? endpoints.departamentoPessoal.portal.funcionario(clienteProprietarioId, funcionarioId)
      : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcherUnwrap, swrOptions);
  return useMemo(
    () => ({ data, isLoading, error, isValidating, mutate }),
    [data, isLoading, error, isValidating, mutate]
  );
}

export function usePortalRubricas(clienteProprietarioId, funcionarioId, params) {
  const qs = buildQuery(params);
  const url =
    clienteProprietarioId && funcionarioId
      ? `${endpoints.departamentoPessoal.portal.rubricas(clienteProprietarioId, funcionarioId)}${qs}`
      : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcherUnwrap, swrOptions);
  const list = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  return useMemo(
    () => ({ data: list, isLoading, error, isValidating, mutate }),
    [list, isLoading, error, isValidating, mutate]
  );
}

export async function portalCreateFuncionario(clienteProprietarioId, body) {
  const res = await axios.post(endpoints.departamentoPessoal.portal.funcionarios(clienteProprietarioId), body);
  return unwrapApi(res.data);
}

export async function portalUpdateFuncionario(clienteProprietarioId, funcionarioId, body) {
  const res = await axios.put(
    endpoints.departamentoPessoal.portal.funcionario(clienteProprietarioId, funcionarioId),
    body
  );
  return unwrapApi(res.data);
}

export async function portalPutRubricas(clienteProprietarioId, funcionarioId, body) {
  const res = await axios.put(
    endpoints.departamentoPessoal.portal.rubricas(clienteProprietarioId, funcionarioId),
    body
  );
  return unwrapApi(res.data);
}

export async function portalSolicitarDemissao(clienteProprietarioId, funcionarioId, body) {
  const res = await axios.post(
    endpoints.departamentoPessoal.portal.solicitarDemissao(clienteProprietarioId, funcionarioId),
    body
  );
  return unwrapApi(res.data);
}

// --- Admin (HUB) ------------------------------------------------------------

export function useAdminFuncionarios(clienteId, params) {
  const qs = buildQuery(params);
  const url = clienteId ? `${endpoints.departamentoPessoal.admin.funcionariosByCliente(clienteId)}${qs}` : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcherUnwrap, swrOptions);
  const list = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  return useMemo(
    () => ({ data: list, isLoading, error, isValidating, mutate }),
    [list, error, isLoading, isValidating, mutate]
  );
}

export function useAdminFuncionario(funcionarioId) {
  const url = funcionarioId ? endpoints.departamentoPessoal.admin.funcionario(funcionarioId) : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcherUnwrap, swrOptions);
  return useMemo(
    () => ({ data, isLoading, error, isValidating, mutate }),
    [data, isLoading, error, isValidating, mutate]
  );
}

export async function adminGetFuncionario(id) {
  const res = await axios.get(endpoints.departamentoPessoal.admin.funcionario(id));
  return unwrapApi(res.data);
}

export async function adminAprovarCadastro(id) {
  const res = await axios.patch(endpoints.departamentoPessoal.admin.aprovarCadastro(id));
  return unwrapApi(res.data);
}

export async function adminReprovarCadastro(id, body) {
  const res = await axios.patch(endpoints.departamentoPessoal.admin.reprovarCadastro(id), body);
  return unwrapApi(res.data);
}

export async function adminDemissaoEmAnalise(id) {
  const res = await axios.patch(endpoints.departamentoPessoal.admin.demissaoEmAnalise(id));
  return unwrapApi(res.data);
}

export async function adminDemissaoAprovar(id, body) {
  const res = await axios.patch(endpoints.departamentoPessoal.admin.demissaoAprovar(id), body ?? {});
  return unwrapApi(res.data);
}

export async function adminDemissaoRejeitar(id, body) {
  const res = await axios.patch(endpoints.departamentoPessoal.admin.demissaoRejeitar(id), body ?? {});
  return unwrapApi(res.data);
}
