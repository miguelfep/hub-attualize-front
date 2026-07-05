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

const TIPO_GUIA_LABELS = {
  DAS: 'DAS',
  EXTRATO_PGDAS: 'Extrato PGDAS',
  EXTRATO_BANCARIO: 'Extrato bancário',
  DARF: 'DARF',
  ICMS: 'ICMS',
  ISS: 'ISS',
  PIS: 'PIS',
  COFINS: 'COFINS',
  IRPJ: 'IRPJ',
  CSLL: 'CSLL',
  CSRF: 'CSRF',
  PARCELAMENTO: 'Parcelamento',
  INSS: 'INSS',
  FGTS: 'FGTS',
  HOLERITE: 'Holerite',
  EXTRATO_FOLHA_PAGAMENTO: 'Extrato Folha',
  OUTROS: 'Outros',
  NAO_IDENTIFICADO: 'Não identificado',
};

export const getTipoGuiaLabel = (tipo) => TIPO_GUIA_LABELS[tipo] || tipo || '-';

/** Documento aguardando classificação manual no hub (não aparece no portal). */
export const STATUS_PROCESSAMENTO_REVISAO = 'revisao';

export const isGuiaEmRevisao = (guia) =>
  guia?.statusProcessamento === STATUS_PROCESSAMENTO_REVISAO;

/** Opções de tipo por categoria — usado no formulário de classificação da revisão. */
export const TIPOS_POR_CATEGORIA = {
  GUIA_FISCAL: [
    'DAS',
    'EXTRATO_PGDAS',
    'DARF',
    'ICMS',
    'ISS',
    'PIS',
    'COFINS',
    'IRPJ',
    'CSLL',
    'CSRF',
    'PARCELAMENTO',
  ],
  GUIA_DP: ['INSS', 'FGTS'],
  DOCUMENTO_DP: ['HOLERITE', 'EXTRATO_FOLHA_PAGAMENTO'],
};

export const CATEGORIA_LABELS_REVISAO = {
  GUIA_FISCAL: 'Guia fiscal',
  GUIA_DP: 'Guia DP',
  DOCUMENTO_DP: 'Documento DP',
};

/** Sugestão de competência salva pelo backend quando o documento entra em revisão. */
export const getCompetenciaSugerida = (guia) =>
  guia?.dadosExtraidos?.competenciaSugerida || getCompetencia(guia) || '';

const FORMATO_EXTRATO_LABELS = {
  pdf: 'PDF',
  ofx: 'OFX',
  xlsx: 'Excel',
  xls: 'Excel',
};

const EXT_POR_FORMATO = {
  pdf: '.pdf',
  ofx: '.ofx',
  xlsx: '.xlsx',
  xls: '.xls',
};

/** Nome final para download (resolve extensão de extratos antigos sem migração). */
export function resolveNomeDownloadGuia(guia) {
  const base = (guia?.nomeArquivo || 'documento').trim();
  if (/\.[a-z0-9]{2,5}$/i.test(base)) return base;

  const { formato, nomeOriginal } = guia?.dadosExtraidos || {};

  if (formato && formato !== 'outro' && EXT_POR_FORMATO[formato]) {
    return `${base}${EXT_POR_FORMATO[formato]}`;
  }

  const extOriginal = nomeOriginal?.match(/\.[a-z0-9]+$/i)?.[0];
  if (extOriginal) return `${base}${extOriginal}`;

  const extUrl = guia?.arquivoUrl?.match(/\.[a-z0-9]+$/i)?.[0];
  if (extUrl) return `${base}${extUrl}`;

  return `${base}.pdf`;
}

/** Tag de formato para extratos de conciliação (PDF/OFX etc.) */
export const getFormatoExtratoLabel = (guia) => {
  const formato = guia?.dadosExtraidos?.formato;
  if (!formato) return null;
  return FORMATO_EXTRATO_LABELS[formato] || String(formato).toUpperCase();
};

export const isExtratoBancario = (guia) =>
  guia?.tipoGuia === 'EXTRATO_BANCARIO' ||
  guia?.dadosExtraidos?.origem === 'conciliacao_extrato';

/** Slug de subpasta: minúsculas, números e hífens */
export const SLUG_PASTA_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function suggestSlugFromNome(nome) {
  if (!nome || typeof nome !== 'string') return 'pasta';
  const s = nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'pasta';
}

export function collectPastaTreeItemIds(nodes, acc = []) {
  if (!nodes?.length) return acc;
  nodes.forEach((n) => {
    acc.push(n._id);
    if (n.children?.length) {
      collectPastaTreeItemIds(n.children, acc);
    }
  });
  return acc;
}

export function findPastaNodeById(nodes, id) {
  if (!id || !nodes?.length) return null;
  const stack = [...nodes];
  while (stack.length) {
    const n = stack.shift();
    if (String(n._id) === String(id)) return n;
    if (n.children?.length) {
      stack.push(...n.children);
    }
  }
  return null;
}

/**
 * Caminho da raiz da árvore até a pasta com o id informado (inclusive), ou null.
 */
export function findPastaPathFromRoot(nodes, targetId, trail = []) {
  if (!targetId || !nodes?.length) return null;
  const list = nodes;
  for (let i = 0; i < list.length; i += 1) {
    const node = list[i];
    const nextTrail = [...trail, node];
    if (String(node._id) === String(targetId)) return nextTrail;
    if (node.children?.length) {
      const found = findPastaPathFromRoot(node.children, targetId, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Nome da pasta de primeiro nível sob a raiz (ex.: Fiscal, Contábil), não a folha (ex.: Março).
 * Usa a árvore carregada no admin; se não achar o nó, cai no nome do populate.
 */
const MESES_SLUG_PT = [
  'janeiro',
  'fevereiro',
  'marco',
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

const MESES_NOME_PT = [
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

/** AAAAMM (Serpro) → MM/AAAA */
export function periodoApuracaoToCompetencia(periodoApuracao) {
  const digits = String(periodoApuracao || '').replace(/\D/g, '');
  if (digits.length !== 6) return null;
  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);
  const monthNum = parseInt(month, 10);
  if (monthNum < 1 || monthNum > 12) return null;
  return `${month}/${year}`;
}

/** MM/AAAA → AAAAMM (Serpro) */
export function competenciaToPeriodoApuracao(competencia) {
  const match = String(competencia || '').match(/^(\d{2})\/(\d{4})$/);
  if (!match) return null;
  return `${match[2]}${match[1]}`;
}

/** Opções de mês numérico para competência (01–12). */
export const MESES_COMPETENCIA_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const value = String(i + 1).padStart(2, '0');
  return { value, label: value };
});

/** mes: "01".."12", ano: "2025" → "202501" (Serpro AAAAMM) */
export function buildPeriodoApuracaoSerpro(mes, ano) {
  const mm = String(mes || '')
    .replace(/\D/g, '')
    .padStart(2, '0');
  const yyyy = String(ano || '').replace(/\D/g, '');
  if (!/^(0[1-9]|1[0-2])$/.test(mm) || yyyy.length !== 4) return null;
  return `${yyyy}${mm}`;
}

/** dayjs → AAAAMMDD (campo dataConsolidacao da Serpro) */
export function buildDataConsolidacaoSerpro(date) {
  if (!date?.isValid?.()) return undefined;
  return date.format('YYYYMMDD');
}

/** mes + ano → "MM/AAAA" para exibição e resolução de pasta */
export function mesAnoToCompetenciaDisplay(mes, ano) {
  const periodo = buildPeriodoApuracaoSerpro(mes, ano);
  return periodo ? periodoApuracaoToCompetencia(periodo) : '';
}

/** Caminho legível da pasta destino da DAS (Fiscal > ano > mês). */
export function buildExpectedDasFolderLabels(competencia) {
  const match = String(competencia || '').match(/^(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const monthNum = parseInt(match[1], 10);
  const year = match[2];
  if (monthNum < 1 || monthNum > 12) return null;
  return {
    year,
    monthSlug: MESES_SLUG_PT[monthNum - 1],
    monthLabel: MESES_NOME_PT[monthNum - 1],
    pathLabels: ['Fiscal', year, MESES_NOME_PT[monthNum - 1]],
  };
}

function findChildFolder(nodes, slugOrNome) {
  if (!nodes?.length || !slugOrNome) return null;
  const key = String(slugOrNome).toLowerCase();
  return (
    nodes.find(
      (node) =>
        String(node.slug || '').toLowerCase() === key ||
        String(node.nome || '').toLowerCase() === key
    ) || null
  );
}

/**
 * Localiza a pasta folha esperada para DAS na árvore do cliente (se já existir).
 * Busca nova estrutura: fiscal → ano → mês
 * Fallback legado: fiscal → ano → impostos → mês
 */
export function findExpectedDasFolder(folders, competencia) {
  const meta = buildExpectedDasFolderLabels(competencia);
  if (!meta || !folders?.length) return null;

  const fiscal = findChildFolder(folders, 'fiscal');
  if (!fiscal) return null;

  const yearNode = findChildFolder(fiscal.children, meta.year);
  if (!yearNode) return { node: fiscal, path: ['Fiscal'], exists: false, meta };

  // Nova estrutura: fiscal → ano → mês
  const monthNode = findChildFolder(yearNode.children, meta.monthSlug);
  if (monthNode) {
    return {
      node: monthNode,
      path: meta.pathLabels,
      exists: true,
      meta,
    };
  }

  // Fallback legado: fiscal → ano → impostos → mês
  const impostos = findChildFolder(yearNode.children, 'impostos');
  if (impostos) {
    const monthLegado = findChildFolder(impostos.children, meta.monthSlug);
    if (monthLegado) {
      return {
        node: monthLegado,
        path: meta.pathLabels,
        exists: true,
        meta,
      };
    }
  }

  // Pasta não existe
  return { node: yearNode, path: ['Fiscal', meta.year], exists: false, meta };
}

export function getTopLevelPastaNome(foldersTree, folderRef) {
  const id =
    folderRef && typeof folderRef === 'object' ? folderRef._id || folderRef.id : folderRef;
  if (!id) return null;

  if (foldersTree?.length) {
    const path = findPastaPathFromRoot(foldersTree, id);
    if (path?.length) {
      return path[0].nome || null;
    }
  }

  if (folderRef && typeof folderRef === 'object' && folderRef.nome) {
    return folderRef.nome;
  }
  return null;
}
