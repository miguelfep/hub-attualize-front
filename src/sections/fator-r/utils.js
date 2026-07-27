/**
 * Rótulos e cores do Fator R.
 *
 * O limiar de 28% é um penhasco, não um gradiente: a cor precisa deixar a
 * distância até ele legível de relance, sem o usuário ter que ler o número.
 */

export const LIMIAR_FATOR_R = 0.28;

export const RISCO_OPTIONS = [
  { value: 'abaixo', label: 'Abaixo de 28%', color: 'error' },
  { value: 'zona_risco', label: 'Zona de risco', color: 'warning' },
  { value: 'confortavel', label: 'Confortável', color: 'success' },
  { value: 'sem_dados', label: 'Sem dados', color: 'default' },
];

export function riscoLabel(risco) {
  return RISCO_OPTIONS.find((o) => o.value === risco)?.label ?? risco ?? '—';
}

export function riscoColor(risco) {
  return RISCO_OPTIONS.find((o) => o.value === risco)?.color ?? 'default';
}

export function anexoLabel(anexo) {
  if (anexo === 'anexo3') return 'Anexo III';
  if (anexo === 'anexo5') return 'Anexo V';
  return anexo ?? '—';
}

/** Anexo III é o desfecho barato; Anexo V é o que se quer evitar. */
export function anexoColor(anexo) {
  if (anexo === 'anexo3') return 'success';
  if (anexo === 'anexo5') return 'error';
  return 'default';
}

/**
 * Origem da folha. A ordem aqui é a precedência do backend (ADR-005):
 * manual > documento > cadastro > pgdas. A da receita é DIFERENTE — ver abaixo.
 */
export const ORIGEM_FOLHA_LABELS = {
  manual: 'Lançamento manual',
  documento: 'Extraído de documento',
  cadastro: 'Calculado do cadastro',
  pgdas: 'Declarado no PGDAS-D',
};

/** No faturamento o declarado à RFB prevalece, ordem oposta à da folha. */
export const ORIGEM_FATURAMENTO_LABELS = {
  pgdas: 'Declarado no PGDAS-D',
  manual: 'Lançamento manual',
  notas: 'Somado das notas',
};

/** Manual é a fonte que um humano vouchou — merece destaque diferente. */
export function origemColor(origem) {
  if (origem === 'manual') return 'primary';
  if (origem === 'pgdas') return 'info';
  return 'default';
}

export const STATUS_APURACAO_OPTIONS = [
  { value: 'rascunho', label: 'Rascunho', color: 'default' },
  { value: 'revisada', label: 'Aprovada', color: 'info' },
  { value: 'transmitida', label: 'Transmitida', color: 'success' },
  { value: 'erro', label: 'Erro', color: 'error' },
];

export function statusApuracaoLabel(status) {
  return STATUS_APURACAO_OPTIONS.find((o) => o.value === status)?.label ?? status ?? '—';
}

export function statusApuracaoColor(status) {
  return STATUS_APURACAO_OPTIONS.find((o) => o.value === status)?.color ?? 'default';
}

/** 'MM/AAAA' a partir de ano e mês numéricos. */
export function competenciaLabel(ano, mes) {
  if (!ano || !mes) return '—';
  return `${String(mes).padStart(2, '0')}/${ano}`;
}

/**
 * O Fator R vem em decimal (0.2814). `fPercent` do projeto divide por 100, então
 * o valor precisa ser multiplicado antes. Null vira travessão — nunca 0%, que
 * seria lido como "a empresa não tem folha".
 */
export function fatorRPercent(fatorR) {
  if (fatorR === null || fatorR === undefined) return '—';
  return `${(fatorR * 100).toFixed(1).replace('.', ',')}%`;
}

/** Distância até o limiar, em pontos percentuais. Negativo = já caiu. */
export function distanciaDoLimiar(fatorR) {
  if (fatorR === null || fatorR === undefined) return null;
  return (fatorR - LIMIAR_FATOR_R) * 100;
}

export const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

/** Competência corrente em BRT — mesmo default que o backend aplica. */
export function competenciaAtual() {
  const agora = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return { ano: agora.getUTCFullYear(), mes: agora.getUTCMonth() + 1 };
}

export function anosDisponiveis(quantidade = 5) {
  const { ano } = competenciaAtual();
  return Array.from({ length: quantidade }, (_, i) => ano - i);
}

export const apiErrMsg = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;
