import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Upload de certificado digital
 * @param {File} certificate - Arquivo do certificado (.pfx, .p12, .cer, .crt)
 * @param {string} password - Senha do certificado
 * @param {string} clienteId - ID do cliente
 * @returns {Promise} Resposta da API
 */
export async function uploadCertificado(certificate, password, clienteId) {
  const formData = new FormData();
  formData.append('certificate', certificate);
  formData.append('password', password);
  formData.append('clienteId', clienteId);

  return axios.post(`${baseUrl}certificados/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
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
 * Desativar certificado
 * @param {string} certificadoId - ID do certificado
 * @returns {Promise} Resposta da API
 */
export async function desativarCertificado(certificadoId) {
  return axios.put(`${baseUrl}certificados/${certificadoId}/desativar`);
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

/**
 * Validar arquivo de certificado
 * @param {File} file - Arquivo a ser validado
 * @returns {Object} Resultado da validação
 */
export function validarArquivoCertificado(file) {
  const validExtensions = ['.pfx', '.p12', '.cer', '.crt'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (!validExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não suportado. Use .pfx, .p12, .cer ou .crt'
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 5MB'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
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
