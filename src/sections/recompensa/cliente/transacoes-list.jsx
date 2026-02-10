'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';

import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

const TIPO_CONFIG = {
  recompensa: {
    label: 'Recompensa',
    color: 'success',
    icon: '💰',
  },
  desconto: {
    label: 'Desconto',
    color: 'info',
    icon: '🎁',
  },
  pix: {
    label: 'PIX',
    color: 'secondary',
    icon: '💸',
  },
  estorno: {
    label: 'Estorno',
    color: 'error',
    icon: '↩️',
  },
};

const STATUS_CONFIG = {
  pendente: {
    label: 'Pendente',
    color: 'warning',
  },
  aprovado: {
    label: 'Aprovado',
    color: 'success',
  },
  processado: {
    label: 'Processado',
    color: 'info',
  },
  rejeitado: {
    label: 'Rejeitado',
    color: 'error',
  },
};

// ----------------------------------------------------------------------

export function TransacoesList({ transacoes, loading }) {
  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!transacoes || transacoes.length === 0) {
    return (
      <EmptyContent
        filled
        title="Nenhuma transação encontrada"
        description="Suas transações aparecerão aqui quando houver movimentações"
      />
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tipo</TableCell>
            <TableCell>Valor</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Detalhes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transacoes.map((transacao) => {
            const tipoConfig = TIPO_CONFIG[transacao.tipo] || TIPO_CONFIG.recompensa;
            const statusConfig = STATUS_CONFIG[transacao.status] || STATUS_CONFIG.pendente;

            return (
              <TableRow key={transacao._id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography>{tipoConfig.icon}</Typography>
                    <Typography variant="body2">{tipoConfig.label}</Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: transacao.tipo === 'recompensa' || transacao.tipo === 'estorno' 
                        ? 'success.main' 
                        : 'error.main' 
                    }}
                  >
                    {transacao.tipo === 'recompensa' || transacao.tipo === 'estorno' ? '+' : '-'}
                    {fCurrency(transacao.valor)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip 
                    label={statusConfig.label} 
                    color={statusConfig.color} 
                    size="small" 
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(transacao.dataSolicitacao)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {transacao.tipo === 'pix' && transacao.chavePix && (
                      <>Chave: {transacao.chavePix}</>
                    )}
                    {transacao.tipo === 'desconto' && transacao.contrato && (
                      <>Contrato aplicado</>
                    )}
                    {transacao.tipo === 'recompensa' && transacao.indicacao && (
                      <>Indicação aprovada</>
                    )}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
