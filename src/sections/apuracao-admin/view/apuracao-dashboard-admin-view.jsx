'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import {
  Container,
  Stack,
  Card,
  Typography,
  Button,
  Grid,
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tab,
  Tabs,
  TextField,
  Alert,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { formatarPeriodo } from 'src/utils/apuracao-helpers';
import { useApuracoes } from 'src/actions/apuracao';
import { useGetAllClientes } from 'src/actions/clientes';

// ----------------------------------------------------------------------

export function ApuracaoDashboardAdminView() {
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState('todas');
  const [periodo, setPeriodo] = useState('');
  const [cliente, setCliente] = useState('');

  // Buscar dados reais
  const { data: clientes, isLoading: loadingClientes } = useGetAllClientes({
    status: true,
    apurarHub: true,
  });

  // Buscar todas as apurações
  const { data: apuracoesData, isLoading: loadingApuracoes, error } = useApuracoes(null, {});
  const apuracoes = apuracoesData?.apuracoes || [];

  // Calcular métricas reais
  const agora = new Date();
  const mesAtual = agora.getMonth() + 1;
  const anoAtual = agora.getFullYear();

  const apuracoesMesAtual = apuracoes.filter((ap) => {
    if (!ap.periodoApuracao) return false;
    const ano = parseInt(ap.periodoApuracao.substring(0, 4), 10);
    const mes = parseInt(ap.periodoApuracao.substring(4, 6), 10);
    return ano === anoAtual && mes === mesAtual;
  });

  const apuracoesSemDas = apuracoes.filter((ap) => !ap.dasGerado && ap.status !== 'cancelada');
  const dasGerados = apuracoes.filter((ap) => ap.dasGerado).length;

  const valorTotal = apuracoes.reduce((total, ap) => {
    return total + (ap.totalImpostos || 0);
  }, 0);

  const isLoading = loadingClientes || loadingApuracoes;

  // Calcular clientes com pendência (clientes com apuração habilitada mas sem DAS gerado)
  const clientesComPendencia = clientes?.filter((cliente) => {
    const clienteId = cliente._id || cliente.id;
    return apuracoesSemDas.some(
      (ap) => (ap.clienteId || ap.cliente?._id || ap.cliente?.id) === clienteId
    );
  }).length || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'calculada':
        return 'info';
      case 'das_gerado':
        return 'success';
      case 'pago':
        return 'success';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'calculada':
        return 'Calculada';
      case 'das_gerado':
        return 'DAS Gerado';
      case 'pago':
        return 'Pago';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const apuracoesArray = apuracoes || [];

  // Definir status como aberta ou finalizada
  const isApuracaoAberta = (apuracao) => {
    return apuracao.status !== 'cancelada' && 
           apuracao.status !== 'pago' && 
           !apuracao.dasGerado;
  };

  const isApuracaoFinalizada = (apuracao) => {
    return apuracao.status === 'pago' || 
           apuracao.status === 'cancelada' || 
           (apuracao.dasGerado && apuracao.status === 'das_gerado');
  };

  const apuracoesAbertas = apuracoesArray.filter(isApuracaoAberta);
  const apuracoesFinalizadas = apuracoesArray.filter(isApuracaoFinalizada);

  const tabs = [
    { value: 'todas', label: 'Todas', count: apuracoesArray.length },
    {
      value: 'abertas',
      label: 'Abertas',
      count: apuracoesAbertas.length,
    },
    {
      value: 'finalizadas',
      label: 'Finalizadas',
      count: apuracoesFinalizadas.length,
    },
  ];

  const filteredData =
    currentTab === 'todas'
      ? apuracoesArray
      : currentTab === 'abertas'
        ? apuracoesAbertas
        : currentTab === 'finalizadas'
          ? apuracoesFinalizadas
          : [];

  const cards = [
    {
      title: 'Clientes com Pendência',
      value: clientesComPendencia,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'warning',
      description: 'Precisam de apuração',
    },
    {
      title: 'Apurações este Mês',
      value: apuracoesMesAtual.length,
      icon: 'solar:document-text-bold-duotone',
      color: 'primary',
      description: 'Calculadas no período',
    },
    {
      title: 'DAS Gerados',
      value: dasGerados,
      icon: 'solar:bill-list-bold-duotone',
      color: 'success',
      description: 'Documentos emitidos',
    },
    {
      title: 'Valor Total',
      value: `R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: 'solar:dollar-bold-duotone',
      color: 'info',
      description: 'Em impostos calculados',
    },
  ];

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Apuração de Impostos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:users-group-rounded-bold-duotone" />}
            onClick={() => router.push(paths.dashboard.fiscal.apuracaoClientes)}
          >
            Gerenciar por Cliente
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      <Stack spacing={3}>

        {/* Cards de Métricas */}
        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  p: 3,
                  cursor: card.action ? 'pointer' : 'default',
                  '&:hover': card.action
                    ? {
                        bgcolor: 'action.hover',
                      }
                    : {},
                  transition: 'all 0.2s',
                }}
                onClick={card.action}
              >
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${card.color}.lighter`,
                      color: `${card.color}.main`,
                    }}
                  >
                    <Iconify icon={card.icon} width={32} />
                  </Box>
                  <Box>
                    <Typography variant="h3">{card.value}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {card.description}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Ações Rápidas */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ações Rápidas
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Iconify icon="solar:users-group-rounded-bold-duotone" />}
                onClick={() => router.push(paths.dashboard.fiscal.apuracaoClientes)}
              >
                Gerenciar por Cliente
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Lista de Apurações */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Erro ao carregar apurações: {error.message || 'Erro desconhecido'}
          </Alert>
        )}

        <Card>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{
              px: 2,
              borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    <Chip label={tab.count} size="small" />
                  </Box>
                }
              />
            ))}
          </Tabs>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Período</TableCell>
                  <TableCell align="right">Receita Bruta</TableCell>
                  <TableCell align="right">Total Impostos</TableCell>
                  <TableCell align="right">Alíquota</TableCell>
                  <TableCell>Fator R</TableCell>
                  <TableCell>DAS</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((apuracao) => {
                  // Extrair o ID do cliente corretamente (pode ser string ou objeto)
                  let clienteId = null;
                  if (typeof apuracao.clienteId === 'string') {
                    clienteId = apuracao.clienteId;
                  } else if (apuracao.clienteId?._id) {
                    clienteId = apuracao.clienteId._id;
                  } else if (apuracao.clienteId?.id) {
                    clienteId = apuracao.clienteId.id;
                  } else if (apuracao.cliente?._id) {
                    clienteId = apuracao.cliente._id;
                  } else if (apuracao.cliente?.id) {
                    clienteId = apuracao.cliente.id;
                  }
                  
                  // Garantir que é string
                  clienteId = clienteId ? String(clienteId) : null;
                  
                  const clienteNome = apuracao.clienteNome || apuracao.clienteId?.razaoSocial || apuracao.cliente?.razaoSocial || 'Cliente não identificado';
                  
                  return (
                    <TableRow key={apuracao._id || apuracao.id} hover>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            cursor: clienteId ? 'pointer' : 'default',
                            color: clienteId ? 'primary.main' : 'text.primary',
                            '&:hover': clienteId ? { textDecoration: 'underline' } : {},
                          }}
                          onClick={() => {
                            if (clienteId) {
                              router.push(paths.dashboard.fiscal.apuracaoClienteDetalhes(clienteId));
                            }
                          }}
                        >
                          {clienteNome}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatarPeriodo(apuracao.periodoApuracao)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        R${' '}
                        {apuracao.totalReceitaBruta?.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        }) || '0,00'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" color="error.main">
                          R${' '}
                          {apuracao.totalImpostos?.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          }) || '0,00'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {apuracao.aliquotaEfetivaTotal?.toFixed(2) || '0.00'}%
                      </TableCell>
                      <TableCell>
                        {apuracao.fatorR && (
                          <Chip
                            label={`${apuracao.fatorR.percentual.toFixed(1)}%`}
                            size="small"
                            color={apuracao.fatorR.percentual >= 28 ? 'success' : 'warning'}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {apuracao.dasGerado ? (
                          <Stack spacing={0.5}>
                            <Chip label="Gerado" size="small" color="success" />
                            {apuracao.dasNumeroDocumento && (
                              <Typography variant="caption" color="text.secondary">
                                {apuracao.dasNumeroDocumento}
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Iconify icon="solar:upload-bold-duotone" />}
                            disabled={!clienteId || !(apuracao._id || apuracao.id)}
                            onClick={() => {
                              const apuracaoId = apuracao._id || apuracao.id;
                              if (clienteId && apuracaoId) {
                                router.push(
                                  `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/${String(apuracaoId)}/upload-das`
                                );
                              } else {
                                toast.error('ID do cliente ou apuração não encontrado');
                              }
                            }}
                          >
                            Upload DAS
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(apuracao.status)}
                          size="small"
                          color={getStatusColor(apuracao.status)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (clienteId) {
                              router.push(
                                `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/${apuracao._id || apuracao.id}`
                              );
                            } else {
                              toast.error('Cliente não identificado nesta apuração');
                            }
                          }}
                        >
                          <Iconify icon="solar:eye-bold-duotone" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Box sx={{ py: 5 }}>
                        <Iconify
                          icon="solar:document-text-bold-duotone"
                          width={80}
                          sx={{ color: 'text.disabled', mb: 2 }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          Nenhuma apuração encontrada
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentTab === 'pendentes'
                            ? 'Todas as apurações têm DAS gerado'
                            : 'Calcule uma nova apuração para começar'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>
    </Container>
  );
}

