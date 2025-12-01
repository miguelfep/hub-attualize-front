'use client';

import { useState, useEffect, useCallback } from 'react';
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
  AlertTitle,
  LinearProgress,
  Paper,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useApuracao, recalcularApuracao, cancelarApuracao } from 'src/actions/apuracao';
import { useGetAllClientes } from 'src/actions/clientes';
import { formatarPeriodo } from 'src/utils/apuracao-helpers';

import { FatorRCard } from 'src/components/apuracao/fator-r-card';
import { NotasPorAnexoTable } from 'src/components/apuracao/notas-por-anexo-table';

// ----------------------------------------------------------------------

export function DetalhesApuracaoView({ clienteId, apuracaoId }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // Buscar dados do cliente
  const { data: clientes } = useGetAllClientes({ status: true });
  const cliente = clientes?.find((c) => (c._id || c.id) === clienteId);

  // Buscar apuração
  const { data: apuracaoData, isLoading, error, mutate } = useApuracao(apuracaoId);
  const apuracao = apuracaoData?.apuracao || apuracaoData;

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

  const handleRecalcular = useCallback(async () => {
    if (!window.confirm('Deseja recalcular esta apuração?')) return;

    try {
      setLoading(true);
      await recalcularApuracao(apuracaoId, {});
      toast.success('Apuração recalculada com sucesso!');
      mutate();
    } catch (error) {
      toast.error(error.message || 'Erro ao recalcular apuração');
    } finally {
      setLoading(false);
    }
  }, [apuracaoId, apuracao, mutate]);

  const handleCancelar = useCallback(async () => {
    const motivo = window.prompt('Informe o motivo do cancelamento:');
    if (!motivo) return;

    try {
      setLoading(true);
      await cancelarApuracao(apuracaoId, motivo);
      toast.success('Apuração cancelada com sucesso!');
      mutate();
    } catch (error) {
      toast.error(error.message || 'Erro ao cancelar apuração');
    } finally {
      setLoading(false);
    }
  }, [apuracaoId, mutate]);

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <LinearProgress sx={{ mb: 3 }} />
      </Container>
    );
  }

  if (error || !apuracao) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error">
          {error?.message || 'Apuração não encontrada'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading={`Apuração - ${formatarPeriodo(apuracao.periodoApuracao)}`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração', href: paths.dashboard.fiscal.apuracao },
          { name: 'Clientes', href: paths.dashboard.fiscal.apuracaoClientes },
          {
            name: cliente?.nome || cliente?.razao_social || 'Cliente',
            href: `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}`,
          },
          { name: formatarPeriodo(apuracao.periodoApuracao) },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            {!apuracao.dasGerado && apuracao.status !== 'cancelada' && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="solar:calculator-bold-duotone" />}
                  onClick={handleRecalcular}
                  disabled={loading}
                >
                  Recalcular
                </Button>
                <Button
                  variant="contained"
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
            {!apuracao.dasGerado && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="solar:upload-bold-duotone" />}
                onClick={() =>
                  router.push(
                    `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/${apuracaoId}/upload-das`
                  )
                }
              >
                Upload DAS
              </Button>
            )}
            {apuracao.dasId && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="solar:document-text-bold-duotone" />}
                onClick={() => {
                  // Extrair o ID do DAS corretamente (pode ser string ou objeto)
                  let dasId = null;
                  if (typeof apuracao.dasId === 'string') {
                    dasId = apuracao.dasId;
                  } else if (apuracao.dasId?._id) {
                    dasId = apuracao.dasId._id;
                  } else if (apuracao.dasId?.id) {
                    dasId = apuracao.dasId.id;
                  } else if (apuracao.das?._id) {
                    dasId = apuracao.das._id;
                  } else if (apuracao.das?.id) {
                    dasId = apuracao.das.id;
                  }
                  
                  // Garantir que é string
                  dasId = dasId ? String(dasId) : null;
                  
                  if (dasId) {
                    router.push(paths.dashboard.fiscal.dasDetalhes(dasId));
                  } else {
                    toast.error('ID do DAS não encontrado');
                  }
                }}
              >
                Ver DAS
              </Button>
            )}
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {(loading || isLoading) && <LinearProgress sx={{ mb: 3 }} />}

      <Stack spacing={3}>
        {/* Header com Status */}
        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" gutterBottom>
                Apuração - {formatarPeriodo(apuracao.periodoApuracao)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {apuracao.mesReferencia}/{apuracao.anoReferencia}
              </Typography>
            </Box>
            <Chip
              label={getStatusLabel(apuracao.status)}
              color={getStatusColor(apuracao.status)}
              icon={
                <Iconify
                  icon={
                    apuracao.status === 'das_gerado' || apuracao.status === 'pago'
                      ? 'solar:check-circle-bold-duotone'
                      : apuracao.status === 'cancelada'
                        ? 'solar:close-circle-bold-duotone'
                        : 'solar:document-text-bold-duotone'
                  }
                />
              }
            />
          </Stack>
        </Card>

        {/* Alertas */}
        {apuracao.alertas && apuracao.alertas.length > 0 && (
          <Alert severity="warning" icon={<Iconify icon="solar:danger-circle-bold-duotone" />}>
            <AlertTitle>Alertas</AlertTitle>
            <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
              {apuracao.alertas.map((alerta, i) => (
                <Typography component="li" key={i} variant="body2">
                  {alerta}
                </Typography>
              ))}
            </Stack>
          </Alert>
        )}

        {/* Totais */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:dollar-bold-duotone" width={24} color="primary.main" />
                  <Typography variant="caption" color="text.secondary">
                    Receita Bruta
                  </Typography>
                </Stack>
                <Typography variant="h4" color="primary.main">
                  R${' '}
                  {apuracao.totalReceitaBruta?.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:bill-list-bold-duotone" width={24} color="error.main" />
                  <Typography variant="caption" color="text.secondary">
                    Total de Impostos
                  </Typography>
                </Stack>
                <Typography variant="h4" color="error.main">
                  R${' '}
                  {apuracao.totalImpostos?.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:percent-bold-duotone" width={24} color="warning.main" />
                  <Typography variant="caption" color="text.secondary">
                    Alíquota Efetiva
                  </Typography>
                </Stack>
                <Typography variant="h4" color="warning.main">
                  {apuracao.aliquotaEfetivaTotal?.toFixed(2)}%
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Fator R */}
        {apuracao.fatorR && (
          <Box>
            <FatorRCard fatorR={apuracao.fatorR} />
          </Box>
        )}

        {/* Notas por Anexo */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notas Fiscais por Anexo
          </Typography>
          {apuracao.notasPorAnexo && apuracao.notasPorAnexo.length > 0 ? (
            <NotasPorAnexoTable notasPorAnexo={apuracao.notasPorAnexo} />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Nenhuma nota fiscal encontrada
            </Typography>
          )}
        </Card>

        {/* Observações */}
        {apuracao.observacoes && apuracao.observacoes.length > 0 && (
          <Card variant="outlined" sx={{ p: 3, bgcolor: 'info.lighter' }}>
            <Typography variant="subtitle1" gutterBottom>
              Observações
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
              {apuracao.observacoes.map((obs, i) => (
                <Typography component="li" key={i} variant="body2">
                  {obs}
                </Typography>
              ))}
            </Stack>
          </Card>
        )}

        {/* Memória de Cálculo */}
        {apuracao.memoriaCalculo && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Memória de Cálculo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Detalhamento completo de como foi calculada esta apuração
            </Typography>

            <Stack spacing={3}>
              {/* Informações Básicas */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold-duotone" />}>
                  <Typography variant="subtitle1">Informações Básicas</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Período de Apuração
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {(() => {
                          const periodo = apuracao.memoriaCalculo.periodoApuracao || apuracao.periodoApuracao;
                          if (!periodo) return '-';
                          if (typeof periodo === 'string') return formatarPeriodo(periodo);
                          if (typeof periodo === 'object' && periodo.inicio && periodo.fim) {
                            return `${formatarPeriodo(String(periodo.inicio))} a ${formatarPeriodo(String(periodo.fim))}`;
                          }
                          return String(periodo);
                        })()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Data do Cálculo
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {(() => {
                          const dataCalc = apuracao.memoriaCalculo.dataCalculo;
                          if (!dataCalc) return '-';
                          try {
                            return new Date(dataCalc).toLocaleString('pt-BR');
                          } catch {
                            return String(dataCalc);
                          }
                        })()}
                      </Typography>
                    </Grid>
                    {apuracao.memoriaCalculo.cliente && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Cliente
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {apuracao.memoriaCalculo.cliente.nome || '-'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            CNPJ
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {apuracao.memoriaCalculo.cliente.cnpj || '-'}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>

             
              {/* Notas Processadas */}
              {apuracao.memoriaCalculo.notasProcessadas && (
                <Accordion>
                  <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold-duotone" />}>
                    <Typography variant="subtitle1">Notas Processadas</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          Total de Notas
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {apuracao.memoriaCalculo.notasProcessadas.total || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          Período
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {(() => {
                            const periodo = apuracao.memoriaCalculo.notasProcessadas.periodo;
                            if (!periodo) return '-';
                            if (typeof periodo === 'string') return formatarPeriodo(periodo);
                            if (typeof periodo === 'object' && periodo.inicio && periodo.fim) {
                              return `${formatarPeriodo(String(periodo.inicio))} a ${formatarPeriodo(String(periodo.fim))}`;
                            }
                            return String(periodo);
                          })()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          Receita Bruta Total
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          R${' '}
                          {Number(apuracao.memoriaCalculo.notasProcessadas.totalReceitaBruta || 0).toLocaleString(
                            'pt-BR',
                            { minimumFractionDigits: 2 }
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* RBT12 - Receita Bruta Total dos Últimos 12 Meses */}
              {apuracao.memoriaCalculo.rbt12 && (
                <Accordion>
                  <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold-duotone" />}>
                    <Typography variant="subtitle1">
                      RBT12 - Receita Bruta Total (Últimos 12 Meses)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Valor Total
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="primary.main">
                            R${' '}
                            {Number(apuracao.memoriaCalculo.rbt12.valor || 0).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary">
                            Meses Considerados
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {apuracao.memoriaCalculo.rbt12.mesesConsiderados || 0} meses
                          </Typography>
                        </Grid>
                      </Grid>

                      {apuracao.memoriaCalculo.rbt12.composicao &&
                        apuracao.memoriaCalculo.rbt12.composicao.length > 0 && (
                          <>
                            <Divider />
                            <Typography variant="subtitle2" gutterBottom>
                              Composição Mensal
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Período</TableCell>
                                    <TableCell align="right">Receita</TableCell>
                                    <TableCell>Origem</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {apuracao.memoriaCalculo.rbt12.composicao.map((item, idx) => {
                                    const periodoStr = (() => {
                                      const periodo = item.periodo;
                                      if (!periodo) return '-';
                                      if (typeof periodo === 'string') return formatarPeriodo(periodo);
                                      if (typeof periodo === 'object' && periodo.inicio && periodo.fim) {
                                        return `${formatarPeriodo(String(periodo.inicio))} a ${formatarPeriodo(String(periodo.fim))}`;
                                      }
                                      return String(periodo);
                                    })();

                                    return (
                                      <TableRow key={idx}>
                                        <TableCell>{periodoStr}</TableCell>
                                        <TableCell align="right">
                                          R${' '}
                                          {Number(item.receita || 0).toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                          })}
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            size="small"
                                            label={
                                              item.origem
                                                ? typeof item.origem === 'string'
                                                  ? item.origem
                                                  : String(item.origem)
                                                : '-'
                                            }
                                            color={item.origem === 'mes_atual' ? 'primary' : 'default'}
                                            variant="outlined"
                                          />
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </>
                        )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Fator R */}
              {apuracao.memoriaCalculo.fatorR && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold-duotone" />}>
                    <Typography variant="subtitle1">Cálculo do Fator R</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={3}>
                      {/* Fórmula */}
                      {apuracao.memoriaCalculo.fatorR.formula && (
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Fórmula
                          </Typography>
                          <Typography variant="body2" fontFamily="monospace">
                            {apuracao.memoriaCalculo.fatorR.formula}
                          </Typography>
                        </Paper>
                      )}

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            Folha do Mês
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            R${' '}
                            {Number(apuracao.memoriaCalculo.fatorR.folhaDoMes || 0).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            INSS do Mês
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            R${' '}
                            {Number(apuracao.memoriaCalculo.fatorR.inssDoMes || 0).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            Receita do Mês
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            R${' '}
                            {Number(apuracao.memoriaCalculo.fatorR.receitaDoMes || 0).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            Folha 12 Meses
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            R${' '}
                            {Number(apuracao.memoriaCalculo.fatorR.folhaPagamento12Meses || 0).toLocaleString(
                              'pt-BR',
                              { minimumFractionDigits: 2 }
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            INSS 12 Meses
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            R${' '}
                            {Number(apuracao.memoriaCalculo.fatorR.inssCpp12Meses || 0).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            Receita 12 Meses
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            R${' '}
                            {Number(apuracao.memoriaCalculo.fatorR.receitaBruta12Meses || 0).toLocaleString(
                              'pt-BR',
                              { minimumFractionDigits: 2 }
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            Percentual
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                            {Number(apuracao.memoriaCalculo.fatorR.percentual || 0).toFixed(2)}%
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            Anexo Aplicável
                          </Typography>
                          <Chip
                            label={apuracao.memoriaCalculo.fatorR.aplicavelAnexoIII ? 'Anexo III' : 'Anexo V'}
                            color={apuracao.memoriaCalculo.fatorR.aplicavelAnexoIII ? 'success' : 'warning'}
                            size="small"
                          />
                        </Grid>
                        {apuracao.memoriaCalculo.fatorR.mesesConsiderados && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">
                              Meses Considerados
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {apuracao.memoriaCalculo.fatorR.mesesConsiderados} meses
                            </Typography>
                          </Grid>
                        )}
                      </Grid>

                      {/* Observações do Fator R */}
                      {apuracao.memoriaCalculo.fatorR.observacoes &&
                        apuracao.memoriaCalculo.fatorR.observacoes.length > 0 && (
                          <Alert severity="info">
                            <AlertTitle>Observações</AlertTitle>
                            <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
                              {apuracao.memoriaCalculo.fatorR.observacoes.map((obs, i) => (
                                <Typography component="li" key={i} variant="body2">
                                  {obs}
                                </Typography>
                              ))}
                            </Stack>
                          </Alert>
                        )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Alíquotas Efetivas */}
              {apuracao.memoriaCalculo.aliquotasEfetivas && (
                <Accordion>
                  <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold-duotone" />}>
                    <Typography variant="subtitle1">Alíquotas Efetivas Calculadas</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {apuracao.memoriaCalculo.aliquotasEfetivas.anexoIII && (
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Anexo III
                          </Typography>
                          <Stack spacing={2}>
                            {apuracao.memoriaCalculo.aliquotasEfetivas.anexoIII.formula && (
                              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                  Fórmula
                                </Typography>
                                <Typography variant="body2" fontFamily="monospace">
                                  {apuracao.memoriaCalculo.aliquotasEfetivas.anexoIII.formula}
                                </Typography>
                              </Paper>
                            )}
                            <Grid container spacing={2}>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">
                                  RBT12
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  R${' '}
                                  {Number(apuracao.memoriaCalculo.aliquotasEfetivas.anexoIII.rbt12 || 0).toLocaleString(
                                    'pt-BR',
                                    { minimumFractionDigits: 2 }
                                  )}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Alíquota
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {Number(apuracao.memoriaCalculo.aliquotasEfetivas.anexoIII.aliquota || 0).toFixed(
                                    2
                                  )}
                                  %
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Dedução
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  R${' '}
                                  {Number(apuracao.memoriaCalculo.aliquotasEfetivas.anexoIII.deducao || 0).toLocaleString(
                                    'pt-BR',
                                    { minimumFractionDigits: 2 }
                                  )}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Alíquota Efetiva
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                  {Number(
                                    apuracao.memoriaCalculo.aliquotasEfetivas.anexoIII.aliquotaEfetiva || 0
                                  ).toFixed(2)}
                                  %
                                </Typography>
                              </Grid>
                            </Grid>
                          </Stack>
                        </Card>
                      )}

                      {apuracao.memoriaCalculo.aliquotasEfetivas.anexoV && (
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Anexo V
                          </Typography>
                          <Stack spacing={2}>
                            {apuracao.memoriaCalculo.aliquotasEfetivas.anexoV.formula && (
                              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                  Fórmula
                                </Typography>
                                <Typography variant="body2" fontFamily="monospace">
                                  {apuracao.memoriaCalculo.aliquotasEfetivas.anexoV.formula}
                                </Typography>
                              </Paper>
                            )}
                            <Grid container spacing={2}>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">
                                  RBT12
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  R${' '}
                                  {Number(apuracao.memoriaCalculo.aliquotasEfetivas.anexoV.rbt12 || 0).toLocaleString(
                                    'pt-BR',
                                    { minimumFractionDigits: 2 }
                                  )}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Alíquota
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {Number(apuracao.memoriaCalculo.aliquotasEfetivas.anexoV.aliquota || 0).toFixed(2)}%
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Dedução
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  R${' '}
                                  {Number(apuracao.memoriaCalculo.aliquotasEfetivas.anexoV.deducao || 0).toLocaleString(
                                    'pt-BR',
                                    { minimumFractionDigits: 2 }
                                  )}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Alíquota Efetiva
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="warning.main">
                                  {Number(
                                    apuracao.memoriaCalculo.aliquotasEfetivas.anexoV.aliquotaEfetiva || 0
                                  ).toFixed(2)}
                                  %
                                </Typography>
                              </Grid>
                            </Grid>
                          </Stack>
                        </Card>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Cálculo de Impostos */}
              {apuracao.memoriaCalculo.calculoImpostos &&
                apuracao.memoriaCalculo.calculoImpostos.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold-duotone" />}>
                      <Typography variant="subtitle1">Cálculo de Impostos por Anexo</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        {apuracao.memoriaCalculo.calculoImpostos.map((calc, idx) => (
                          <Card key={idx} variant="outlined" sx={{ p: 2 }}>
                            <Stack spacing={2}>
                              <Box>
                                <Chip
                                  label={`Anexo ${calc.anexo}`}
                                  color={calc.usaFatorR ? 'success' : 'default'}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                {calc.usaFatorR && (
                                  <Chip label="Usa Fator R" size="small" color="success" variant="outlined" />
                                )}
                              </Box>

                              {calc.formula && (
                                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
                                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    Fórmula
                                  </Typography>
                                  <Typography variant="body2" fontFamily="monospace">
                                    {calc.formula}
                                  </Typography>
                                </Paper>
                              )}

                              <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption" color="text.secondary">
                                    Quantidade de Notas
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {calc.quantidadeNotas || 0}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption" color="text.secondary">
                                    Receita Bruta
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    R${' '}
                                    {Number(calc.receitaBruta || 0).toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                    })}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption" color="text.secondary">
                                    Alíquota Efetiva
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold">
                                    {Number(calc.aliquotaEfetiva || 0).toFixed(2)}%
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="caption" color="text.secondary">
                                    Imposto Calculado
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold" color="error.main">
                                    R${' '}
                                    {Number(calc.impostoCalculado || 0).toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                    })}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )}

              {/* Totais da Memória */}
              {apuracao.memoriaCalculo.totais && (
                <Card variant="outlined" sx={{ p: 3, bgcolor: 'primary.lighter' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Totais do Cálculo
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Receita Bruta
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        R${' '}
                        {Number(apuracao.memoriaCalculo.totais.receitaBruta || 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Total de Impostos
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="error.main">
                        R${' '}
                        {Number(apuracao.memoriaCalculo.totais.totalImpostos || 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Alíquota Efetiva Total
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="warning.main">
                        {Number(apuracao.memoriaCalculo.totais.aliquotaEfetivaTotal || 0).toFixed(2)}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              )}

              {/* Observações e Alertas do Cálculo */}
              {(apuracao.memoriaCalculo.observacoesCalculo?.length > 0 ||
                apuracao.memoriaCalculo.alertasCalculo?.length > 0) && (
                <>
                  {apuracao.memoriaCalculo.observacoesCalculo?.length > 0 && (
                    <Alert severity="info">
                      <AlertTitle>Observações do Cálculo</AlertTitle>
                      <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
                        {apuracao.memoriaCalculo.observacoesCalculo.map((obs, i) => (
                          <Typography component="li" key={i} variant="body2">
                            {obs}
                          </Typography>
                        ))}
                      </Stack>
                    </Alert>
                  )}

                  {apuracao.memoriaCalculo.alertasCalculo?.length > 0 && (
                    <Alert severity="warning">
                      <AlertTitle>Alertas do Cálculo</AlertTitle>
                      <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
                        {apuracao.memoriaCalculo.alertasCalculo.map((alerta, i) => (
                          <Typography component="li" key={i} variant="body2">
                            {alerta}
                          </Typography>
                        ))}
                      </Stack>
                    </Alert>
                  )}
                </>
              )}
            </Stack>
          </Card>
        )}

        {/* Informações Adicionais */}
        <Card variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Calculado em
              </Typography>
              <Typography variant="body2">
                {apuracao.calculadoEm
                  ? new Date(apuracao.calculadoEm).toLocaleString('pt-BR')
                  : '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Atualizado em
              </Typography>
              <Typography variant="body2">
                {apuracao.atualizadoEm
                  ? new Date(apuracao.atualizadoEm).toLocaleString('pt-BR')
                  : '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Regime Tributário
              </Typography>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {apuracao.regimeTributario || '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Anexo Principal
              </Typography>
              <Typography variant="body2">
                {apuracao.anexoPrincipal?.join(', ') || '-'}
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Stack>
    </Container>
  );
}

