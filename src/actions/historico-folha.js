'use client';

import Cookies from 'js-cookie';
import useSWR from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';
import { STORAGE_KEY as JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

/**
 * Actions para Histórico de Folha e Faturamento
 * @typedef {import('src/types/apuracao').IHistoricoFolhaFaturamento} IHistoricoFolhaFaturamento
 * @typedef {import('src/types/apuracao').IHistoricoFolhaFaturamentoCreate} IHistoricoFolhaFaturamentoCreate
 * @typedef {import('src/types/apuracao').IHistoricoFolhaFaturamentoUpdate} IHistoricoFolhaFaturamentoUpdate
 * @typedef {import('src/types/apuracao').IHistoricoFiltros} IHistoricoFiltros
 * @typedef {import('src/types/apuracao').IHistoricoTotais12Meses} IHistoricoTotais12Meses
 * @typedef {import('src/types/apuracao').IUploadCSVResponse} IUploadCSVResponse
 */

// ----------------------------------------------------------------------

const swrDefaultOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
};

function getAuthHeaders() {
  if (typeof window === 'undefined') {
    return {};
  }

  const cookieToken = Cookies.get(JWT_STORAGE_KEY);
  const localToken = window.localStorage?.getItem('accessToken');
  const token = cookieToken || localToken;

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

// ----------------------------------------------------------------------
// HISTÓRICO DE FOLHA E FATURAMENTO
// ----------------------------------------------------------------------

/**
 * Hook para listar históricos de folha e faturamento
 * @param {string} clienteId 
 * @param {IHistoricoFiltros} filtros 
 * @returns {import('swr').SWRResponse<{sucesso: boolean, total: number, historicos: IHistoricoFolhaFaturamento[]}>}
 */
export function useHistoricosFolha(clienteId, filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const url = clienteId && endpoints?.historicoFolha?.listar
    ? `${endpoints.historicoFolha.listar(clienteId)}${params.toString() ? `?${params}` : ''}`
    : null;

  return useSWR(url, fetcher, swrDefaultOptions);
}

/**
 * Hook para buscar histórico dos últimos 12 meses
 * @param {string} clienteId 
 * @param {string} periodoReferencia - Formato AAAAMM
 * @returns {import('swr').SWRResponse<IHistoricoTotais12Meses>}
 */
export function useHistorico12Meses(clienteId, periodoReferencia) {
  const url =
    clienteId && periodoReferencia && endpoints?.historicoFolha?.totais12Meses
      ? `${endpoints.historicoFolha.totais12Meses(clienteId)}?periodoReferencia=${periodoReferencia}`
      : null;

  return useSWR(url, fetcher, swrDefaultOptions);
}

/**
 * Hook para buscar um histórico específico por ID
 * @param {string} historicoId 
 * @returns {import('swr').SWRResponse<{sucesso: boolean, historico: IHistoricoFolhaFaturamento}>}
 */
export function useHistoricoFolha(historicoId) {
  const url =
    historicoId && endpoints?.historicoFolha?.buscar
      ? endpoints.historicoFolha.buscar(historicoId)
      : null;

  return useSWR(url, fetcher, swrDefaultOptions);
}

/**
 * Criar histórico manual
 * @param {string} clienteId 
 * @param {IHistoricoFolhaFaturamentoCreate} payload 
 * @returns {Promise<{sucesso: boolean, historico: IHistoricoFolhaFaturamento}>}
 */
export async function criarHistoricoFolha(clienteId, payload) {
  if (!endpoints?.historicoFolha?.criar) {
    throw new Error('Endpoint de criação de histórico não está disponível');
  }

  const response = await axios.post(endpoints.historicoFolha.criar(clienteId), payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Upload de CSV com históricos
 * @param {string} clienteId 
 * @param {File} file 
 * @param {boolean} sobrescrever 
 * @returns {Promise<IUploadCSVResponse>}
 */
export async function uploadCSVHistorico(clienteId, file, sobrescrever = false) {
  if (!endpoints?.historicoFolha?.uploadCsv) {
    throw new Error('Endpoint de upload CSV não está disponível');
  }

  const formData = new FormData();
  formData.append('arquivo', file);
  formData.append('sobrescrever', sobrescrever.toString());

  const response = await axios.post(endpoints.historicoFolha.uploadCsv(clienteId), formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Atualizar histórico
 * @param {string} historicoId 
 * @param {IHistoricoFolhaFaturamentoUpdate} payload 
 * @returns {Promise<{sucesso: boolean, historico: IHistoricoFolhaFaturamento}>}
 */
export async function atualizarHistoricoFolha(historicoId, payload) {
  if (!endpoints?.historicoFolha?.atualizar) {
    throw new Error('Endpoint de atualização de histórico não está disponível');
  }

  const response = await axios.patch(endpoints.historicoFolha.atualizar(historicoId), payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Cancelar histórico
 * @param {string} historicoId 
 * @param {string} motivo 
 * @returns {Promise<{sucesso: boolean, historico: IHistoricoFolhaFaturamento}>}
 */
export async function cancelarHistoricoFolha(historicoId, motivo) {
  if (!endpoints?.historicoFolha?.cancelar) {
    throw new Error('Endpoint de cancelamento de histórico não está disponível');
  }

  const response = await axios.patch(
    endpoints.historicoFolha.cancelar(historicoId),
    { motivo },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

