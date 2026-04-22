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
