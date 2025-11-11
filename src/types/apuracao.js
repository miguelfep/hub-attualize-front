'use client';

/**
 * Tipagens utilitárias para o módulo de Apuração / Fator R.
 * Mantemos como comentários JSDoc para facilitar o autocomplete
 * em ambientes JS.
 */

export const STATUS_APURACAO = [
  'pendente',
  'calculada',
  'validada',
  'transmitida',
  'das_gerado',
  'pago',
  'cancelada',
];

export const STATUS_DAS = ['gerado', 'pago', 'cancelado', 'vencido'];

export const STATUS_AVALIACAO = ['pendente', 'ativo', 'oculto', 'reportado'];

export const AMBIENTE_DAS = ['teste', 'producao'];

export const ANEXOS_SIMPLES = ['I', 'II', 'III', 'IV', 'V', 'VI'];

/**
 * @typedef {Object} FatorR
 * @property {number} folhaPagamento12Meses
 * @property {number} receitaBruta12Meses
 * @property {number} percentual
 * @property {boolean} aplicavelAnexoIII
 * @property {boolean} aplicavelAnexoV
 */

/**
 * @typedef {Object} NotasPorAnexo
 * @property {string} anexo
 * @property {boolean} usaFatorR
 * @property {number} quantidadeNotas
 * @property {number} totalNotas
 * @property {number} aliquotaEfetiva
 * @property {number} impostoCalculado
 */

/**
 * @typedef {Object} HistoricoFaturamento
 * @property {string} periodoApuracao
 * @property {number} receitaBruta
 * @property {number} folhaPagamento
 * @property {number} proLabore
 * @property {number} fatorR
 * @property {string|Date} [atualizadoEm]
 */

/**
 * @typedef {Object} Apuracao
 * @property {string} _id
 * @property {string} clienteId
 * @property {string} periodoApuracao
 * @property {number} mesReferencia
 * @property {number} anoReferencia
 * @property {FatorR=} fatorR
 * @property {NotasPorAnexo[]} notasPorAnexo
 * @property {number} totalReceitaBruta
 * @property {number} totalImpostos
 * @property {number} aliquotaEfetivaTotal
 * @property {string[]} observacoes
 * @property {string[]} alertas
 * @property {string} status
 * @property {boolean} dasGerado
 * @property {string=} dasId
 * @property {string} calculadoEm
 * @property {number=} receitaBruta12Meses
 * @property {number=} folhaPagamento12Meses
 * @property {number=} proLabore12Meses
 * @property {HistoricoFaturamento[]=} historicoFaturamento
 */

/**
 * @typedef {Object} ValoresDAS
 * @property {number} principal
 * @property {number} multa
 * @property {number} juros
 * @property {number} total
 */

/**
 * @typedef {Object} ComposicaoDAS
 * @property {string} periodoApuracao
 * @property {string} codigo
 * @property {string} denominacao
 * @property {ValoresDAS} valores
 */

/**
 * @typedef {Object} DAS
 * @property {string} _id
 * @property {string} clienteId
 * @property {string} cnpj
 * @property {'teste'|'producao'} ambiente
 * @property {string} periodoApuracao
 * @property {string} numeroDocumento
 * @property {string} dataVencimento
 * @property {ValoresDAS} valores
 * @property {ComposicaoDAS[]} composicao
 * @property {string[]} observacoes
 * @property {string} status
 * @property {string=} pdfBase64
 */

/**
 * @typedef {Object} PeriodoHistorico
 * @property {string} periodoApuracao
 * @property {number} receitaBruta
 * @property {number} folhaPagamento
 * @property {number} proLabore
 * @property {number} fatorR
 */

/**
 * @typedef {Object} Totais12Meses
 * @property {number} receitaBruta12Meses
 * @property {number} folhaPagamento12Meses
 * @property {number} proLabore12Meses
 * @property {number} fatorRAtual
 * @property {number} mesesComDados
 * @property {PeriodoHistorico[]} periodos
 */

export default {};

