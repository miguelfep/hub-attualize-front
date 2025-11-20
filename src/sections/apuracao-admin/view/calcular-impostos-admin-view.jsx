'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import {
  Container,
  Stack,
  Card,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Alert,
  AlertTitle,
  Divider,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { calcularApuracao } from 'src/actions/apuracao';
import { useHistorico12Meses } from 'src/actions/historico-folha';
import { useGetAllClientes } from 'src/actions/clientes';
import { FATOR_R_MINIMO, formatarPeriodo } from 'src/utils/apuracao-helpers';

// ----------------------------------------------------------------------

export function CalcularImpostosAdminView() {
  const router = useRouter();

  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [calculando, setCalculando] = useState(false);
  const [resultado, setResultado] = useState(null);

  // Buscar lista de clientes
  const { data: clientes, isLoading: loadingClientes } = useGetAllClientes({
    status: true,
    apurarHub: true, // Apenas clientes com apuração habilitada
  });

  // Buscar histórico quando cliente e período são selecionados
  const { data: historico12Meses, isLoading: loadingHistorico } = useHistorico12Meses(
    clienteSelecionado,
    periodo
  );

  const handleCalcular = useCallback(async () => {
    if (!clienteSelecionado) {
      toast.error('Selecione um cliente');
      return;
    }

    if (!periodo || periodo.length !== 6) {
      toast.error('Informe um período válido (AAAAMM)');
      return;
    }

    try {
      setCalculando(true);
      const apuracao = await calcularApuracao(clienteSelecionado, {
        periodoApuracao: periodo,
        calcularFatorR: true,
        folhaPagamentoMes: historico12Meses?.historicos?.[0]?.folhaPagamento,
        inssCppMes: historico12Meses?.historicos?.[0]?.inssCpp,
      });

      setResultado(apuracao);
      toast.success('Apuração calculada com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Erro ao calcular apuração');
      console.error(error);
    } finally {
      setCalculando(false);
    }
  }, [clienteSelecionado, periodo, historico12Meses]);

  const handleGerarDAS = useCallback(() => {
    if (!resultado) return;
    router.push(`${paths.dashboard.fiscal.apuracaoList}?apuracaoId=${resultado._id}`);
  }, [resultado, router]);

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Calcular Impostos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração', href: paths.dashboard.fiscal.apuracao },
          { name: 'Calcular' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        {/* Formulário de Cálculo */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dados para Cálculo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Selecione o cliente e o período para calcular os impostos baseados nas notas fiscais
            emitidas
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Cliente"
                value={clienteSelecionado}
                onChange={(e) => setClienteSelecionado(e.target.value)}
                helperText="Selecione o cliente para calcular a apuração"
                disabled={loadingClientes}
              >
                <MenuItem value="">
                  {loadingClientes ? 'Carregando...' : 'Selecione um cliente'}
                </MenuItem>
                {clientes && clientes.length > 0 ? (
                  clientes.map((cliente) => (
                    <MenuItem key={cliente._id || cliente.id} value={cliente._id || cliente.id}>
                      {cliente.nome || cliente.razao_social} - {cliente.cnpj}
                    </MenuItem>
                  ))
                ) : (
                  !loadingClientes && (
                    <MenuItem value="" disabled>
                      Nenhum cliente disponível
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Período de Apuração"
                placeholder="202412"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                helperText="Formato: AAAAMM (ex: 202412 para Dezembro/2024)"
                InputProps={{
                  endAdornment: periodo && (
                    <Typography variant="caption" color="text.secondary">
                      {formatarPeriodo(periodo)}
                    </Typography>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<Iconify icon="solar:calculator-bold-duotone" />}
            onClick={handleCalcular}
            disabled={!clienteSelecionado || !periodo || calculando}
            sx={{ mt: 3 }}
          >
            {calculando ? 'Calculando...' : 'Calcular Impostos'}
          </Button>
        </Card>

        {/* Loading do Histórico */}
        {loadingHistorico && clienteSelecionado && periodo && (
          <Alert severity="info">
            <AlertTitle>Buscando Dados</AlertTitle>
            Carregando histórico de folha e faturamento...
          </Alert>
        )}

        {/* Informações do Histórico/Fator R */}
        {historico12Meses && clienteSelecionado && periodo && (
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Histórico e Fator R</Typography>
                <Chip
                  label={
                    historico12Meses.totais.atingeFatorRMinimo
                      ? `Anexo III (≥${FATOR_R_MINIMO}%)`
                      : `Anexo V (<${FATOR_R_MINIMO}%)`
                  }
                  color={historico12Meses.totais.atingeFatorRMinimo ? 'success' : 'warning'}
                />
              </Stack>

              <Alert
                severity={historico12Meses.totais.atingeFatorRMinimo ? 'success' : 'info'}
                icon={
                  <Iconify
                    icon={
                      historico12Meses.totais.atingeFatorRMinimo
                        ? 'solar:check-circle-bold-duotone'
                        : 'solar:info-circle-bold-duotone'
                    }
                  />
                }
              >
                <AlertTitle>
                  Fator R: {historico12Meses.totais.fatorRMedio.toFixed(2)}%
                </AlertTitle>
                {historico12Meses.totais.atingeFatorRMinimo ? (
                  <>
                    Cliente atinge o fator R mínimo. <strong>Anexo III será aplicado</strong> com
                    alíquotas reduzidas.
                  </>
                ) : (
                  <>
                    Fator R abaixo do mínimo. <strong>Anexo V será aplicado</strong>.
                  </>
                )}
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Folha + INSS (12 meses)
                    </Typography>
                    <Typography variant="h6">
                      R${' '}
                      {historico12Meses.totais.folhaComEncargosTotal.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Faturamento (12 meses)
                    </Typography>
                    <Typography variant="h6">
                      R${' '}
                      {historico12Meses.totais.faturamentoTotal.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Meses Registrados
                    </Typography>
                    <Typography variant="h6">{historico12Meses.mesesEncontrados} / 12</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </Card>
        )}

        {/* Loading do Cálculo */}
        {calculando && <LinearProgress />}

        {/* Resultado do Cálculo */}
        {resultado && (
          <>
            {/* Resumo do Cálculo */}
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5">Resultado da Apuração</Typography>
                  <Chip
                    label={resultado.status}
                    color="success"
                    icon={<Iconify icon="solar:check-circle-bold-duotone" />}
                  />
                </Stack>

                <Divider />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Receita Bruta Total
                      </Typography>
                      <Typography variant="h4">
                        R${' '}
                        {resultado.totalReceitaBruta.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Total de Impostos
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        R${' '}
                        {resultado.totalImpostos.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Alíquota Efetiva
                      </Typography>
                      <Typography variant="h4">
                        {resultado.aliquotaEfetivaTotal.toFixed(2)}%
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                {/* Notas por Anexo */}
                {resultado.notasPorAnexo && resultado.notasPorAnexo.length > 0 && (
                  <>
                    <Divider />
                    <Typography variant="h6">Detalhamento por Anexo</Typography>
                    {resultado.notasPorAnexo.map((anexoData, index) => (
                      <Accordion key={index}>
                        <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-linear" />}>
                          <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                            <Chip label={`Anexo ${anexoData.anexo}`} color="primary" />
                            {anexoData.usaFatorR && (
                              <Chip label="Com Fator R" size="small" color="success" />
                            )}
                            <Typography variant="body2" sx={{ ml: 'auto' }}>
                              {anexoData.quantidadeNotas} nota(s) -{' '}
                              <strong>
                                R${' '}
                                {anexoData.totalNotas.toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                })}
                              </strong>
                            </Typography>
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={2}>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Alíquota Efetiva
                                </Typography>
                                <Typography variant="subtitle1">
                                  {anexoData.aliquotaEfetiva.toFixed(2)}%
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Imposto Calculado
                                </Typography>
                                <Typography variant="subtitle1" color="error.main">
                                  R${' '}
                                  {anexoData.impostoCalculado.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                  })}
                                </Typography>
                              </Grid>
                            </Grid>

                            {anexoData.notas && anexoData.notas.length > 0 && (
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Nota</TableCell>
                                      <TableCell>Data</TableCell>
                                      <TableCell align="right">Valor</TableCell>
                                      <TableCell>CNAE</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {anexoData.notas.map((nota, noteIndex) => (
                                      <TableRow key={noteIndex}>
                                        <TableCell>{nota.numeroNota}</TableCell>
                                        <TableCell>
                                          {new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell align="right">
                                          R${' '}
                                          {nota.valorServicos.toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                          })}
                                        </TableCell>
                                        <TableCell>{nota.cnae}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </>
                )}

                {/* Observações */}
                {resultado.observacoes && resultado.observacoes.length > 0 && (
                  <>
                    <Divider />
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Observações</Typography>
                      {resultado.observacoes.map((obs, index) => (
                        <Alert key={index} severity="info" sx={{ py: 0.5 }}>
                          {obs}
                        </Alert>
                      ))}
                    </Stack>
                  </>
                )}

                {/* Ações */}
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<Iconify icon="solar:upload-bold-duotone" />}
                    onClick={handleGerarDAS}
                  >
                    Gerar/Upload DAS
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push(paths.dashboard.fiscal.apuracaoList)}
                  >
                    Ver Todas Apurações
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </>
        )}

        {/* Informações Adicionais */}
        {!resultado && !calculando && (
          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
            <AlertTitle>Como Funciona o Cálculo</AlertTitle>
            <Typography variant="body2" component="div">
              O sistema irá:
              <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Buscar todas as notas fiscais emitidas no período selecionado</li>
                <li>Calcular o Fator R baseado no histórico dos últimos 12 meses</li>
                <li>Determinar o anexo aplicável (III ou V) conforme o Fator R</li>
                <li>Calcular a alíquota efetiva baseada na receita bruta acumulada</li>
                <li>Aplicar a alíquota sobre cada nota fiscal</li>
                <li>Gerar o total de impostos a pagar</li>
              </ol>
            </Typography>
          </Alert>
        )}
      </Stack>
    </Container>
  );
}

