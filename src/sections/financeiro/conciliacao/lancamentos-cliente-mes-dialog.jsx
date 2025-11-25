'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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

export function LancamentosClienteMesDialog({ open, onClose, cliente, mes }) {
  const [bancoSelecionado, setBancoSelecionado] = useState(0);

  const { data, error, isLoading } = useSWR(
    open && cliente && mes
      ? endpoints.conciliacao.clienteLancamentosPorBanco(cliente.clienteId, mes.mesAno)
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const bancos = useMemo(() => {
    if (!data?.bancos) return [];
    return data.bancos;
  }, [data]);

  const lancamentosBancoAtual = useMemo(() => {
    if (!bancos.length || bancoSelecionado >= bancos.length) return [];
    return bancos[bancoSelecionado]?.lancamentos || [];
  }, [bancos, bancoSelecionado]);

  const summaryBancoAtual = useMemo(() => {
    if (!bancos.length || bancoSelecionado >= bancos.length) {
      return { totalEntradas: 0, totalSaidas: 0, saldo: 0, conciliados: 0, pendentes: 0 };
    }
    return bancos[bancoSelecionado]?.summary || {};
  }, [bancos, bancoSelecionado]);

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

  if (!cliente || !mes) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="h6">
              Lançamentos - {cliente.nomeCliente}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mes.mesNome}
            </Typography>
          </Stack>
          <Iconify icon="solar:close-circle-bold-duotone" onClick={onClose} sx={{ cursor: 'pointer' }} width={24} />
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={200} />
              <Skeleton variant="rectangular" height={400} />
            </Stack>
          ) : error ? (
            <Alert severity="error">Erro ao carregar lançamentos.</Alert>
          ) : bancos.length === 0 ? (
            <Alert severity="info">Nenhum lançamento encontrado para este mês.</Alert>
          ) : (
            <>
              {/* Tabs de bancos */}
              {bancos.length > 1 && (
                <Tabs value={bancoSelecionado} onChange={(e, v) => setBancoSelecionado(v)}>
                  {bancos.map((banco, index) => (
                    <Tab
                      key={banco.bancoId}
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2">{banco.nomeBanco}</Typography>
                          <Chip
                            label={banco.lancamentos?.length || 0}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>
                      }
                    />
                  ))}
                </Tabs>
              )}

              {/* Resumo do banco atual */}
              <Card
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
                      {formatCurrency(summaryBancoAtual.totalEntradas)}
                    </Typography>
                  </Stack>
                  <Stack alignItems="center" spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Total Saídas
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {formatCurrency(Math.abs(summaryBancoAtual.totalSaidas))}
                    </Typography>
                  </Stack>
                  <Stack alignItems="center" spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Saldo
                    </Typography>
                    <Typography variant="h6" color={summaryBancoAtual.saldo >= 0 ? 'success.main' : 'error.main'}>
                      {formatCurrency(summaryBancoAtual.saldo)}
                    </Typography>
                  </Stack>
                  <Stack alignItems="center" spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Conciliados
                    </Typography>
                    <Typography variant="h6">
                      {summaryBancoAtual.conciliados || 0} / {lancamentosBancoAtual.length}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>

              {/* Tabela de lançamentos */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="center">Tipo</TableCell>
                      <TableCell align="center">Categoria</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lancamentosBancoAtual.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary">
                            Nenhum lançamento encontrado
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      lancamentosBancoAtual.map((lancamento) => (
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
                            <Typography variant="caption">{lancamento.categoria || 'Não classificado'}</Typography>
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

