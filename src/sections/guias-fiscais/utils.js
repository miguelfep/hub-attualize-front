// ----------------------------------------------------------------------

/**
 * Verifica se a categoria é uma guia (Fiscal ou DP)
 * @param {string} categoria - Categoria do documento
 * @returns {boolean}
 */
export const isGuia = (categoria) => categoria === 'GUIA_FISCAL' || categoria === 'GUIA_DP';

/**
 * Verifica se a categoria é um documento DP
 * @param {string} categoria - Categoria do documento
 * @returns {boolean}
 */
export const isDocumento = (categoria) => categoria === 'DOCUMENTO_DP';

/**
 * Formata competência de "MM/AAAA" para formato legível
 * @param {string} competencia - Competência no formato "MM/AAAA"
 * @returns {string} - Formato legível (ex: "Janeiro/2025") ou o valor original se inválido
 */
export const formatCompetencia = (competencia) => {
  if (!competencia) return '-';

  // Validar formato MM/AAAA
  const match = competencia.match(/^(\d{2})\/(\d{4})$/);
  if (!match) return competencia;

  const [, mes, ano] = match;
  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const mesIndex = parseInt(mes, 10) - 1;
  if (mesIndex < 0 || mesIndex > 11) return competencia;

  return `${meses[mesIndex]}/${ano}`;
};

/**
 * Obtém a competência do documento (prioriza campo direto, depois dadosExtraidos)
 * @param {object} guia - Objeto da guia/documento
 * @returns {string|null} - Competência ou null
 */
export const getCompetencia = (guia) => guia?.competencia || guia?.dadosExtraidos?.competencia || null;
