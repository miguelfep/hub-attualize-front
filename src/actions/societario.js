import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
// ----------------------------------------------------------------------

export async function getAberturasSocietario() {
  return axios.get(`${baseUrl}societario/aberturas`);
}

// ----------------------------------------------------------------------

export async function getAberturaById(id) {
  return axios.get(`${baseUrl}societario/abertura/id/${id}`);
}

// ----------------------------------------------------------------------

export async function createAbertura(itemData) {
  return axios.post(`${baseUrl}societario/abertura`, itemData);
}

// ----------------------------------------------------------------------

export async function updateAbertura(id, itemData) {
  return axios.put(`${baseUrl}societario/abertura/atualizar/${id}`, itemData);
}

// Função para fazer upload de arquivos
export async function uploadArquivo(clientId, documentType, file) {
  const data = new FormData();
  data.append('file', file);
  data.append('clientId', clientId);
  data.append('documentType', documentType);

  try {
    const response = await axios.post(`${baseUrl}societario/upload`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Erro ao enviar arquivo:', error);
    throw error;
  }
}

// Função para buscar arquivos
export async function downloadArquivo(clientId, documentType, filename) {
  try {
    const response = await axios.get(
      `${baseUrl}societario/download/${clientId}/${documentType}/${filename}`,
      {
        responseType: 'blob', // Isto é importante para receber o arquivo como um blob
      }
    );
    return response;
  } catch (error) {
    console.error('Erro ao buscar arquivo:', error);
    throw error;
  }
}

export async function deletarArquivo(clientId, documentType, config = {}) {
  try {
    const response = await axios.delete(
      `${baseUrl}societario/delete/${clientId}/${documentType}`,
      config
    );
    return response;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw error;
  }
}

export async function solicitarAprovacaoPorId(id, config = {}) {
  try {
    const response = await axios.put(
      `${baseUrl}societario/abertura/aprovar/${id}`,
      config
    );
    return response;
  } catch (error) {
    console.error("Erro ao solicitar aprovação:", error);
    throw error;
  }
}


export async function enviarLinkAbertura(id, config = {}) {
  try {
    const response = await axios.post(
      `${baseUrl}societario/abertura/enviar/link/${id}`,
      config
    );
    return response;
  } catch (error) {
    console.error("Erro ao enivar link:", error);
    throw error;
  }
}


// Função para buscar todas as licenças (legado - manter para compatibilidade)
export async function getLicencas() {
  try {
    const response = await axios.get(`${baseUrl}societario/licencas`);
    return response;
  } catch (error) {
    console.error('Erro ao buscar licenças:', error);
    throw error;
  }
}

/**
 * Listar licenças com filtros e paginação
 * Suporta params: page, limit, status, cliente, vencidos, expiraEmDias, sortBy, sortOrder
 * @param {Object} params 
 * @returns {Promise}
 */
export async function listarLicencas(params = {}) {
  try {
    const query = { ...params };
    const response = await axios.get(`${baseUrl}societario/licencas`, { params: query });
    return response;
  } catch (error) {
    console.error('Erro ao listar licenças:', error);
    throw error;
  }
}

/**
 * Listar licenças de um cliente específico
 * Suporta params: page, limit, status, incluirComentarios
 * @param {string} clienteId - ID do cliente
 * @param {Object} params - Parâmetros de filtro e paginação
 * @returns {Promise}
 */
export async function listarLicencasPorCliente(clienteId, params = {}) {
  try {
    const query = { ...params };
    const response = await axios.get(`${baseUrl}societario/licencas/cliente/${clienteId}`, { params: query });
    return response;
  } catch (error) {
    console.error('Erro ao listar licenças do cliente:', error);
    throw error;
  }
}

// Função para buscar uma licença por ID
export async function getLicencaById(id) {
  try {
    const response = await axios.get(`${baseUrl}societario/licenca/${id}`);
    return response;
  } catch (error) {
    console.error('Erro ao buscar licença por ID:', error);
    throw error;
  }
}

/**
 * Validar arquivo de licença
 * @param {File} file - Arquivo a ser validado
 * @returns {Object} Resultado da validação
 */
export function validarArquivoLicenca(file) {
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'Arquivo muito grande. O tamanho máximo permitido é 20MB.'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
}

/**
 * Criar uma nova licença (agora suporta upload de arquivo opcional)
 * @param {Object|FormData} itemData - Dados da licença ou FormData com arquivo
 * @param {File} [file] - Arquivo opcional da licença (máx 20MB)
 * @returns {Promise}
 */
export async function createLicenca(itemData, file = null) {
  try {
    // Se houver arquivo, validar tamanho
    if (file) {
      const validacao = validarArquivoLicenca(file);
      if (!validacao.isValid) {
        const error = new Error(validacao.error);
        error.status = 413;
        throw error;
      }
    }

    // Se houver arquivo ou se itemData já for FormData, usar multipart/form-data
    const isFormData = itemData instanceof FormData || file !== null;
    
    if (isFormData) {
      const formData = itemData instanceof FormData ? itemData : new FormData();
      
      // Se não for FormData, adicionar campos do itemData
      if (!(itemData instanceof FormData)) {
        Object.entries(itemData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
          }
        });
      }
      
      // Adicionar arquivo se fornecido
      if (file) {
        formData.append('file', file);
      }

      const response = await axios.post(`${baseUrl}societario/licenca`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } 
      // Requisição JSON normal (compatibilidade com código antigo)
      const response = await axios.post(`${baseUrl}societario/licenca`, itemData);
      return response;
    
  } catch (error) {
    // Tratar erro 413 do backend
    if (error.response?.status === 413 || error.status === 413) {
      const errorMessage = error.response?.data?.message || error.message || 'Arquivo muito grande. O tamanho máximo permitido é 20MB.';
      const customError = new Error(errorMessage);
      customError.status = 413;
      throw customError;
    }
    console.error('Erro ao criar licença:', error);
    throw error;
  }
}

// Função para atualizar a licença com arquivo e data de vencimento
export async function updateLicencaWithFile(id, file, itemData) {
  const data = new FormData();

  // Adiciona o arquivo ao FormData, se ele existir
  if (file) {
    data.append('file', file);
  }

  // Adiciona todos os campos do objeto itemData ao FormData
  Object.entries(itemData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      data.append(key, value);
    }
  });

  try {
    const response = await axios.post(`${baseUrl}societario/licenca/${id}/upload`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  } catch (error) {
    console.error('Erro ao atualizar licença com arquivo e dados:', error);
    throw error;
  }
}

// Função para atualizar a licença sem arquivo (outros dados)
export async function updateLicenca(id, itemData) {
  try {
    const response = await axios.put(`${baseUrl}societario/licenca/${id}`, itemData);
    return response;
  } catch (error) {
    console.error('Erro ao atualizar licença:', error);
    throw error;
  }
}

// Função para deletar uma licença por ID
export async function deleteLicenca(id) {
  try {
    const response = await axios.delete(`${baseUrl}societario/licenca/${id}`);
    return response;
  } catch (error) {
    console.error('Erro ao deletar licença:', error);
    throw error;
  }
}

// Função para fazer o download de um arquivo de licença

export async function downloadLicenca(id) {
  try {
    const response = await axios.get(`${baseUrl}societario/licenca/download/${id}`, {
      responseType: 'blob', // Necessário para receber o arquivo como blob
    });

    return response;

  } catch (error) {
    console.error('Erro ao fazer o download do arquivo da licença:', error);
    throw error;
  }
}

export async function deletarArquivoLicenca(id) {
  try {
    const response = await axios.delete(`${baseUrl}societario/licenca/delete/file/${id}`);

    return response;

  } catch (error) {
    console.error('Erro ao deletar o arquivo da licença:', error);
    throw error;
  }
}

// Comentários de Licença
export async function listarComentariosLicenca(licencaId, incluirInternos = true) {
  try {
    const response = await axios.get(`${baseUrl}societario/licenca/${licencaId}/comentarios`, {
      params: { incluirInternos },
    });
    return response;
  } catch (error) {
    console.error('Erro ao listar comentários da licença:', error);
    throw error;
  }
}

export async function criarComentarioLicenca(licencaId, payload) {
  try {
    const response = await axios.post(`${baseUrl}societario/licenca/${licencaId}/comentario`, payload);
    return response;
  } catch (error) {
    console.error('Erro ao criar comentário da licença:', error);
    throw error;
  }
}

export async function deletarComentarioSocietario(comentarioId) {
  try {
    const response = await axios.delete(`${baseUrl}societario/comentario/${comentarioId}`);
    return response;
  } catch (error) {
    console.error('Erro ao deletar comentário do societário:', error);
    throw error;
  }
}

export async function getAlteracoesSocietario() {
  return axios.get(`${baseUrl}societario/alteracoes`);
}

export async function createAlteracao(itemData, options = {}) {
  const data = {
    ...itemData,
    ...options,
  }
  return axios.post(`${baseUrl}societario/alteracao`, data);
}

export async function getAlteracaoById(id) {
  try {
    const response = await axios.get(`${baseUrl}societario/alteracao/id/${id}`);
    return response.data;
  } catch (error) {
    return error;
  };
}

export async function sendMessageLink(id) {
  try {
    const response = await axios.post(`${baseUrl}societario/alteracao/link/${id}`);
    return response.data;
  } catch (error) {
    console.error(error)
    return error;
  };
}

export async function updateAlteracao(id, itemData) {
  return axios.put(`${baseUrl}societario/alteracao/atualizar/${id}`, itemData);
}

export const uploadArquivoAlteracao = async (aberturaId, documentType, file, socioIndex) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('clientId', aberturaId);
  formData.append('documentType', documentType);
  formData.append('socioIndex', socioIndex);

  return axios.post(`${baseUrl}societario/upload/alteracao`, formData);
};

export async function downloadArquivoAlteracao(clientId, documentType, filename) {
  try {
    // Encode o filename para evitar problemas com caracteres especiais na URL
    const encodedFilename = encodeURIComponent(filename);
    const response = await axios.get(
      `${baseUrl}societario/download/alteracao/${clientId}/${documentType}/${encodedFilename}`,
      {
        responseType: 'blob',
      }
    );
    return response;
  } catch (error) {
    console.error('Erro ao baixar arquivo de alteração:', error);
    throw error;
  }
}

export async function deletarArquivoAlteracao(clientId, documentType, config = {}) {
  try {
    // documentType pode ser "iptuAnexo" ou "socios.0.cnhAnexo"
    const response = await axios.delete(
      `${baseUrl}societario/delete/alteracao/${clientId}/${documentType}`,
      config
    );
    return response;
  } catch (error) {
    console.error('Erro ao deletar arquivo de alteração:', error);
    throw error;
  }
}

export async function aprovarAlteracaoPorId(id, config = {}) {
  try {
    const response = await axios.put(
      `${baseUrl}societario/alteracao/aprovar/${id}`,
      config
    );
    return response;
  } catch (error) {
    console.error("Erro ao aprovar alteração:", error);
    throw error;
  }
}

// Função para enviar mensagem quando mudar a situação da abertura
export async function enviarMensagemSituacaoAbertura(id, situacaoAbertura, config = {}) {
  try {
    const response = await axios.post(
      `${baseUrl}societario/abertura/situacao/mensagem/${id}`,
      { situacaoAbertura },
      config
    );
    return response;
  } catch (error) {
    console.error("Erro ao enviar mensagem da situação:", error);
    throw error;
  }
}

// Função para gerar/reenviar acesso do usuário no onboarding
export async function gerarAcessoUsuario(id, config = {}) {
  try {
    const response = await axios.post(
      `${baseUrl}societario/abertura/gerar-acesso/${id}`,
      config
    );
    return response;
  } catch (error) {
    console.error("Erro ao gerar acesso do usuário:", error);
    throw error;
  }
}

/**
 * Obter cor do status da licença
 * @param {string} status - Status da licença
 * @returns {string} Cor do status
 */
export function getCorStatusLicenca(status) {
  switch (status) {
    case 'valida':
      return 'success';
    case 'vencida':
      return 'error';
    case 'dispensada':
      return 'info';
    case 'a_expirar':
      return 'warning';
    case 'em_processo':
      return 'secondary';
    default:
      return 'default';
  }
}

/**
 * Obter ícone do status da licença
 * @param {string} status - Status da licença
 * @returns {string} Nome do ícone
 */
export function getIconeStatusLicenca(status) {
  switch (status) {
    case 'valida':
      return 'solar:shield-check-bold-duotone';
    case 'vencida':
      return 'solar:shield-cross-bold-duotone';
    case 'dispensada':
      return 'solar:shield-user-bold-duotone';
    case 'a_expirar':
      return 'solar:sort-by-time-bold';
    case 'em_processo':
      return 'solar:shield-bold-duotone';
    default:
      return 'solar:sort-by-time-bold';
  }
}
