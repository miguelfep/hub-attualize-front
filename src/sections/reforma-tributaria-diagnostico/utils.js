// ----------------------------------------------------------------------
// Reforma Tributária — Diagnóstico: constantes e helpers compartilhados
// entre backoffice e portal do cliente.
// ----------------------------------------------------------------------

export const DIAGNOSTICO_STATUS_OPTIONS = [
  { value: 'rascunho', label: 'Rascunho', color: 'default' },
  { value: 'em_analise', label: 'Em análise', color: 'warning' },
  { value: 'concluido', label: 'Concluído', color: 'success' },
  { value: 'arquivado', label: 'Arquivado', color: 'info' },
];

export function getStatusOption(status) {
  return (
    DIAGNOSTICO_STATUS_OPTIONS.find((o) => o.value === status) || {
      value: status,
      label: status || 'Sem status',
      color: 'default',
    }
  );
}

export const RECOMENDACAO_LABELS = {
  simples: 'Simples tradicional',
  hibrido: 'Simples com IBS/CBS por fora',
  empate_tecnico: 'Empate técnico',
};

export function getRecomendacaoLabel(value) {
  return RECOMENDACAO_LABELS[value] || value || '—';
}

export function getRecomendacaoColor(value) {
  if (value === 'hibrido') return 'info';
  if (value === 'simples') return 'success';
  return 'warning';
}

export const CONFIABILIDADE_NIVEL_COLORS = {
  alta: 'success',
  media: 'warning',
  baixa: 'error',
};

// ----------------------------------------------------------------------
// Conversões: a API trabalha com frações 0..1; os inputs exibem 0..100 (%).

/** Fração da API (0.07) → valor de input em % ('7'). */
export function fractionToPercentInput(value) {
  if (value === null || value === undefined || value === '') return '';
  const pct = Number(value) * 100;
  if (Number.isNaN(pct)) return '';
  return String(Math.round(pct * 10000) / 10000);
}

/** Input em % ('7' ou '7,5') → fração da API (0.075). Vazio → undefined. */
export function percentInputToFraction(value) {
  if (value === null || value === undefined || value === '') return undefined;
  const num = Number(String(value).replace(',', '.'));
  if (Number.isNaN(num)) return undefined;
  return num / 100;
}

/** Input numérico ('1200' ou '1200,50') → número. Vazio → undefined. */
export function numberInputToNumber(value) {
  if (value === null || value === undefined || value === '') return undefined;
  const num = Number(String(value).replace(',', '.'));
  return Number.isNaN(num) ? undefined : num;
}

export function numberToInput(value) {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
}

/** Remove chaves undefined; retorna undefined se nada sobrar. */
export function compactObject(obj) {
  const entries = Object.entries(obj || {}).filter(([, v]) => v !== undefined);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

// ----------------------------------------------------------------------

/** '2026-07' → 'julho/2026' (fallback: valor original). */
export function formatCompetencia(competencia) {
  if (!competencia || !/^\d{4}-\d{2}$/.test(competencia)) return competencia || '—';
  const [ano, mes] = competencia.split('-');
  const meses = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];
  const label = meses[Number(mes) - 1];
  return label ? `${label}/${ano}` : competencia;
}

// ----------------------------------------------------------------------
// Cenários do comparativo — nomes reais da API primeiro, com fallbacks.

const pickNumber = (obj, keys) => {
  if (!obj) return undefined;
  const key = keys.find((k) => obj[k] !== null && obj[k] !== undefined);
  return key ? obj[key] : undefined;
};

export const getCargaAnual = (lado) => pickNumber(lado, ['cargaAnual', 'cargaTributariaAnual']);

export const getCargaMensal = (lado) =>
  pickNumber(lado, ['cargaMensalMedia', 'cargaMensal', 'cargaTributariaMensal']);

export const getMargem = (lado) =>
  pickNumber(lado, ['margemLiquidaEstimada', 'margem', 'margemLiquida']);

export const getPrecoIndice = (lado) => pickNumber(lado, ['precoIndice', 'indicePreco']);

export const CENARIO_LABELS = { otimista: 'Otimista', base: 'Base', conservador: 'Conservador' };

export const getCenarioLabel = (nome, index = 0) =>
  CENARIO_LABELS[nome] || nome || `Cenário ${index + 1}`;

/** Diferença de carga anual (híbrido − simples) do cenário base; negativa = economia do híbrido. */
export function getDiferencaCargaBase(comparativo) {
  const cenarios = comparativo?.cenarios || [];
  const base = cenarios.find((c) => c.nome === 'base') || cenarios[0];
  const diff = base?.diferencaCargaAnual;
  return diff === null || diff === undefined ? null : Number(diff);
}

/** Cliente pode vir populado (objeto) ou só o id. */
export function getClienteDisplay(diagnostico) {
  const cliente = diagnostico?.cliente || diagnostico?.clienteId;
  if (!cliente) return '—';
  if (typeof cliente === 'string') return cliente;
  return cliente.razaoSocial || cliente.nome || cliente.nomeFantasia || cliente._id || '—';
}

export function getClienteIdValue(diagnostico) {
  const cliente = diagnostico?.cliente || diagnostico?.clienteId;
  if (!cliente) return null;
  return typeof cliente === 'string' ? cliente : cliente._id || cliente.id || null;
}
