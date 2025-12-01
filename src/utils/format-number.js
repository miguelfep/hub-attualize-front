import { formatNumberLocale } from 'src/locales';

// ----------------------------------------------------------------------

const DEFAULT_LOCALE = { code: 'en-US', currency: 'USD' };

function processInput(inputValue) {
  if (inputValue == null || Number.isNaN(inputValue)) return null;
  return Number(inputValue);
}

// ----------------------------------------------------------------------

export function fNumber(inputValue, options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm;
}

// ----------------------------------------------------------------------

export function fCurrency(inputValue, options) {
  const locale = 'pt-BR';
  const currency = 'BRL';

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm;
}

// ----------------------------------------------------------------------

export function fPercent(inputValue, options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    ...options,
  }).format(number / 100);

  return fm;
}

// ----------------------------------------------------------------------

export function fShortenNumber(inputValue, options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    notation: 'compact',
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm.replace(/[A-Z]/g, (match) => match.toLowerCase());
}

// ----------------------------------------------------------------------

export function fData(inputValue) {
  const number = processInput(inputValue);
  if (number === null || number === 0) return '0 bytes';

  const units = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
  const decimal = 2;
  const baseValue = 1024;

  const index = Math.floor(Math.log(number) / Math.log(baseValue));
  const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;

  return fm;
}

export function formatCpfCnpj(value) {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
}

// ----------------------------------------------------------------

export function formatLargePercent(value) {
  if (Math.abs(value) > 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return fPercent(value);
}

// ----------------------------------------------------------------

export const onlyDigits = (v) => v.replace(/\D/g, '');

// ----------------------------------------------------------------

export const formatCPF = (v) => {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// ----------------------------------------------------------------

export const formatCNPJ = (v) => {
  const d = onlyDigits(v).slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

// ----------------------------------------------------------------

export const formatCPFOrCNPJ = (v) => {
  const d = onlyDigits(v);
  // Se passou de 11 dígitos, assume máscara de CNPJ, senão CPF
  return d.length > 11 ? formatCNPJ(d) : formatCPF(d);
};

// ----------------------------------------------------------------

/**
 * Valida CPF verificando dígitos verificadores
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {boolean} - true se CPF é válido
 */
export const validateCPF = (cpf) => {
  const cleanCpf = onlyDigits(cpf);

  if (cleanCpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += parseInt(cleanCpf.charAt(i), 10) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCpf.charAt(9), 10)) return false;

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += parseInt(cleanCpf.charAt(i), 10) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCpf.charAt(10), 10)) return false;

  return true;
};

// ----------------------------------------------------------------

/**
 * Valida CNPJ verificando dígitos verificadores
 * @param {string} cnpj - CNPJ com ou sem formatação
 * @returns {boolean} - true se CNPJ é válido
 */
export const validateCNPJ = (cnpj) => {
  const cleanCnpj = onlyDigits(cnpj);

  if (cleanCnpj.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;

  // Valida primeiro dígito verificador
  let length = cleanCnpj.length - 2;
  let numbers = cleanCnpj.substring(0, length);
  const digits = cleanCnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i -= 1) {
    sum += parseInt(numbers.charAt(length - i), 10) * pos;
    pos -= 1;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0), 10)) return false;

  // Valida segundo dígito verificador
  length += 1;
  numbers = cleanCnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i -= 1) {
    sum += parseInt(numbers.charAt(length - i), 10) * pos;
    pos -= 1;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1), 10)) return false;

  return true;
};

// ----------------------------------------------------------------

/**
 * Valida CPF ou CNPJ verificando dígitos verificadores
 * @param {string} value - CPF/CNPJ com ou sem formatação
 * @returns {boolean} - true se CPF ou CNPJ é válido
 */
export const validateCPFOrCNPJ = (value) => {
  const cleanValue = onlyDigits(value);

  if (cleanValue.length === 11) {
    return validateCPF(cleanValue);
  }

  if (cleanValue.length === 14) {
    return validateCNPJ(cleanValue);
  }

  return false;
};

// ----------------------------------------------------------------

/**
 * Formata telefone brasileiro
 * @param {string} value - Telefone com ou sem formatação
 * @returns {string} - Telefone formatado
 */
export const formatTelefone = (value) => {
  if (!value) return '';

  const nums = onlyDigits(value);
  const cleanNums = nums.slice(0, 11);

  if (cleanNums.length <= 10) {
    return cleanNums
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return cleanNums
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/( \d)(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

