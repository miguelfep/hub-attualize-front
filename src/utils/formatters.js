// ----------------------------------------------------------------------
// Formatadores para o Sistema de Indicação
// Baseado na documentação FRONTEND_IMPLEMENTATION_GUIDE.md
// ----------------------------------------------------------------------

/**
 * Formata valor para moeda brasileira (R$)
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

/**
 * Formata data para padrão brasileiro
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada (DD/MM/YYYY)
 */
export function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora para padrão brasileiro
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data e hora formatadas (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(date) {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formata telefone brasileiro
 * @param {string} telefone - Telefone a ser formatado
 * @returns {string} Telefone formatado
 */
export function formatTelefone(telefone) {
  if (!telefone) return '';
  
  // Remove tudo que não é número
  const numeros = telefone.replace(/\D/g, '');
  
  // Formata conforme quantidade de dígitos
  if (numeros.length === 11) {
    // Celular: (00) 00000-0000
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }
  
  if (numeros.length === 10) {
    // Fixo: (00) 0000-0000
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  
  // Retorna apenas os números se não tiver o tamanho esperado
  return numeros;
}

/**
 * Formata CPF brasileiro
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} CPF formatado (000.000.000-00)
 */
export function formatCPF(cpf) {
  if (!cpf) return '';
  
  // Remove tudo que não é número
  const numeros = cpf.replace(/\D/g, '');
  
  // Formata se tiver 11 dígitos
  if (numeros.length === 11) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
  }
  
  // Retorna apenas os números se não tiver o tamanho esperado
  return numeros;
}

/**
 * Formata CNPJ brasileiro
 * @param {string} cnpj - CNPJ a ser formatado
 * @returns {string} CNPJ formatado (00.000.000/0000-00)
 */
export function formatCNPJ(cnpj) {
  if (!cnpj) return '';
  
  // Remove tudo que não é número
  const numeros = cnpj.replace(/\D/g, '');
  
  // Formata se tiver 14 dígitos
  if (numeros.length === 14) {
    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12)}`;
  }
  
  // Retorna apenas os números se não tiver o tamanho esperado
  return numeros;
}

/**
 * Formata chave PIX conforme tipo
 * @param {string} chave - Chave PIX
 * @param {string} tipo - Tipo da chave
 * @returns {string} Chave formatada
 */
export function formatChavePix(chave, tipo) {
  if (!chave) return '';

  switch (tipo) {
    case 'cpf':
      return formatCPF(chave);
    
    case 'cnpj':
      return formatCNPJ(chave);
    
    case 'telefone':
      return formatTelefone(chave);
    
    case 'email':
    case 'aleatoria':
    default:
      return chave;
  }
}

/**
 * Formata tempo relativo (ex: "há 2 horas", "há 3 dias")
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Tempo relativo
 */
export function formatRelativeTime(date) {
  if (!date) return '-';
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  // Menos de 1 minuto
  if (diffInSeconds < 60) return 'agora há pouco';
  
  // Menos de 1 hora
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  
  // Menos de 1 dia
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  
  // Menos de 1 semana
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }
  
  // Menos de 1 mês
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }
  
  // Mais de 1 mês, mostrar data completa
  return formatDate(date);
}

/**
 * Formata percentual
 * @param {number} value - Valor a ser formatado
 * @param {number} [decimais=1] - Número de casas decimais
 * @returns {string} Percentual formatado
 */
export function formatPercentage(value, decimais = 1) {
  return `${value.toFixed(decimais)}%`;
}

/**
 * Formata número com separador de milhares
 * @param {number} value - Valor a ser formatado
 * @returns {string} Número formatado
 */
export function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value || 0);
}

/**
 * Trunca texto longo
 * @param {string} text - Texto a ser truncado
 * @param {number} [maxLength=50] - Tamanho máximo
 * @returns {string} Texto truncado
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Formata nome abreviando sobrenomes do meio
 * Exemplo: "João da Silva Santos" -> "João S. Santos"
 * @param {string} nome - Nome completo
 * @returns {string} Nome formatado
 */
export function formatNomeAbreviado(nome) {
  if (!nome) return '';
  
  const partes = nome.trim().split(' ');
  
  if (partes.length <= 2) return nome;
  
  const primeiro = partes[0];
  const ultimo = partes[partes.length - 1];
  const meios = partes.slice(1, -1).map(p => `${p.charAt(0).toUpperCase()}.`).join(' ');
  
  return `${primeiro} ${meios} ${ultimo}`;
}

/**
 * Formata CEP brasileiro
 * @param {string} cep - CEP a ser formatado
 * @returns {string} CEP formatado (00000-000)
 */
export function formatCEP(cep) {
  if (!cep) return '';
  
  const numeros = cep.replace(/\D/g, '');
  
  if (numeros.length === 8) {
    return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
  }
  
  return numeros;
}

/**
 * Remove formatação de string (deixa apenas números)
 * @param {string} value - Valor a ser desformatado
 * @returns {string} Apenas números
 */
export function removeFormatacao(value) {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

/**
 * Formata bytes para tamanho legível
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} Tamanho formatado (ex: "1.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  // Corrigido para Number.isNaN e uso do logaritmo
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Alterado Math.pow(k, i) para o operador k ** i (Exponenciação)
  return `${parseFloat((bytes / (k ** i)).toFixed(2))} ${sizes[i]}`;
}