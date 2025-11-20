'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

import {
  Container,
  Stack,
  Card,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  Alert,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useDasDetalhes, baixarDasPdf, marcarDasComoPago, cancelarDas } from 'src/actions/apuracao';
import { formatarPeriodo } from 'src/utils/apuracao-helpers';

// ----------------------------------------------------------------------

export function DetalhesDasView({ dasId }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // Buscar DAS
  const { data: dasData, isLoading, error, mutate } = useDasDetalhes(dasId, false);
  const das = dasData?.das || dasData;

  const getStatusColor = (status) => {
    switch (status) {
      case 'gerado':
        return 'info';
      case 'pago':
        return 'success';
      case 'cancelado':
        return 'error';
      case 'vencido':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      gerado: 'Gerado',
      pago: 'Pago',
      cancelado: 'Cancelado',
      vencido: 'Vencido',
    };
    return labels[status] || status;
  };

  const handleDownloadPdf = useCallback(async () => {
    try {
      setLoading(true);
      const response = await baixarDasPdf(dasId);
      
      // Se response já é um Blob, usar diretamente
      const blob = response instanceof Blob ? response : response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DAS_${das.numeroDocumento || dasId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Erro ao baixar PDF');
      console.error('Erro ao baixar PDF:', error);
    } finally {
      setLoading(false);
    }
  }, [dasId, das]);

  const handleMarcarPago = useCallback(async () => {
    const valorPago = window.prompt('Informe o valor pago:', das?.valores?.total || '0');
    if (!valorPago || parseFloat(valorPago) <= 0) return;

    try {
      setLoading(true);
      await marcarDasComoPago(dasId, {
        valorPago: parseFloat(valorPago),
      });
      toast.success('DAS marcado como pago!');
      mutate();
    } catch (error) {
      toast.error(error.message || 'Erro ao marcar como pago');
    } finally {
      setLoading(false);
    }
  }, [dasId, das, mutate]);

  const handleCancelar = useCallback(async () => {
    const motivo = window.prompt('Informe o motivo do cancelamento:');
    if (!motivo) return;

    try {
      setLoading(true);
      await cancelarDas(dasId, motivo);
      toast.success('DAS cancelado com sucesso!');
      mutate();
    } catch (error) {
      toast.error(error.message || 'Erro ao cancelar DAS');
    } finally {
      setLoading(false);
    }
  }, [dasId, mutate]);

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <LinearProgress sx={{ mb: 3 }} />
      </Container>
    );
  }

  if (error || !das) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">{error?.message || 'DAS não encontrado'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading={`DAS - ${das.numeroDocumento || dasId}`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração', href: paths.dashboard.fiscal.apuracao },
          { name: 'DAS' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            {das.status === 'gerado' && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="solar:download-bold-duotone" />}
                  onClick={handleDownloadPdf}
                  disabled={loading}
                >
                  Baixar PDF
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  startIcon={<Iconify icon="solar:check-circle-bold-duotone" />}
                  onClick={handleMarcarPago}
                  disabled={loading}
                >
                  Marcar como Pago
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<Iconify icon="solar:close-circle-bold-duotone" />}
                  onClick={handleCancelar}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </>
            )}
            {das.status === 'pago' && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="solar:download-bold-duotone" />}
                onClick={handleDownloadPdf}
                disabled={loading}
              >
                Baixar PDF
              </Button>
            )}
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {(loading || isLoading) && <LinearProgress sx={{ mb: 3 }} />}

      <Stack spacing={3}>
        {/* Header */}
        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" gutterBottom>
                DAS - {das.numeroDocumento}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Período: {formatarPeriodo(das.periodoApuracao)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip
                label={getStatusLabel(das.status)}
                color={getStatusColor(das.status)}
                icon={
                  <Iconify
                    icon={
                      das.status === 'pago'
                        ? 'solar:check-circle-bold-duotone'
                        : das.status === 'cancelado'
                          ? 'solar:close-circle-bold-duotone'
                          : das.status === 'vencido'
                            ? 'solar:danger-circle-bold-duotone'
                            : 'solar:document-text-bold-duotone'
                    }
                  />
                }
              />
              {das.ambiente && (
                <Chip label={das.ambiente.toUpperCase()} size="small" variant="outlined" />
              )}
            </Stack>
          </Stack>
        </Card>

        {/* Valores */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:dollar-bold-duotone" width={24} color="primary.main" />
                  <Typography variant="caption" color="text.secondary">
                    Principal
                  </Typography>
                </Stack>
                <Typography variant="h5" color="primary.main">
                  R${' '}
                  {das.valores?.principal?.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:bill-list-bold-duotone" width={24} color="warning.main" />
                  <Typography variant="caption" color="text.secondary">
                    Multa
                  </Typography>
                </Stack>
                <Typography variant="h5" color="warning.main">
                  R${' '}
                  {das.valores?.multa?.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:percent-bold-duotone" width={24} color="info.main" />
                  <Typography variant="caption" color="text.secondary">
                    Juros
                  </Typography>
                </Stack>
                <Typography variant="h5" color="info.main">
                  R${' '}
                  {das.valores?.juros?.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'success.lighter' }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:dollar-bold-duotone" width={24} color="success.main" />
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                </Stack>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  R${' '}
                  {das.valores?.total?.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Informações */}
        <Card variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Data Vencimento
              </Typography>
              <Typography variant="body2">
                {das.dataVencimento
                  ? new Date(
                      `${das.dataVencimento.slice(0, 4)}-${das.dataVencimento.slice(4, 6)}-${das.dataVencimento.slice(6, 8)}`
                    ).toLocaleDateString('pt-BR')
                  : '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Data Limite Acolhimento
              </Typography>
              <Typography variant="body2">
                {das.dataLimiteAcolhimento
                  ? new Date(
                      `${das.dataLimiteAcolhimento.slice(0, 4)}-${das.dataLimiteAcolhimento.slice(4, 6)}-${das.dataLimiteAcolhimento.slice(6, 8)}`
                    ).toLocaleDateString('pt-BR')
                  : '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Gerado em
              </Typography>
              <Typography variant="body2">
                {das.geradoEm ? new Date(das.geradoEm).toLocaleString('pt-BR') : '-'}
              </Typography>
            </Grid>
            {das.status === 'pago' && (
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Pago em
                </Typography>
                <Typography variant="body2">
                  {das.dataPagamento ? new Date(das.dataPagamento).toLocaleString('pt-BR') : '-'}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Card>

        {/* Composição */}
        {das.composicao && das.composicao.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Composição de Tributos
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Período</TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell>Denominação</TableCell>
                    <TableCell align="right">Principal</TableCell>
                    <TableCell align="right">Multa</TableCell>
                    <TableCell align="right">Juros</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {das.composicao.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatarPeriodo(item.periodoApuracao)}</TableCell>
                      <TableCell>{item.codigo}</TableCell>
                      <TableCell>{item.denominacao}</TableCell>
                      <TableCell align="right">
                        R${' '}
                        {item.valores?.principal?.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell align="right">
                        R${' '}
                        {item.valores?.multa?.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell align="right">
                        R${' '}
                        {item.valores?.juros?.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2">
                          R${' '}
                          {item.valores?.total?.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Observações */}
        {das.observacoes && das.observacoes.length > 0 && (
          <Card variant="outlined" sx={{ p: 3, bgcolor: 'info.lighter' }}>
            <Typography variant="subtitle1" gutterBottom>
              Observações
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
              {das.observacoes.map((obs, i) => (
                <Typography component="li" key={i} variant="body2">
                  {obs}
                </Typography>
              ))}
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
}

