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

import { enviarPedidoOrcamento } from 'src/actions/invoices';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function AberturaTableRow({ row, selected, onSelectRow, onEditRow, onDeleteRow }) {
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

  const statusMap = {
    finalizado: { label: 'Finalizado', color: 'success' },
    kickoff: { label: 'Kickoff', color: 'success' },
    onboarding: { label: 'Onboarding', color: 'warning' },
    em_validacao: { label: 'Validação', color: 'primary' },
    em_constituicao: { label: 'Em Constituição', color: 'secondary' },
    iniciado: { label: 'Iniciado', color: 'warning' },
  };
  

  const popover = usePopover();
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{ id: `row-checkbox-${row._id}`, 'aria-label': `Row checkbox` }}
          />
        </TableCell>

        <TableCell>
          <Stack spacing={2} direction="row" alignItems="center">
            <Avatar alt={row.nome}>{row.nome.charAt(0).toUpperCase()}</Avatar>
            <ListItemText
              disableTypography
              primary={
                <Typography variant="body2" noWrap>
                  {row.nome}
                </Typography>
              }
              secondary={
                <Link
                  noWrap
                  variant="body2"
                  onClick={onEditRow}
                  sx={{ color: 'text.disabled', cursor: 'pointer' }}
                >
                  {row.nomeEmpresarial}
                </Link>
              }
            />
          </Stack>
        </TableCell>

        <TableCell>
          <ListItemText
            primary={row.email}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
          />
        </TableCell>

        <TableCell>
        <Label
            variant="soft"
            color={statusMap[row.statusAbertura]?.color || 'default'}
          >
            {statusMap[row.statusAbertura]?.label || 'Desconhecido'}
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
          {/* <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:eye-bold" />
            Ver
          </MenuItem> */}

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
        content="Tem certeza que deseja deletar essa abertura?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Deletar
          </Button>
        }
      />
    </>
  );
}
