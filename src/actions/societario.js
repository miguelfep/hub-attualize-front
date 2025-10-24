import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
// ----------------------------------------------------------------------

export async function getAberturasSocietario() {
  return axios.get( `${baseUrl}societario/aberturas`);
} 

// ----------------------------------------------------------------------

export async function getAberturaById(id) {
  return axios.get(`${baseUrl}societario/abertura/id/${id}`);
}

// ----------------------------------------------------------------------

export async function createAbertura(itemData) {
  return axios.post( `${baseUrl}societario/abertura`, itemData);
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


// Função para buscar todas as licenças
export async function getLicencas() {
  try {
    const response = await axios.get(`${baseUrl}societario/licencas`);
    return response;
  } catch (error) {
    console.error('Erro ao buscar licenças:', error);
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

// Função para criar uma nova licença (sem arquivo e sem data de vencimento)
export async function createLicenca(itemData) {
  try {
    const response = await axios.post(`${baseUrl}societario/licenca`, itemData);
    return response;
  } catch (error) {
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

export async function getAlteracoesSocietario() {
  return axios.get(`${baseUrl}societario/alteracoes`);
}

export async function createAlteracao(itemData, statusAlteracao = {}) {
  const data = {
    ...itemData,
    statusAlteracao,
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
    const response = await axios.get(
      `${baseUrl}societario/download/alteracao/${clientId}/${documentType}/${filename}`,
      {
        responseType: 'blob',
      }
    );
    return response;
  } catch (error) {
    return error;
  }
};

export async function deletarArquivoAlteracao(clientId, documentType, socioCpf, config = {}) {
  try {
    const url = socioCpf
      ? `${baseUrl}societario/delete/alteracao/${clientId}/${documentType}/${socioCpf}`
      : `${baseUrl}societario/delete/alteracao/${clientId}/${documentType}`;
    const response = await axios.delete(url, config);
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
