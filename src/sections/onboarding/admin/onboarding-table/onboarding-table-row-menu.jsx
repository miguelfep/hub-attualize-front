'use client';

import { useCallback } from 'react';

import { ListItemIcon, ListItemText, MenuItem, MenuList } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function OnboardingTableRowMenu({ onEdit, onDelete, open, onClose, anchorEl }) {
  const handleEdit = useCallback(() => {
    onEdit?.();
    onClose?.();
  }, [onEdit, onClose]);

  const handleDelete = useCallback(() => {
    onDelete?.();
    onClose?.();
  }, [onDelete, onClose]);

  return (
    <CustomPopover
      open={!!open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Iconify icon="solar:pen-bold" />
          </ListItemIcon>
          <ListItemText primary="Editar" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </ListItemIcon>
          <ListItemText primary="Deletar" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );
}

