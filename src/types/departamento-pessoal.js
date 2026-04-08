/**
 * Referência de tipos — alinhado à API de Departamento Pessoal.
 * @see documentação backend (Funcionario, RubricaCompetencia, demissão)
 */

/**
 * @typedef {'pendente_aprovacao'|'aprovado'|'reprovado'} StatusCadastroFuncionario
 * @typedef {'ativo'|'inativo'} StatusVinculoFuncionario
 * @typedef {'nenhuma'|'solicitada'|'em_analise'|'aprovada'|'rejeitada'} StatusDemissaoFuncionario
 */

/**
 * @typedef {Object} DemissaoFuncionario
 * @property {StatusDemissaoFuncionario} status
 * @property {string} [solicitadaEm]
 * @property {string} [motivo]
 * @property {string} [dataPrevistaDesligamento]
 * @property {string} [analisadoEm]
 * @property {string} [analisadoPor]
 * @property {string} [observacaoInterna]
 */

/**
 * @typedef {Object} Funcionario
 * @property {string} _id
 * @property {string} clienteId
 * @property {string} nome
 * @property {string} cpf
 * @property {string} [email]
 * @property {string} [cargo]
 * @property {string} [dataAdmissao]
 * @property {string} [observacoes]
 * @property {StatusCadastroFuncionario} statusCadastro
 * @property {string} [motivoReprovacao]
 * @property {string} [aprovadoPor]
 * @property {string} [aprovadoEm]
 * @property {string} [reprovadoEm]
 * @property {StatusVinculoFuncionario} statusVinculo
 * @property {DemissaoFuncionario} demissao
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} RubricaItem
 * @property {string} codigo
 * @property {string} [descricao]
 * @property {number} [quantidade]
 * @property {number} [valor]
 * @property {string} [observacao]
 */

/**
 * @typedef {Object} ClientePortalFlags
 * @property {string} _id
 * @property {string} [nome]
 * @property {boolean} [possuiFuncionario]
 * @property {boolean} [possuiExtrato]
 */

/**
 * Espelho de flags do Cliente na resposta de /cliente-portal/* (não persistido na coleção Settings).
 * @typedef {Object} SettingsPortalResposta
 * @property {string} [clienteId]
 * @property {Record<string, boolean>} [funcionalidades]
 * @property {boolean} possuiExtrato
 * @property {boolean} possuiFuncionario
 */

/**
 * @typedef {Object} RubricaCompetencia
 * @property {string} _id
 * @property {string} funcionarioId
 * @property {string} clienteId
 * @property {number} ano
 * @property {number} mes
 * @property {RubricaItem[]} itens
 * @property {string} [observacoesGerais]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export const CODIGOS_RUBRICA_SUGERIDOS = [
  { value: 'FALTA', label: 'Falta' },
  { value: 'HORA_EXTRA_50', label: 'Hora extra 50%' },
  { value: 'HORA_EXTRA_100', label: 'Hora extra 100%' },
  { value: 'ATRASO', label: 'Atraso' },
  { value: 'ADICIONAL_NOTURNO', label: 'Adicional noturno' },
  { value: 'OUTRO', label: 'Outro' },
];
