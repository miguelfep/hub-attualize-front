'use client';

import { useState } from 'react';

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
import { useGetAllClientes } from 'src/actions/clientes';

// ----------------------------------------------------------------------

export function ApuracoesClienteListView({ clienteId }) {
  const router = useRouter();

  const [statusFiltro, setStatusFiltro] = useState('');
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFim, setPeriodoFim] = useState('');

  // Buscar dados do cliente
  const { data: clientes } = useGetAllClientes({ status: true });
  const cliente = clientes?.find((c) => (c._id || c.id) === clienteId);

  // Buscar apurações do cliente
  const filtros = {};
  if (statusFiltro) filtros.status = statusFiltro;
  if (periodoInicio) filtros.periodoInicio = periodoInicio;
  if (periodoFim) filtros.periodoFim = periodoFim;

  const { data: apuracoesData, isLoading, error } = useApuracoes(clienteId, filtros);
  const apuracoes = apuracoesData?.apuracoes || apuracoesData || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'calculada':
        return 'info';
      case 'validada':
        return 'primary';
      case 'transmitida':
        return 'warning';
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
    const labels = {
      calculada: 'Calculada',
      validada: 'Validada',
      transmitida: 'Transmitida',
      das_gerado: 'DAS Gerado',
      pago: 'Pago',
      cancelada: 'Cancelada',
    };
    return labels[status] || status;
  };

  if (!cliente) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">Cliente não encontrado</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading={`Apurações - ${cliente.nome || cliente.razao_social}`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração', href: paths.dashboard.fiscal.apuracao },
          { name: 'Clientes', href: paths.dashboard.fiscal.apuracaoClientes },
          { name: cliente.nome || cliente.razao_social },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:calculator-bold-duotone" />}
            onClick={() => router.push(`${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/nova`)}
          >
            Nova Apuração
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
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                select
                label="Status"
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="calculada">Calculada</MenuItem>
                <MenuItem value="validada">Validada</MenuItem>
                <MenuItem value="transmitida">Transmitida</MenuItem>
                <MenuItem value="das_gerado">DAS Gerado</MenuItem>
                <MenuItem value="pago">Pago</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Período Início"
                placeholder="202401"
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Período Fim"
                placeholder="202412"
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setStatusFiltro('');
                    setPeriodoInicio('');
                    setPeriodoFim('');
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
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
                {apuracoes.map((apuracao) => (
                  <TableRow key={apuracao._id || apuracao.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {formatarPeriodo(apuracao.periodoApuracao)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      R${' '}
                      {apuracao.totalReceitaBruta?.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" color="error.main">
                        R${' '}
                        {apuracao.totalImpostos?.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {apuracao.aliquotaEfetivaTotal?.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      {apuracao.fatorR ? (
                        <Chip
                          label={`${apuracao.fatorR.percentual?.toFixed(1) || 0}%`}
                          size="small"
                          color={apuracao.fatorR.aplicavelAnexoIII ? 'success' : 'warning'}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {apuracao.dasGerado ? (
                        <Chip label="Gerado" size="small" color="success" />
                      ) : (
                        <Chip label="Pendente" size="small" color="warning" />
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
                        onClick={() =>
                          router.push(
                            `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/${apuracao._id || apuracao.id}`
                          )
                        }
                      >
                        <Iconify icon="solar:eye-bold-duotone" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {apuracoes.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box sx={{ py: 5 }}>
                        <Iconify
                          icon="solar:document-text-bold-duotone"
                          width={80}
                          sx={{ color: 'text.disabled', mb: 2 }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          Nenhuma apuração encontrada
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Crie uma nova apuração para começar
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Iconify icon="solar:calculator-bold-duotone" />}
                          onClick={() =>
                            router.push(`${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/nova`)
                          }
                        >
                          Nova Apuração
                        </Button>
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

