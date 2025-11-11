'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { toast } from 'sonner';
import { NumericFormat } from 'react-number-format';

import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useApuracoes, useDas, useApuracaoActions } from 'src/hooks/use-apuracao';
import { useFatorR } from 'src/hooks/use-fator-r';
import { importarHistorico } from 'src/actions/fator-r';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { STATUS_APURACAO, STATUS_DAS } from 'src/types/apuracao';
import { DashboardContent } from 'src/layouts/dashboard/main';

// ----------------------------------------------------------------------

const STATUS_FILTRO_OPCOES = [
  { value: '', label: 'Todas' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'calculada', label: 'Calculadas' },
  { value: 'validada', label: 'Validadas' },
  { value: 'transmitida', label: 'Transmitidas' },
  { value: 'das_gerado', label: 'DAS gerado' },
  { value: 'pago', label: 'Pagas' },
  { value: 'cancelada', label: 'Canceladas' },
];

const STATUS_APURACAO_COLORS = {
  pendente: 'warning',
  calculada: 'info',
  validada: 'primary',
  transmitida: 'secondary',
  das_gerado: 'info',
  pago: 'success',
  cancelada: 'default',
};

const STATUS_DAS_COLORS = {
  gerado: 'info',
  pago: 'success',
  cancelado: 'default',
  vencido: 'error',
};

const AMBIENTE_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Teste', value: 'teste' },
  { label: 'Produção', value: 'producao' },
];

const STATUS_DAS_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Gerado', value: 'gerado' },
  { label: 'Pago', value: 'pago' },
  { label: 'Cancelado', value: 'cancelado' },
  { label: 'Vencido', value: 'vencido' },
];

dayjs.locale('pt-br');

// ----------------------------------------------------------------------

function formatCurrency(value) {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatPercent(value, decimals = 2) {
  if (value === undefined || value === null) return '—';
  return `${value.toFixed(decimals)}%`;
}

function formatPeriodo(periodo) {
  if (!periodo || periodo.length !== 6) return periodo || '—';
  const ano = periodo.slice(0, 4);
  const mes = parseInt(periodo.slice(4, 6), 10);
  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return `${meses[mes - 1]}/${ano}`;
}

function formatDateIso(value) {
  if (!value) return '—';
  const formatted = fDate(value, 'DD/MM/YYYY');
  return formatted || '—';
}

function podeGerarDas(apuracao) {
  if (!apuracao) return false;
  if (apuracao.dasGerado) return false;
  return ['validada', 'transmitida', 'calculada'].includes(apuracao.status);
}

function podeCancelarApuracao(apuracao) {
  if (!apuracao) return false;
  return !apuracao.dasGerado;
}

function podeRegistrarFolha(cliente) {
  return Boolean(cliente?.apurarHub);
}

function validarClienteParaApuracao(cliente) {
  if (!cliente) return { valido: false, erros: ['Cliente não encontrado'] };

  const erros = [];

  if (!cliente.apurarHub) {
    erros.push('Cliente não está habilitado para Apuração Hub');
  }

  if (cliente.regimeTributario !== 'simples') {
    erros.push('Cliente não está no regime Simples Nacional');
  }

  if (!cliente.cnpj) {
    erros.push('Cliente não possui CNPJ cadastrado');
  }

  if (!cliente.atividade_principal || !cliente.atividade_principal.length) {
    erros.push('Cliente não possui CNAE principal cadastrado');
  }

  return {
    valido: erros.length === 0,
    erros,
  };
}

// ----------------------------------------------------------------------

function ImportarHistoricoDialog({ open, onClose, onFileSelected, onSubmit, loading, error, selectedFile }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Importar histórico de faturamento</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">
            Faça upload do CSV exportado do Simples Nacional. O histórico será atualizado com os valores reais de faturamento e folha de pagamento.
          </Alert>

          <Button
            variant="outlined"
            component="label"
            startIcon={<Iconify icon="solar:upload-minimalistic-bold" width={18} />}
          >
            Selecionar CSV
            <input
              type="file"
              hidden
              accept=".csv,text/csv"
              onChange={(event) => onFileSelected(event.target.files?.[0] || null)}
            />
          </Button>

          {selectedFile && <Chip label={`Arquivo selecionado: ${selectedFile.name}`} color="info" variant="outlined" />}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={loading} onClick={onSubmit}>
          Importar histórico
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}


export function ApuracaoDashboardView({ cliente }) {
  const router = useRouter();
  const clienteId = cliente?._id;

  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroPeriodoInicio, setFiltroPeriodoInicio] = useState('');
  const [filtroPeriodoFim, setFiltroPeriodoFim] = useState('');
  const [filtroAmbienteDas, setFiltroAmbienteDas] = useState('');
  const [filtroStatusDas, setFiltroStatusDas] = useState('');

  const [dialogNovaApuracao, setDialogNovaApuracao] = useState(false);
  const [dialogFolha, setDialogFolha] = useState(false);
  const [dialogSimulador, setDialogSimulador] = useState(false);
  const [apuracaoSelecionada, setApuracaoSelecionada] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [dialogEditarHistorico, setDialogEditarHistorico] = useState(false);
  const [historicoSelecionado, setHistoricoSelecionado] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');

  const { data: apuracoesResp, isLoading: loadingApuracoes, mutate: mutateApuracoes } = useApuracoes(
    clienteId,
    {
      status: filtroStatus || undefined,
      periodoInicio: filtroPeriodoInicio || undefined,
      periodoFim: filtroPeriodoFim || undefined,
    }
  );

  const { data: dasResp, isLoading: loadingDas, mutate: mutateDas } = useDas(clienteId, {
    ambiente: filtroAmbienteDas || undefined,
    status: filtroStatusDas || undefined,
  });

  const apuracoes = useMemo(() => apuracoesResp?.apuracoes || apuracoesResp?.data || [], [apuracoesResp]);
  const das = useMemo(() => dasResp?.das || dasResp?.data || [], [dasResp]);

  const { totais, proLaboreIdeal, resultadoSimulacao, loading: loadingFatorR, loadingSimulacao, simular, registrar, refetch: refetchFatorR } =
    useFatorR(clienteId);

  const { calcular, gerarDasDeApuracao, cancelarApuracao, gerarDasDireto, cancelarDas, marcarDasPago, baixarDasPdf } =
    useApuracaoActions();

  const validacaoCliente = useMemo(() => validarClienteParaApuracao(cliente), [cliente]);

  const handleNovaApuracao = useCallback(async (payload) => {
    try {
      setLoadingAction(true);
      await calcular(clienteId, payload);
      toast.success('Apuração calculada com sucesso!');
      setDialogNovaApuracao(false);
      mutateApuracoes();
      refetchFatorR();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erro ao calcular apuração');
    } finally {
      setLoadingAction(false);
    }
  }, [calcular, clienteId, mutateApuracoes, refetchFatorR]);

  const handleGerarDas = useCallback(
    async (apuracao, ambiente = 'teste') => {
      if (!apuracao?._id) return;
      try {
        setLoadingAction(true);
        await gerarDasDeApuracao(apuracao._id, { ambiente });
        toast.success('DAS gerado com sucesso!');
        mutateApuracoes();
        mutateDas();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Erro ao gerar DAS');
      } finally {
        setLoadingAction(false);
      }
    },
    [gerarDasDeApuracao, mutateApuracoes, mutateDas]
  );

  const handleCancelarApuracao = useCallback(
    async (apuracao) => {
      if (!apuracao?._id) return;
      try {
        setLoadingAction(true);
        await cancelarApuracao(apuracao._id);
        toast.success('Apuração cancelada.');
        mutateApuracoes();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Erro ao cancelar apuração');
      } finally {
        setLoadingAction(false);
      }
    },
    [cancelarApuracao, mutateApuracoes]
  );

  const handleRegistrarFolha = useCallback(
    async (payload) => {
      try {
        setLoadingAction(true);
        await registrar(clienteId, payload);
        toast.success('Folha registrada com sucesso!');
        setDialogFolha(false);
        refetchFatorR();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Erro ao registrar folha');
      } finally {
        setLoadingAction(false);
      }
    },
    [clienteId, registrar, refetchFatorR]
  );

  const handleSimularFatorR = useCallback(
    async (payload) => {
      try {
        await simular(clienteId, payload);
        toast.success('Simulação concluída');
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Erro ao simular Fator R');
      }
    },
    [clienteId, simular]
  );

  const handleEditarHistorico = useCallback((historico) => {
    setHistoricoSelecionado(historico);
    setDialogEditarHistorico(true);
  }, []);

  const handleSalvarHistorico = useCallback(
    async (payload) => {
      try {
        setLoadingAction(true);
        await registrar(clienteId, payload);
        toast.success('Histórico atualizado com sucesso!');
        setDialogEditarHistorico(false);
        setHistoricoSelecionado(null);
        refetchFatorR();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Erro ao atualizar histórico');
      } finally {
        setLoadingAction(false);
      }
    },
    [clienteId, registrar, refetchFatorR]
  );

  const handleMarcarDasPago = useCallback(
    async (dasId, valorPago, dataPagamento) => {
      try {
        setLoadingAction(true);
        await marcarDasPago(dasId, {
          valorPago,
          dataPagamento: dataPagamento ? new Date(dataPagamento).toISOString() : undefined,
        });
        toast.success('DAS marcado como pago.');
        mutateDas();
        mutateApuracoes();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Erro ao marcar DAS como pago');
      } finally {
        setLoadingAction(false);
      }
    },
    [marcarDasPago, mutateDas, mutateApuracoes]
  );

  const handleCancelarDas = useCallback(
    async (dasId) => {
      try {
        setLoadingAction(true);
        await cancelarDas(dasId);
        toast.success('DAS cancelado.');
        mutateDas();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Erro ao cancelar DAS');
      } finally {
        setLoadingAction(false);
      }
    },
    [cancelarDas, mutateDas]
  );

  const handleBaixarDas = useCallback(async (dasId) => {
    try {
      const { data } = await baixarDasPdf(dasId);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DAS_${dasId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Erro ao baixar PDF do DAS');
    }
  }, [baixarDasPdf]);

  const handleVerDetalhesApuracao = useCallback((apuracao) => {
    if (!apuracao?._id) return;
    router.push(paths.dashboard.apuracao.detalhes(apuracao._id));
  }, [router]);

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="h3">Apuração de Impostos</Typography>
            <Typography variant="body2" color="text.secondary">
              Calcule o Simples Nacional, acompanhe DAS e otimize o Fator R para o cliente selecionado.
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
            size="small"
            sx={{ px: 2.5, fontSize: '0.75rem', textTransform: 'none', justifyContent: 'center', minHeight: 40 }}
              startIcon={<Iconify icon="solar:upload-minimalistic-bold" width={18} />}
              onClick={() => {
                setImportDialogOpen(true);
                setImportFile(null);
                setImportError('');
              }}
            >
            Importar CSV
            </Button>
            <Button
              variant="outlined"
              color="secondary"
            size="small"
            sx={{ px: 2.5, fontSize: '0.75rem', textTransform: 'none', justifyContent: 'center', minHeight: 40 }}
              startIcon={<Iconify icon="solar:chart-2-bold" />}
              onClick={() => setDialogSimulador(true)}
              disabled={!podeRegistrarFolha(cliente)}
            >
            Simular Fator R
            </Button>
            <Button
              variant="outlined"
            size="small"
            sx={{ px: 2.5, fontSize: '0.75rem', textTransform: 'none', justifyContent: 'center', minHeight: 40 }}
              startIcon={<Iconify icon="solar:wallet-bold" />}
              onClick={() => setDialogFolha(true)}
              disabled={!podeRegistrarFolha(cliente)}
            >
              Registrar Folha
            </Button>
            <Button
              variant="contained"
            size="small"
            sx={{ px: 2.5, fontSize: '0.75rem', textTransform: 'none', justifyContent: 'center', minHeight: 40 }}
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={() => setDialogNovaApuracao(true)}
              disabled={!validacaoCliente.valido}
            >
              Nova Apuração
            </Button>
          </Stack>
        </Stack>

        {!validacaoCliente.valido && (
          <Alert severity="warning">
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Este cliente ainda não está apto para utilizar o módulo de apuração.
            </Typography>
            <Stack spacing={0.5}>
              {validacaoCliente.erros.map((erro) => (
                <Typography key={erro} variant="body2">
                  • {erro}
                </Typography>
              ))}
            </Stack>
          </Alert>
        )}

        <ResumoFatorRCard
          totais={totais}
          proLaboreIdeal={proLaboreIdeal}
          loading={loadingFatorR}
          resultadoSimulacao={resultadoSimulacao}
        />

        <HistoricoFaturamentoCard
          periodos={totais?.periodos}
          loading={loadingFatorR}
          onEditar={podeRegistrarFolha(cliente) ? handleEditarHistorico : null}
        />

        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Status das apurações"
                value={filtroStatus}
                onChange={(event) => setFiltroStatus(event.target.value)}
                size="small"
                sx={{ minWidth: { xs: '100%', md: 220 } }}
              >
                {STATUS_FILTRO_OPCOES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Período inicial (AAAAMM)"
                value={filtroPeriodoInicio}
                onChange={(event) => setFiltroPeriodoInicio(event.target.value)}
                size="small"
              />
              <TextField
                label="Período final (AAAAMM)"
                value={filtroPeriodoFim}
                onChange={(event) => setFiltroPeriodoFim(event.target.value)}
                size="small"
              />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">Histórico de apurações</Typography>
                <Chip label={`${apuracoes.length} registros`} size="small" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Visualize o detalhamento de receitas, impostos e Fator R de cada apuração já calculada.
              </Typography>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Período</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Receita Bruta</TableCell>
                    <TableCell align="right">Impostos</TableCell>
                    <TableCell align="right">Alíquota Efetiva</TableCell>
                    <TableCell align="right">Fator R</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingApuracoes && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Iconify icon="svg-spinners:90-ring" width={24} />
                          <Typography variant="body2">Carregando apurações...</Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loadingApuracoes && apuracoes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography variant="body2" color="text.secondary" align="center">
                          Nenhuma apuração encontrada para os filtros aplicados.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {apuracoes.map((apuracao) => (
                    <TableRow key={apuracao._id} hover>
                      <TableCell>
                        <Stack>
                          <Typography variant="subtitle2">{formatPeriodo(apuracao.periodoApuracao)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Calculado em {formatDateIso(apuracao.calculadoEm)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={apuracao.status}
                          color={STATUS_APURACAO_COLORS[apuracao.status] || 'default'}
                          size="small"
                          variant="soft"
                        />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(apuracao.totalReceitaBruta)}</TableCell>
                      <TableCell align="right">{formatCurrency(apuracao.totalImpostos)}</TableCell>
                      <TableCell align="right">{formatPercent(apuracao.aliquotaEfetivaTotal || 0)}</TableCell>
                      <TableCell align="right">
                        {apuracao?.fatorR ? formatPercent(apuracao?.fatorR?.percentual || 0) : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Ver detalhes">
                            <IconButton color="default" size="small" onClick={() => handleVerDetalhesApuracao(apuracao)}>
                              <Iconify icon="solar:eye-bold" width={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Gerar DAS">
                            <span>
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleGerarDas(apuracao)}
                                disabled={!podeGerarDas(apuracao) || loadingAction}
                              >
                                <Iconify icon="solar:file-download-bold" width={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Cancelar apuração">
                            <span>
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleCancelarApuracao(apuracao)}
                                disabled={!podeCancelarApuracao(apuracao) || loadingAction}
                              >
                                <Iconify icon="solar:trash-bin-minimalistic-bold" width={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={2} sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6">DAS gerados</Typography>
                <Chip label={`${das.length} registros`} size="small" color="default" />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Ambiente"
                  value={filtroAmbienteDas}
                  onChange={(event) => setFiltroAmbienteDas(event.target.value)}
                  size="small"
                  sx={{ minWidth: { xs: '100%', md: 180 } }}
                >
                  {AMBIENTE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Status"
                  value={filtroStatusDas}
                  onChange={(event) => setFiltroStatusDas(event.target.value)}
                  size="small"
                  sx={{ minWidth: { xs: '100%', md: 180 } }}
                >
                  {STATUS_DAS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Período</TableCell>
                    <TableCell>Documento</TableCell>
                    <TableCell align="right">Valor total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ambiente</TableCell>
                    <TableCell>Vencimento</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingDas && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Iconify icon="svg-spinners:90-ring" width={24} />
                          <Typography variant="body2">Carregando DAS...</Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loadingDas && das.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Nenhum DAS encontrado.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {das.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{formatPeriodo(item.periodoApuracao)}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{item.numeroDocumento}</Typography>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(item.valores?.total)}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={STATUS_DAS_COLORS[item.status] || 'default'}
                          size="small"
                          variant="soft"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.ambiente === 'producao' ? 'Produção' : 'Teste'}
                          size="small"
                          color={item.ambiente === 'producao' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{formatDateIso(item.dataVencimento)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Baixar PDF">
                            <IconButton size="small" color="primary" onClick={() => handleBaixarDas(item._id)}>
                              <Iconify icon="solar:download-minimalistic-bold" width={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Marcar como pago">
                            <span>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  const valor = item?.valores?.total || 0;
                                  handleMarcarDasPago(item._id, valor, new Date());
                                }}
                                disabled={item.status === 'pago' || loadingAction}
                              >
                                <Iconify icon="solar:check-circle-bold" width={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Cancelar DAS">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCancelarDas(item._id)}
                                disabled={item.status === 'cancelado' || loadingAction}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>

      <NovaApuracaoDialog
        open={dialogNovaApuracao}
        onClose={() => setDialogNovaApuracao(false)}
        onSubmit={handleNovaApuracao}
        loading={loadingAction}
      />

      <RegistrarFolhaDialog
        open={dialogFolha}
        onClose={() => setDialogFolha(false)}
        onSubmit={handleRegistrarFolha}
        loading={loadingAction}
      />

      <SimuladorFatorRDialog
        open={dialogSimulador}
        onClose={() => setDialogSimulador(false)}
        totais={totais}
        proLaboreIdeal={proLaboreIdeal}
        resultado={resultadoSimulacao}
        loading={loadingSimulacao}
        onSimular={handleSimularFatorR}
      />

      <ImportarHistoricoDialog
        open={importDialogOpen}
        onClose={() => {
          if (importLoading) return;
          setImportDialogOpen(false);
          setImportFile(null);
          setImportError('');
        }}
        onFileSelected={(file) => {
          setImportFile(file);
          setImportError('');
        }}
        onSubmit={async () => {
          if (!importFile) {
            setImportError('Selecione um arquivo CSV antes de importar.');
            return;
          }

          setImportLoading(true);
          try {
            await importarHistorico(clienteId, importFile);
            toast.success('Histórico importado com sucesso!');
            setImportDialogOpen(false);
            setImportFile(null);
            setImportError('');
            refetchFatorR();
          } catch (error) {
            console.error(error);
            setImportError(error?.response?.data?.message || 'Erro ao importar histórico');
          } finally {
            setImportLoading(false);
          }
        }}
        loading={importLoading}
        error={importError}
        selectedFile={importFile}
      />

      <EditarHistoricoDialog
        open={dialogEditarHistorico}
        onClose={() => {
          if (loadingAction) return;
          setDialogEditarHistorico(false);
          setHistoricoSelecionado(null);
        }}
        historico={historicoSelecionado}
        onSubmit={handleSalvarHistorico}
        loading={loadingAction}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function ResumoFatorRCard({ totais, proLaboreIdeal, loading, resultadoSimulacao }) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="svg-spinners:90-ring" width={20} />
            <Typography variant="body2">Carregando indicadores de Fator R...</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (!totais) {
    return null;
  }

  const fatorRAtual = totais?.fatorRAtual || 0;
  const badgeColor = fatorRAtual >= 28 ? 'success' : fatorRAtual >= 25 ? 'warning' : 'error';

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Fator R atual
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h4">{formatPercent(fatorRAtual)}</Typography>
                <Chip
                  label={fatorRAtual >= 28 ? 'Anexo III' : 'Anexo V'}
                  color={badgeColor}
                  size="small"
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Cálculo com base na receita e folha dos últimos 12 meses.
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <StatItem
              title="Receita (12 meses)"
              value={formatCurrency(totais?.receitaBruta12Meses)}
              icon="solar:bill-list-bold"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <StatItem
              title="Folha (12 meses)"
              value={formatCurrency(totais?.folhaPagamento12Meses)}
              icon="solar:card-transfer-bold"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <StatItem
              title="Pró-labore (mensal)"
              value={formatCurrency((totais?.proLabore12Meses || 0) / 12)}
              icon="solar:user-id-bold"
            />
          </Grid>
        </Grid>

        {proLaboreIdeal && (
          <>
            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Alert severity={proLaboreIdeal.valeAPena ? 'success' : 'info'} sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">Pró-labore ideal sugerido</Typography>
                <Typography variant="body2">
                  Valor mensal recomendado: <strong>{formatCurrency(proLaboreIdeal?.proLaboreIdeal?.mensal)}</strong>
                </Typography>
                <Typography variant="body2">
                  Economia líquida anual estimada:{' '}
                  <strong>{formatCurrency(proLaboreIdeal?.beneficios?.economiaLiquidaAnual)}</strong>
                </Typography>
              </Alert>

              {resultadoSimulacao && (
                <Alert severity="info" sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2">Simulação recente</Typography>
                  <Typography variant="body2">
                    Novo pró-labore: <strong>{formatCurrency(resultadoSimulacao?.simulacao?.proLaboreSimulado)}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Fator R simulado: <strong>{formatPercent(resultadoSimulacao?.totaisSimulados?.fatorR || 0)}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Economia estimada: <strong>{formatCurrency(resultadoSimulacao?.resultado?.economiaEstimadaAnual)}</strong>
                  </Typography>
                </Alert>
              )}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function HistoricoFaturamentoCard({ periodos, loading, onEditar }) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="svg-spinners:90-ring" width={20} />
            <Typography variant="body2">Carregando histórico de faturamento...</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(periodos) || periodos.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">Histórico de faturamento e folha</Typography>
            <Chip label={`${periodos.length} lançamentos`} size="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Dados consolidados dos últimos 12 meses, utilizados para o cálculo do Fator R.
          </Typography>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Competência</TableCell>
                <TableCell align="right">Receita bruta</TableCell>
                <TableCell align="right">Folha</TableCell>
                <TableCell align="right">INSS/CPP</TableCell>
                <TableCell align="right">Fator R</TableCell>
                {onEditar && <TableCell align="right">Ações</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {periodos.map((periodo) => (
                <TableRow key={periodo.periodoApuracao}>
                  <TableCell>{formatPeriodo(periodo.periodoApuracao)}</TableCell>
                  <TableCell align="right">{formatCurrency(periodo.receitaBruta)}</TableCell>
                  <TableCell align="right">{formatCurrency(periodo.folhaPagamento)}</TableCell>
                  <TableCell align="right">{formatCurrency(periodo.inssCpp)}</TableCell>
                  <TableCell align="right">
                    {periodo.fatorR !== undefined && periodo.fatorR !== null
                      ? formatPercent(periodo.fatorR)
                      : '—'}
                  </TableCell>
                  {onEditar && (
                    <TableCell align="right">
                      <Tooltip title="Editar lançamento">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onEditar(periodo)}
                          >
                            <Iconify icon="solar:pen-bold" width={18} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function StatItem({ title, value, icon }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon={icon} width={20} />
            <Typography variant="subtitle1">{value}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

function NovaApuracaoDialog({ open, onClose, onSubmit, loading }) {
  const [competencia, setCompetencia] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!competencia || !dayjs(competencia).isValid()) {
      toast.error('Selecione o mês/ano da apuração');
      return;
    }

    onSubmit({
      periodoApuracao: dayjs(competencia).format('YYYYMM'),
    });
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setCompetencia(null);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Nova apuração</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Alert severity="info">
            Escolha a competência desejada. As bases de receita e folha serão carregadas do histórico importado.
          </Alert>

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <DatePicker
              label="Competência"
              views={['year', 'month']}
              format="MM/YYYY"
              value={competencia}
              onChange={(value) => setCompetencia(value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  required: true,
                },
              }}
            />
          </LocalizationProvider>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={loading} onClick={handleSubmit}>
          Calcular apuração
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

function RegistrarFolhaDialog({ open, onClose, onSubmit, loading }) {
  const [competencia, setCompetencia] = useState(null);
  const [valorFolha, setValorFolha] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!competencia || !dayjs(competencia).isValid()) {
      toast.error('Selecione a competência da folha');
      return;
    }

    const valorNumerico = typeof valorFolha === 'number' ? valorFolha : Number(valorFolha);
    if (!valorNumerico || valorNumerico <= 0) {
      toast.error('Informe o valor da folha');
      return;
    }

    onSubmit({
      periodoApuracao: dayjs(competencia).format('YYYYMM'),
      folhaPagamento: valorNumerico,
      receitaBruta: 0,
      proLabore: 0,
    });
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setCompetencia(null);
      setValorFolha(null);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar folha de pagamento</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <DatePicker
              label="Competência"
              views={['year', 'month']}
              format="MM/YYYY"
              value={competencia}
              onChange={(value) => setCompetencia(value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  required: true,
                },
              }}
            />
          </LocalizationProvider>

          <NumericFormat
            value={valorFolha ?? ''}
            onValueChange={(values) => setValorFolha(values.floatValue ?? null)}
            customInput={TextField}
            label="Valor da folha"
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            prefix="R$ "
            fullWidth
            size="small"
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={loading} onClick={handleSubmit}>
          Registrar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

function SimuladorFatorRDialog({ open, onClose, totais, proLaboreIdeal, resultado, loading, onSimular }) {
  const [valorSimulado, setValorSimulado] = useState(() => proLaboreIdeal?.proLaboreIdeal?.mensal || 0);
  const [mesSimulacao, setMesSimulacao] = useState('');

  const handleSimular = () => {
    onSimular({
      novoProLabore: Number(valorSimulado),
      mesSimulacao: mesSimulacao || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Simulador de Fator R</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Ajuste o pró-labore mensal do cliente para simular o novo percentual do Fator R e projetar possíveis economias tributárias.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Situação atual
                  </Typography>
                  <Stack spacing={1}>
                    <StatRow label="Fator R atual" value={formatPercent(totais?.fatorRAtual || 0)} />
                    <StatRow label="Folha (12 meses)" value={formatCurrency(totais?.folhaPagamento12Meses)} />
                    <StatRow label="Pró-labore (mensal)" value={formatCurrency((totais?.proLabore12Meses || 0) / 12)} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Pró-labore ideal sugerido
                  </Typography>
                  {proLaboreIdeal ? (
                    <Stack spacing={1}>
                      <StatRow label="Valor mensal" value={formatCurrency(proLaboreIdeal?.proLaboreIdeal?.mensal)} />
                      <StatRow
                        label="Economia líquida"
                        value={formatCurrency(proLaboreIdeal?.beneficios?.economiaLiquidaAnual)}
                      />
                    </Stack>
                  ) : (
                    <Typography variant="body2">Nenhuma sugestão disponível.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider flexItem sx={{ my: 2, borderStyle: 'dashed' }} />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Pró-labore mensal simulado"
              value={valorSimulado}
              onChange={(event) => setValorSimulado(event.target.value)}
              type="number"
              InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
            />
            <TextField
              label="Mês referência (opcional - AAAAMM)"
              value={mesSimulacao}
              onChange={(event) => setMesSimulacao(event.target.value)}
              inputProps={{ maxLength: 6 }}
            />
            <LoadingButton variant="contained" loading={loading} onClick={handleSimular}>
              Simular
            </LoadingButton>
          </Stack>

          {resultado && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Resultado da simulação
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <StatRow
                      label="Fator R simulado"
                      value={formatPercent(resultado?.totaisSimulados?.fatorR || 0)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <StatRow
                      label="Anexo resultante"
                      value={resultado?.resultado?.anexoSimulado || '—'}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <StatRow
                      label="Economia estimada"
                      value={formatCurrency(resultado?.resultado?.economiaEstimadaAnual || 0)}
                    />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {resultado?.resultado?.recomendacao}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

function EditarHistoricoDialog({ open, onClose, historico, onSubmit, loading }) {
  const [receita, setReceita] = useState(null);
  const [folha, setFolha] = useState(null);
  const [inss, setInss] = useState(null);

  useEffect(() => {
    if (historico) {
      setReceita(historico.receitaBruta ?? null);
      setFolha(historico.folhaPagamento ?? null);
      setInss(historico.inssCpp ?? null);
    } else {
      setReceita(null);
      setFolha(null);
      setInss(null);
    }
  }, [historico]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!historico) {
      return;
    }

    const receitaNumber = typeof receita === 'number' ? receita : Number(receita);
    const folhaNumber = typeof folha === 'number' ? folha : Number(folha);
    const inssNumber = typeof inss === 'number' ? inss : Number(inss);

    if (Number.isNaN(receitaNumber) || receitaNumber < 0) {
      toast.error('Informe a receita bruta corretamente.');
      return;
    }
    if (Number.isNaN(folhaNumber) || folhaNumber < 0) {
      toast.error('Informe a folha de pagamento corretamente.');
      return;
    }
    if (Number.isNaN(inssNumber) || inssNumber < 0) {
      toast.error('Informe o INSS/CPP corretamente.');
      return;
    }

    onSubmit({
      periodoApuracao: historico.periodoApuracao,
      receitaBruta: receitaNumber,
      folhaPagamento: folhaNumber,
      proLabore: historico?.proLabore ?? 0,
      inssCpp: inssNumber,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar lançamento mensal</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Alert severity="info">
            Ajuste os valores conforme necessário. As alterações impactam o cálculo do Fator R imediatamente.
          </Alert>

          <TextField
            label="Competência"
            value={historico ? formatPeriodo(historico.periodoApuracao) : ''}
            InputProps={{ readOnly: true }}
            size="small"
          />

          <NumericFormat
            value={receita ?? ''}
            onValueChange={(values) => setReceita(values.floatValue ?? null)}
            customInput={TextField}
            label="Receita bruta"
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            prefix="R$ "
            fullWidth
            size="small"
            required
          />

          <NumericFormat
            value={folha ?? ''}
            onValueChange={(values) => setFolha(values.floatValue ?? null)}
            customInput={TextField}
            label="Folha de pagamento"
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            prefix="R$ "
            fullWidth
            size="small"
            required
          />

          <NumericFormat
            value={inss ?? ''}
            onValueChange={(values) => setInss(values.floatValue ?? null)}
            customInput={TextField}
            label="INSS/CPP"
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            prefix="R$ "
            fullWidth
            size="small"
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={loading} onClick={handleSubmit}>
          Salvar alterações
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

function StatRow({ label, value }) {
  return (
    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2">{value}</Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export default ApuracaoDashboardView;


