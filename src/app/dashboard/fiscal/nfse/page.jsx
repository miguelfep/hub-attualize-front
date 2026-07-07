'use client';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect, useCallback } from 'react';

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
  Tooltip,
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
  FormHelperText,
} from '@mui/material';

import { useDebounce } from 'src/hooks/use-debounce';

import axios from 'src/utils/axios';
import { formatClienteCodigoRazao } from 'src/utils/formatter';
import { fCurrency, formatCPFOrCNPJ } from 'src/utils/format-number';
import { formatCpfCnpj, removeFormatting } from 'src/utils/format-input';

import { getClientes } from 'src/actions/clientes';
import { useGetSettings } from 'src/actions/settings';
import {
  isNotaSefaz,
  isNotaNfcePr,
  abrirPdfNota,
  baixarXmlNota,
  isNotaNacional,
  cancelarNfcePr,
  consultarNfcePr,
  dadosEmitenteNota,
  tipoMovimentoNota,
  cancelarNotaFiscal,
  labelStatusDominio,
  podeReenviarDominio,
  mensagemErroDominio,
  reenviarNotaDominio,
  sincronizarUnificado,
  isNotaElegivelDominio,
  cancelarNotaNoProvedor,
  sincronizarTodosNfeSefaz,
  reenviarCancelamentoDominio,
  listarNotasFiscaisPorCliente,
  reprocessarRetencoesNacional,
  podeReenviarCancelamentoDominio,
} from 'src/actions/notafiscal';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Skeleton
            variant="rounded"
            animation="wave"
            width={52}
            height={26}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton variant="rounded" animation="wave" width={56} height={26} />
          <Skeleton variant="text" animation="wave" width={72} sx={{ transform: 'none' }} />
          <Skeleton variant="rounded" animation="wave" width={64} height={26} />
          <Skeleton variant="rounded" animation="wave" width={76} height={26} />
          <Skeleton variant="rounded" animation="wave" width={88} height={26} />
        </Stack>
        <Skeleton
          variant="text"
          animation="wave"
          width={130}
          height={18}
          sx={{ transform: 'none' }}
        />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1.5 }}>
        <Box flex={1} sx={notaInnerBoxSx}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Skeleton variant="circular" animation="wave" width={18} height={18} />
              <Skeleton animation="wave" width={72} height={14} sx={{ transform: 'none' }} />
            </Stack>
            <Skeleton
              animation="wave"
              width="100%"
              height={22}
              sx={{ transform: 'none', maxWidth: 280 }}
            />
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
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{ width: '100%', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
            >
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
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'admin';

  const [selectedCliente, setSelectedCliente] = useState('');
  const [status, setStatus] = useState('');
  const [tipoNota, setTipoNota] = useState('');
  const [origem, setOrigem] = useState(''); // '' | 'enotas' | 'sieg' | 'nacional' | 'sefaz'
  const [tipoMovimento, setTipoMovimento] = useState('saida'); // '' | 'entrada' | 'saida' — query param tipoMovimento
  const [comRetencao, setComRetencao] = useState(''); // '' | 'com' | 'sem' — query param comRetencao
  // Busca por número da nota (debounced) e CPF/CNPJ do tomador (prioridade sobre os demais filtros)
  const [filtroNumeroNota, setFiltroNumeroNota] = useState('');
  const numeroNotaDebounce = useDebounce(filtroNumeroNota, 500);
  const [filtroCpfCnpj, setFiltroCpfCnpj] = useState('');
  const [cpfCnpjAplicado, setCpfCnpjAplicado] = useState('');
  const [cpfCnpjErro, setCpfCnpjErro] = useState('');
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

  // Emissor Nacional: sincronização incremental + importação por período (ADN).
  // Disponível para quem emite pelo Nacional OU habilitou só o download (buscaHabilitada).
  const { settings: clienteSettings } = useGetSettings(selectedCliente || null);
  const isClienteNacional =
    clienteSettings?.provedorNFSe === 'nacional' ||
    Boolean(clienteSettings?.nfseNacionalConfig?.buscaHabilitada);
  // NF-e SEFAZ: busca/importação de NF-e (modelo 55)
  const nfeBuscaHabilitada = Boolean(clienteSettings?.nfeConfig?.buscaHabilitada);
  const nfeBloqueadoAte = clienteSettings?.nfeConfig?.bloqueadoAte || null;
  const nfeBloqueado = !!nfeBloqueadoAte && new Date(nfeBloqueadoAte).getTime() > Date.now();
  // Domínio: envio de XML de NFS-e à contabilidade
  const dominioHabilitado = Boolean(clienteSettings?.dominioConfig?.habilitado);
  const [reenviandoDominioId, setReenviandoDominioId] = useState(null);
  const [reenviandoCancelamentoId, setReenviandoCancelamentoId] = useState(null);
  const [syncingTodosNfe, setSyncingTodosNfe] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [baixandoLote, setBaixandoLote] = useState(false);
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
      // Busca por número tem prioridade: desabilita período/status/tipo/origem/movimento/retenção
      const numeroNota = numeroNotaDebounce || undefined;
      const cpfCnpj =
        !numeroNota && (cpfCnpjAplicado.length === 11 || cpfCnpjAplicado.length === 14)
          ? cpfCnpjAplicado
          : undefined;
      const pageParam = numeroNota ? 1 : page;

      const res = await listarNotasFiscaisPorCliente({
        clienteId: selectedCliente,
        numeroNota,
        cpfCnpj,
        status: numeroNota ? undefined : status || undefined,
        inicio: numeroNota ? undefined : startDate || undefined,
        fim: numeroNota ? undefined : endDate || undefined,
        tipoNota: numeroNota ? undefined : tipoNota || undefined,
        origem: numeroNota ? undefined : origem || undefined,
        tipoMovimento: numeroNota ? undefined : tipoMovimento || undefined,
        comRetencao: numeroNota
          ? undefined
          : comRetencao === 'com'
            ? true
            : comRetencao === 'sem'
              ? false
              : undefined,
        page: pageParam,
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
  }, [
    selectedCliente,
    status,
    startDate,
    endDate,
    tipoNota,
    origem,
    tipoMovimento,
    comRetencao,
    numeroNotaDebounce,
    cpfCnpjAplicado,
  ]);

  useEffect(() => {
    fetchNotas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCliente,
    status,
    startDate,
    endDate,
    tipoNota,
    origem,
    tipoMovimento,
    comRetencao,
    numeroNotaDebounce,
    cpfCnpjAplicado,
    page,
  ]);

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

  // Aplicar filtro de CPF/CNPJ do tomador (apenas com documento completo)
  const aplicarFiltroCpfCnpj = useCallback(() => {
    const d = removeFormatting(filtroCpfCnpj);
    if (!d) {
      setCpfCnpjAplicado('');
      setCpfCnpjErro('');
      setPage(1);
      return;
    }
    if (d.length !== 11 && d.length !== 14) {
      setCpfCnpjErro('Informe CPF (11 dígitos) ou CNPJ (14 dígitos) completo para filtrar.');
      return;
    }
    setCpfCnpjErro('');
    setCpfCnpjAplicado(d);
    setPage(1);
  }, [filtroCpfCnpj]);

  const handleCpfCnpjBlur = useCallback(() => {
    const d = removeFormatting(filtroCpfCnpj);
    if (!d) {
      if (cpfCnpjAplicado) {
        setCpfCnpjAplicado('');
        setCpfCnpjErro('');
        setPage(1);
      }
      return;
    }
    if (d.length === 11 || d.length === 14) {
      setCpfCnpjErro('');
      if (d !== cpfCnpjAplicado) {
        setCpfCnpjAplicado(d);
        setPage(1);
      }
      return;
    }
    if (cpfCnpjAplicado) {
      setCpfCnpjAplicado('');
      setCpfCnpjErro('');
      setPage(1);
    }
  }, [filtroCpfCnpj, cpfCnpjAplicado]);

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
    // NFC-e exige motivo com no mínimo 15 caracteres (requisito SEFAZ)
    if (isNotaNfcePr(notaToCancel) && motivoCancelamento.trim().length < 15) {
      toast.error('O motivo do cancelamento deve ter no mínimo 15 caracteres');
      return;
    }
    try {
      setCanceling(true);
      const notaId = notaToCancel._id || notaToCancel.id;
      if (isNotaNfcePr(notaToCancel)) {
        // NFC-e SEFAZ-PR — evento 110111 (prazo de 30 min)
        await cancelarNfcePr(notaId, motivoCancelamento);
      } else if (notaToCancel.origem === 'nacional') {
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
      const msg =
        error?.response?.data?.message || error?.message || 'Erro ao cancelar nota fiscal';
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

  const handleConsultarNfce = async (nota) => {
    try {
      const res = await consultarNfcePr(nota._id || nota.id);
      const d = res.data || {};
      toast.info(`SEFAZ-PR (${d.cStat || '-'}): ${d.xMotivo || 'consulta concluída'}`, {
        duration: 7000,
      });
    } catch (error) {
      toast.error(error?.message || 'Erro ao consultar a NFC-e no SEFAZ-PR');
    }
  };

  // Reenvia o XML de uma NFS-e ao Domínio (contabilidade).
  const handleReenviarDominio = async (nota) => {
    const id = nota._id || nota.id;
    try {
      setReenviandoDominioId(id);
      await reenviarNotaDominio(id);
      toast.success('Nota reenviada ao Domínio');
      await fetchNotas();
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || 'Falha ao reenviar ao Domínio';
      toast.error(msg);
    } finally {
      setReenviandoDominioId(null);
    }
  };

  // Reenvia o evento de cancelamento (e101101) de uma NFS-e nacional ao Domínio.
  const handleReenviarCancelamentoDominio = async (nota) => {
    const id = nota._id || nota.id;
    try {
      setReenviandoCancelamentoId(id);
      await reenviarCancelamentoDominio(id);
      toast.success('Cancelamento reenviado ao Domínio');
      await fetchNotas();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Falha ao reenviar cancelamento ao Domínio';
      toast.error(msg);
    } finally {
      setReenviandoCancelamentoId(null);
    }
  };

  // Sincronização unificada — todos os provedores habilitados, modo incremental.
  const handleSincronizar = async () => {
    if (!selectedCliente || syncing) return;
    try {
      setSyncing(true);
      const res = await sincronizarUnificado(selectedCliente, {});
      const data = res.data || {};

      if (data.totalImportadas > 0 || data.totalAtualizadas > 0) {
        toast.success(
          data.message || `${data.totalImportadas} importadas, ${data.totalAtualizadas} atualizadas`
        );
      } else {
        toast.info(data.message || 'Sincronização concluída sem novas notas');
      }

      if (data.erros?.nfe) toast.warning(`NF-e SEFAZ: ${data.erros.nfe}`, { duration: 7000 });
      if (data.erros?.nacional)
        toast.warning(`Emissor Nacional: ${data.erros.nacional}`, { duration: 7000 });
      if (data.erros?.sieg) toast.warning(`SIEG: ${data.erros.sieg}`, { duration: 7000 });
      if (data.resultados?.nfe?.bloqueadoAte) {
        toast.warning(
          `SEFAZ bloqueou as consultas. Tente após ${new Date(data.resultados.nfe.bloqueadoAte).toLocaleString('pt-BR')}.`,
          { duration: 8000 }
        );
      }

      await fetchNotas();
    } catch (error) {
      toast.error(error?.message || 'Erro ao sincronizar notas');
    } finally {
      setSyncing(false);
    }
  };

  // Admin: sincroniza NF-e de todos os clientes habilitados (mesmo efeito do cron)
  const handleSincronizarTodosNfe = async () => {
    if (syncingTodosNfe) return;
    try {
      setSyncingTodosNfe(true);
      const res = await sincronizarTodosNfeSefaz();
      toast.success(
        res.data?.message || 'Sincronização de NF-e disparada para todos os clientes habilitados'
      );
    } catch (error) {
      toast.error(error?.message || 'Erro ao sincronizar NF-e de todos os clientes');
    } finally {
      setSyncingTodosNfe(false);
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
          : {
            ano: Number(importAno),
            mesInicio: Number(importMesInicio),
            mesFim: Number(importMesFim),
          };
      const res = await sincronizarUnificado(selectedCliente, body);
      setImportResultado(res.data);
      toast.success(res.data?.message || 'Importação concluída');
      await fetchNotas();
    } catch (error) {
      toast.error(error?.message || 'Erro ao importar notas do período');
    } finally {
      setImporting(false);
    }
  };

  const handleBaixarXmlLote = async () => {
    if (!selectedCliente) return;
    try {
      setBaixandoLote(true);
      toast.info('Buscando notas para download...');

      const res = await listarNotasFiscaisPorCliente({
        clienteId: selectedCliente,
        status: status || undefined,
        inicio: startDate || undefined,
        fim: endDate || undefined,
        tipoNota: tipoNota || undefined,
        origem: origem || undefined,
        tipoMovimento: tipoMovimento || undefined,
        comRetencao: comRetencao === 'com' ? true : comRetencao === 'sem' ? false : undefined,
        limit: 500,
      });

      const todasNotas = res.data?.notasFiscais || [];
      const notasComXml = todasNotas.filter(
        (n) => isNotaNfcePr(n) || isNotaSefaz(n) || isNotaNacional(n) || n.siegXmlBase64
      );

      if (notasComXml.length === 0) {
        toast.warning('Nenhuma nota com XML disponível para download em lote');
        return;
      }

      toast.info(`Baixando ${notasComXml.length} XML(s)...`);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const JSZip = (await import('jszip')).default;
      const { saveAs } = await import('file-saver');
      const zip = new JSZip();

      const results = await Promise.allSettled(
        notasComXml.map(async (nota) => {
          const id = nota._id || nota.id;
          const num = nota.numeroNota || nota.chaveAcesso || id;
          const tipo = (nota.tipoNota || 'nota').toUpperCase();
          const filename = `${tipo}-${num}.xml`;
          if (nota.siegXmlBase64) {
            const bytes = Uint8Array.from(atob(nota.siegXmlBase64), (c) => c.charCodeAt(0));
            zip.file(filename, bytes);
          } else {
            let endpoint;
            if (isNotaNfcePr(nota)) {
              endpoint = `${baseUrl}nota-fiscal/${id}/nfce-pr/xml`;
            } else if (isNotaSefaz(nota)) {
              endpoint = `${baseUrl}nota-fiscal/${id}/sefaz/xml`;
            } else {
              endpoint = `${baseUrl}nota-fiscal/${id}/nacional/xml`;
            }
            const xmlRes = await axios.get(endpoint, { responseType: 'blob' });
            zip.file(filename, xmlRes.data);
          }
        })
      );

      const success = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      if (success === 0) {
        toast.error('Nenhum XML pôde ser baixado');
        return;
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const periodo = `${startDate}_${endDate}`.replace(/-/g, '');
      saveAs(blob, `XMLs-${periodo}.zip`);

      if (failed > 0) {
        toast.warning(`${success} XML(s) baixados, ${failed} com erro`);
      } else {
        toast.success(`${success} XML(s) baixados com sucesso`);
      }
    } catch (error) {
      toast.error(error?.message || 'Erro ao baixar XMLs em lote');
    } finally {
      setBaixandoLote(false);
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
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {selectedCliente && (isClienteNacional || nfeBuscaHabilitada) && (
            <Tooltip title="Sincronização incremental de todos os provedores habilitados (NFS-e Nacional + NF-e SEFAZ)">
              <span>
                <LoadingButton
                  variant="contained"
                  loading={syncing}
                  startIcon={<Iconify icon="solar:refresh-circle-bold" />}
                  onClick={handleSincronizar}
                >
                  Sincronizar
                </LoadingButton>
              </span>
            </Tooltip>
          )}
          {selectedCliente && (isClienteNacional || nfeBuscaHabilitada) && (
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:download-square-bold" />}
              onClick={handleOpenImportDialog}
            >
              Importar período
            </Button>
          )}
          {selectedCliente && isClienteNacional && (
            <LoadingButton
              variant="outlined"
              loading={reprocessandoRetencoes}
              startIcon={<Iconify icon="solar:shield-check-bold" />}
              onClick={handleReprocessarRetencoes}
            >
              Reprocessar retenções
            </LoadingButton>
          )}
          {isAdmin && (
            <Tooltip title="Sincroniza NF-e de todos os clientes habilitados (equivale ao cron)">
              <span>
                <LoadingButton
                  variant="outlined"
                  color="inherit"
                  size="small"
                  loading={syncingTodosNfe}
                  startIcon={<Iconify icon="solar:refresh-circle-bold" />}
                  onClick={handleSincronizarTodosNfe}
                >
                  Sincronizar todos
                </LoadingButton>
              </span>
            </Tooltip>
          )}
        </Stack>
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        {/* Linha 1: Cliente (primário/obrigatório), Status e Tipo de Nota */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12} md={6}>
            <Autocomplete
              fullWidth
              options={clientes || []}
              loading={loadingClientes}
              getOptionLabel={(option) => formatClienteCodigoRazao(option)}
              isOptionEqualToValue={(opt, val) => (opt?._id || opt?.id) === (val?._id || val?.id)}
              value={(clientes || []).find((c) => c._id === selectedCliente) || null}
              onChange={(_, newValue) => {
                setSelectedCliente(newValue?._id || '');
              }}
              disabled={!!filtroNumeroNota}
              renderInput={(params) => (
                <TextField {...params} label="Cliente" placeholder="Digite para buscar" />
              )}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                }}
                disabled={!!filtroNumeroNota}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="emitida">Emitida</MenuItem>
                <MenuItem value="autorizada">Autorizada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
                <MenuItem value="negada">Negada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Nota</InputLabel>
              <Select
                label="Tipo de Nota"
                value={tipoNota}
                onChange={(e) => {
                  setTipoNota(e.target.value);
                  setPage(1);
                }}
                disabled={!!filtroNumeroNota}
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
        </Grid>

        {/* Linha 2: Origem, Entrada/Saída e Retenção */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12} sm={4} md={4}>
            <FormControl fullWidth>
              <InputLabel>Origem</InputLabel>
              <Select
                label="Origem"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                disabled={!!filtroNumeroNota}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="enotas">eNotas</MenuItem>
                <MenuItem value="sieg">SIEG</MenuItem>
                <MenuItem value="nacional">Nacional</MenuItem>
                <MenuItem value="sefaz">SEFAZ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={4} md={4}>
            <FormControl fullWidth>
              <InputLabel>Entrada/Saída</InputLabel>
              <Select
                label="Entrada/Saída"
                value={tipoMovimento}
                onChange={(e) => setTipoMovimento(e.target.value)}
                disabled={!!filtroNumeroNota}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saida">Saída</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={4} md={4}>
            <FormControl fullWidth>
              <InputLabel>Retenção</InputLabel>
              <Select
                label="Retenção"
                value={comRetencao}
                onChange={(e) => setComRetencao(e.target.value)}
                disabled={!!filtroNumeroNota}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="com">Com retenção</MenuItem>
                <MenuItem value="sem">Sem retenção</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Linha 3: Busca por número da nota e CPF/CNPJ do tomador (número tem prioridade) */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12} sm={4} md={3}>
            <TextField
              label="Número da Nota"
              type="number"
              fullWidth
              value={filtroNumeroNota}
              onChange={(e) => setFiltroNumeroNota(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="Digite para buscar..."
              InputProps={{
                endAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />,
              }}
            />
          </Grid>
          <Grid xs={12} sm={8} md={9}>
            <Stack spacing={0}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'stretch', sm: 'flex-end' }}
              >
                <TextField
                  label="CPF ou CNPJ do Tomador"
                  fullWidth
                  value={filtroCpfCnpj}
                  onChange={(e) => {
                    setFiltroCpfCnpj(formatCpfCnpj(e.target.value));
                    if (cpfCnpjErro) setCpfCnpjErro('');
                  }}
                  onBlur={handleCpfCnpjBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      aplicarFiltroCpfCnpj();
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  disabled={!!filtroNumeroNota}
                  error={!!cpfCnpjErro}
                  inputProps={{ 'aria-describedby': 'dashboard-fiscal-cpf-cnpj-helper' }}
                  InputProps={{
                    endAdornment: (
                      <Iconify icon="solar:user-id-bold" sx={{ color: 'text.disabled' }} />
                    ),
                  }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={aplicarFiltroCpfCnpj}
                  disabled={!!filtroNumeroNota}
                >
                  Aplicar
                </Button>
              </Stack>
              <FormHelperText
                id="dashboard-fiscal-cpf-cnpj-helper"
                error={!!cpfCnpjErro}
                sx={{ mx: 0 }}
              >
                {filtroNumeroNota
                  ? 'Indisponível enquanto buscar por número da nota'
                  : cpfCnpjErro ||
                  'Digite o documento e clique em Aplicar ou pressione Enter. A busca só ocorre com CPF ou CNPJ completo.'}
              </FormHelperText>
            </Stack>
          </Grid>
          {filtroNumeroNota && (
            <Grid xs={12}>
              <Typography variant="caption" color="text.secondary">
                Busca por número ativa: os filtros de período, status, tipo, origem, movimento e
                retenção estão desativados.
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Linha 4: Navegação mensal e período */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Box sx={{ display: 'flex', flex: 1, gap: 1.5, alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={handlePrevMonth}
              startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
              sx={{ minWidth: 150 }}
              disabled={!!filtroNumeroNota}
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
              disabled={!!filtroNumeroNota}
            />
            <TextField
              label="Fim"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
              disabled={!!filtroNumeroNota}
            />
            <Button
              variant="outlined"
              onClick={handleNextMonth}
              endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
              sx={{ minWidth: 150 }}
              disabled={!!filtroNumeroNota}
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

        {/* Filtros Ativos */}
        {(filtroNumeroNota ||
          cpfCnpjAplicado ||
          status ||
          tipoNota ||
          origem ||
          tipoMovimento ||
          comRetencao) && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }} useFlexGap>
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                Filtros ativos:
              </Typography>
              {filtroNumeroNota && (
                <Chip
                  size="small"
                  label={`Número: ${filtroNumeroNota}`}
                  onDelete={() => setFiltroNumeroNota('')}
                  color="default"
                  variant="soft"
                />
              )}
              {cpfCnpjAplicado && (
                <Chip
                  size="small"
                  label={`CPF/CNPJ: ${formatCpfCnpj(cpfCnpjAplicado)}`}
                  onDelete={() => {
                    setFiltroCpfCnpj('');
                    setCpfCnpjAplicado('');
                    setCpfCnpjErro('');
                  }}
                  color="default"
                  variant="soft"
                />
              )}
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
              {origem && (
                <Chip
                  size="small"
                  label={`Origem: ${origem === 'sefaz' ? 'SEFAZ' : origem === 'sieg' ? 'SIEG' : origem === 'nacional' ? 'Nacional' : 'eNotas'}`}
                  onDelete={() => setOrigem('')}
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

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" color="text.secondary">
              {totalItems} nota(s) no total com os filtros atuais
              {totalPages > 1 ? ` · Página ${page} de ${totalPages} (50 por página)` : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Soma dos valores nesta página: {fCurrency(totalValorNotas)} • Total geral:{' '}
              {fCurrency(somaTotal)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {(filtroNumeroNota ||
              cpfCnpjAplicado ||
              status ||
              tipoNota ||
              origem ||
              tipoMovimento ||
              comRetencao) && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<Iconify icon="solar:refresh-linear" />}
                  onClick={() => {
                    setFiltroNumeroNota('');
                    setFiltroCpfCnpj('');
                    setCpfCnpjAplicado('');
                    setCpfCnpjErro('');
                    setStatus('');
                    setTipoNota('');
                    setOrigem('');
                    setTipoMovimento('');
                    setComRetencao('');
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            {selectedCliente && (
              <LoadingButton
                size="small"
                variant="outlined"
                color="success"
                loading={baixandoLote}
                startIcon={<Iconify icon="solar:zip-file-bold" />}
                onClick={handleBaixarXmlLote}
              >
                Baixar XMLs em lote
              </LoadingButton>
            )}
          </Stack>
        </Stack>

        {nfeBuscaHabilitada && nfeBloqueado && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            A SEFAZ limitou temporariamente as consultas de NF-e deste cliente (consumo indevido). A
            sincronização ficará disponível após {new Date(nfeBloqueadoAte).toLocaleString('pt-BR')}
            .
          </Alert>
        )}

        <Stack spacing={1.5} aria-busy={loading && !!selectedCliente} aria-live="polite">
          {selectedCliente && loading
            ? Array.from({ length: 5 }, (_, i) => (
              <NotaFiscalCardSkeleton key={`nf-skeleton-${i}`} />
            ))
            : notas.map((n) => {
              const valor = n.valorServicos || n.valor || 0;
              const statusLabel = n.status || '-';
              const eNotasLabel = n.eNotasStatus || '-';
              const s = String(statusLabel || '').toLowerCase();
              const se = String(eNotasLabel || '').toLowerCase();
              const color =
                s === 'emitida'
                  ? 'success'
                  : s === 'cancelada' || s === 'negada'
                    ? 'error'
                    : 'warning';
              const colorEnotas =
                se === 'autorizada'
                  ? 'success'
                  : se === 'cancelada' || se === 'negada'
                    ? 'error'
                    : 'warning';
              const dataEmissao = n.dataEmissao || n.createdAt || n.data;
              const tomador = n.tomador || {};
              const servicoDesc =
                Array.isArray(n.servicos) && n.servicos.length
                  ? n.servicos[0]?.descricao
                  : n.descricao || n.discriminacao;
              const isSieg = n.origem === 'sieg';
              const isNacional = n.origem === 'nacional';
              const isNfce = isNotaNfcePr(n); // NFC-e SEFAZ-PR (origem sefaz + tipoNota nfce)
              const isSefaz = n.origem === 'sefaz' && !isNfce; // NF-e SEFAZ (modelo 55)
              const isEnotas = n.origem === 'enotas' || !n.origem; // fallback para notas antigas
              const isSefazResumo = isSefaz && n.sefazResumo === true;
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
                (isSieg
                  ? n.siegCnpjEmitente
                  : isNacional
                    ? n.nacionalCnpjEmitente
                    : isSefaz
                      ? n.sefazCnpjEmitente
                      : '');
              const docFormatted = docRaw ? formatCPFOrCNPJ(String(docRaw)) : '';

              return (
                <Card key={n._id || n.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Label color={tipoNotaColor} variant="soft" sx={{ fontWeight: 600 }}>
                        {tipoNotaLabel}
                      </Label>
                      <Label
                        color={
                          isNacional
                            ? 'info'
                            : isSefaz
                              ? 'secondary'
                              : isNfce
                                ? 'secondary'
                                : 'default'
                        }
                        variant="soft"
                      >
                        {isNacional
                          ? 'Nacional'
                          : isNfce
                            ? 'SEFAZ-PR'
                            : isSefaz
                              ? 'SEFAZ'
                              : isSieg
                                ? 'SIEG'
                                : 'eNotas'}
                      </Label>
                      {isSefazResumo && (
                        <Tooltip title="XML completo será liberado após a manifestação automática (ciência da operação)">
                          <Label color="warning" variant="soft">
                            Resumo
                          </Label>
                        </Tooltip>
                      )}
                      <Typography variant="subtitle2">
                        #
                        {isSieg
                          ? n.siegNumero || n.numeroNota || '-'
                          : n.numeroNota || n.numero || '-'}
                      </Typography>
                      {n.serie && (
                        <Label variant="soft" color="default">
                          Série {n.serie}
                        </Label>
                      )}
                      <Label
                        variant="soft"
                        color={movimento === 'entrada' ? 'warning' : 'success'}
                      >
                        {movimento === 'entrada' ? 'Entrada' : 'Saída'}
                      </Label>
                      {temRetencao && (
                        <Label variant="soft" color="error">
                          Retenção
                        </Label>
                      )}
                      <Label color={color} variant="soft">
                        {statusLabel}
                      </Label>
                      {isEnotas && (
                        <Label color={colorEnotas} variant="soft">
                          eNotas: {eNotasLabel}
                        </Label>
                      )}
                      {isNotaElegivelDominio(n) &&
                        (n.dominioEnvio || dominioHabilitado) &&
                        (() => {
                          const dom = labelStatusDominio(n.dominioEnvio, dominioHabilitado);
                          const env = n.dominioEnvio;
                          const tip =
                            env?.status === 'enviado'
                              ? `Enviado em ${env.enviadoEm ? dayjs(env.enviadoEm).format('DD/MM/YYYY HH:mm') : '-'}${env.processadoEm ? ` · Confirmado em ${dayjs(env.processadoEm).format('DD/MM/YYYY HH:mm')}` : ''}${env.batchId ? ` · Lote ${env.batchId}` : ''}`
                              : env?.status === 'erro'
                                ? `${mensagemErroDominio(env.erro) || 'Erro no envio'}${env.tentativas ? ` (tentativa ${env.tentativas}/5)` : ''}`
                                : 'Envio de XML à contabilidade (Domínio)';
                          return (
                            <Tooltip title={tip}>
                              <Label
                                color={dom.color}
                                variant="soft"
                                startIcon={<Iconify icon="solar:buildings-3-bold" />}
                              >
                                Domínio: {dom.label}
                              </Label>
                            </Tooltip>
                          );
                        })()}
                      {s === 'cancelada' &&
                        n.dominioEnvioCancelamento &&
                        (() => {
                          const cancEnv = n.dominioEnvioCancelamento;
                          const canc = labelStatusDominio(cancEnv, true);
                          const tipCanc =
                            cancEnv.status === 'enviado'
                              ? `Cancelamento enviado em ${cancEnv.enviadoEm ? dayjs(cancEnv.enviadoEm).format('DD/MM/YYYY HH:mm') : '-'}${cancEnv.processadoEm ? ` · Confirmado em ${dayjs(cancEnv.processadoEm).format('DD/MM/YYYY HH:mm')}` : ''}${cancEnv.batchId ? ` · Lote ${cancEnv.batchId}` : ''}`
                              : cancEnv.status === 'erro'
                                ? `${mensagemErroDominio(cancEnv.erro) || 'Erro no envio do cancelamento'}${cancEnv.tentativas ? ` (tentativa ${cancEnv.tentativas}/5)` : ''}`
                                : 'Envio do evento de cancelamento à contabilidade (Domínio)';
                          return (
                            <Tooltip title={tipCanc}>
                              <Label
                                color={canc.color}
                                variant="soft"
                                startIcon={<Iconify icon="solar:close-circle-bold" />}
                              >
                                Cancelamento → Domínio: {canc.label}
                              </Label>
                            </Tooltip>
                          );
                        })()}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {dataEmissao ? dayjs(dataEmissao).format('DD/MM/YYYY HH:mm') : '-'}
                    </Typography>
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1.5 }}>
                    <Box flex={1} sx={notaInnerBoxSx}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Iconify
                            icon="solar:user-bold"
                            width={18}
                            sx={{ color: 'text.secondary', flexShrink: 0 }}
                          />
                          <Typography
                            variant="overline"
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 700,
                              letterSpacing: 0.8,
                              lineHeight: 1.2,
                            }}
                          >
                            {movimento === 'entrada' ? 'Emitente' : 'Tomador'}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, lineHeight: 1.45 }}
                        >
                          {parteNome || '-'}
                        </Typography>
                        {!!docFormatted && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontFamily:
                                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                              letterSpacing: 0.4,
                            }}
                          >
                            {docFormatted}
                          </Typography>
                        )}
                      </Stack>
                    </Box>

                    <Box flex={2} sx={notaInnerBoxSx}>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Iconify
                            icon="solar:document-text-bold"
                            width={18}
                            sx={{ color: 'text.secondary', flexShrink: 0 }}
                          />
                          <Typography
                            variant="overline"
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 700,
                              letterSpacing: 0.8,
                              lineHeight: 1.2,
                            }}
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
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            flexWrap="wrap"
                            sx={{ pt: 0.25 }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', fontWeight: 600 }}
                            >
                              Cód. verificação
                            </Typography>
                            <Box
                              component="span"
                              sx={{
                                typography: 'caption',
                                fontFamily:
                                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
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
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.75}
                          sx={{
                            width: '100%',
                            justifyContent: { xs: 'flex-start', md: 'flex-end' },
                          }}
                        >
                          <Iconify
                            icon="solar:wallet-money-bold"
                            width={18}
                            sx={{ color: 'text.secondary', flexShrink: 0 }}
                          />
                          <Typography
                            variant="overline"
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 700,
                              letterSpacing: 0.8,
                              lineHeight: 1.2,
                            }}
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
                          <Typography
                            variant="caption"
                            sx={{ color: 'error.main', fontWeight: 600 }}
                          >
                            Retido {fCurrency(retencao.totalRetencoes || 0)}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>

                  {temRetencao && (
                    <Box sx={{ ...notaInnerBoxSx, mt: 1.5 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Iconify
                          icon="solar:shield-warning-bold"
                          width={18}
                          sx={{ color: 'error.main', flexShrink: 0 }}
                        />
                        <Typography
                          variant="overline"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 700,
                            letterSpacing: 0.8,
                            lineHeight: 1.2,
                          }}
                        >
                          Retenções na fonte
                        </Typography>
                        {retencao.issRetido && (
                          <Label variant="soft" color="warning">
                            ISS retido {fCurrency(retencao.valorIssRetido || 0)}
                          </Label>
                        )}
                        {!!retencao.valorIrrf && (
                          <Label variant="soft" color="warning">
                            IRRF {fCurrency(retencao.valorIrrf)}
                          </Label>
                        )}
                        {!!retencao.valorPis && (
                          <Label variant="soft" color="warning">
                            PIS {fCurrency(retencao.valorPis)}
                          </Label>
                        )}
                        {!!retencao.valorCofins && (
                          <Label variant="soft" color="warning">
                            COFINS {fCurrency(retencao.valorCofins)}
                          </Label>
                        )}
                        {!!retencao.valorCsll && (
                          <Label variant="soft" color="warning">
                            CSLL {fCurrency(retencao.valorCsll)}
                          </Label>
                        )}
                        {!!retencao.valorInss && (
                          <Label variant="soft" color="warning">
                            INSS {fCurrency(retencao.valorInss)}
                          </Label>
                        )}
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Total: {fCurrency(retencao.totalRetencoes || 0)}
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  {(n.eNotasErro || n.motivoCancelamento) && (
                    <Alert
                      severity={se === 'cancelada' || s === 'cancelada' ? 'warning' : 'error'}
                      sx={{ mt: 1 }}
                    >
                      {n.motivoCancelamento ? `Motivo: ${n.motivoCancelamento}` : n.eNotasErro}
                    </Alert>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                    {isNfce ? (
                      <>
                        {!!n.linkNota && n.linkNota !== 'Processando...' && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={n.linkNota}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<Iconify icon="solar:qr-code-bold" />}
                          >
                            Cupom / QR
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleBaixarXml(n)}
                          startIcon={<Iconify icon="solar:code-square-bold" />}
                        >
                          XML
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleConsultarNfce(n)}
                          startIcon={<Iconify icon="solar:refresh-linear" />}
                        >
                          Consultar
                        </Button>
                      </>
                    ) : isSefaz ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleBaixarXml(n)}
                        startIcon={<Iconify icon="solar:code-square-bold" />}
                      >
                        {isSefazResumo ? 'XML (resumo)' : 'XML'}
                      </Button>
                    ) : isNacional ? (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleAbrirPdf(n)}
                          startIcon={<Iconify icon="solar:document-text-bold" />}
                        >
                          PDF
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleBaixarXml(n)}
                          startIcon={<Iconify icon="solar:code-square-bold" />}
                        >
                          XML
                        </Button>
                      </>
                    ) : (
                      <>
                        {!!n.linkNota && n.linkNota !== 'Processando...' && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={n.linkNota}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<Iconify icon="solar:document-text-bold" />}
                          >
                            PDF
                          </Button>
                        )}
                        {!!n.linkXml && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={n.linkXml}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<Iconify icon="solar:code-square-bold" />}
                          >
                            XML
                          </Button>
                        )}
                      </>
                    )}
                    {isSieg && n.siegXmlBase64 && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="solar:code-square-bold" />}
                        onClick={() => {
                          const blob = new Blob([atob(n.siegXmlBase64)], {
                            type: 'application/xml',
                          });
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
                    {dominioHabilitado &&
                      isNotaElegivelDominio(n) &&
                      podeReenviarDominio(n.dominioEnvio) && (
                        <LoadingButton
                          size="small"
                          variant="outlined"
                          color="info"
                          loading={reenviandoDominioId === (n._id || n.id)}
                          startIcon={<Iconify icon="solar:buildings-3-bold" />}
                          onClick={() => handleReenviarDominio(n)}
                        >
                          Reenviar Domínio
                        </LoadingButton>
                      )}
                    {dominioHabilitado && podeReenviarCancelamentoDominio(n) && (
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        color="warning"
                        loading={reenviandoCancelamentoId === (n._id || n.id)}
                        startIcon={<Iconify icon="solar:close-circle-bold" />}
                        onClick={() => handleReenviarCancelamentoDominio(n)}
                      >
                        Reenviar cancelamento
                      </LoadingButton>
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
              {isNotaNfcePr(notaToCancel)
                ? 'A NFC-e será cancelada no SEFAZ-PR (evento 110111). Prazo de 30 minutos após a emissão; o motivo deve ter no mínimo 15 caracteres.'
                : notaToCancel?.origem === 'nacional'
                  ? 'A nota será cancelada diretamente no Emissor Nacional (Sefin) de forma síncrona.'
                  : 'Esta ação cancelará a nota fiscal no sistema. Certifique-se de cancelar também na Prefeitura/eNotas se necessário.'}
            </Alert>

            {notaToCancel && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Nota #{notaToCancel.numeroNota || notaToCancel.siegNumero || '-'}
                </Typography>
                <Typography variant="body2">{notaToCancel.tomador?.nome || '-'}</Typography>
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

            {notaToCancel?.origem !== 'nacional' && !isNotaNfcePr(notaToCancel) && (
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
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
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
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
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
              <Stack spacing={1}>
                <Alert severity={importResultado.success !== false ? 'success' : 'warning'}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">{importResultado.message}</Typography>
                    <Typography variant="body2">
                      Total importadas: {importResultado.totalImportadas ?? 0} · Atualizadas:{' '}
                      {importResultado.totalAtualizadas ?? 0}
                    </Typography>
                  </Stack>
                </Alert>

                {importResultado.resultados?.nacional && (
                  <Alert severity="info">
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Emissor Nacional
                    </Typography>
                    <Typography variant="body2">
                      {importResultado.resultados.nacional.notasImportadas ?? 0} importadas ·{' '}
                      {importResultado.resultados.nacional.notasAtualizadas ?? 0} atualizadas · NSU:{' '}
                      {importResultado.resultados.nacional.ultimoNSU ?? '-'}
                    </Typography>
                  </Alert>
                )}

                {importResultado.resultados?.nfe && (
                  <Alert severity="info">
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      NF-e SEFAZ
                    </Typography>
                    <Typography variant="body2">
                      {importResultado.resultados.nfe.notasImportadas ?? 0} importadas ·{' '}
                      {importResultado.resultados.nfe.resumosImportados ?? 0} resumos · NSU:{' '}
                      {importResultado.resultados.nfe.ultimoNSU ?? '-'}
                    </Typography>
                    {importResultado.resultados.nfe._aviso && (
                      <Typography variant="caption" color="text.secondary">
                        {importResultado.resultados.nfe._aviso}
                      </Typography>
                    )}
                  </Alert>
                )}

                {importResultado.resultados?.sieg && (
                  <Alert severity="info">
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      SIEG
                    </Typography>
                    <Typography variant="body2">
                      {importResultado.resultados.sieg.totalCriados ?? 0} criadas ·{' '}
                      {importResultado.resultados.sieg.totalAtualizados ?? 0} atualizadas ·{' '}
                      {importResultado.resultados.sieg.totalPulados ?? 0} ignoradas
                    </Typography>
                  </Alert>
                )}

                {importResultado.erros && Object.keys(importResultado.erros).length > 0 && (
                  <Alert severity="error">
                    {Object.entries(importResultado.erros).map(([tipo, msg]) => (
                      <Typography key={tipo} variant="body2">
                        <strong>{tipo.toUpperCase()}:</strong> {msg}
                      </Typography>
                    ))}
                  </Alert>
                )}

                {importResultado.ignorados && Object.keys(importResultado.ignorados).length > 0 && (
                  <Alert severity="warning">
                    {Object.entries(importResultado.ignorados).map(([tipo, msg]) => (
                      <Typography key={tipo} variant="body2">
                        <strong>{tipo.toUpperCase()}:</strong> {msg}
                      </Typography>
                    ))}
                  </Alert>
                )}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setImportDialogOpen(false)}
            disabled={importing}
          >
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
