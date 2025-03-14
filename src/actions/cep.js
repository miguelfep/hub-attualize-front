export async function buscarCep(cep) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    return {
      ...data,
      rua: data.logradouro,
      cidade: data.localidade,
      estado: data.uf,
    };
  } catch (error) {
    throw new Error('CEP não encontrado ou inválido');
  }
}
