'use client';

import { toast } from 'sonner';
import { useState } from 'react';

import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';

import { updateBanner, deleteBanner } from 'src/actions/banners';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';


// ----------------------------------------------------------------------

export function BannerActionsMenu({ banner, onEdit, onChanged }) {
  const popover = usePopover();
  const confirmDelete = useState(false);

  const handleToggleAtivo = async () => {
    popover.onClose();
    try {
      await updateBanner(banner._id, { ativo: !banner.ativo });
      toast.success(banner.ativo ? 'Banner desativado.' : 'Banner ativado.');
      onChanged?.();
    } catch (e) {
      toast.error(e?.message || 'Erro ao alterar status.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBanner(banner._id);
      toast.success('Banner removido.');
      onChanged?.();
    } catch (e) {
      toast.error(e?.message || 'Erro ao remover banner.');
    }
  };

  return (
    <>
      <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              onEdit?.();
            }}
          >
            <Iconify icon="solar:pen-bold" /> Editar
          </MenuItem>

          <MenuItem onClick={handleToggleAtivo}>
            <Iconify
              icon={banner.ativo ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
            />
            {banner.ativo ? 'Desativar' : 'Ativar'}
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
              confirmDelete[1](true);
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" /> Excluir
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirmDelete[0]}
        onClose={() => confirmDelete[1](false)}
        title="Excluir banner?"
        content={`O banner "${banner?.titulo}" será removido permanentemente.`}
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Excluir
          </Button>
        }
      />
    </>
  );
}
