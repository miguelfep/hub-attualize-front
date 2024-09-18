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
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function ContratoTableRow({
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

  const isActive = row.status === 'ativo'; // Verifica se o contrato está ativo

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell padding="checkbox">
          <Checkbox id={row._id} checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell>
          <Stack spacing={2} direction="row" alignItems="center">
            <Avatar alt={row.cliente.razaoSocial} src={row.titulo} />

            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Link color="inherit" onClick={onEditRow} sx={{ cursor: 'pointer' }}>
                {row.cliente.razaoSocial}
              </Link>
              <Box component="span" sx={{ color: 'text.disabled' }}>
                {row.titulo}
              </Box>
            </Stack>
          </Stack>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.tipoContrato}</TableCell>
        <TableCell>
          <Label variant="soft" color={isActive ? 'success' : 'warning'}>
            {isActive ? 'Ativo' : 'Encerrado'}
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

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              confirm.onTrue(); // Abre a confirmação de ativação ou encerramento
              popover.onClose();
            }}
            sx={{ color: isActive ? 'warning.main' : 'success.main' }}
          >
            <Iconify icon={isActive ? 'lets-icons:remove-duotone' : 'solar:check-circle-bold'} />
            {isActive ? 'Encerrar' : 'Ativar'}
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
        title={isActive ? 'Encerrar' : 'Ativar'}
        content={`Tem certeza que deseja ${isActive ? 'Encerrar' : 'Ativar'} esse contrato?`}
        action={
          <Button
            variant="contained"
            color={isActive ? 'warning' : 'success'}
            onClick={isActive ? onDeleteRow : onActivateRow} // Verifica se deve ativar ou encerrar
          >
            {isActive ? 'Encerrar' : 'Ativar'}
          </Button>
        }
      />
    </>
  );
}
