'use client';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { paths } from 'src/routes/paths';

import { fDateTime } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { getCaixaPostalDetalhe, getSerproEmissaoDetalhe } from 'src/actions/serpro-portal';
import {
  getIntegraContadorLogs,
  getIntegraContadorStats,
} from 'src/actions/integra-contador-relatorio';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Chart, useChart } from 'src/components/chart';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import ChartCardSkeleton from 'src/components/skeleton/ChartCardSkeleton';
import WidgetSummarySkeleton from 'src/components/skeleton/WidgetSummarySkeleton';

import { AppWidgetSummary } from 'src/sections/overview/app/app-widget-summary';

const CHART_HEIGHT = 220;

const SUMMARY_GRID_SX = {
  display: 'grid',
  gap: 3,
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(4, 1fr)',
  },
};

const CHARTS_GRID_SX = {
  display: 'grid',
  gap: 3,
  gridTemplateColumns: {
    xs: '1fr',
    md: '5fr 7fr',
  },
  alignItems: 'stretch',
};

// ----------------------------------------------------------------------

const MODULO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'integra_contador', label: 'Integra Contador (DAS)' },
  { value: 'caixa_postal', label: 'Caixa Postal' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'SUCESSO', label: 'Sucesso' },
  { value: 'ERRO', label: 'Erro' },
  { value: 'PENDENTE', label: 'Pendente' },
];

const MODULO_LABELS = {
  integra_contador: 'Integra Contador',
  caixa_postal: 'Caixa Postal',
};

const TABLE_HEAD = [
  { id: 'createdAt', label: 'Data/Hora' },
  { id: 'operacao', label: 'Operação' },
  { id: 'modulo', label: 'Módulo' },
  { id: 'status', label: 'Status' },
  { id: 'userEmail', label: 'Usuário' },
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'tempoResposta', label: 'Tempo (ms)' },
  { id: 'actions', label: '', align: 'right' },
];

function buildQueryParams(filtros, page, rowsPerPage) {
  return {
    inicio: filtros.inicio?.startOf('day').toISOString(),
    fim: filtros.fim?.endOf('day').toISOString(),
    modulo: filtros.modulo || undefined,
    status: filtros.status || undefined,
    userEmail: filtros.userEmail || undefined,
    pagina: page + 1,
    limite: rowsPerPage,
  };
}

function getStatusColor(status) {
  if (status === 'SUCESSO') return 'success';
  if (status === 'ERRO') return 'error';
  if (status === 'PENDENTE') return 'warning';
  return 'default';
}

// ----------------------------------------------------------------------

function IntegraContadorAreaChart({ porDia, height = CHART_HEIGHT }) {
  const theme = useTheme();

  const series = useMemo(
    () => [
      {
        name: 'Sucesso',
        data: (porDia || []).map((d) => ({
          x: new Date(`${d.data}T12:00:00`).getTime(),
          y: d.sucesso,
        })),
      },
      {
        name: 'Erros',
        data: (porDia || []).map((d) => ({
          x: new Date(`${d.data}T12:00:00`).getTime(),
          y: d.erro,
        })),
      },
    ],
    [porDia]
  );

  const options = useChart({
    colors: [theme.palette.success.main, theme.palette.error.main],
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { width: 2, curve: 'smooth' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    legend: { position: 'top', horizontalAlign: 'right' },
    xaxis: {
      type: 'datetime',
      labels: { format: 'dd/MM', style: { colors: theme.palette.text.disabled } },
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.disabled } },
      min: 0,
      forceNiceScale: true,
    },
    tooltip: {
      x: { format: 'dd/MM/yyyy' },
      y: { formatter: (val) => `${val} req.` },
    },
  });

  const isEmpty = !porDia?.length;

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Requisições por dia
      </Typography>
      {isEmpty ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Nenhuma requisição no período selecionado.
          </Typography>
        </Box>
      ) : (
        <Chart type="area" series={series} options={options} height={height} />
      )}
    </Card>
  );
}

function IntegraContadorOperacoesDonut({ porOperacao, height = CHART_HEIGHT }) {
  const theme = useTheme();

  const itens = porOperacao || [];
  const total = itens.reduce((acc, i) => acc + i.total, 0);
  const isEmpty = total === 0;

  const options = useChart({
    chart: { type: 'donut' },
    labels: itens.map((i) => i.operacaoLabel),
    colors: [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ],
    legend: { show: false },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => `${total}`,
            },
          },
        },
      },
    },
    tooltip: { y: { formatter: (val) => `${val} req.` } },
  });

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Por operação
      </Typography>
      {isEmpty ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Sem dados.
          </Typography>
        </Box>
      ) : (
        <>
          <Chart
            type="donut"
            series={itens.map((i) => i.total)}
            options={options}
            height={height}
          />
          <Stack spacing={1} sx={{ mt: 1 }}>
            {itens.slice(0, 5).map((item) => (
              <Stack key={item.operacao} direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '70%' }}>
                  {item.operacaoLabel}
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {item.total}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </>
      )}
    </Card>
  );
}

function IntegraContadorUsuariosChart({ porUsuario, height = CHART_HEIGHT }) {
  const theme = useTheme();
  const itens = (porUsuario || []).slice(0, 8);
  const isEmpty = !itens.length;

  const labels = itens.map((i) => {
    const email = i.userEmail || '—';
    return email.length > 28 ? `${email.slice(0, 26)}…` : email;
  });

  const options = useChart({
    chart: { toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, barHeight: '65%', borderRadius: 4 } },
    dataLabels: { enabled: true, formatter: (val) => `${val}`, style: { fontSize: '11px' } },
    xaxis: {
      categories: labels,
      labels: { style: { colors: theme.palette.text.disabled, fontSize: '11px' } },
    },
    yaxis: { labels: { show: true } },
    grid: { strokeDashArray: 4, xaxis: { lines: { show: true } } },
    tooltip: {
      y: { formatter: (_, opts) => `${itens[opts.dataPointIndex]?.userEmail}: ${itens[opts.dataPointIndex]?.total} req.` },
    },
    colors: [theme.palette.primary.main],
  });

  const series = [{ name: 'Requisições', data: itens.map((i) => i.total) }];

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Top usuários
      </Typography>
      {isEmpty ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Sem dados.
          </Typography>
        </Box>
      ) : (
        <Chart type="bar" series={series} options={options} height={height} />
      )}
    </Card>
  );
}

// ----------------------------------------------------------------------

export function IntegraContadorRelatorioView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [filtros, setFiltros] = useState({
    inicio: dayjs().subtract(30, 'days'),
    fim: dayjs(),
    modulo: '',
    status: '',
    userEmail: '',
  });

  const [payloadDialog, setPayloadDialog] = useState({ open: false, log: null });
  const [payload, setPayload] = useState(null);
  const [loadingPayload, setLoadingPayload] = useState(false);

  const fetchData = useCallback(async () => {
    if (!filtros.inicio || !filtros.fim) return;

    setLoading(true);
    try {
      const params = buildQueryParams(filtros, page, rowsPerPage);
      const [statsData, logsData] = await Promise.all([
        getIntegraContadorStats(params),
        getIntegraContadorLogs(params),
      ]);
      setStats(statsData);
      setLogs(logsData.logs || []);
      setTotalLogs(logsData.paginacao?.total || 0);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 403) {
        toast.error('Acesso negado: apenas administradores.');
      } else {
        toast.error('Erro ao carregar relatório Integra Contador.');
      }
      setStats(null);
      setLogs([]);
      setTotalLogs(0);
    } finally {
      setLoading(false);
    }
  }, [filtros, page, rowsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sparkline = useMemo(() => {
    const porDia = stats?.porDia || [];
    return {
      categories: porDia.map((d) => d.data),
      series: porDia.map((d) => d.total),
    };
  }, [stats]);

  const handleFilterChange = (field, value) => {
    setFiltros((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFiltros({
      inicio: dayjs().subtract(30, 'days'),
      fim: dayjs(),
      modulo: '',
      status: '',
      userEmail: '',
    });
    setPage(0);
  };

  const handleOpenPayload = async (log) => {
    setPayloadDialog({ open: true, log });
    setPayload(null);
    setLoadingPayload(true);
    try {
      const detalhe =
        log.modulo === 'caixa_postal'
          ? await getCaixaPostalDetalhe(log._id)
          : await getSerproEmissaoDetalhe(log._id);
      setPayload(detalhe);
    } catch {
      toast.error('Erro ao carregar payload.');
    } finally {
      setLoadingPayload(false);
    }
  };

  const handleClosePayload = () => {
    setPayloadDialog({ open: false, log: null });
    setPayload(null);
  };

  if (loading && !stats) {
    return (
      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading="Integra Contador"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Relatórios' },
            { name: 'Integra Contador' },
          ]}
          sx={{ mb: 3 }}
        />
        <Stack spacing={3}>
          <Box sx={SUMMARY_GRID_SX}>
            <WidgetSummarySkeleton />
            <WidgetSummarySkeleton />
            <WidgetSummarySkeleton />
            <WidgetSummarySkeleton />
          </Box>
          <ChartCardSkeleton chartType="rectangular" />
          <Box sx={CHARTS_GRID_SX}>
            <ChartCardSkeleton chartType="circular" />
            <ChartCardSkeleton chartType="rectangular" />
          </Box>
        </Stack>
      </DashboardContent>
    );
  }

  const resumo = stats?.resumo || {
    total: 0,
    sucesso: 0,
    erro: 0,
    pendente: 0,
    tempoRespostaMedioMs: 0,
    mediaPorDia: 0,
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Integra Contador"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Relatórios' },
          { name: 'Integra Contador' },
        ]}
        sx={{ mb: 3 }}
      />

      <Stack spacing={3}>
        {/* Filtros */}
        <Card sx={{ p: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
              <DatePicker
                label="Data início"
                value={filtros.inicio}
                onChange={(v) => handleFilterChange('inicio', v)}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
              />
              <DatePicker
                label="Data fim"
                value={filtros.fim}
                onChange={(v) => handleFilterChange('fim', v)}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Módulo</InputLabel>
                <Select
                  value={filtros.modulo}
                  label="Módulo"
                  onChange={(e) => handleFilterChange('modulo', e.target.value)}
                >
                  {MODULO_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtros.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="E-mail do usuário"
                value={filtros.userEmail}
                onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                sx={{ minWidth: 220 }}
              />
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleResetFilters}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                Limpar
              </Button>
            </Stack>
          </LocalizationProvider>
        </Card>

        {/* Cards resumo */}
        <Box sx={SUMMARY_GRID_SX}>
          <AppWidgetSummary
            title="Total de requisições"
            total={resumo.total}
            percent={0}
            chart={{
              categories: sparkline.categories,
              series: sparkline.series,
            }}
          />
          <AppWidgetSummary
            title="Sucesso"
            total={resumo.sucesso}
            percent={0}
            chart={{ categories: [], series: [] }}
          />
          <AppWidgetSummary
            title="Erros"
            total={resumo.erro}
            percent={0}
            chart={{ categories: [], series: [] }}
          />
          <AppWidgetSummary
            title="Tempo médio (ms)"
            total={resumo.tempoRespostaMedioMs}
            percent={0}
            chart={{ categories: [], series: [] }}
          />
        </Box>

        {/* Gráfico área */}
        <IntegraContadorAreaChart porDia={stats?.porDia} />

        {/* Donut + barras */}
        <Box sx={CHARTS_GRID_SX}>
          <IntegraContadorOperacoesDonut porOperacao={stats?.porOperacao} />
          <IntegraContadorUsuariosChart porUsuario={stats?.porUsuario} />
        </Box>

        {/* Tabela */}
        <Card>
          <Box sx={{ p: 2.5, pb: 0 }}>
            <Typography variant="h6">Requisições recentes</Typography>
            <Typography variant="body2" color="text.secondary">
              Média de {resumo.mediaPorDia} req./dia no período
              {resumo.pendente > 0 ? ` · ${resumo.pendente} pendente(s)` : ''}
            </Typography>
          </Box>

          <Scrollbar>
            <TableContainer sx={{ minWidth: 900 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {TABLE_HEAD.map((head) => (
                      <TableCell key={head.id} align={head.align || 'left'}>
                        {head.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Nenhum log encontrado.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((row) => (
                      <TableRow key={`${row.modulo}-${row._id}`} hover>
                        <TableCell>{fDateTime(row.createdAt)}</TableCell>
                        <TableCell>{row.operacaoLabel}</TableCell>
                        <TableCell>{MODULO_LABELS[row.modulo] || row.modulo}</TableCell>
                        <TableCell>
                          <Chip size="small" label={row.status} color={getStatusColor(row.status)} />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 180 }}>{row.userEmail}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.cnpj}</TableCell>
                        <TableCell>{row.tempoResposta ?? '—'}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => handleOpenPayload(row)}
                            startIcon={<Iconify icon="solar:document-text-bold-duotone" />}
                          >
                            Payload
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            component="div"
            count={totalLogs}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Linhas:"
          />
        </Card>
      </Stack>

      {/* Dialog payload */}
      <Dialog open={payloadDialog.open} onClose={handleClosePayload} maxWidth="md" fullWidth>
        <DialogTitle>
          Payload — {payloadDialog.log?.operacaoLabel}
        </DialogTitle>
        <DialogContent dividers>
          {loadingPayload && (
            <Typography variant="body2" color="text.secondary">
              Carregando...
            </Typography>
          )}
          {!loadingPayload && payload && (
            <Stack spacing={2}>
              {payload.dadosEntrada && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Dados de entrada
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      overflow: 'auto',
                      p: 1.5,
                      bgcolor: 'background.neutral',
                      borderRadius: 1,
                      maxHeight: 280,
                    }}
                  >
                    {JSON.stringify(payload.dadosEntrada, null, 2)}
                  </Box>
                </Box>
              )}
              {payload.dadosSaida && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Dados de saída
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      overflow: 'auto',
                      p: 1.5,
                      bgcolor: 'background.neutral',
                      borderRadius: 1,
                      maxHeight: 280,
                    }}
                  >
                    {JSON.stringify(payload.dadosSaida, null, 2)}
                  </Box>
                </Box>
              )}
              {payload.erro && (
                <Typography variant="body2" color="error.main">
                  Erro: {payload.erro}
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePayload}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
