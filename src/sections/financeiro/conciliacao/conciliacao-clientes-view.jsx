'use client';

import { useState, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import useSWR from 'swr';

import { fetcher, endpoints } from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

import { LancamentosClienteMesDialog } from './lancamentos-cliente-mes-dialog';

// ----------------------------------------------------------------------

export function ConciliacaoClientesView() {
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [mesSelecionado, setMesSelecionado] = useState(null);
  const [dialogAberto, setDialogAberto] = useState(false);

  const {
    data: clientesStatusData,
    error: clientesStatusError,
    isLoading: clientesStatusLoading,
  } = useSWR(endpoints.conciliacao.clientesExtratosStatus, fetcher, {
    revalidateOnFocus: false,
  });

  const clientesComMeses = useMemo(() => {
    if (!clientesStatusData?.clientes) return [];

    return clientesStatusData.clientes.map((cliente) => {
      // Gerar últimos 12 meses para cada cliente
      const meses = [];
      const hoje = new Date();

      for (let i = 0; i < 12; i += 1) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = data.toISOString().slice(0, 7);
        const mesNome = data.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

        // Verificar se o cliente enviou neste mês (mock: últimos 3 meses enviados)
        const mesAtual = hoje.toISOString().slice(0, 7);
        const enviado = 
          (cliente.mesAno === mesAno && cliente.enviado) || 
          (i > 0 && i <= 3); // Mock: últimos 3 meses (exceto atual) como enviados

        // Mock: Calcular conciliação (últimos 3 meses têm alguns conciliados)
        const totalLancamentos = enviado ? (i === 1 ? 8 : i === 2 ? 6 : i === 3 ? 5 : 0) : 0;
        const conciliados = enviado ? Math.floor(totalLancamentos * (i === 1 ? 0.75 : i === 2 ? 0.67 : 0.6)) : 0;

        meses.push({
          mesAno,
          mesNome: mesNome.charAt(0).toUpperCase() + mesNome.slice(1),
          enviado,
          enviadoEm: enviado 
            ? (cliente.mesAno === mesAno ? cliente.enviadoEm : new Date(data.getFullYear(), data.getMonth(), 15).toISOString())
            : null,
          quantidadeArquivos: enviado ? (cliente.mesAno === mesAno ? cliente.quantidadeArquivos : 2) : 0,
          totalLancamentos,
          conciliados,
          pendentes: totalLancamentos - conciliados,
        });
      }

      // Calcular totais do cliente
      const totalMesesEnviados = meses.filter((m) => m.enviado).length;
      const totalLancamentosCliente = meses.reduce((sum, m) => sum + m.totalLancamentos, 0);
      const totalConciliadosCliente = meses.reduce((sum, m) => sum + m.conciliados, 0);

      return {
        ...cliente,
        meses,
        totalMesesEnviados,
        totalLancamentos: totalLancamentosCliente,
        totalConciliados: totalConciliadosCliente,
        totalPendentes: totalLancamentosCliente - totalConciliadosCliente,
      };
    });
  }, [clientesStatusData]);

  const handleVerLancamentos = useCallback((cliente, mes) => {
    setClienteSelecionado(cliente);
    setMesSelecionado(mes);
    setDialogAberto(true);
  }, []);

  const mesAtual = new Date().toISOString().slice(0, 7);

  if (clientesStatusLoading) {
    return (
      <Card sx={{ p: 3 }}>
        <LinearProgress />
      </Card>
    );
  }

  if (clientesStatusError) {
    return (
      <Card sx={{ p: 3 }}>
        <Alert severity="error">Erro ao carregar dados dos clientes.</Alert>
      </Card>
    );
  }

  if (!clientesComMeses.length) {
    return (
      <Card sx={{ p: 3 }}>
        <Alert severity="info">Nenhum cliente encontrado.</Alert>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Conciliação Bancária por Cliente</Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<Iconify icon="solar:check-circle-bold-duotone" width={16} />}
            label={`${clientesStatusData.clientesEnviaram} enviaram este mês`}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<Iconify icon="solar:clock-circle-bold-duotone" width={16} />}
            label={`${clientesStatusData.clientesPendentes} pendentes`}
            color="warning"
            variant="outlined"
          />
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {clientesComMeses.map((cliente) => (
          <Grid key={cliente.clienteId} xs={12} md={6} lg={4}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {cliente.nomeCliente}
                  </Typography>
                  {cliente.enviado && (
                    <Chip
                      icon={<Iconify icon="solar:check-circle-bold-duotone" width={14} />}
                      label="Enviou"
                      color="success"
                      size="small"
                    />
                  )}
                </Stack>

                {/* Resumo de conciliação */}
                {cliente.totalLancamentos > 0 && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Total de lançamentos:
                        </Typography>
                        <Typography variant="subtitle2">{cliente.totalLancamentos}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          Conciliados:
                        </Typography>
                        <Chip
                          label={`${cliente.totalConciliados} / ${cliente.totalLancamentos}`}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                      {cliente.totalPendentes > 0 && (
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            Pendentes:
                          </Typography>
                          <Chip
                            label={cliente.totalPendentes}
                            color="warning"
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                )}

                <Divider />

                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle2" color="text.secondary">
                      Histórico de envios:
                    </Typography>
                    <Chip
                      label={`${cliente.meses.filter((m) => m.enviado).length} enviados`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Stack>
                  <Stack spacing={1}>
                    {cliente.meses.slice(0, 6).map((mes) => (
                      <Box
                        key={mes.mesAno}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: mes.enviado ? 'success.main' : 'divider',
                          bgcolor: mes.enviado ? 'success.lighter' : 'background.default',
                          cursor: mes.enviado ? 'pointer' : 'default',
                          '&:hover': mes.enviado ? { bgcolor: 'success.lighter', opacity: 0.8 } : {},
                        }}
                        onClick={() => mes.enviado && handleVerLancamentos(cliente, mes)}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack spacing={0.5} sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: mes.enviado ? 600 : 400 }}>
                              {mes.mesNome}
                            </Typography>
                            {mes.enviado && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                {mes.quantidadeArquivos > 0 && (
                                  <Typography variant="caption" color="text.secondary">
                                    {mes.quantidadeArquivos} arquivo(s)
                                  </Typography>
                                )}
                                {mes.totalLancamentos > 0 && (
                                  <>
                                <Typography variant="caption" color="text.secondary">•</Typography>
                                <Chip
                                  label={`${mes.conciliados}/${mes.totalLancamentos} conciliados`}
                                  size="small"
                                  color={mes.conciliados === mes.totalLancamentos ? 'success' : 'warning'}
                                  variant="outlined"
                                  sx={{ height: 20 }}
                                />
                                  </>
                                )}
                              </Stack>
                            )}
                          </Stack>
                          {mes.enviado ? (
                            <Button
                              size="small"
                              variant="text"
                              endIcon={<Iconify icon="solar:arrow-right-bold-duotone" width={16} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerLancamentos(cliente, mes);
                              }}
                            >
                              Ver
                            </Button>
                          ) : (
                            <Chip label="Pendente" size="small" color="default" variant="outlined" />
                          )}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <LancamentosClienteMesDialog
        open={dialogAberto}
        onClose={() => {
          setDialogAberto(false);
          setClienteSelecionado(null);
          setMesSelecionado(null);
        }}
        cliente={clienteSelecionado}
        mes={mesSelecionado}
      />
    </Stack>
  );
}

