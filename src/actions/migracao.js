import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// ----------------------------------------------------------------------
// Migração de contabilidade (societário) — internas (dashboard)
// ----------------------------------------------------------------------

export async function getMigracoes(params = {}) {
  const res = await axios.get(`${baseUrl}migracoes`, { params });
  return res.data;
}

export async function getMigracaoById(id) {
  const res = await axios.get(`${baseUrl}migracoes/${id}`);
  return res.data;
}

export async function createMigracao(dados) {
  const res = await axios.post(`${baseUrl}migracoes`, dados);
  return res.data;
}

export async function updateMigracao(id, dados) {
  const res = await axios.put(`${baseUrl}migracoes/${id}`, dados);
  return res.data;
}

/** canais: array com 'email' e/ou 'whatsapp' */
export async function enviarLinkMigracao(id, canais) {
  const res = await axios.post(`${baseUrl}migracoes/${id}/enviar-link`, { canais });
  return res.data;
}

export async function regenerarLinkMigracao(id) {
  const res = await axios.post(`${baseUrl}migracoes/${id}/regenerar-link`);
  return res.data;
}

export async function removerDocumentoMigracao(id, docId) {
  const res = await axios.delete(`${baseUrl}migracoes/${id}/documentos/${docId}`);
  return res.data;
}

/** Baixa o documento autenticado e dispara o download no navegador. */
export async function downloadDocumentoMigracao(id, docId, nomeArquivo) {
  const res = await axios.get(`${baseUrl}migracoes/${id}/documentos/${docId}/download`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo || 'documento';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------
// Públicas — página de coleta do contador anterior (token do link, sem auth)
// ----------------------------------------------------------------------

export async function obterMigracaoPorToken(token) {
  const res = await axios.get(`${baseUrl}migracoes/publico/${token}`, {
    headers: { Authorization: '' },
  });
  return res.data;
}

/**
 * Envia documentos pelo link público.
 * @param {string} token
 * @param {File[]} files
 * @param {(progress: number) => void} [onProgress] — 0–100
 */
export async function enviarDocumentosPorToken(token, files, onProgress) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await axios.post(`${baseUrl}migracoes/publico/${token}/documentos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: '',
    },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return res.data;
}

// ----------------------------------------------------------------------
// Helpers de status

export const MIGRACAO_STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'link_enviado', label: 'Link enviado' },
  { value: 'docs_recebidos', label: 'Docs recebidos' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
];

export function getLabelStatusMigracao(status) {
  return MIGRACAO_STATUS_OPTIONS.find((opcao) => opcao.value === status)?.label || status;
}

export function getCorStatusMigracao(status) {
  switch (status) {
    case 'pendente':
      return 'default';
    case 'link_enviado':
      return 'info';
    case 'docs_recebidos':
      return 'warning';
    case 'em_analise':
      return 'secondary';
    case 'concluida':
      return 'success';
    case 'cancelada':
      return 'error';
    default:
      return 'default';
  }
}
