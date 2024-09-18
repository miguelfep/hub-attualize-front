import axios from 'axios';

export const consultarCep = async (cep) => {
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    const { data } = response;
    return data;
  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    throw error;
  }
};
