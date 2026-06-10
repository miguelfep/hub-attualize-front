'use client';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Button,
  Select,
  Dialog,
  Skeleton,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  Pagination,
  CardContent,
  FormControl,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { formatClienteCodigoRazao } from 'src/utils/formatter';
import { fCurrency, formatCPFOrCNPJ } from 'src/utils/format-number';

import { getClientes } from 'src/actions/clientes';
import { useGetSettings } from 'src/actions/settings';
import {
  abrirPdfNota,
  baixarXmlNota,
  dadosEmitenteNota,
  tipoMovimentoNota,
  cancelarNotaFiscal,
  cancelarNotaNoProvedor,
  sincronizarDfeNacional,
  sincronizarPeriodoNacional,
  listarNotasFiscaisPorCliente,
  reprocessarRetencoesNacional,
} from 'src/actions/notafiscal';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// Helper para formatar tipo de nota
const formatTipoNota = (tipo) => {
  const tipos = {
    nfse: 'NFS-e',
    nfe: 'NF-e',
    nfce: 'NFC-e',
    cfe: 'CF-e',
    cte: 'CT-e',
  };
  const key = String(tipo || '').toLowerCase();
  if (!key) return 'Não informado';
  return tipos[key] || tipo?.toUpperCase() || 'Não informado';
};

// Helper para cor do tipo de nota
const getTipoNotaColor = (tipo) => {
  const tipos = {
    nfse: 'primary',
    nfe: 'info',
    nfce: 'error',
    cfe: 'secondary',
    cte: 'warning',
  };
  return tipos[String(tipo || '').toLowerCase()] || 'default';
};

// Rótulo do bloco de descrição conforme o tipo (NF-e/NFC-e/CF-e são notas de produto)
const getDescricaoNotaLabel = (tipo) => {
  const key = String(tipo || '').toLowerCase();
  if (key === 'nfe' || key === 'nfce' || key === 'cfe') return 'Produto';
  if (key === 'cte') return 'Transporte';
  return 'Serviço';
};

const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const notaInnerBoxSx = {
  p: 1.5,
  borderRadius: 2,
  border: 1,
  borderColor: 'divider',
  bgcolor: (t) => alpha(t.palette.grey[500], 0.06),
};

function NotaFiscalCardSkeleton() {
  return (
    <Card variant="outlined" sx={{ p: 2 }} aria-hidden>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Skeleton variant="rounded" animation="wave" width={52} height={26} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" animation="wave" width={56} height={26} />
          <Skeleton variant="text" animation="wave" width={72} sx={{ transform: 'none' }} />
          <Skeleton variant="rounded" animation="wave" width={64} height={26} />
          <Skeleton variant="rounded" animation="wave" width={76} height={26} />
          <Skeleton variant="rounded" animation="wave" width={88} height={26} />
        </Stack>
        <Skeleton variant="text" animation="wave" width={130} height={18} sx={{ transform: 'none' }} />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1.5 }}>
        <Box flex={1} sx={notaInnerBoxSx}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Skeleton variant="circular" animation="wave" width={18} height={18} />
              <Skeleton animation="wave" width={72} height={14} sx={{ transform: 'none' }} />
            </Stack>
            <Skeleton animation="wave" width="100%" height={22} sx={{ transform: 'none', maxWidth: 280 }} />
            <Skeleton animation="wave" width="55%" height={16} sx={{ transform: 'none' }} />
          </Stack>
        </Box>
        <Box flex={2} sx={notaInnerBoxSx}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Skeleton variant="circular" animation="wave" width={18} height={18} />
              <Skeleton animation="wave" width={56} height={14} sx={{ transform: 'none' }} />
            </Stack>
            <Skeleton animation="wave" width="100%" height={18} sx={{ transform: 'none' }} />
            <Skeleton animation="wave" width="92%" height={18} sx={{ transform: 'none' }} />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 0.25 }}>
              <Skeleton animation="wave" width={100} height={14} sx={{ transform: 'none' }} />
              <Skeleton variant="rounded" animation="wave" width={120} height={22} />
            </Stack>
          </Stack>
        </Box>
        <Box
          sx={{
            ...notaInnerBoxSx,
            alignSelf: { xs: 'stretch', md: 'flex-start' },
            minWidth: { md: 160 },
          }}
        >
          <Stack spacing={0.75} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ width: '100%', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Skeleton variant="circular" animation="wave" width={18} height={18} />
              <Skeleton animation="wave" width={64} height={14} sx={{ transform: 'none' }} />
            </Stack>
            <Skeleton animation="wave" width={112} height={32} sx={{ transform: 'none' }} />
            <Skeleton animation="wave" width={80} height={16} sx={{ transform: 'none' }} />
          </Stack>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
        <Skeleton variant="rounded" animation="wave" width={76} height={32} />
        <Skeleton variant="rounded" animation="wave" width={76} height={32} />
        <Skeleton variant="rounded" animation="wave" width={96} height={32} />
      </Stack>
    </Card>
  );
}

export default function DashboardFiscalPage() {
  const theme = useTheme();

  const [selectedCliente, setSelectedCliente] = useState('');
  const [status, setStatus] = useState('');
  const [tipoNota, setTipoNota] = useState('');
  const [tipoMovimento, setTipoMovimento] = useState('saida'); // '' | 'entrada' | 'saida' — query param tipoMovimento
  const [comRetencao, setComRetencao] = useState(''); // '' | 'com' | 'sem' — query param comRetencao
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [notas, setNotas] = useState([]);

  // Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [somaTotal, setSomaTotal] = useState(0);

  // Datas: primeiro dia do mês atual até hoje
  const [startDate, setStartDate] = useState(() => dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(() => dayjs().format('YYYY-MM-DD'));

  // Modal de cancelamento
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [notaToCancel, setNotaToCancel] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [dataCancelamento, setDataCancelamento] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [canceling, setCanceling] = useState(false);

  // Emissor Nacional: sincronização incremental + importação por período (ADN)
  const { settings: clienteSettings } = useGetSettings(selectedCliente || null);
  const isClienteNacional = clienteSettings?.provedorNFSe === 'nacional';
  const [syncing, setSyncing] = useState(false);
  const [reprocessandoRetencoes, setReprocessandoRetencoes] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importModo, setImportModo] = useState('mes'); // 'mes' | 'intervalo'
  const [importAno, setImportAno] = useState(() => dayjs().year());
  const [importMesInicio, setImportMesInicio] = useState(() => dayjs().month() + 1);
  const [importMesFim, setImportMesFim] = useState(() => dayjs().month() + 1);
  const [importResultado, setImportResultado] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingClientes(true);
        const res = await getClientes({ status: true, tipoContato: 'cliente' });
        setClientes(res);
      } catch (e) {
        setClientes([]);
      } finally {
        setLoadingClientes(false);
      }
    };
    load();
  }, []);

  const { totalValorNotas, totalNotas } = useMemo(() => {
    const arr = Array.isArray(notas) ? notas : [];
    const total = arr.reduce((acc, n) => acc + Number(n?.valorServicos || n?.valor || 0), 0);
    return { totalValorNotas: total, totalNotas: arr.length };
  }, [notas]);

  const fetchNotas = async () => {
    if (!selectedCliente) return;
    try {
      setLoading(true);
      const res = await listarNotasFiscaisPorCliente({
        clienteId: selectedCliente,
        status: status || undefined,
        inicio: startDate || undefined,
        fim: endDate || undefined,
        tipoNota: tipoNota || undefined,
        tipoMovimento: tipoMovimento || undefined,
        comRetencao: comRetencao === 'com' ? true : comRetencao === 'sem' ? false : undefined,
        page,
        limit: 50,
      });

      const { data } = res;
      setNotas(data?.notasFiscais || []);
      setTotalPages(data?.pagination?.pages || 1);
      setTotalItems(data?.pagination?.total || 0);
      setSomaTotal(data?.somaTotal || 0);
    } catch (e) {
      setNotas([]);
      setTotalPages(1);
      setTotalItems(0);
      setSomaTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Resetar página ao mudar filtros
  useEffect(() => {
    setPage(1);
  }, [selectedCliente, status, startDate, endDate, tipoNota, tipoMovimento, comRetencao]);

  useEffect(() => {
    fetchNotas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCliente, status, startDate, endDate, tipoNota, tipoMovimento, comRetencao, page]);

  // Navegação mensal
  const handlePrevMonth = () => {
    const newStart = dayjs(startDate).subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
    const newEnd = dayjs(startDate).subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const handleNextMonth = () => {
    const newStart = dayjs(startDate).add(1, 'month').startOf('month').format('YYYY-MM-DD');
    const newEnd = dayjs(startDate).add(1, 'month').endOf('month').format('YYYY-MM-DD');
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const handleCurrentMonth = () => {
    setStartDate(dayjs().startOf('month').format('YYYY-MM-DD'));
    setEndDate(dayjs().format('YYYY-MM-DD'));
  };

  const handleOpenCancelDialog = (nota) => {
    setNotaToCancel(nota);
    setMotivoCancelamento('Nota cancelada manualmente pelo administrador');
    setDataCancelamento(dayjs().format('YYYY-MM-DD'));
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setNotaToCancel(null);
    setMotivoCancelamento('');
    setDataCancelamento(dayjs().format('YYYY-MM-DD'));
  };

  const handleConfirmCancel = async () => {
    if (!notaToCancel) return;
    if (!motivoCancelamento.trim()) {
      toast.error('Informe o motivo do cancelamento');
      return;
    }
    try {
      setCanceling(true);
      const notaId = notaToCancel._id || notaToCancel.id;
      if (notaToCancel.origem === 'nacional') {
        // Cancelamento síncrono no Sefin (evento e101101) — backend ramifica por origem
        await cancelarNotaNoProvedor(notaId, motivoCancelamento);
      } else {
        const dataISO = dayjs(dataCancelamento).toISOString();
        await cancelarNotaFiscal(notaId, motivoCancelamento, dataISO);
      }
      toast.success('Nota fiscal cancelada com sucesso!');
      handleCloseCancelDialog();
      await fetchNotas(); // Recarrega a lista
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Erro ao cancelar nota fiscal';
      toast.error(msg);
    } finally {
      setCanceling(false);
    }
  };

  const handleAbrirPdf = async (nota) => {
    try {
      await abrirPdfNota(nota);
    } catch (error) {
      toast.error(error?.message || 'Erro ao abrir o PDF da nota');
    }
  };

  const handleBaixarXml = async (nota) => {
    try {
      await baixarXmlNota(nota);
    } catch (error) {
      toast.error(error?.message || 'Erro ao baixar o XML da nota');
    }
  };

  const handleSincronizarDfe = async () => {
    if (!selectedCliente) return;
    try {
      setSyncing(true);
      const res = await sincronizarDfeNacional(selectedCliente);
      toast.success(res.data?.message || 'Sincronização concluída');
      await fetchNotas();
    } catch (error) {
      toast.error(error?.message || 'Erro ao sincronizar notas do Emissor Nacional');
    } finally {
      setSyncing(false);
    }
  };

  // Backfill do campo `retencao` nas notas nacionais antigas (reaproveita o XML salvo, idempotente)
  const handleReprocessarRetencoes = async () => {
    if (!selectedCliente) return;
    try {
      setReprocessandoRetencoes(true);
      const res = await reprocessarRetencoesNacional(selectedCliente);
      toast.success(res.data?.message || 'Retenções reprocessadas');
      await fetchNotas();
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || 'Erro ao reprocessar retenções';
      toast.error(msg);
    } finally {
      setReprocessandoRetencoes(false);
    }
  };

  const handleOpenImportDialog = () => {
    setImportResultado(null);
    setImportModo('mes');
    setImportAno(dayjs().year());
    setImportMesInicio(dayjs().month() + 1);
    setImportMesFim(dayjs().month() + 1);
    setImportDialogOpen(true);
  };

  const handleImportarPeriodo = async () => {
    if (!selectedCliente) return;
    if (importModo === 'intervalo' && importMesFim < importMesInicio) {
      toast.error('O mês final deve ser maior ou igual ao mês inicial');
      return;
    }
    try {
      setImporting(true);
      setImportResultado(null);
      const body =
        importModo === 'mes'
          ? { competencia: `${importAno}-${String(importMesInicio).padStart(2, '0')}` }
          : { ano: Number(importAno), mesInicio: Number(importMesInicio), mesFim: Number(importMesFim) };
      const res = await sincronizarPeriodoNacional(selectedCliente, body);
      setImportResultado(res.data);
      toast.success(res.data?.message || 'Importação concluída');
      await fetchNotas();
    } catch (error) {
      toast.error(error?.message || 'Erro ao importar notas do período');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Fiscal - Notas Fiscais por Cliente
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Selecione um cliente para visualizar as notas emitidas e o faturamento.
          </Typography>
        </Box>
        {isClienteNacional && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <LoadingButton
              variant="outlined"
              loading={syncing}
              startIcon={<Iconify icon="solar:refresh-circle-bold" />}
              onClick={handleSincronizarDfe}
            >
              Sincronizar novas
            </LoadingButton>
            <LoadingButton
              variant="outlined"
              loading={reprocessandoRetencoes}
              startIcon={<Iconify icon="solar:shield-check-bold" />}
              onClick={handleReprocessarRetencoes}
            >
              Reprocessar retenções
            </LoadingButton>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:download-square-bold" />}
              onClick={handleOpenImportDialog}
            >
              Importar período
            </Button>
          </Stack>
        )}
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        {/* Linha 1: Cliente, Status e Tipo */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12} md={4}>
            <Autocomplete
              fullWidth
              options={clientes || []}
              loading={loadingClientes}
              getOptionLabel={(option) => formatClienteCodigoRazao(option)}
              isOptionEqualToValue={(opt, val) => (opt?._id || opt?.id) === (val?._id || val?.id)}
              value={(clientes || []).find((c) => c._id === selectedCliente) || null}
              onChange={(_, newValue) => { setSelectedCliente(newValue?._id || ''); }}
              renderInput={(params) => (
                <TextField {...params} label="Cliente" placeholder="Digite para buscar" />
              )}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); }}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="emitida">Emitida</MenuItem>
                <MenuItem value="autorizada">Autorizada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
                <MenuItem value="negada">Negada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Nota</InputLabel>
              <Select
                label="Tipo de Nota"
                value={tipoNota}
                onChange={(e) => {
                  setTipoNota(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="nfse">NFS-e (Serviço)</MenuItem>
                <MenuItem value="nfe">NF-e (Produto)</MenuItem>
                <MenuItem value="nfce">NFC-e (Consumidor)</MenuItem>
                <MenuItem value="cfe">CF-e (Cupom fiscal)</MenuItem>
                <MenuItem value="cte">CT-e (Transporte)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={1.5}>
            <FormControl fullWidth>
              <InputLabel>Entrada/Saída</InputLabel>
              <Select
                label="Entrada/Saída"
                value={tipoMovimento}
                onChange={(e) => setTipoMovimento(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saida">Saída</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={1.5}>
            <FormControl fullWidth>
              <InputLabel>Retenção</InputLabel>
              <Select
                label="Retenção"
                value={comRetencao}
                onChange={(e) => setComRetencao(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="com">Com retenção</MenuItem>
                <MenuItem value="sem">Sem retenção</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Filtros Ativos */}
        {(status || tipoNota || tipoMovimento || comRetencao) && (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }} useFlexGap>
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
              Filtros ativos:
            </Typography>
            {status && (
              <Chip
                size="small"
                label={`Status: ${status}`}
                onDelete={() => setStatus('')}
                color="default"
                variant="soft"
              />
            )}
            {tipoNota && (
              <Chip
                size="small"
                label={`Tipo: ${formatTipoNota(tipoNota)}`}
                onDelete={() => setTipoNota('')}
                color="default"
                variant="soft"
              />
            )}
            {tipoMovimento && (
              <Chip
                size="small"
                label={tipoMovimento === 'entrada' ? 'Entrada' : 'Saída'}
                onDelete={() => setTipoMovimento('')}
                color="default"
                variant="soft"
              />
            )}
            {comRetencao && (
              <Chip
                size="small"
                label={comRetencao === 'com' ? 'Com retenção' : 'Sem retenção'}
                onDelete={() => setComRetencao('')}
                color="default"
                variant="soft"
              />
            )}
          </Stack>
        )}

        {/* Linha 2: Navegação mensal e período */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', flex: 1, gap: 1.5, alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={handlePrevMonth}
              startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
              sx={{ minWidth: 150 }}
            >
              Mês Anterior
            </Button>
            <TextField
              label="Início"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="Fim"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <Button
              variant="outlined"
              onClick={handleNextMonth}
              endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
              sx={{ minWidth: 150 }}
            >
              Próximo Mês
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={page || 1}
                onChange={(e, value) => {
                  setPage(value);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                color="primary"
                showFirstButton
                showLastButton
                disabled={loading}
              />
            )}
          </Box>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" color="text.secondary">
              {totalItems} nota(s) no total com os filtros atuais
              {totalPages > 1
                ? ` · Página ${page} de ${totalPages} (50 por página)`
                : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Soma dos valores nesta página: {fCurrency(totalValorNotas)} • Total geral: {fCurrency(somaTotal)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {(status || tipoNota || tipoMovimento || comRetencao) && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="solar:refresh-linear" />}
                onClick={() => {
                  setStatus('');
                  setTipoNota('');
                  setTipoMovimento('');
                  setComRetencao('');
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </Stack>
        </Stack>

        <Stack spacing={1.5} aria-busy={loading && !!selectedCliente} aria-live="polite">
          {selectedCliente && loading
            ? Array.from({ length: 5 }, (_, i) => <NotaFiscalCardSkeleton key={`nf-skeleton-${i}`} />)
            : notas.map((n) => {
              const valor = n.valorServicos || n.valor || 0;
              const statusLabel = n.status || '-';
              const eNotasLabel = n.eNotasStatus || '-';
              const s = String(statusLabel || '').toLowerCase();
              const se = String(eNotasLabel || '').toLowerCase();
              const color = s === 'emitida' ? 'success' : s === 'cancelada' || s === 'negada' ? 'error' : 'warning';
              const colorEnotas = se === 'autorizada' ? 'success' : se === 'cancelada' || se === 'negada' ? 'error' : 'warning';
              const dataEmissao = n.dataEmissao || n.createdAt || n.data;
              const tomador = n.tomador || {};
              const servicoDesc = Array.isArray(n.servicos) && n.servicos.length ? n.servicos[0]?.descricao : (n.descricao || n.discriminacao);
              const isSieg = n.origem === 'sieg';
              const isNacional = n.origem === 'nacional';
              const isEnotas = n.origem === 'enotas' || !n.origem; // fallback para notas antigas
              const movimento = tipoMovimentoNota(n);
              const { retencao } = n;
              const temRetencao = retencao?.possuiRetencao === true;
              const tipoNotaLabel = formatTipoNota(n.tipoNota);
              const tipoNotaColor = getTipoNotaColor(n.tipoNota);
              // Nota de entrada: o tomador salvo é o próprio cliente — exibir quem emitiu
              const emitente = movimento === 'entrada' ? dadosEmitenteNota(n) : null;
              const parteNome = emitente ? emitente.nome : tomador?.nome;
              const docRaw = emitente
                ? emitente.cpfCnpj
                : tomador?.cpfCnpj ||
                  (isSieg ? n.siegCnpjEmitente : isNacional ? n.nacionalCnpjEmitente : '');
              const docFormatted = docRaw ? formatCPFOrCNPJ(String(docRaw)) : '';

              return (
                <Card key={n._id || n.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Label
                        color={tipoNotaColor}
                        variant="soft"
                        sx={{ fontWeight: 600 }}
                      >
                        {tipoNotaLabel}
                      </Label>
                      <Label
                        color={isNacional ? 'info' : 'default'}
                        variant="soft"
                      >
                        {isNacional ? 'Nacional' : isSieg ? 'SIEG' : 'eNotas'}
                      </Label>
                      <Typography variant="subtitle2">
                        #{isSieg ? (n.siegNumero || n.numeroNota || '-') : (n.numeroNota || n.numero || '-')}
                      </Typography>
                      {n.serie && (
                        <Label variant="soft" color="default">Série {n.serie}</Label>
                      )}
                      <Label variant="soft" color={movimento === 'entrada' ? 'warning' : 'success'}>
                        {movimento === 'entrada' ? 'Entrada' : 'Saída'}
                      </Label>
                      {temRetencao && (
                        <Label variant="soft" color="error">
                          Retenção
                        </Label>
                      )}
                      <Label color={color} variant="soft">{statusLabel}</Label>
                      {isEnotas && (
                        <Label color={colorEnotas} variant="soft">eNotas: {eNotasLabel}</Label>
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{dataEmissao ? dayjs(dataEmissao).format('DD/MM/YYYY HH:mm') : '-'}</Typography>
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1.5 }}>
                    <Box
                      flex={1}
                      sx={notaInnerBoxSx}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Iconify icon="solar:user-bold" width={18} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                          <Typography
                            variant="overline"
                            sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8, lineHeight: 1.2 }}
                          >
                            {movimento === 'entrada' ? 'Emitente' : 'Tomador'}
                          </Typography>
                        </Stack>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
                          {parteNome || '-'}
                        </Typography>
                        {!!docFormatted && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                              letterSpacing: 0.4,
                            }}
                          >
                            {docFormatted}
                          </Typography>
                        )}
                      </Stack>
                    </Box>

                    <Box
                      flex={2}
                      sx={notaInnerBoxSx}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Iconify icon="solar:document-text-bold" width={18} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                          <Typography
                            variant="overline"
                            sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8, lineHeight: 1.2 }}
                          >
                            {getDescricaoNotaLabel(n.tipoNota)}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.primary',
                            lineHeight: 1.65,
                            wordBreak: 'break-word',
                          }}
                        >
                          {servicoDesc || '-'}
                        </Typography>
                        {n.codigoVerificacao && (
                          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ pt: 0.25 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              Cód. verificação
                            </Typography>
                            <Box
                              component="span"
                              sx={{
                                typography: 'caption',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                px: 1,
                                py: 0.35,
                                borderRadius: 1,
                                bgcolor: 'action.hover',
                                color: 'text.primary',
                              }}
                            >
                              {n.codigoVerificacao}
                            </Box>
                          </Stack>
                        )}
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        ...notaInnerBoxSx,
                        alignSelf: { xs: 'stretch', md: 'flex-start' },
                        minWidth: { md: 160 },
                      }}
                    >
                      <Stack spacing={0.75} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ width: '100%', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                          <Iconify icon="solar:wallet-money-bold" width={18} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                          <Typography
                            variant="overline"
                            sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8, lineHeight: 1.2 }}
                          >
                            Valores
                          </Typography>
                        </Stack>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {fCurrency(valor)}
                        </Typography>
                        {!!n.valorIss && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            ISS {fCurrency(n.valorIss)}
                          </Typography>
                        )}
                        {temRetencao && (
                          <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                            Retido {fCurrency(retencao.totalRetencoes || 0)}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>

                  {temRetencao && (
                    <Box sx={{ ...notaInnerBoxSx, mt: 1.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Iconify icon="solar:shield-warning-bold" width={18} sx={{ color: 'error.main', flexShrink: 0 }} />
                        <Typography
                          variant="overline"
                          sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8, lineHeight: 1.2 }}
                        >
                          Retenções na fonte
                        </Typography>
                        {retencao.issRetido && (
                          <Label variant="soft" color="warning">
                            ISS retido {fCurrency(retencao.valorIssRetido || 0)}
                          </Label>
                        )}
                        {!!retencao.valorIrrf && (
                          <Label variant="soft" color="warning">IRRF {fCurrency(retencao.valorIrrf)}</Label>
                        )}
                        {!!retencao.valorPis && (
                          <Label variant="soft" color="warning">PIS {fCurrency(retencao.valorPis)}</Label>
                        )}
                        {!!retencao.valorCofins && (
                          <Label variant="soft" color="warning">COFINS {fCurrency(retencao.valorCofins)}</Label>
                        )}
                        {!!retencao.valorCsll && (
                          <Label variant="soft" color="warning">CSLL {fCurrency(retencao.valorCsll)}</Label>
                        )}
                        {!!retencao.valorInss && (
                          <Label variant="soft" color="warning">INSS {fCurrency(retencao.valorInss)}</Label>
                        )}
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Total: {fCurrency(retencao.totalRetencoes || 0)}
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  {(n.eNotasErro || n.motivoCancelamento) && (
                    <Alert severity={se === 'cancelada' || s === 'cancelada' ? 'warning' : 'error'} sx={{ mt: 1 }}>
                      {n.motivoCancelamento ? `Motivo: ${n.motivoCancelamento}` : n.eNotasErro}
                    </Alert>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                    {isNacional ? (
                      <>
                        <Button size="small" variant="outlined" onClick={() => handleAbrirPdf(n)} startIcon={<Iconify icon="solar:document-text-bold" />}>PDF</Button>
                        <Button size="small" variant="outlined" onClick={() => handleBaixarXml(n)} startIcon={<Iconify icon="solar:code-square-bold" />}>XML</Button>
                      </>
                    ) : (
                      <>
                        {!!n.linkNota && n.linkNota !== 'Processando...' && (
                          <Button size="small" variant="outlined" href={n.linkNota} target="_blank" rel="noopener noreferrer" startIcon={<Iconify icon="solar:document-text-bold" />}>PDF</Button>
                        )}
                        {!!n.linkXml && (
                          <Button size="small" variant="outlined" href={n.linkXml} target="_blank" rel="noopener noreferrer" startIcon={<Iconify icon="solar:code-square-bold" />}>XML</Button>
                        )}
                      </>
                    )}
                    {isSieg && n.siegXmlBase64 && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="solar:code-square-bold" />}
                        onClick={() => {
                          const blob = new Blob([atob(n.siegXmlBase64)], { type: 'application/xml' });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `nota-${n.siegNumero || 'sieg'}.xml`;
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(url);
                        }}
                      >
                        XML Sieg
                      </Button>
                    )}
                    {s !== 'cancelada' && s !== 'rejeitada' && s !== 'emitindo' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Iconify icon="solar:close-circle-bold" />}
                        onClick={() => handleOpenCancelDialog(n)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </Stack>
                </Card>
              );
            })}
        </Stack>

        {/* Paginação inferior */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page || 1}
              onChange={(e, value) => {
                setPage(value);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              color="primary"
              showFirstButton
              showLastButton
              disabled={loading}
            />
          </Box>
        )}
      </CardContent>

      {/* Modal de Cancelamento */}
      <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:close-circle-bold" width={24} sx={{ color: 'error.main' }} />
            <Typography variant="h6">Cancelar Nota Fiscal</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              {notaToCancel?.origem === 'nacional'
                ? 'A nota será cancelada diretamente no Emissor Nacional (Sefin) de forma síncrona.'
                : 'Esta ação cancelará a nota fiscal no sistema. Certifique-se de cancelar também na Prefeitura/eNotas se necessário.'}
            </Alert>

            {notaToCancel && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Nota #{notaToCancel.numeroNota || notaToCancel.siegNumero || '-'}
                </Typography>
                <Typography variant="body2">
                  {notaToCancel.tomador?.nome || '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Valor: {fCurrency(notaToCancel.valorServicos || notaToCancel.valor || 0)}
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Motivo do Cancelamento"
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              placeholder="Descreva o motivo do cancelamento..."
            />

            {notaToCancel?.origem !== 'nacional' && (
              <TextField
                fullWidth
                type="date"
                label="Data do Cancelamento"
                value={dataCancelamento}
                onChange={(e) => setDataCancelamento(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} variant="outlined">
            Cancelar
          </Button>
          <LoadingButton
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            loading={canceling}
            startIcon={<Iconify icon="solar:close-circle-bold" />}
          >
            Confirmar Cancelamento
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Modal de Importação por Período — Emissor Nacional (ADN) */}
      <Dialog
        open={importDialogOpen}
        onClose={() => !importing && setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:download-square-bold" width={24} sx={{ color: 'primary.main' }} />
            <Typography variant="h6">Importar notas — Emissor Nacional</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              A primeira importação pode demorar alguns minutos: o ADN é varrido por NSU desde o
              início e as notas são filtradas pelo período informado.
            </Alert>

            <FormControl fullWidth>
              <InputLabel id="import-modo-label">Modo</InputLabel>
              <Select
                labelId="import-modo-label"
                label="Modo"
                value={importModo}
                onChange={(e) => setImportModo(e.target.value)}
                disabled={importing}
              >
                <MenuItem value="mes">Um mês</MenuItem>
                <MenuItem value="intervalo">Intervalo de meses (mesmo ano)</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Ano"
                value={importAno}
                onChange={(e) => setImportAno(Number(e.target.value))}
                disabled={importing}
              />
              <FormControl fullWidth>
                <InputLabel id="import-mes-inicio-label">
                  {importModo === 'mes' ? 'Mês' : 'De'}
                </InputLabel>
                <Select
                  labelId="import-mes-inicio-label"
                  label={importModo === 'mes' ? 'Mês' : 'De'}
                  value={importMesInicio}
                  onChange={(e) => setImportMesInicio(Number(e.target.value))}
                  disabled={importing}
                >
                  {MESES.map((m) => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {importModo === 'intervalo' && (
                <FormControl fullWidth>
                  <InputLabel id="import-mes-fim-label">Até</InputLabel>
                  <Select
                    labelId="import-mes-fim-label"
                    label="Até"
                    value={importMesFim}
                    onChange={(e) => setImportMesFim(Number(e.target.value))}
                    disabled={importing}
                  >
                    {MESES.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>

            {importing && (
              <Alert severity="info">
                Importando notas do Emissor Nacional... pode levar alguns minutos.
              </Alert>
            )}

            {importResultado && (
              <Alert severity="success">
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">{importResultado.message}</Typography>
                  <Typography variant="body2">
                    Importadas: {importResultado.notasImportadas ?? 0} · Atualizadas:{' '}
                    {importResultado.notasAtualizadas ?? 0} · Fora do período:{' '}
                    {importResultado.notasIgnoradasForaPeriodo ?? 0} · Eventos:{' '}
                    {importResultado.eventosProcessados ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Documentos processados: {importResultado.documentosProcessados ?? 0} · Último
                    NSU: {importResultado.ultimoNSU ?? '-'}
                  </Typography>
                </Stack>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setImportDialogOpen(false)} disabled={importing}>
            Fechar
          </Button>
          <LoadingButton
            variant="contained"
            loading={importing}
            startIcon={<Iconify icon="solar:download-square-bold" />}
            onClick={handleImportarPeriodo}
          >
            Importar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}


