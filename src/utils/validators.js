// ----------------------------------------------------------------------
// Validadores para o Sistema de Indicação
// Baseado na documentação FRONTEND_IMPLEMENTATION_GUIDE.md
// ----------------------------------------------------------------------

/**
 * Valida formato de email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se válido
 */
export function validarEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida formato de telefone brasileiro
 * Aceita: (00) 00000-0000 ou (00) 0000-0000
 * @param {string} telefone - Telefone a ser validado
 * @returns {boolean} True se válido
 */
export function validarTelefone(telefone) {
  if (!telefone) return false;
  // Remove caracteres não numéricos
  const numeros = telefone.replace(/\D/g, '');
  // Valida se tem 10 ou 11 dígitos
  return numeros.length === 10 || numeros.length === 11;
}

/**
 * Valida CPF brasileiro
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} True se válido
 */
export function validarCPF(cpfInput) {
  if (!cpfInput) return false;
  
  // Remove caracteres não numéricos
  const cpf = cpfInput.replace(/\D/g, '');
  
  // Valida tamanho
  if (cpf.length !== 11) return false;
  
  // Valida CPFs conhecidos como inválidos
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Valida primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i += 1) {
    soma += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let digito1 = 11 - (soma % 11);
  if (digito1 > 9) digito1 = 0;

  // Valida segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i += 1) {
    soma += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  let digito2 = 11 - (soma % 11);
  if (digito2 > 9) digito2 = 0;

  // Verifica se os dígitos calculados correspondem aos informados
  return (
    digito1 === parseInt(cpf.charAt(9), 10) &&
    digito2 === parseInt(cpf.charAt(10), 10)
  );
}

/**
 * Valida CNPJ brasileiro
 * @param {string} cnpjInput - CNPJ a ser validado
 * @returns {boolean} True se válido
 */
export function validarCNPJ(cnpjInput) {
  if (!cnpjInput) return false;
  
  // Remove caracteres não numéricos
  const cnpj = cnpjInput.replace(/\D/g, '');
  
  // Valida tamanho
  if (cnpj.length !== 14) return false;
  
  // Valida CNPJs conhecidos como inválidos
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Valida primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i -= 1) {
    soma += numeros.charAt(tamanho - i) * pos;
    pos -= 1;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

  // Valida segundo dígito verificador
  tamanho += 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i -= 1) {
    soma += numeros.charAt(tamanho - i) * pos;
    pos -= 1;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1), 10)) return false;

  return true;
}

/**
 * Valida chave PIX conforme o tipo
 * @param {string} chave - Chave PIX a ser validada
 * @param {string} tipo - Tipo da chave ('cpf', 'cnpj', 'email', 'telefone', 'aleatoria')
 * @returns {boolean} True se válido
 */
export function validarChavePix(chave, tipo) {
  if (!chave) return false;

  switch (tipo) {
    case 'cpf':
      return validarCPF(chave);
    
    case 'cnpj':
      return validarCNPJ(chave);
    
    case 'email':
      return validarEmail(chave);
    
    case 'telefone': {
      // Usando chaves { } para evitar no-case-declarations
      const telefone = chave.replace(/\D/g, '');
      return telefone.length >= 13 && telefone.startsWith('55');
    }
    
    case 'aleatoria': {
      const regex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
      return regex.test(chave) || (chave.length >= 32 && /^[a-zA-Z0-9]+$/.test(chave));
    }
    
    default:
      return false;
  }
}

/**
 * Detecta automaticamente o tipo de chave PIX
 * @param {string} chave - Chave PIX
 * @returns {string|null} Tipo da chave ou null se não detectado
 */
export function detectarTipoChavePix(chaveInput) {
  if (!chaveInput) return null;

  const chave = chaveInput.trim();

  if (validarCPF(chave)) return 'cpf';
  if (validarCNPJ(chave)) return 'cnpj';
  if (validarEmail(chave)) return 'email';

  const telefone = chave.replace(/\D/g, '');
  if (telefone.length >= 13 && telefone.startsWith('55')) return 'telefone';

  if (
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(chave) ||
    (chave.length >= 32 && /^[a-zA-Z0-9]+$/.test(chave))
  ) {
    return 'aleatoria';
  }

  return null;
}

/**
 * Valida valor monetário
 * @param {number|string} valor - Valor a ser validado
 * @param {number} [minimo=0] - Valor mínimo permitido
 * @param {number} [maximo] - Valor máximo permitido
 * @returns {boolean} True se válido
 */
export function validarValor(valor, minimo = 0, maximo = Number.POSITIVE_INFINITY) {
  const valorNum = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  if (Number.isNaN(valorNum)) return false;
  if (valorNum < minimo) return false;
  if (valorNum > maximo) return false;
  
  return true;
}

/**
 * Valida se uma data está no formato correto e é válida
 * @param {string} data - Data no formato YYYY-MM-DD ou DD/MM/YYYY
 * @returns {boolean} True se válido
 */
export function validarData(data) {
  if (!data) return false;
  
  const dateObj = new Date(data);
  return dateObj instanceof Date && !Number.isNaN(dateObj.getTime());
}

/**
 * Valida se um campo obrigatório está preenchido
 * @param {any} valor - Valor a ser validado
 * @returns {boolean} True se preenchido
 */
export function validarCampoObrigatorio(valor) {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === 'string') return valor.trim().length > 0;
  return true;
}

/**
 * Placeholder para chave PIX conforme tipo
 * @param {string} tipo - Tipo da chave PIX
 * @returns {string} Placeholder apropriado
 */
export function getPlaceholderChavePix(tipo) {
  const placeholders = {
    cpf: '000.000.000-00',
    cnpj: '00.000.000/0000-00',
    email: 'seu@email.com',
    telefone: '+55 (00) 00000-0000',
    aleatoria: 'Chave aleatória gerada pelo banco',
  };

  return placeholders[tipo] || 'Digite sua chave PIX';
}