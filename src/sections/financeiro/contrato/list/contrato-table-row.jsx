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
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { getReajusteInfo } from '../contrato-reajuste-utils';

// ----------------------------------------------------------------------

export function ContratoTableRow({
  row,
  pendente,
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

  const reajuste = getReajusteInfo(row);
  const valorPendente = pendente?.valor ?? 0;

  const reajusteTooltip = (() => {
    if (reajuste.category === 'desabilitado') return 'Reajuste anual não habilitado';
    if (!reajuste.proximaData) return 'Sem data de referência para reajuste';
    if (reajuste.category === 'vencido') {
      return `Elegível desde ${fDate(reajuste.proximaData)} (${Math.abs(reajuste.diasRestantes)} dias)`;
    }
    return `Próximo reajuste em ${fDate(reajuste.proximaData)} (${reajuste.diasRestantes} dias)`;
  })();

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

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fCurrency(row.valorMensalidade)}</TableCell>

        <TableCell>
          <Tooltip title={reajusteTooltip} arrow>
            <span>
              <Label variant="soft" color={reajuste.color}>
                {reajuste.label}
              </Label>
            </span>
          </Tooltip>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {valorPendente > 0 ? (
            <Tooltip title={`${pendente.count} cobrança(s) vencida(s)/expirada(s)`} arrow>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                {fCurrency(valorPendente)}
              </Typography>
            </Tooltip>
          ) : (
            <Box component="span" sx={{ color: 'text.disabled' }}>
              —
            </Box>
          )}
        </TableCell>

        <TableCell>
          <Label variant="soft" color={isActive ? 'success' : 'warning'}>
            {isActive ? 'Ativo' : 'Encerrado'}
          </Label>
        </TableCell>
        <TableCell>
          <Stack direction="row" alignItems="center">
            

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
