import { toast } from 'sonner';

import {
  Chip,
  Stack,
  Button,
  Tooltip,
  TableRow,
  TableCell,
  IconButton,
  Typography,
} from '@mui/material';

import { abrirPdfNota } from 'src/actions/notafiscal';

import { Iconify } from 'src/components/iconify';

const getStatusColor = (status) => {
  const map = { pago: 'success', aprovado: 'info', recusado: 'error', pendente: 'warning' };
  return map[status] || 'default';
};

export function VendasTableRow({ row, onEdit }) {
  return (
    <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Button
          href={`./${row._id}`}
          variant="text"
          sx={{ px: 0, pl: 1, minWidth: 0, fontWeight: 600 }}
        >
          {row.numero}
        </Button>
      </TableCell>
      <TableCell>
        <Typography variant="body2" noWrap sx={{ maxWidth: 360 }}>
          {row?.clienteDoClienteId?.nome}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip size="small" label={row.status} color={getStatusColor(row.status)} />
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {row?.dataValidade ? new Date(row.dataValidade).toLocaleDateString() : '-'}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Ver / Editar Venda">
            <IconButton onClick={onEdit} size="small" color="primary">
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          {row?.notaFiscalId?.linkNota && row.notaFiscalId.linkNota !== 'Processando...' && (
            <Tooltip title="Ver NFSe (PDF)">
              <IconButton
                size="small"
                color="default"
                onClick={() =>
                  abrirPdfNota(row.notaFiscalId).catch((err) =>
                    toast.error(err?.message || 'Erro ao abrir a nota')
                  )
                }
              >
                <Iconify icon="solar:document-text-bold" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
