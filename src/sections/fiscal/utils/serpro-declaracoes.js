import dayjs from 'dayjs';

import { formatCompetencia, periodoApuracaoToCompetencia } from 'src/sections/guias-fiscais/utils';

// ----------------------------------------------------------------------

export function formatSerproDateTime(value) {
  if (value == null || value === '') return null;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 14) {
    const parsed = dayjs(digits, 'YYYYMMDDHHmmss', true);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : null;
  }
  if (digits.length === 8) {
    const parsed = dayjs(digits, 'YYYYMMDD', true);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : null;
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : null;
}

function periodoApuracaoToMesAno(periodoApuracao) {
  const digits = String(periodoApuracao || '').replace(/\D/g, '');
  if (digits.length !== 6) return { mes: '', ano: '' };
  return { ano: digits.slice(0, 4), mes: digits.slice(4, 6) };
}

function mapOperacao(op, periodoApuracao, index, ultimaEmissao) {
  const { mes, ano } = periodoApuracaoToMesAno(periodoApuracao);
  const competencia = periodoApuracaoToCompetencia(periodoApuracao) || '';
  const tipoOperacao = op?.tipoOperacao || 'Operação';
  const isDas = /das/i.test(tipoOperacao);
  const dec = op?.indiceDeclaracao || null;
  const das = op?.indiceDas || null;

  const detailParts = [];
  if (dec?.numeroDeclaracao) detailParts.push(`Declaração ${dec.numeroDeclaracao}`);
  if (dec?.dataHoraTransmissao) {
    const dt = formatSerproDateTime(dec.dataHoraTransmissao);
    if (dt) detailParts.push(`Transmitida em ${dt}`);
  }
  if (das?.numeroDas) detailParts.push(`DAS ${das.numeroDas}`);
  if (das?.dataHoraEmissaoDas) {
    const dt = formatSerproDateTime(das.dataHoraEmissaoDas);
    if (dt) detailParts.push(`Emitida em ${dt}`);
  } else if (das?.datahoraEmissaoDas) {
    const dt = formatSerproDateTime(das.datahoraEmissaoDas);
    if (dt) detailParts.push(`Emitida em ${dt}`);
  }

  return {
    id: `${periodoApuracao}-${index}-${tipoOperacao}`.replace(/\s+/g, '-'),
    periodoApuracao: String(periodoApuracao || ''),
    competencia,
    competenciaLabel: formatCompetencia(competencia),
    mes,
    ano,
    tipoOperacao,
    isDas,
    numeroDeclaracao: dec?.numeroDeclaracao || null,
    malha: dec?.malha || null,
    numeroDas: das?.numeroDas || null,
    dasPago: typeof das?.dasPago === 'boolean' ? das.dasPago : null,
    detail: detailParts.join(' · '),
    canEmitDas: Boolean(mes && ano),
    ultimaEmissao: ultimaEmissao || null,
  };
}

function flattenPeriodo(periodo, rows, ultimaEmissaoMap = {}) {
  if (!periodo || typeof periodo !== 'object') return;
  const pa = periodo.periodoApuracao ?? '';
  const operacoes = Array.isArray(periodo.operacoes) ? periodo.operacoes : [];
  if (!operacoes.length) return;

  const ultimaEmissao = ultimaEmissaoMap[String(pa)] || null;
  const mapped = operacoes.map((op, index) => mapOperacao(op, pa, index, ultimaEmissao));

  const lastIndex = mapped.length - 1;
  const lastRow = mapped[lastIndex];
  const hasMesAno = Boolean(lastRow.mes && lastRow.ano);

  // Vencimento DAS: dia 20 do mês seguinte à competência (Simples Nacional)
  const { mes, ano } = periodoApuracaoToMesAno(pa);
  const mesNum = parseInt(mes, 10);
  const anoNum = parseInt(ano, 10);
  const dataVencimento = new Date(anoNum, mesNum, 20);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencida = dataVencimento < hoje;

  const ultimaNaoPagaVencida = lastRow.dasPago !== true && vencida;

  mapped.forEach((row, index) => {
    row.canEmitDas = index === lastIndex && ultimaNaoPagaVencida && hasMesAno;
    rows.push(row);
  });
}

/**
 * Normaliza o payload da API (CONSDECLARACAO13) em linhas flat para a UI.
 * @param {object} payload - res.data da consulta
 * @returns {Array}
 */
export function parseSerproDeclaracoesPayload(payload, ultimaEmissaoMap = {}) {
  const root = payload?.declaracoes ?? payload;
  const dados = root?.dados ?? root;
  if (!dados || typeof dados !== 'object') return [];

  const rows = [];

  if (Array.isArray(dados.periodos)) {
    dados.periodos.forEach((periodo) => flattenPeriodo(periodo, rows, ultimaEmissaoMap));
  }

  if (dados.periodo && typeof dados.periodo === 'object') {
    flattenPeriodo(dados.periodo, rows, ultimaEmissaoMap);
  }

  return rows;
}

/**
 * Agrupa linhas por período de apuração (útil na consulta anual).
 * @param {Array} rows
 * @returns {Array<{ periodoApuracao: string, competenciaLabel: string, items: Array }>}
 */
export function groupOperacoesByPeriodo(rows) {
  const map = new Map();
  rows.forEach((row) => {
    const key = row.periodoApuracao || 'sem-periodo';
    if (!map.has(key)) {
      map.set(key, {
        periodoApuracao: key,
        competenciaLabel: row.competenciaLabel || key,
        items: [],
      });
    }
    map.get(key).items.push(row);
  });
  return Array.from(map.values()).sort((a, b) =>
    String(a.periodoApuracao).localeCompare(String(b.periodoApuracao))
  );
}

export function getDasPagoChipProps(dasPago) {
  if (dasPago === true) {
    return { label: 'DAS pago', color: 'success' };
  }
  if (dasPago === false) {
    return { label: 'DAS em aberto', color: 'warning' };
  }
  return null;
}

export function getMalhaChipProps(malha) {
  if (!malha) return null;
  const normalized = String(malha).toLowerCase();
  let color = 'default';
  if (normalized.includes('liberada') || normalized.includes('aceita')) color = 'success';
  else if (normalized.includes('retida') || normalized.includes('rejeitada')) color = 'error';
  else if (normalized.includes('intimada')) color = 'warning';
  return { label: malha, color };
}

export function getOperacaoIcon(tipoOperacao, isDas) {
  if (isDas) return 'solar:bill-list-bold-duotone';
  if (/retific/i.test(tipoOperacao)) return 'solar:pen-new-square-bold-duotone';
  return 'solar:document-text-bold-duotone';
}
