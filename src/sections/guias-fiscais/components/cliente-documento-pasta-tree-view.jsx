'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { alpha, useTheme } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const ROOT_ORDER = ['fiscal', 'departamento-pessoal', 'contabil', 'societario'];

const MONTH_INDEX_BY_TEXT = {
  janeiro: 1,
  fevereiro: 2,
  marco: 3,
  março: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};

function normalizeText(v) {
  return (v || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function getMonthOrder(node) {
  const slug = normalizeText(node?.slug);
  const nome = normalizeText(node?.nome);
  if (/^\d{1,2}$/.test(slug)) {
    const n = parseInt(slug, 10);
    return n >= 1 && n <= 12 ? n : null;
  }
  if (MONTH_INDEX_BY_TEXT[slug]) return MONTH_INDEX_BY_TEXT[slug];
  if (MONTH_INDEX_BY_TEXT[nome]) return MONTH_INDEX_BY_TEXT[nome];
  return null;
}

function getRootIcon(slug) {
  switch (slug) {
    case 'fiscal':
      return 'solar:document-text-bold-duotone';
    case 'departamento-pessoal':
      return 'solar:users-group-rounded-bold-duotone';
    case 'contabil':
      return 'solar:calculator-bold-duotone';
    case 'societario':
      return 'solar:buildings-2-bold-duotone';
    default:
      return 'solar:folder-favourite-bookmark-bold-duotone';
  }
}

function getNodeFileCount(node) {
  if (!node || typeof node !== 'object') return 0;
  const candidates = [
    node.totalArquivos,
    node.totalDocumentos,
    node.arquivosCount,
    node.documentosCount,
    node.count,
  ];
  for (let i = 0; i < candidates.length; i += 1) {
    const n = Number(candidates[i]);
    if (Number.isFinite(n) && n >= 0) {
      return n;
    }
  }

  // Fallback: quando a API não envia total do nó, usa soma dos filhos.
  const children = Array.isArray(node.children) ? node.children : [];
  if (!children.length) return 0;
  return children.reduce((acc, child) => acc + getNodeFileCount(child), 0);
}

function collectSubtreeItemIds(node) {
  if (!node?._id) return [];
  const out = [node._id];
  (node.children || []).forEach((ch) => {
    out.push(...collectSubtreeItemIds(ch));
  });
  return out;
}

function sortFolders(nodes = [], depth = 0) {
  const sorted = [...nodes].sort((a, b) => {
    if (depth === 0) {
      const ai = ROOT_ORDER.indexOf(normalizeText(a.slug));
      const bi = ROOT_ORDER.indexOf(normalizeText(b.slug));
      if (ai !== -1 || bi !== -1) {
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        if (ai !== bi) return ai - bi;
      }
    }

    const aMonth = getMonthOrder(a);
    const bMonth = getMonthOrder(b);
    if (aMonth && bMonth && aMonth !== bMonth) {
      return aMonth - bMonth;
    }

    const aYear = /^\d{4}$/.test(normalizeText(a.slug)) ? parseInt(a.slug, 10) : null;
    const bYear = /^\d{4}$/.test(normalizeText(b.slug)) ? parseInt(b.slug, 10) : null;
    if (aYear && bYear && aYear !== bYear) {
      return bYear - aYear;
    }

    return (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' });
  });

  return sorted.map((n) => ({
    ...n,
    children: n.children?.length ? sortFolders(n.children, depth + 1) : [],
  }));
}

function FolderTreeItem({ node, selectedId, onSelect }) {
  const theme = useTheme();
  const isSel = selectedId === node._id;
  const hasChildren = node.children?.length > 0;
  const fileCount = getNodeFileCount(node);

  return (
    <TreeItem
      itemId={node._id}
      label={
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node._id);
          }}
          sx={{
            py: 0.5,
            px: 0.5,
            mx: -0.5,
            borderRadius: 1,
            bgcolor: isSel ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
            cursor: 'pointer',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ pr: 1 }}>
            <Iconify
              width={18}
              icon={hasChildren ? 'solar:folder-bold-duotone' : 'solar:folder-2-bold-duotone'}
            />
            <Typography variant="body2" noWrap title={node.nome}>
              {node.nome}
            </Typography>
            {fileCount > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontWeight: 700 }}>
                ({fileCount})
              </Typography>
            )}
          </Stack>
        </Box>
      }
    >
      {hasChildren
        ? node.children.map((ch) => (
            <FolderTreeItem key={ch._id} node={ch} selectedId={selectedId} onSelect={onSelect} />
          ))
        : null}
    </TreeItem>
  );
}

export function ClienteDocumentoPastaTreeView({ folders, selectedId, onSelect, defaultExpandedItems }) {
  const theme = useTheme();
  const sortedFolders = useMemo(() => sortFolders(folders || []), [folders]);
  const roots = useMemo(
    () => (sortedFolders?.length ? sortedFolders.map((f) => f._id) : []),
    [sortedFolders]
  );
  const initialExpanded = useMemo(() => defaultExpandedItems ?? roots, [defaultExpandedItems, roots]);
  const [expandedItems, setExpandedItems] = useState(initialExpanded);

  useEffect(() => {
    setExpandedItems(initialExpanded);
  }, [initialExpanded]);

  const handleExpandedForRoot = useCallback((rootNode) => (event, newIds) => {
    const allowed = new Set(collectSubtreeItemIds(rootNode));
    setExpandedItems((prev) => {
      const stripped = prev.filter((id) => !allowed.has(id));
      const merged = [...stripped, ...newIds.filter((id) => allowed.has(id))];
      return merged;
    });
  }, []);

  if (!sortedFolders?.length) {
    return null;
  }

  return (
    <Stack spacing={1.5} sx={{ width: '100%' }}>
      {sortedFolders.map((rootNode) => {
        const subtreeIds = new Set(collectSubtreeItemIds(rootNode));
        const rootFileCount = getNodeFileCount(rootNode);
        const expandedForTree = expandedItems.filter(
          (id) => subtreeIds.has(id) && id !== rootNode._id
        );
        const selectedForTree =
          selectedId && subtreeIds.has(selectedId) && selectedId !== rootNode._id
            ? [selectedId]
            : [];

        return (
          <Box
            key={rootNode._id}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              overflow: 'hidden',
              boxShadow: selectedId === rootNode._id ? 3 : 0,
              transition: 'all 0.2s ease',
            }}
          >
            <Box
              role="button"
              tabIndex={0}
              onClick={() => onSelect(rootNode._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(rootNode._id);
                }
              }}
              sx={{
                px: 1.25,
                py: 0.75,
                borderBottom: rootNode.children?.length ? 1 : 0,
                borderColor: 'divider',
                bgcolor:
                  selectedId === rootNode._id
                    ? alpha(theme.palette.primary.main, 0.12)
                    : alpha(theme.palette.primary.main, 0.03),
                cursor: 'pointer',
                '&:hover': {
                  bgcolor:
                    selectedId === rootNode._id
                      ? alpha(theme.palette.primary.main, 0.16)
                      : alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                Pasta principal — clique para ver documentos nesta pasta
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.25 }}>
                <Iconify
                  icon={getRootIcon(normalizeText(rootNode.slug))}
                  width={18}
                  sx={{ color: selectedId === rootNode._id ? 'primary.main' : 'text.secondary' }}
                />
                <Typography variant="subtitle2" fontWeight={700} noWrap title={rootNode.nome}>
                  {rootNode.nome}
                </Typography>
                {rootFileCount > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontWeight: 700 }}>
                    ({rootFileCount})
                  </Typography>
                )}
                {rootNode.children?.length > 0 && (
                  <Chip
                    size="small"
                    label={`${rootNode.children.length} subpasta${rootNode.children.length > 1 ? 's' : ''}`}
                    variant="outlined"
                    sx={{ ml: 'auto', height: 22 }}
                  />
                )}
              </Stack>
            </Box>
            <Box sx={{ px: 0.5, py: 0.75 }}>
              {rootNode.children?.length ? (
                <SimpleTreeView
                  expandedItems={expandedForTree}
                  selectedItems={selectedForTree}
                  onExpandedItemsChange={handleExpandedForRoot(rootNode)}
                  sx={{
                    width: '100%',
                    '& .MuiTreeItem-groupTransition': {
                      marginLeft: 0.5,
                      paddingLeft: 1.5,
                      borderLeft: '2px solid',
                      borderLeftColor: 'divider',
                    },
                  }}
                >
                  {rootNode.children.map((ch) => (
                    <FolderTreeItem key={ch._id} node={ch} selectedId={selectedId} onSelect={onSelect} />
                  ))}
                </SimpleTreeView>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 1, px: 1 }}>
                  Nenhuma subpasta. Use o cabeçalho acima para listar os documentos desta pasta.
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
