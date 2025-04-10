import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import { yellow } from '@mui/material/colors';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { ClienteQuickEditForm } from './cliente-quick-edit-form';

// ----------------------------------------------------------------------

export function ClienteTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onActivateRow,
  onUpdate,
}) {
  const confirm = useBoolean();

  const popover = usePopover();

  const quickEdit = useBoolean();

  const handleAction = () => {
    if (row.status) {
      // Caso esteja ativo, inativar o cliente
      onDeleteRow();
    } else {
      // Caso esteja inativo, ativar o cliente
      onActivateRow();
    }
    confirm.onFalse();
  };

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell padding="checkbox">
          <Checkbox id={row.id} checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.codigo}</TableCell>

        <TableCell>
          <Stack spacing={2} direction="row" alignItems="center">
            <Avatar alt={row.nome} src={row.avatarUrl} />

            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Link color="inherit" onClick={onEditRow} sx={{ cursor: 'pointer' }}>
                {row.nome}
                {row.clienteVip && (
                  <Iconify
                    icon="mdi:star" // Ícone de estrela VIP
                    width={20}
                    height={20}
                    style={{ color: yellow[700] }} // Cor amarela
                  />
                )}
              </Link>
              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row.email}
              </Box>
            </Stack>
          </Stack>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.razaoSocial}</TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={(row.status === true && 'success') || (row.status === false && 'warning')}
          >
            {(row.status === true && 'Ativo') || (row.status === false && 'Inativo')}
          </Label>
        </TableCell>
        <TableCell>
          <Stack direction="row" alignItems="center">
            <Tooltip title="Edição Rápida" placement="top" arrow>
              <IconButton
                color={quickEdit.value ? 'inherit' : 'default'}
                onClick={quickEdit.onTrue}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>

            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      <ClienteQuickEditForm
        currentUser={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        onUpdate={onUpdate}
      />

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: row.status ? 'warning.main' : 'success.main' }} // Muda a cor conforme o status
          >
            <Iconify icon={row.status ? 'lets-icons:remove-duotone' : 'solar:tick-bold'} />
            {row.status ? 'Inativar' : 'Ativar'}
          </MenuItem>

          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={row.status ? 'Inativar' : 'Ativar'}
        content={`Tem certeza que deseja ${row.status ? 'inativar' : 'ativar'} esse cliente?`}
        action={
          <Button
            variant="contained"
            color={row.status ? 'warning' : 'success'}
            onClick={handleAction}
          >
            {row.status ? 'Inativar' : 'Ativar'}
          </Button>
        }
      />
    </>
  );
}
