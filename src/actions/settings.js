import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { baseUrl, fetcher, endpoints } from 'src/utils/axios';

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useGetSettings(clienteId) {
  const url = clienteId ? endpoints.settings.byClienteId(clienteId) : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      settings: data || null,
      settingsLoading: isLoading,
      settingsError: error,
      settingsValidating: isValidating,
      refetchSettings: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

export async function updateSettings(clienteId, payload) {
  const url = endpoints.settings.byClienteId(clienteId);
  const res = await axios.put(url, payload);
  return res.data;
}

export async function uploadInterCertificates(clienteId, environment, crtFile, keyFile) {
  const interCertificatesEndpoint = endpoints?.settings?.interCertificates;
  const url =
    typeof interCertificatesEndpoint === 'function'
      ? interCertificatesEndpoint(clienteId)
      : `${endpoints.settings.base}/${clienteId}/inter/certificates`;
  const formData = new FormData();
  formData.append('environment', environment);
  formData.append('crt', crtFile);
  formData.append('key', keyFile);
  const res = await axios.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export function useCheckFuncionalidade(clienteId, funcionalidade) {
  const url = clienteId && funcionalidade
    ? endpoints.settings.check(clienteId, funcionalidade)
    : null;

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      funcionalidadeAtiva: Boolean(data?.ativa ?? data?.active ?? false),
      checkLoading: isLoading,
      checkError: error,
      checkValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
// Attualize — configuração da empresa própria (NFSe/eNotas)
// ----------------------------------------------------------------------

/**
 * Passo 1: salva os dados da empresa Attualize (CNPJ, razão social, endereço,
 * alíquota ISS, configuração NFSe, provedorNFSe, nfseNacionalConfig, etc.).
 * Quando o payload incluir nfseNacionalConfig.idCertificado com provedorNFSe 'enotas',
 * o backend vincula o certificado automaticamente.
 * @param {object} payload
 */
export async function configurarAttualize(payload) {
  return axios.post(`${baseUrl}attualize-config/configurar`, payload);
}

/**
 * Passo 2: usa os dados já salvos pelo passo 1, registra a empresa no eNotas
 * e persiste o idEnotas retornado na configuração. Sem body.
 */
export async function criarEmpresaEnotasAttualize() {
  return axios.post(`${baseUrl}attualize-config/criar-empresa-enotas`);
}

/** Busca a configuração atual da Attualize (empresa, provedorNFSe, nfseNacionalConfig). */
export async function buscarConfiguracaoAttualize() {
  return axios.get(`${baseUrl}attualize-config/configuracao`);
}

/** Lista somente os certificados digitais da própria Attualize (filtrados por CNPJ no backend). */
export async function listarCertificadosAttualize() {
  return axios.get(`${baseUrl}attualize-config/certificados`);
}

/**
 * Upload do certificado digital (A1) da própria Attualize.
 * O backend resolve o cadastro pelo CNPJ da Attualize e, se ainda não houver
 * certificado vinculado no Emissor Nacional, vincula o novo automaticamente.
 * @param {File} certificate - Arquivo .pfx/.p12
 * @param {string} password - Senha do certificado
 */
export async function uploadCertificadoAttualize(certificate, password) {
  const formData = new FormData();
  formData.append('certificate', certificate);
  formData.append('password', String(password).trim());
  return axios.post(`${baseUrl}attualize-config/certificados/upload`, formData);
}
