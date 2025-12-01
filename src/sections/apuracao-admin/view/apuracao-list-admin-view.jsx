'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import {
  Container,
  Stack,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  Tab,
  Tabs,
  MenuItem,
  TextField,
  Grid,
  LinearProgress,
  Alert,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { formatarPeriodo } from 'src/utils/apuracao-helpers';
import { useApuracoes } from 'src/actions/apuracao';

// ----------------------------------------------------------------------

export function ApuracaoListAdminView() {
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState('todas');
  const [periodo, setPeriodo] = useState('');
  const [cliente, setCliente] = useState('');

  // Buscar apurações do backend (todas, sem filtro de empresa)
  const { data: apuracoesData, isLoading, mutate, error } = useApuracoes(null, {});

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

  const apuracoesArray = apuracoesData?.apuracoes || [];

  const tabs = [
    { value: 'todas', label: 'Todas', count: apuracoesArray.length },
    {
      value: 'pendentes',
      label: 'Sem DAS',
      count: apuracoesArray.filter((a) => !a.dasGerado).length,
    },
    {
      value: 'completas',
      label: 'Com DAS',
      count: apuracoesArray.filter((a) => a.dasGerado).length,
    },
  ];

  const filteredData =
    currentTab === 'todas'
      ? apuracoesArray
      : currentTab === 'pendentes'
        ? apuracoesArray.filter((a) => !a.dasGerado)
        : apuracoesArray.filter((a) => a.dasGerado);

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Apurações Calculadas"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração', href: paths.dashboard.fiscal.apuracao },
          { name: 'Lista' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:users-group-rounded-bold-duotone" />}
            onClick={() => router.push(paths.dashboard.fiscal.apuracaoClientes)}
          >
            Ver Clientes
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erro ao carregar apurações: {error.message || 'Erro desconhecido'}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Filtros */}
        <Card sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Período"
                placeholder="202412"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nome do cliente"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Iconify icon="solar:magnifer-bold-duotone" />}
                >
                  Buscar
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setPeriodo('');
                    setCliente('');
                  }}
                >
                  Limpar
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {/* Tabela */}
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
                  // Extrair o ID da apuração corretamente
                  const apuracaoId = apuracao._id || apuracao.id;
                  
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
                  
                  // Garantir que são strings
                  clienteId = clienteId ? String(clienteId) : null;
                  const apuracaoIdStr = apuracaoId ? String(apuracaoId) : null;
                  
                  return (
                    <TableRow key={apuracaoId} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {apuracao.clienteNome || apuracao.clienteId?.razaoSocial || 'Cliente não identificado'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatarPeriodo(apuracao.periodoApuracao)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        R${' '}
                        {apuracao.totalReceitaBruta.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" color="error.main">
                          R${' '}
                          {apuracao.totalImpostos.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {apuracao.aliquotaEfetivaTotal.toFixed(2)}%
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
                            disabled={!clienteId || !apuracaoIdStr}
                            onClick={() => {
                              if (clienteId && apuracaoIdStr) {
                                router.push(
                                  `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/${apuracaoIdStr}/upload-das`
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
                          const clienteId = apuracao.clienteId || apuracao.cliente?._id || apuracao.cliente?.id;
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

