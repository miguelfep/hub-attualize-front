'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { alpha, useTheme } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function FolderTreeItem({ node, selectedId, onSelect }) {
  const theme = useTheme();
  const isSel = selectedId === node._id;
  const hasChildren = node.children?.length > 0;

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
  const roots = folders?.length ? folders.map((f) => f._id) : [];
  return (
    <SimpleTreeView defaultExpandedItems={defaultExpandedItems ?? roots} sx={{ width: '100%' }}>
      {folders?.map((node) => (
        <FolderTreeItem key={node._id} node={node} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </SimpleTreeView>
  );
}
