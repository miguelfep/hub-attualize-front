import {
  Chip,
  Stack,
  Button,
  TableRow,
  TableCell,
  IconButton,
  Typography,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

const isActive = (v) => v === true || v === 'true' || v === 1;
const getRazaoSocial = (row) => row?.razaoSocial ?? row?.razaosocial ?? row?.razao_social ?? row?.RazaoSocial ?? '';

export function ClienteTableRow({ row, onEdit, onToggle, isToggling }) {
  return (
    <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.nome}</Typography>
          {!!getRazaoSocial(row) && (
            <Typography variant="body2" color="text.secondary">{getRazaoSocial(row)}</Typography>
          )}
        </Stack>
      </TableCell>
      <TableCell>{row.cpfCnpj}</TableCell>
      <TableCell>{row.email}</TableCell>
      <TableCell>{row.telefone}</TableCell>
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
        </Stack>
      </TableCell>
    </TableRow>
  );
}
