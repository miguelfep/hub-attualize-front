'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const getTipoAcessoLabel = (tipoAcesso) => {
  const tipoMap = {
    gratuito: 'Gratuito',
    exclusivo_cliente: 'Exclusivo Cliente',
    pago: 'Pago',
  };
  return tipoMap[tipoAcesso] || tipoAcesso;
};

const getTipoAcessoColor = (tipoAcesso) => {
  const colorMap = {
    gratuito: 'success',
    exclusivo_cliente: 'info',
    pago: 'warning',
  };
  return colorMap[tipoAcesso] || 'default';
};

const getStatusLabel = (status) => {
  const statusMap = {
    ativo: 'Ativo',
    inativo: 'Inativo',
    rascunho: 'Rascunho',
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    ativo: 'success',
    inativo: 'error',
    rascunho: 'warning',
  };
  return colorMap[status] || 'default';
};

// ----------------------------------------------------------------------

export function CursoTableRow({ row, selected, onSelectRow, onViewRow, onEditRow, onDeleteRow }) {
  const popover = usePopover();

  return (
    <>
    <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="subtitle2" noWrap>
              {row.titulo}
            </Typography>
            {row.descricao && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {row.descricao.substring(0, 50)}
                {row.descricao.length > 50 ? '...' : ''}
              </Typography>
            )}
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={getTipoAcessoColor(row.tipoAcesso)}>
          {getTipoAcessoLabel(row.tipoAcesso)}
        </Label>
      </TableCell>

      <TableCell>
        {row.tipoAcesso === 'pago' ? (
          <Typography variant="body2">{fCurrency(row.preco)}</Typography>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            -
          </Typography>
        )}
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2">{row.materiais?.length || 0} materiais</Typography>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={getStatusColor(row.status)}>
          {getStatusLabel(row.status)}
        </Label>
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2">{row.visualizacoes || 0}</Typography>
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2">{row.inscricoes || 0}</Typography>
      </TableCell>

      <TableCell align="right">
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
            popover.onClose();
            onViewRow(row._id);
          }}
        >
          <Iconify icon="eva:eye-fill" sx={{ mr: 1 }} />
          Visualizar
        </MenuItem>
        <MenuItem
          onClick={() => {
            popover.onClose();
            onEditRow(row._id);
          }}
        >
          <Iconify icon="eva:edit-fill" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            popover.onClose();
            onDeleteRow(row._id);
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-fill" sx={{ mr: 1 }} />
          Deletar
        </MenuItem>
      </MenuList>
    </CustomPopover>
    </>
  );
}
