import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Upload de certificado digital (multipart/form-data).
 * API: POST /api/certificados/upload
 * Campos: certificate (arquivo), clienteId, password, observacoes (opcional).
 * @param {File} certificate - Arquivo do certificado (.pfx, .p12, .cer, .crt)
 * @param {string} password - Senha do certificado (será trim no backend; mín. 4 caracteres)
 * @param {string} clienteId - ID do cliente (MongoDB ObjectId)
 * @param {string} [observacoes] - Observações opcionais
 * @returns {Promise} Resposta da API { success, message, data? }
 */
export async function uploadCertificado(certificate, password, clienteId, observacoes = '') {
  const formData = new FormData();
  formData.append('certificate', certificate);
  formData.append('clienteId', String(clienteId).trim());
  formData.append('password', String(password).trim());
  if (observacoes && String(observacoes).trim()) {
    formData.append('observacoes', String(observacoes).trim());
  }

  return axios.post(`${baseUrl}certificados/upload`, formData, {
    headers: {
      // Não definir Content-Type: o axios define multipart/form-data com boundary
    },
  });
}

/**
 * Listar certificados de um cliente
 * @param {string} clienteId - ID do cliente
 * @returns {Promise} Lista de certificados
 */
export async function getCertificadosCliente(clienteId) {
  return axios.get(`${baseUrl}certificados/cliente/${clienteId}`);
}

/**
 * Obter certificado ativo de um cliente
 * @param {string} clienteId - ID do cliente
 * @returns {Promise} Certificado ativo
 */
export async function getCertificadoAtivo(clienteId) {
  return axios.get(`${baseUrl}certificados/cliente/${clienteId}/ativo`);
}

/**
 * Desativar certificado (mantém no banco, apenas desativa).
 * @param {string} certificadoId - ID do certificado
 * @returns {Promise} Resposta da API
 */
export async function desativarCertificado(certificadoId) {
  return axios.put(`${baseUrl}certificados/${certificadoId}/desativar`);
}

/**
 * Deletar certificado permanentemente (apenas admin).
 * @param {string} certificadoId - ID do certificado
 * @returns {Promise} Resposta da API
 */
export async function deletarCertificado(certificadoId) {
  return axios.delete(`${baseUrl}certificados/${certificadoId}`);
}

/**
 * Download de certificado
 * @param {string} certificadoId - ID do certificado
 * @returns {Promise} Resposta da API com arquivo
 */
export async function downloadCertificado(certificadoId) {
  return axios.get(`${baseUrl}certificados/${certificadoId}/download`, {
    responseType: 'blob', // Importante para receber o arquivo como blob
  });
}

const CERTIFICATE_VALID_EXTENSIONS = ['.pfx', '.p12', '.cer', '.crt'];
const CERTIFICATE_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Validar arquivo de certificado (extensão e tamanho).
 * Tipos aceitos: .p12, .pfx, .cer, .crt. Limite: 5 MB.
 * @param {File} file - Arquivo a ser validado
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validarArquivoCertificado(file) {
  if (!file || !file.name) {
    return { isValid: false, error: 'Arquivo de certificado é obrigatório.' };
  }
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!CERTIFICATE_VALID_EXTENSIONS.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não permitido. Use .pfx, .p12, .cer ou .crt',
    };
  }
  if (file.size > CERTIFICATE_MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 5 MB.',
    };
  }
  if (file.size === 0) {
    return { isValid: false, error: 'Arquivo de certificado vazio.' };
  }
  return { isValid: true, error: null };
}

/**
 * Validar senha do certificado no frontend (mín. 4 caracteres após trim).
 * @param {string} password
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validarSenhaCertificado(password) {
  const trimmed = typeof password === 'string' ? password.trim() : '';
  if (!trimmed) {
    return { isValid: false, error: 'Senha do certificado é obrigatória.' };
  }
  if (trimmed.length < 4) {
    return { isValid: false, error: 'Senha deve ter no mínimo 4 caracteres.' };
  }
  return { isValid: true, error: null };
}

/**
 * Formatar data para exibição
 * @param {string} dateString - Data em formato ISO
 * @returns {string} Data formatada
 */
export function formatarDataCertificado(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obter cor do status do certificado
 * @param {string} status - Status do certificado
 * @returns {string} Cor do status
 */
export function getCorStatusCertificado(status) {
  switch (status) {
    case 'ativo':
      return 'success';
    case 'inativo':
      return 'default';
    case 'expirado':
      return 'error';
    case 'erro':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Obter ícone do status do certificado
 * @param {string} status - Status do certificado
 * @returns {string} Nome do ícone
 */
export function getIconeStatusCertificado(status) {
  switch (status) {
    case 'ativo':
      return 'eva:checkmark-circle-2-fill';
    case 'inativo':
      return 'eva:minus-circle-fill';
    case 'expirado':
      return 'eva:close-circle-fill';
    case 'erro':
      return 'eva:alert-circle-fill';
    default:
      return 'eva:help-circle-fill';
  }
}

/**
 * Listar certificados com filtros e paginação
 * Suporta params: page, limit, status, vencidos, expiraEmDias, cliente, clienteId, sortBy, sortOrder
 * @param {Object} params 
 * @returns {Promise}
 */
export async function listarCertificados(params = {}) {
  const query = { ...params };
  return axios.get(`${baseUrl}certificados`, { params: query });
}

/**
 * Obter senha (decriptada) de um certificado específico
 * Requer que o backend exponha endpoint seguro e com permissões
 * @param {string} certificadoId
 * @returns {Promise}
 */
export async function getSenhaCertificado(certificadoId) {
  // Endpoint protegido que retorna a senha do certificado usando o Bearer Token do usuário
  // Conforme solicitado: urlapi/api/certificados/:certificateId/senha
  return axios.get(`${baseUrl}certificados/${certificadoId}/senha`);
}
