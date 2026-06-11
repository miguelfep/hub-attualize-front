const onlyDigits = (v) => (v || '').replace(/\D/g, '');

const normalizarTelefone = (ddd, numero) => {
  const d = onlyDigits(`${ddd || ''}${numero || ''}`);
  return d || '';
};

async function buscarNoCnpja(cnpj) {
  const response = await fetch(`https://open.cnpja.com/office/${cnpj}`);
  if (!response.ok) throw new Error('CNPJ não encontrado no CNPJA');
  const data = await response.json();
  const phone = data.phones?.[0];
  return {
    razaoSocial: data.company?.name || '',
    nomeFantasia: data.alias || '',
    email: data.emails?.[0]?.address || '',
    telefone: normalizarTelefone(phone?.area, phone?.number),
    endereco: {
      cep: onlyDigits(data.address?.zip),
      rua: data.address?.street || '',
      numero: data.address?.number || '',
      complemento: data.address?.details || '',
      bairro: data.address?.district || '',
      cidade: data.address?.city || '',
      estado: data.address?.state || '',
    },
  };
}

async function buscarNoReceitaWs(cnpj) {
  const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
  if (!response.ok) throw new Error('CNPJ não encontrado na ReceitaWS');
  const data = await response.json();
  if (data.status === 'ERROR') throw new Error(data.message || 'CNPJ não encontrado');
  return {
    razaoSocial: data.nome || '',
    nomeFantasia: data.fantasia || '',
    email: data.email || '',
    telefone: onlyDigits(data.telefone),
    endereco: {
      cep: onlyDigits(data.cep),
      rua: data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      cidade: data.municipio || '',
      estado: data.uf || '',
    },
  };
}

async function buscarNoBrasilApi(cnpj) {
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
  if (!response.ok) throw new Error('CNPJ não encontrado na BrasilAPI');
  const data = await response.json();
  return {
    razaoSocial: data.razao_social || '',
    nomeFantasia: data.nome_fantasia || '',
    email: data.email || '',
    telefone: onlyDigits(data.ddd_telefone_1),
    endereco: {
      cep: onlyDigits(data.cep),
      rua: data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      cidade: data.municipio || '',
      estado: data.uf || '',
    },
  };
}

export async function buscarCnpj(cnpj) {
  const digits = onlyDigits(cnpj);
  if (digits.length !== 14) {
    throw new Error('CNPJ inválido');
  }

  const validar = (resultado) => {
    if (!resultado?.razaoSocial) throw new Error('CNPJ sem razão social');
    return resultado;
  };

  return buscarNoCnpja(digits)
    .then(validar)
    .catch(() => buscarNoReceitaWs(digits).then(validar))
    .catch(() => buscarNoBrasilApi(digits).then(validar))
    .catch(() => {
      throw new Error('CNPJ não encontrado');
    });
}
