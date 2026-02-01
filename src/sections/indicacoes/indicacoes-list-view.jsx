'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { useMinhasIndicacoes } from 'src/actions/indicacoes';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'contato_iniciado', label: 'Contato Iniciado' },
  { value: 'em_negociacao', label: 'Em Negociação' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'recusado', label: 'Recusado' },
];

function getStatusColor(status) {
  const colors = {
    pendente: 'warning',
    contato_iniciado: 'info',
    em_negociacao: 'info',
    aprovado: 'success',
    recusado: 'error',
  };
  return colors[status] || 'default';
}

function getStatusLabel(status) {
  const labels = {
    pendente: 'Pendente',
    contato_iniciado: 'Contato Iniciado',
    em_negociacao: 'Em Negociação',
    aprovado: 'Aprovado',
    recusado: 'Recusado',
  };
  return labels[status] || status;
}

// ----------------------------------------------------------------------

export function IndicacoesListView() {
  const { data: indicacoes, isLoading } = useMinhasIndicacoes();
  const [statusFilter, setStatusFilter] = useState('all');

  const indicacoesFiltradas = useMemo(() => {
    if (statusFilter === 'all') return indicacoes;
    return indicacoes.filter((ind) => ind.status === statusFilter);
  }, [indicacoes, statusFilter]);

  return (
    <Stack spacing={3}>
      <Card sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="subtitle2">Filtrar por status:</Typography>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Card>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Recompensa</TableCell>
                  <TableCell>Data de Criação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : indicacoesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyContent
                        title="Nenhuma indicação encontrada"
                        description="Você ainda não possui indicações"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  indicacoesFiltradas.map((indicacao) => (
                    <TableRow key={indicacao._id}>
                      <TableCell>
                        <Typography variant="subtitle2">{indicacao.lead?.nome || '-'}</Typography>
                      </TableCell>
                      <TableCell>{indicacao.lead?.email || '-'}</TableCell>
                      <TableCell>{indicacao.lead?.telefone || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(indicacao.status)}
                          color={getStatusColor(indicacao.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {indicacao.valorRecompensa ? (
                          <Typography variant="subtitle2" color="success.main">
                            {fCurrency(indicacao.valorRecompensa)}
                          </Typography>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {indicacao.createdAt
                          ? fDate(indicacao.createdAt, 'dd/MM/yyyy')
                          : '-'}
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
