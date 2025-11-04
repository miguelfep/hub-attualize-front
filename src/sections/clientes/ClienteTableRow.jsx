import {
  Chip,
  Stack,
  TableRow,
  MenuList,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

const isActive = (v) => v === true || v === 'true' || v === 1;
const getRazaoSocial = (row) => row?.razaoSocial ?? row?.razaosocial ?? row?.razao_social ?? row?.RazaoSocial ?? '';

export function ClienteTableRow({ row, onEdit, onToggle, isToggling }) {

  const popover = usePopover();

  const handleEdit = () => {
    popover.onClose();
    onEdit();
  };

  const handleToggle = () => {
    popover.onClose();
    onToggle();
  };

  return (
    <>
    <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell sx={{ width: 300 }} align='left'>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.nome}</Typography>
          {!!getRazaoSocial(row) && (
            <Typography variant="body2" color="text.secondary">{getRazaoSocial(row)}</Typography>
          )}
        </Stack>
      </TableCell>
      <TableCell sx={{ width: 300 }} align='center'>{row.cpfCnpj}</TableCell>
      <TableCell sx={{ width: 300 }} align='center'>{row.email}</TableCell>
      <TableCell sx={{ width: 300 }} align='center'>{row.telefone || '-'}</TableCell>
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
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>

          <MenuItem
            onClick={handleToggle}
            sx={{
              color: isActive(row.status) ? 'warning.main' : 'success.main',
            }}
          >
            <Iconify icon={isActive(row.status) ? 'fe:disabled' : 'fe:check-circle'} />
            {isActive(row.status) ? 'Inativar' : 'Ativar'}
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}