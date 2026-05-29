import { useMemo, useState } from 'react';

import {
  Box,
  Card,
  Chip,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  CardHeader,
  TableSortLabel,
  TableContainer,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import { formatToCurrency } from 'src/components/animate';

// ----------------------------------------------------------------------

const CLASSIFICACAO = {
  expansao: { label: 'Expansão', color: 'success' },
  retido: { label: 'Retido', color: 'info' },
  downgrade: { label: 'Downgrade', color: 'warning' },
  churn: { label: 'Churn', color: 'error' },
};

const MOTIVO_CHURN = {
  cliente_inativado: 'Cliente inativado',
  contrato_inativo: 'Contrato inativo',
  contrato_encerrado: 'Contrato encerrado',
};

export default function NrrDetalhesTable({ detalhes = [] }) {
  const [order, setOrder] = useState('asc');

  const rows = useMemo(() => {
    const arr = [...(detalhes || [])];
    arr.sort((a, b) => (order === 'asc' ? a.delta - b.delta : b.delta - a.delta));
    return arr;
  }, [detalhes, order]);

  const toggleOrder = () => setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));

  return (
    <Card>
      <CardHeader title="Detalhamento por contrato" subheader={`${detalhes.length} contrato(s) na coorte`} />
      <Box sx={{ p: 2 }}>
        <TableContainer>
          <Scrollbar>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Contrato</TableCell>
                  <TableCell align="right">MRR inicial</TableCell>
                  <TableCell align="right">MRR final</TableCell>
                  <TableCell align="right" sortDirection={order}>
                    <TableSortLabel active direction={order} onClick={toggleOrder}>
                      Δ
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Classificação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const cls = CLASSIFICACAO[row.classificacao] ?? { label: row.classificacao, color: 'default' };
                  return (
                    <TableRow key={row.contratoId} hover>
                      <TableCell>
                        <Box sx={{ typography: 'body2' }}>{row.clienteNome ?? '—'}</Box>
                        {row.clienteCodigo != null && (
                          <Box sx={{ typography: 'caption', color: 'text.secondary' }}>#{row.clienteCodigo}</Box>
                        )}
                      </TableCell>
                      <TableCell>{row.contratoTitulo ?? '—'}</TableCell>
                      <TableCell align="right">{formatToCurrency(row.mrrInicial ?? 0)}</TableCell>
                      <TableCell align="right">{formatToCurrency(row.mrrFinal ?? 0)}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            row.delta > 0 ? 'success.main' : row.delta < 0 ? 'error.main' : 'text.secondary',
                          fontWeight: 600,
                        }}
                      >
                        {row.delta > 0 ? '+' : ''}
                        {formatToCurrency(row.delta ?? 0)}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" variant="soft" color={cls.color} label={cls.label} />
                        {row.classificacao === 'churn' && row.motivoChurn && (
                          <Box sx={{ typography: 'caption', color: 'text.secondary', mt: 0.5 }}>
                            {MOTIVO_CHURN[row.motivoChurn] ?? row.motivoChurn}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Sem contratos na coorte para o período.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Box>
    </Card>
  );
}
