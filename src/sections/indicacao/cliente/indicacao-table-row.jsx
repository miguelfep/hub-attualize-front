'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

const STATUS_CONFIG = {
  pendente: {
    label: 'Pendente',
    color: 'warning',
  },
  contato_iniciado: {
    label: 'Contato Iniciado',
    color: 'info',
  },
  em_negociacao: {
    label: 'Em Negociação',
    color: 'secondary',
  },
  aprovado: {
    label: 'Aprovado',
    color: 'success',
  },
  recusado: {
    label: 'Recusado',
    color: 'error',
  },
};

// ----------------------------------------------------------------------

export function IndicacaoTableRow({ row }) {
  const { lead, status, valorRecompensa, dataContato, dataAprovacao, createdAt } = row;

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pendente;

  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <TableRow hover>
      <TableCell>
        <Stack>
          <Typography variant="subtitle2">{lead?.nome || '-'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {lead?.email || '-'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{lead?.telefone || '-'}</Typography>
      </TableCell>

      <TableCell>
        <Chip 
          label={statusConfig.label} 
          color={statusConfig.color} 
          size="small" 
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {status === 'aprovado' && valorRecompensa 
            ? fCurrency(valorRecompensa)
            : '-'
          }
        </Typography>
      </TableCell>

      <TableCell>
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            Criado: {formatDate(createdAt)}
          </Typography>
          {dataContato && (
            <Typography variant="caption" color="text.secondary">
              Contato: {formatDate(dataContato)}
            </Typography>
          )}
          {dataAprovacao && (
            <Typography variant="caption" color="success.main">
              Aprovado: {formatDate(dataAprovacao)}
            </Typography>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
