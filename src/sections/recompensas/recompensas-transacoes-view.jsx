'use client';

import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { useTransacoesRecompensa } from 'src/actions/recompensas';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

const TIPO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'recompensa', label: 'Recompensa' },
  { value: 'desconto', label: 'Desconto' },
  { value: 'pix', label: 'PIX' },
  { value: 'estorno', label: 'Estorno' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'processado', label: 'Processado' },
];

function getTipoLabel(tipo) {
  const labels = {
    recompensa: 'Recompensa',
    desconto: 'Desconto',
    pix: 'PIX',
    estorno: 'Estorno',
  };
  return labels[tipo] || tipo;
}

function getStatusColor(status) {
  const colors = {
    pendente: 'warning',
    aprovado: 'info',
    rejeitado: 'error',
    processado: 'success',
  };
  return colors[status] || 'default';
}

function getStatusLabel(status) {
  const labels = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
    processado: 'Processado',
  };
  return labels[status] || status;
}

// ----------------------------------------------------------------------

export function RecompensasTransacoesView() {
  const [filtros, setFiltros] = useState({
    tipo: '',
    status: '',
    dataInicio: '',
    dataFim: '',
  });

  const { transacoes, isLoading } = useTransacoesRecompensa(filtros);

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  return (
    <Stack spacing={3}>
      <Card sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <Typography variant="subtitle2">Filtros:</Typography>
          <Select
            value={filtros.tipo}
            onChange={(e) => handleFiltroChange('tipo', e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            {TIPO_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={filtros.status}
            onChange={(e) => handleFiltroChange('status', e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label="Data Inicial"
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Data Final"
            type="date"
            value={filtros.dataFim}
            onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
        </Stack>
      </Card>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data Solicitação</TableCell>
                  <TableCell>Data Processamento</TableCell>
                  <TableCell>Observações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : transacoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyContent
                        title="Nenhuma transação encontrada"
                        description="Você ainda não possui transações"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  transacoes.map((transacao) => (
                    <TableRow key={transacao._id}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {getTipoLabel(transacao.tipo)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          color={transacao.tipo === 'recompensa' ? 'success.main' : 'text.primary'}
                        >
                          {transacao.tipo === 'recompensa' ? '+' : '-'}
                          {fCurrency(transacao.valor)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(transacao.status)}
                          color={getStatusColor(transacao.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {transacao.dataSolicitacao
                          ? fDate(transacao.dataSolicitacao, 'dd/MM/yyyy HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {transacao.dataProcessamento
                          ? fDate(transacao.dataProcessamento, 'dd/MM/yyyy HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {transacao.chavePix && (
                          <Typography variant="caption" color="text.secondary">
                            PIX: {transacao.chavePix}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>
    </Stack>
  );
}
