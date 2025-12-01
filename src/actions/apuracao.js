'use client';

import Cookies from 'js-cookie';
import useSWR from 'swr';

import axios, { fetcher, endpoints } from 'src/utils/axios';
import { STORAGE_KEY as JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

/**
 * @typedef {import('src/types/apuracao').IHistoricoFolhaFaturamento} IHistoricoFolhaFaturamento
 * @typedef {import('src/types/apuracao').IApuracao} IApuracao
 * @typedef {import('src/types/apuracao').IDas} IDas
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
// APURAÇÃO
// ----------------------------------------------------------------------

export function useApuracoes(empresaId, filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  // Se empresaId é null, busca todas as apurações (endpoint geral)
  // Se empresaId é fornecido, busca apenas daquela empresa
  const url = endpoints?.apuracao?.listar
    ? empresaId
    ? `${endpoints.apuracao.listar(empresaId)}${params.toString() ? `?${params}` : ''}`
      : endpoints.apuracao.listarTodas
        ? `${endpoints.apuracao.listarTodas}${params.toString() ? `?${params}` : ''}`
        : null
    : null;

  return useSWR(url, fetcher, swrDefaultOptions);
}

export function useApuracao(apuracaoId) {
  const url = apuracaoId && endpoints?.apuracao?.detalhes
    ? endpoints.apuracao.detalhes(apuracaoId)
    : null;
  return useSWR(url, fetcher, swrDefaultOptions);
}

export async function calcularApuracao(empresaId, payload) {
  if (!endpoints?.apuracao?.calcular) {
    throw new Error('Endpoint de cálculo de apuração não está disponível');
  }
  const response = await axios.post(endpoints.apuracao.calcular(empresaId), payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function recalcularApuracao(apuracaoId, payload) {
  if (!endpoints?.apuracao?.recalcular) {
    throw new Error('Endpoint de recálculo de apuração não está disponível');
  }
  const response = await axios.post(endpoints.apuracao.recalcular(apuracaoId), payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function cancelarApuracao(apuracaoId, motivo) {
  if (!endpoints?.apuracao?.cancelar) {
    throw new Error('Endpoint de cancelamento de apuração não está disponível');
  }
  const response = await axios.patch(
    endpoints.apuracao.cancelar(apuracaoId),
    { motivo },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function gerarDasDeApuracao(apuracaoId, params) {
  if (!endpoints?.apuracao?.gerarDas) {
    throw new Error('Endpoint de geração de DAS não está disponível');
  }
  const response = await axios.post(endpoints.apuracao.gerarDas(apuracaoId), params, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function gerarDasDireto(empresaId, params) {
  if (!endpoints?.apuracao?.gerarDasDireto) {
    throw new Error('Endpoint de geração direta de DAS não está disponível');
  }
  const response = await axios.post(endpoints.apuracao.gerarDasDireto(empresaId), params, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

// ----------------------------------------------------------------------
// DAS
// ----------------------------------------------------------------------

export function useDas(empresaId, filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const url = empresaId && endpoints?.apuracao?.listarDas
    ? `${endpoints.apuracao.listarDas(empresaId)}${params.toString() ? `?${params}` : ''}`
    : null;

  return useSWR(url, fetcher, swrDefaultOptions);
}

export function useDasDetalhes(dasId, incluirPdf = false) {
  const url = dasId && endpoints?.apuracao?.dasDetalhes
    ? `${endpoints.apuracao.dasDetalhes(dasId)}${incluirPdf ? '?incluirPdf=true' : ''}`
    : null;

  return useSWR(url, fetcher, swrDefaultOptions);
}

export async function baixarDasPdf(dasId) {
  if (!endpoints?.apuracao?.dasPdf) {
    throw new Error('Endpoint de download de PDF do DAS não está disponível');
  }
  const response = await axios.get(endpoints.apuracao.dasPdf(dasId), {
    headers: getAuthHeaders(),
    responseType: 'blob',
  });

  return response;
}

export async function marcarDasComoPago(dasId, payload) {
  if (!endpoints?.apuracao?.dasPagar) {
    throw new Error('Endpoint de marcação de DAS como pago não está disponível');
  }
  const response = await axios.patch(endpoints.apuracao.dasPagar(dasId), payload, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function cancelarDas(dasId, motivo) {
  if (!endpoints?.apuracao?.dasCancelar) {
    throw new Error('Endpoint de cancelamento de DAS não está disponível');
  }
  const response = await axios.patch(
    endpoints.apuracao.dasCancelar(dasId),
    { motivo },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

/**
 * Faz upload do PDF do DAS para uma apuração (base64)
 * @param {string} apuracaoId - ID da apuração
 * @param {Object} dados - Dados do DAS com pdfBase64
 * @param {string} dados.pdfBase64 - PDF em base64
 * @param {string} dados.numeroDocumento - Número do documento
 * @param {string} dados.dataVencimento - Data de vencimento (YYYYMMDD)
 * @param {number} dados.valorTotal - Valor total
 * @param {string} [dados.dataLimiteAcolhimento] - Data limite acolhimento (YYYYMMDD)
 * @param {string} [dados.ambiente] - Ambiente (teste/producao)
 * @param {string[]} [dados.observacoes] - Array de observações
 * @returns {Promise<IDas>} DAS criado
 */
export async function uploadDasPdf(apuracaoId, dados) {
  if (!endpoints?.apuracao?.uploadDas) {
    throw new Error('Endpoint de upload de DAS não está disponível');
  }
  
  const response = await axios.post(
    endpoints.apuracao.uploadDas(apuracaoId),
    dados,
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data;
}

/**
 * Calcula a folha ideal necessária para atingir o Fator R mínimo de 28%
 * @param {string} empresaId - ID da empresa/cliente
 * @param {string} periodoReferencia - Período de referência no formato AAAAMM (ex: "202410")
 * @param {number} [percentualINSS=0.278] - Percentual de INSS sobre a folha (padrão: 27,8%)
 * @returns {Promise<Object>} Dados da folha ideal calculada
 */
export async function calcularFolhaIdeal(empresaId, periodoReferencia, percentualINSS = 0.278) {
  if (!endpoints?.apuracao?.folhaIdeal) {
    throw new Error('Endpoint de cálculo de folha ideal não está disponível');
  }

  const params = new URLSearchParams({
    periodoReferencia,
    percentualINSS: String(percentualINSS),
  });

  const response = await axios.get(
    `${endpoints.apuracao.folhaIdeal(empresaId)}?${params.toString()}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

