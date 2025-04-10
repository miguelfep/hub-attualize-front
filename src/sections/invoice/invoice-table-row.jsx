import { toast } from 'sonner';
import React, { useCallback } from 'react';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { enviarPedidoOrcamento } from 'src/actions/invoices';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function InvoiceTableRow({ row, selected, onSelectRow, onViewRow, onEditRow, onDeleteRow }) {
  const confirm = useBoolean();

  const handleSendWhatsapp = useCallback(async () => {
    try {
      const res = await enviarPedidoOrcamento(row._id);
      if (res.status === 200) {
        toast.success('Mensagem enviada com sucesso!');
      } else {
        const errorMessage = res.data.message || 'Erro ao enviar mensagem';
        toast.error(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao enviar mensagem';
      toast.error(`Erro: ${errorMessage}`);
    }
  }, [row._id]);

  const popover = usePopover();
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{ id: `row-checkbox-${row.id}`, 'aria-label': `Row checkbox` }}
          />
        </TableCell>

        <TableCell onClick={onViewRow} sx={{ cursor: 'pointer' }}>
          <Stack spacing={2} direction="row" alignItems="center">
            <Avatar alt={row.cliente.nome}>{row.cliente.nome.charAt(0).toUpperCase()}</Avatar>
            <ListItemText
              disableTypography
              primary={
                <Typography variant="body2" noWrap>
                  {row.cliente.nome}
                </Typography>
              }
              secondary={
                <Link noWrap variant="body2" sx={{ color: 'text.disabled' }}>
                  {row.invoiceNumber}
                </Link>
              }
            />
          </Stack>
        </TableCell>

        <TableCell onClick={onViewRow} sx={{ cursor: 'pointer' }}>
          <ListItemText
            primary={fDate(row.dataVencimento)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
          />
        </TableCell>

        <TableCell onClick={onViewRow} sx={{ cursor: 'pointer' }}>
          {fCurrency(row.total)}
        </TableCell>
        <TableCell onClick={onViewRow} sx={{ cursor: 'pointer' }}>
          {fCurrency(row.desconto)}
        </TableCell>

        <TableCell onClick={onViewRow} sx={{ cursor: 'pointer' }}>
          <Label
            variant="soft"
            color={
              (row.status === 'pago' && 'success') ||
              (row.status === 'aprovada' && 'secondary') ||
              (row.status === 'perdida' && 'error') ||
              'default'
            }
          >
            {row.status}
          </Label>
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
            onClick={() => {
              onViewRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:eye-bold" />
            Ver
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
          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem
            onClick={() => {
              handleSendWhatsapp();
              popover.onClose();
            }}
          >
            <Iconify icon="mdi:whatsapp" />
            Enviar Whatsapp
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Tem certeza que deseja deletar esse orçamento?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}
