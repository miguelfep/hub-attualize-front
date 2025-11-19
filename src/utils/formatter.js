/**
 * Formata uma string de CNAE (Classificação Nacional de Atividades Econômicas).
 * Adiciona a máscara padrão XX.XX-X/XX.
 * @param {string} cnae A string de CNAE a ser formatada.
 * @returns {string} O CNAE formatado. Retorna o original se não tiver 7 dígitos.
 */
export const formatCNAE = (cnae) => {
  const cleaned = String(cnae || '').replace(/\D/g, '');
  if (cleaned.length !== 7) return cnae;
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}-${cleaned.slice(4, 5)}/${cleaned.slice(5)}`;
};

/**
 * Formata uma string de código de serviço.
 * Adiciona a máscara padrão XX.XX.XX.
 * @param {string} codigo A string de código a ser formatada.
 * @returns {string} O código formatado. Retorna o original se não tiver 6 dígitos.
 */
export const formatCodigoServico = (codigo) => {
  const cleaned = String(codigo || '').replace(/\D/g, '');
  if (cleaned?.length !== 6) return codigo;
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}.${cleaned.slice(4, 6)}`;
};

/**
 * Formata uma string de CPF ou CNPJ.
 * Adiciona a máscara padrão XX.XXX.XXX-XXXX.
 * @param {string} cnpj A string de CPF ou CNPJ a ser formatada.
 * @returns {string} O CPF ou CNPJ formatado. Retorna o original se não tiver 11 ou 14 dígitos.
 */
export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

/**
 * Converte uma string para camelCase.
 * @param {string} str A string a ser convertida.
 * @returns {string} A string em camelCase.
 */
export const formatToCamelCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^./, (char) => char.toLowerCase());
};
