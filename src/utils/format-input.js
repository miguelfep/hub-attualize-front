// Funções de formatação para inputs sem dependência de react-input-mask

/**
 * Formata CEP
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Valor formatado (00000-000)
 */
export const formatCep = (value) => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

/**
 * Formata CPF
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Valor formatado (000.000.000-00)
 */
export const formatCpf = (value) => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

/**
 * Formata RG
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Valor formatado (00.000.000-0)
 */
export const formatRg = (value) => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}-${numbers.slice(8, 9)}`;
};

/**
 * Formata Telefone com DDD
 * @param {string} value - Valor a ser formatado
 * @returns {string} - Valor formatado ((00) 0 0000-0000)
 */
export const formatPhone = (value) => {
  if (!value) return '';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers.length > 0 ? `(${numbers}` : '';
  if (numbers.length <= 3) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

/**
 * Remove formatação de string (mantém apenas números)
 * @param {string} value - Valor formatado
 * @returns {string} - Apenas números
 */
export const removeFormatting = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};
