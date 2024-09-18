import axios from 'src/utils/axios';

const baseUrl = 'https://api.attualizecontabil.com.br/api/';
// ----------------------------------------------------------------------

export async function getAberturasSocietario() {
  return axios.get('https://api.attualizecontabil.com.br/api/societario/aberturas');
}

// ----------------------------------------------------------------------

export async function getAberturaById(id) {
  return axios.get(`https://api.attualizecontabil.com.br/api/societario/abertura/id/${id}`);
}

// ----------------------------------------------------------------------

export async function createAbertura(itemData) {
  return axios.post('https://api.attualizecontabil.com.br/api/societario/abertura', itemData);
}

// ----------------------------------------------------------------------

export async function updateAbertura(id, itemData) {
  return axios.put(`https://api.attualizecontabil.com.br/api/societario/abertura/atualizar/${id}`, itemData);
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

