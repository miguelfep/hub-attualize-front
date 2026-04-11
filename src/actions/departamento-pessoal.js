import { useMemo } from 'react';
import useSWR, { mutate as swrGlobalMutate } from 'swr';

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

/** Competência mensal: 404 = rota ainda não disponível no backend (front degrada sem quebrar). */
async function fetcherCompetenciaOptional(url) {
  try {
    const res = await axios.get(url);
    return unwrapApi(res.data);
  } catch (e) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

/** Uma competência (GET mês) por cliente — uso em listagens admin (404 → null). */
export async function getPortalApontamentosCompetenciaMesOptional(clienteProprietarioId, ano, mes) {
  if (!clienteProprietarioId || !ano || !mes) return null;
  const url = endpoints.departamentoPessoal.portal.apontamentosCompetenciaMes(
    clienteProprietarioId,
    ano,
    mes
  );
  return fetcherCompetenciaOptional(url);
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

/** Revalida listas SWR de funcionários do cliente no dashboard (inclui variantes com query de filtro). */
export function revalidateAdminFuncionariosByCliente(clienteId) {
  if (!clienteId) return Promise.resolve();
  const prefix = endpoints.departamentoPessoal.admin.funcionariosByCliente(clienteId);
  return swrGlobalMutate(
    (key) => typeof key === 'string' && key.startsWith(prefix),
    undefined,
    { revalidate: true }
  );
}

/** Revalida listas SWR de funcionários no portal (inclui query). */
export function revalidatePortalFuncionariosByCliente(clienteProprietarioId) {
  if (!clienteProprietarioId) return Promise.resolve();
  const prefix = endpoints.departamentoPessoal.portal.funcionarios(clienteProprietarioId);
  return swrGlobalMutate(
    (key) => typeof key === 'string' && key.startsWith(prefix),
    undefined,
    { revalidate: true }
  );
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

export function usePortalApontamentosCompetenciaAno(clienteProprietarioId, ano) {
  const url =
    clienteProprietarioId && ano
      ? endpoints.departamentoPessoal.portal.apontamentosCompetenciaAno(clienteProprietarioId, ano)
      : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcherCompetenciaOptional, swrOptions);
  const lista = useMemo(() => {
    if (data === undefined) return undefined;
    if (data === null) return null;
    return Array.isArray(data) ? data : [];
  }, [data]);
  return useMemo(
    () => ({ data: lista, isLoading, error, isValidating, mutate }),
    [lista, error, isLoading, isValidating, mutate]
  );
}

export function usePortalApontamentosCompetenciaMes(clienteProprietarioId, ano, mes) {
  const url =
    clienteProprietarioId && ano && mes
      ? endpoints.departamentoPessoal.portal.apontamentosCompetenciaMes(clienteProprietarioId, ano, mes)
      : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcherCompetenciaOptional, swrOptions);
  return useMemo(
    () => ({ data, isLoading, error, isValidating, mutate }),
    [data, error, isLoading, isValidating, mutate]
  );
}

export async function portalFecharCompetenciaApontamentos(clienteProprietarioId, ano, mes, body) {
  const res = await axios.post(
    endpoints.departamentoPessoal.portal.apontamentosFecharCompetencia(clienteProprietarioId, ano, mes),
    body
  );
  return unwrapApi(res.data);
}

/** Reabre competência já fechada no portal (apenas rota admin autenticada). */
export async function adminReabrirCompetenciaApontamentos(clienteId, ano, mes, body = {}) {
  const res = await axios.post(
    endpoints.departamentoPessoal.admin.apontamentosReabrirCompetencia(clienteId, ano, mes),
    body
  );
  return unwrapApi(res.data);
}

/** @param {string} [header] */
function filenameFromContentDisposition(header) {
  if (!header || typeof header !== 'string') return null;
  const star = /filename\*=(?:UTF-8'')?([^;\n]+)/i.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^["']|["']$/g, ''));
    } catch {
      return star[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  const plain = /filename="([^"]+)"/i.exec(header) || /filename=([^;\n]+)/i.exec(header);
  if (plain) return plain[1].trim().replace(/^["']|["']$/g, '');
  return null;
}

/** @param {unknown} rejected — axios interceptor pode repassar Blob (erro) ou objeto/string. */
async function messageFromExportRejection(rejected) {
  if (rejected && typeof rejected === 'object' && typeof rejected.text === 'function') {
    try {
      const t = await rejected.text();
      try {
        const j = JSON.parse(t);
        return j.message || t || 'Não foi possível exportar.';
      } catch {
        return t || 'Não foi possível exportar.';
      }
    } catch {
      return 'Não foi possível exportar.';
    }
  }
  if (typeof rejected === 'string') return rejected;
  if (rejected && typeof rejected === 'object' && 'message' in rejected && rejected.message) {
    return String(rejected.message);
  }
  return 'Não foi possível exportar.';
}

function triggerBlobDownload(data, downloadName) {
  const blob = data instanceof Blob ? data : new Blob([data]);
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', downloadName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

/**
 * Admin (HUB): baixa TXT da competência. Layout Prosoft vs “com plano”, nome e charset vêm da API conforme `folhaComPlano` do cliente.
 * @param {string} clienteId
 * @param {number} ano
 * @param {number} mes
 */
export async function adminDownloadApontamentosTxt(clienteId, ano, mes) {
  const url = endpoints.departamentoPessoal.admin.apontamentosExportarTxt(clienteId, ano, mes);
  try {
    const res = await axios.get(url, { responseType: 'blob' });
    const cd = res.headers['content-disposition'] || res.headers['Content-Disposition'] || '';
    const fallback = `dp-${clienteId}-${ano}-${String(mes).padStart(2, '0')}.txt`;
    const name = filenameFromContentDisposition(cd) || fallback;
    triggerBlobDownload(res.data, name);
  } catch (e) {
    const msg = await messageFromExportRejection(e);
    throw new Error(msg);
  }
}

/**
 * Portal: baixa TXT da competência (mesmo contrato que admin §4.5.2).
 * @param {string} clienteProprietarioId
 * @param {number} ano
 * @param {number} mes
 */
export async function portalDownloadApontamentosTxt(clienteProprietarioId, ano, mes) {
  const url = endpoints.departamentoPessoal.portal.apontamentosExportarTxt(
    clienteProprietarioId,
    ano,
    mes
  );
  try {
    const res = await axios.get(url, { responseType: 'blob' });
    const cd = res.headers['content-disposition'] || res.headers['Content-Disposition'] || '';
    const fallback = `dp-${clienteProprietarioId}-${ano}-${String(mes).padStart(2, '0')}.txt`;
    const name = filenameFromContentDisposition(cd) || fallback;
    triggerBlobDownload(res.data, name);
  } catch (e) {
    const msg = await messageFromExportRejection(e);
    throw new Error(msg);
  }
}

/** Revalida GETs de competência (ano / mês) após fechar mês ou salvar rubricas. */
export function revalidatePortalApontamentosCompetencia(clienteProprietarioId) {
  if (!clienteProprietarioId) return Promise.resolve();
  const needle = `portal/departamento-pessoal/${clienteProprietarioId}/apontamentos/competencia`;
  return swrGlobalMutate(
    (key) => typeof key === 'string' && key.includes(needle),
    undefined,
    { revalidate: true }
  );
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
