import {
  Chip,
  Stack,
  Button,
  TableRow,
  TableCell,
  IconButton,
  Typography,
} from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

const isActive = (v) => v === true || v === 'true' || v === 1;

export function ServicoTableRow({ row, onEdit, onToggle, onDelete, isToggling }) {
  return (
    <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.nome}</Typography>
      </TableCell>
      <TableCell>{row.categoria}</TableCell>
      <TableCell>{fCurrency(row.valor)}</TableCell>
      <TableCell>{row.unidade}</TableCell>
      <TableCell>
        <Chip
          label={isActive(row.status) ? 'Ativo' : 'Inativo'}
          color={isActive(row.status) ? 'success' : 'default'}
          size="small"
          variant="soft"
        />
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <IconButton color="primary" onClick={onEdit}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <Button
            size="small"
            variant="outlined"
            color={isActive(row.status) ? 'warning' : 'success'}
            disabled={isToggling}
            onClick={onToggle}
            sx={{ minWidth: 80 }}
          >
            {isActive(row.status) ? 'Inativar' : 'Ativar'}
          </Button>
          <IconButton color="error" onClick={onDelete}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
