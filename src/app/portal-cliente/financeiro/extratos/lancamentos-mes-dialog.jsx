'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';

import useSWR from 'swr';

import { fetcher, endpoints } from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function LancamentosMesDialog({ open, onClose, mes, clienteId }) {
  const { data, error, isLoading } = useSWR(
    open && mes && clienteId ? endpoints.conciliacao.clienteLancamentos(clienteId, mes.mesAno) : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const lancamentos = useMemo(() => data?.lancamentos || [], [data]);
  const summary = useMemo(() => data?.summary || { totalEntradas: 0, totalSaidas: 0, saldo: 0 }, [data]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

  const formatDate = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString('pt-BR');
  };

  if (!mes) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Lançamentos - {mes.mesNome}</Typography>
          <Iconify icon="solar:close-circle-bold-duotone" onClick={onClose} sx={{ cursor: 'pointer' }} width={24} />
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Resumo */}
          {!isLoading && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.neutral',
              }}
            >
              <Stack direction="row" spacing={3} justifyContent="space-around">
                <Stack alignItems="center" spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Total Entradas
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(summary.totalEntradas)}
                  </Typography>
                </Stack>
                <Stack alignItems="center" spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Total Saídas
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {formatCurrency(Math.abs(summary.totalSaidas))}
                  </Typography>
                </Stack>
                <Stack alignItems="center" spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Saldo
                  </Typography>
                  <Typography variant="h6" color={summary.saldo >= 0 ? 'success.main' : 'error.main'}>
                    {formatCurrency(summary.saldo)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          )}

          {/* Tabela de lançamentos */}
          {isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={200} />
              <Skeleton variant="rectangular" height={200} />
            </Stack>
          ) : error ? (
            <Alert severity="error">Erro ao carregar lançamentos do mês.</Alert>
          ) : lancamentos.length === 0 ? (
            <Alert severity="info">Nenhum lançamento encontrado para este mês.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell align="center">Tipo</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lancamentos.map((lancamento) => (
                    <TableRow key={lancamento.id} hover>
                      <TableCell>
                        <Typography variant="body2">{formatDate(lancamento.date)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{lancamento.description}</Typography>
                        {lancamento.sourceFile?.name && (
                          <Typography variant="caption" color="text.secondary">
                            {lancamento.sourceFile.name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: lancamento.amount >= 0 ? 'success.main' : 'error.main' }}
                        >
                          {formatCurrency(lancamento.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={lancamento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          color={lancamento.tipo === 'entrada' ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {lancamento.conciliado ? (
                          <Chip
                            icon={<Iconify icon="solar:check-circle-bold-duotone" width={16} />}
                            label="Conciliado"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<Iconify icon="solar:clock-circle-bold-duotone" width={16} />}
                            label="Pendente"
                            color="warning"
                            size="small"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Informações do envio */}
          {mes.enviado && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
              }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle2">Informações do envio</Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Typography variant="body2" color="text.secondary">
                    <strong>Arquivos:</strong> {mes.quantidadeArquivos}
                  </Typography>
                  {mes.enviadoEm && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Enviado em:</strong>{' '}
                      {new Date(mes.enviadoEm).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  )}
                </Stack>
                {mes.arquivos?.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {mes.arquivos.join(', ')}
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

