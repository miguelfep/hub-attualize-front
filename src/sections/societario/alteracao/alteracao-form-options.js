/**
 * Opções de selects do fluxo de alteração societária.
 * Fonte canônica alinhada aos formulários existentes (value/label para compatibilidade com dados em produção).
 */

export const REGIME_BENS_OPTIONS = [
    { value: 'Comunhão Parcial de Bens', label: 'Comunhão Parcial de Bens' },
    { value: 'Comunhão Universal de Bens', label: 'Comunhão Universal de Bens' },
    { value: 'Separação Total de Bens', label: 'Separação Total de Bens' },
];

export const ESTADO_CIVIL_OPTIONS = [
    { value: 'Solteiro', label: 'Solteiro' },
    { value: 'Casado', label: 'Casado' },
    { value: 'Divorciado', label: 'Divorciado' },
    { value: 'Viuvo', label: 'Viuvo' },
    { value: 'Uniao Estavel', label: 'União Estável' },
];

export const REGIME_TRIBUTARIO_OPTIONS = [
    { value: 'simples', label: 'Simples Nacional' },
    { value: 'presumido', label: 'Lucro Presumido' },
    { value: 'real', label: 'Lucro Real' },
];

export const FORMA_ATUACAO_OPTIONS = [
    { value: 'internet', label: 'Internet' },
    { value: 'fora_estabelecimento', label: 'Fora do estabelecimento' },
    { value: 'escritorio', label: 'Escritório administrativo' },
    { value: 'local_proprio', label: 'Local próprio' },
    { value: 'terceiro', label: 'Em estabelecimento de terceiros' },
    { value: 'casa_cliente', label: 'Casa do cliente' },
    { value: 'outros', label: 'Outros' },
];

export const ETNIA_OPTIONS = [
    { value: 'branca', label: 'Branca' },
    { value: 'preta', label: 'Preta' },
    { value: 'parda', label: 'Parda' },
    { value: 'amarela', label: 'Amarela' },
    { value: 'indigena', label: 'Indigena' },
    { value: 'prefiroNaoInformar', label: 'Prefiro não informar' },
];

export const GRAU_ESCOLARIDADE_OPTIONS = [
    { value: 'semInstrucao', label: 'Sem Instrução' },
    { value: 'fundamentalIncompleto', label: 'Ensino Fundamental Incompleto' },
    { value: 'fundamentalCompleto', label: 'Ensino Fundamental Completo' },
    { value: 'medioIncompleto', label: 'Ensino Médio Incompleto' },
    { value: 'medioCompleto', label: 'Ensino Médio Completo' },
    { value: 'superiorIncompleto', label: 'Ensino Superior Incompleto' },
    { value: 'superiorCompleto', label: 'Ensino Superior Completo' },
    { value: 'posGraduacao', label: 'Pós-graduação' },
    { value: 'mestrado', label: 'Mestrado' },
    { value: 'doutorado', label: 'Doutorado' },
    { value: 'prefiroNaoInformar', label: 'Prefiro não informar' },
];
