import {
  Chip,
  Divider,
  TableRow,
  MenuItem,
  MenuList,
  TableCell,
  IconButton,
  Typography,
} from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

const isActive = (v) => v === true || v === 'true' || v === 1;

export function ServicoTableRow({ row, onEdit, onToggle, onDelete, isToggling }) {

  const popover = usePopover();

  const handleEdit = () => {
    popover.onClose();
    onEdit();
  };

  return (
    <>
    <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.nome}</Typography>
      </TableCell>
      <TableCell sx={{ width: 300 }} align='center'>{row.categoria || '-'}</TableCell>
      <TableCell sx={{ width: 300 }} align='center'>{fCurrency(row.valor)}</TableCell>
      <TableCell sx={{ width: 300 }} align='center'>{row.unidade}</TableCell>
      <TableCell sx={{ width: 300 }} align='center'>
        <Chip
          label={isActive(row.status) ? 'Ativo' : 'Inativo'}
          color={isActive(row.status) ? 'success' : 'default'}
          size="small"
          variant="soft"
        />
      </TableCell>
      <TableCell align="right" sx={{ px: 1 }}>
        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
    <CustomPopover
      open={popover.open}
      anchorEl={popover.anchorEl}
      onClose={popover.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem 
          onClick={handleEdit}
        >
          <Iconify icon="eva:edit-fill" />
            Editar
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem 
          onClick={onDelete} 
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-fill" />
            Excluir
        </MenuItem>
      </MenuList>
    </CustomPopover>
  </>
);
}
