'use client';

import React from 'react';
import { toast } from 'sonner';
import { LazyMotion, m as motion, domAnimation } from 'framer-motion';
import LoadingButton from '@mui/lab/LoadingButton';

import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Button,
  Tooltip,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  CardContent,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { toTitleCase } from 'src/utils/helper';
import { applySortFilter } from 'src/utils/constants/table-utils';

import {
  usePortalOrcamentos,
  usePortalOrcamentosStats,
  portalUpdateOrcamentoStatus,
  portalEmitirBoletoOrcamento,
  portalBaixarPdfBoleto,
  extractPaymentIdFromBoletoResponse,
} from 'src/actions/portal';

import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';
import { useTable } from 'src/components/table';
import { VendasPageSkeleton } from 'src/components/skeleton/PortalVendasPageSkeleton';
import { VendaTableRowSkeleton } from 'src/components/skeleton/VendasTableRowSkeleton';

import { TableHeadCustom } from 'src/sections/clientes/TableHeadCustom';

import { useAuthContext } from 'src/auth/hooks';

function formatarVencimento(row) {
  const raw = row?.dataValidade;
  const ymd = extrairYmdDataValidade(raw);
  if (!ymd) return '-';
  const [y, m, d] = ymd.split('-');
  return `${d}/${m}/${y}`;
}

function getPrimeiroEUltimoDiaDoMesISO(year, monthIndex) {
  const pad = (n) => String(n).padStart(2, '0');
  const dataInicio = `${year}-${pad(monthIndex + 1)}-01`;
  const ultimoDia = new Date(year, monthIndex + 1, 0).getDate();
  const dataFim = `${year}-${pad(monthIndex + 1)}-${pad(ultimoDia)}`;
  return { dataInicio, dataFim };
}

function getMesAtualFiltroInicial() {
  const d = new Date();
  return getPrimeiroEUltimoDiaDoMesISO(d.getFullYear(), d.getMonth());
}

/**
 * Ex.: "3/12" = 3.ª venda de um plano de 12. Não exibe o id do grupo.
 * Aceita `total` ou `quantidade` (tamanho da série) e `indice` 0-based ou 1-based.
 */
function formatarTextoRecorrencia(r) {
  if (!r || typeof r !== 'object') return '-';
  const tRaw = r.total != null ? r.total : r.quantidade;
  const t = tRaw != null ? Number(tRaw) : null;
  const i = r.indice != null ? Number(r.indice) : NaN;
  if (!Number.isFinite(t) || t <= 0) {
    if (r.grupoId) return 'Recorrente';
    return '-';
  }
  if (!Number.isFinite(i)) {
    if (r.grupoId) return 'Recorrente';
    return '-';
  }
  let parcela;
  if (i >= 1 && i <= t) {
    parcela = i;
  } else if (i >= 0 && i < t) {
    parcela = i + 1;
  } else {
    parcela = i;
  }
  return `${parcela}/${t}`;
}

/** Extrai YYYY-MM-DD preservando o dia civil da API (evita deslocamento por fuso em `...Z`). */
function extrairYmdDataValidade(dataValidade) {
  if (dataValidade == null || dataValidade === '') return null;
  if (typeof dataValidade === 'string') {
    const m = dataValidade.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m?.[1]) return m[1];
  }
  const d = new Date(dataValidade);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Garante que o período (Início/Fim) reflete a data de vencimento mostrada na lista. A API pode ignorar o query ou usar outro campo. */
function filtrarPorVencimentoNoPeriodo(orcamentos, dataInicio, dataFim) {
  if (!dataInicio && !dataFim) return Array.isArray(orcamentos) ? orcamentos : [];
  const list = Array.isArray(orcamentos) ? orcamentos : [];
  return list.filter((o) => {
    const ymd = extrairYmdDataValidade(o?.dataValidade);
    if (!ymd) return false;
    if (dataInicio && ymd < dataInicio) return false;
    if (dataFim && ymd > dataFim) return false;
    return true;
  });
}

function ServiceOrderMobileCard({
  serviceOrder,
  getStatusColor,
  podeEmitirBoleto,
  emitindoBoleto,
  baixandoBoleto,
  podeBaixarBoleto,
  onEmitirBoleto,
  onBaixarBoleto,
}) {
  return (
    <Card variant="outlined" sx={{ '&:hover': { boxShadow: (theme) => theme.customShadows.z16 } }}>
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Box sx={{ maxWidth: 'calc(100% - 100px)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              Venda #{serviceOrder.numero}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {serviceOrder?.clienteDoClienteId?.nome}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={toTitleCase(serviceOrder.status)}
            color={getStatusColor(serviceOrder.status)}
            variant="soft"
          />
        </Stack>
        <Stack spacing={1} sx={{ mb: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Vencimento:</strong> {formatarVencimento(serviceOrder)}
          </Typography>
        </Stack>
        {formatarTextoRecorrencia(serviceOrder?.recorrencia) !== '-' && (
          <Box sx={{ mb: 2 }}>
            <Chip
              size="small"
              color="secondary"
              variant="soft"
              label={formatarTextoRecorrencia(serviceOrder?.recorrencia)}
            />
          </Box>
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {serviceOrder?.notaFiscalId?.linkNota && 
           serviceOrder.notaFiscalId.linkNota !== 'Processando...' && (
            <Tooltip title="Ver NFSe (PDF)">
              <IconButton
                href={serviceOrder.notaFiscalId.linkNota}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                color="default"
              >
                <Iconify icon="solar:document-text-bold" />
              </IconButton>
            </Tooltip>
          )}
          {serviceOrder?.notaFiscalId?.linkNota === 'Processando...' && (
            <Tooltip title="Nota em processo de emissão">
              <IconButton size="small" color="warning" disabled>
                <Iconify icon="solar:clock-circle-bold" />
              </IconButton>
            </Tooltip>
          )}
          <Button
            href={`./${serviceOrder._id}`}
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Iconify icon="solar:eye-bold" />}
          >
            Ver Venda
          </Button>
          {podeBaixarBoleto && (
            <LoadingButton
              size="small"
              variant="outlined"
              loading={baixandoBoleto}
              onClick={() => onBaixarBoleto(serviceOrder)}
              startIcon={<Iconify icon="solar:download-minimalistic-bold" />}
            >
              Baixar boleto
            </LoadingButton>
          )}
          {podeEmitirBoleto && (
            <LoadingButton
              size="small"
              variant="outlined"
              loading={emitindoBoleto}
              onClick={() => onEmitirBoleto(serviceOrder._id)}
              startIcon={<Iconify icon="solar:bill-list-bold" />}
            >
              Emitir boleto
            </LoadingButton>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function hasBoletoDisponivelParaDownload(venda) {
  const temBoletoValido = Boolean(venda?.possuiBoletoValido);
  const paymentId = venda?.boletoAtual?.paymentId;
  const statusBoleto = String(venda?.boletoAtual?.status || '').toLowerCase();
  const statusInvalido = ['cancelled', 'canceled', 'cancelado', 'failed', 'falhou'].includes(statusBoleto);
  return Boolean(paymentId) && (temBoletoValido || !statusInvalido);
}

function StatCard({ title, value }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h6" noWrap>
            {value}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

// =======================================================================
// COMPONENTE PRINCIPAL DA PÁGINA
// =======================================================================

export default function PortalOrcamentosPage() {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeCriarOrcamentos, limiteOrcamentos, interProntoParaBoleto } = useSettings();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [filters, setFilters] = React.useState(() => {
    const { dataInicio, dataFim } = getMesAtualFiltroInicial();
    return { status: '', dataInicio, dataFim };
  });
  const [appliedFilters, setAppliedFilters] = React.useState(() => {
    const { dataInicio, dataFim } = getMesAtualFiltroInicial();
    return { status: '', dataInicio, dataFim };
  });

  const deslocarMesFiltro = React.useCallback((delta) => {
    setFilters((f) => {
      const ref = f.dataInicio
        ? (() => {
            const p = f.dataInicio.split('-');
            const yy = Number(p[0]);
            const mm = Number(p[1]);
            if (!Number.isFinite(yy) || !Number.isFinite(mm)) {
              const d = new Date();
              return new Date(d.getFullYear(), d.getMonth() + delta, 1);
            }
            return new Date(yy, mm - 1 + delta, 1);
          })()
        : (() => {
            const d = new Date();
            return new Date(d.getFullYear(), d.getMonth() + delta, 1);
          })();
      const { dataInicio, dataFim } = getPrimeiroEUltimoDiaDoMesISO(
        ref.getFullYear(),
        ref.getMonth()
      );
      return { ...f, dataInicio, dataFim };
    });
  }, []);

  React.useEffect(() => {
    const changed =
      filters.status !== appliedFilters.status ||
      filters.dataInicio !== appliedFilters.dataInicio ||
      filters.dataFim !== appliedFilters.dataFim;
    if (!changed) return;
    setAppliedFilters(filters);
  }, [filters, appliedFilters]);

  const { data: orcamentos, isLoading, mutate: mutateOrcamentos } = usePortalOrcamentos(
    clienteProprietarioId,
    appliedFilters
  );
  const { data: stats } = usePortalOrcamentosStats(clienteProprietarioId);

  const table = useTable({ defaultOrderBy: 'dataValidade', defaultOrder: 'desc', defaultRowsPerPage: 25 });

  const [statusEdits, setStatusEdits] = React.useState({});
  const [savingMap, setSavingMap] = React.useState({});
  const [emitindoBoletoMap, setEmitindoBoletoMap] = React.useState({});
  const [baixandoBoletoMap, setBaixandoBoletoMap] = React.useState({});
  const pollingIntervalsRef = React.useRef({});
  const podeEmitirBoletoVenda = Boolean(interProntoParaBoleto);

  const getHttpErrorMessage = React.useCallback((error, fallback) => {
    const statusCode = error?.status || error?.response?.status;
    const apiMessage = error?.message || error?.response?.data?.message;
    if (apiMessage) return apiMessage;
    if (statusCode === 400) return 'Dados inválidos para esta operação.';
    if (statusCode === 401) return 'Sessão expirada. Faça login novamente.';
    if (statusCode === 403) return 'Você não tem permissão para esta ação.';
    if (statusCode === 404) return 'Recurso não encontrado.';
    if (statusCode >= 500) return 'Falha interna ao processar a solicitação.';
    return fallback;
  }, []);

  const orcamentosNoPeriodoVencimento = React.useMemo(
    () => filtrarPorVencimentoNoPeriodo(orcamentos, appliedFilters.dataInicio, appliedFilters.dataFim),
    [orcamentos, appliedFilters.dataInicio, appliedFilters.dataFim]
  );

  const dataFiltered = applySortFilter({
    inputData: orcamentosNoPeriodoVencimento,
    order: table.order,
    orderBy: table.orderBy,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pago':
        return 'success';
      case 'aprovado':
        return 'info';
      case 'recusado':
        return 'error';
      case 'pendente':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleStatusUpdate = async (id) => {
    const newStatus = statusEdits[id];
    if (!newStatus) return;
    try {
      setSavingMap((m) => ({ ...m, [id]: true }));
      await portalUpdateOrcamentoStatus(id, { status: newStatus, clienteProprietarioId });
      toast.success('Status atualizado');
    } catch (e) {
      toast.error(getHttpErrorMessage(e, 'Erro ao atualizar status'));
    } finally {
      setSavingMap((m) => ({ ...m, [id]: false }));
    }
  };

  const handleEmitirBoletoVenda = async (orcamentoId) => {
    if (!podeEmitirBoletoVenda) return;
    try {
      setEmitindoBoletoMap((prev) => ({ ...prev, [orcamentoId]: true }));
      const { status: httpStatus, data: body } = await portalEmitirBoletoOrcamento(
        clienteProprietarioId,
        orcamentoId
      );
      const msg = body?.message;
      if (httpStatus === 200) {
        toast.info(msg || 'Esta venda já possui boleto emitido.');
      } else if (httpStatus === 201) {
        const low = (msg || '').toLowerCase();
        if (low.includes('reemit')) {
          toast.success(msg || 'Boleto reemitido com sucesso.');
        } else {
          toast.success(msg || 'Boleto da venda emitido com sucesso.');
        }
        const pay = body?.data != null && typeof body.data === 'object' ? body.data : body;
        const temLinhaOuPix = Boolean(
          (pay?.linhaDigitavel && String(pay.linhaDigitavel).trim()) ||
            (pay?.pixCopiaECola && String(pay.pixCopiaECola).trim())
        );
        const paymentId = extractPaymentIdFromBoletoResponse(body);
        if (paymentId && !temLinhaOuPix) {
          toast.info('Linha/PIX podem demorar alguns segundos. Abra a venda para acompanhar.', {
            duration: 4500,
          });
        }
      } else {
        toast.success(msg || 'Boleto processado.');
      }
      await mutateOrcamentos();
    } catch (error) {
      toast.error(getHttpErrorMessage(error, 'Erro ao emitir boleto da venda.'));
    } finally {
      setEmitindoBoletoMap((prev) => ({ ...prev, [orcamentoId]: false }));
    }
  };

  const decodeBase64ToPdfBlob = React.useCallback((base64) => {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: 'application/pdf' });
  }, []);

  const handleBaixarBoletoVenda = async (orcamento) => {
    const paymentId = orcamento?.boletoAtual?.paymentId;
    if (!paymentId) {
      toast.error('Boleto não disponível para esta venda.');
      return;
    }
    try {
      setBaixandoBoletoMap((prev) => ({ ...prev, [orcamento._id]: true }));
      const response = await portalBaixarPdfBoleto(clienteProprietarioId, paymentId);

      let pdfBlob = null;
      if (response?.data instanceof Blob) {
        if ((response.data.type || '').includes('application/pdf')) {
          pdfBlob = response.data;
        } else {
          const txt = await response.data.text();
          try {
            const parsed = JSON.parse(txt);
            const b64 = parsed?.data?.pdf || parsed?.pdf;
            if (b64) pdfBlob = decodeBase64ToPdfBlob(b64);
          } catch (e) {
            // erro tratado abaixo
          }
        }
      } else {
        const b64 = response?.data?.data?.pdf || response?.data?.pdf;
        if (b64) pdfBlob = decodeBase64ToPdfBlob(b64);
      }

      if (!pdfBlob) {
        toast.error('Resposta de PDF inválida.');
        return;
      }

      const blobUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `boleto-${paymentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error(getHttpErrorMessage(error, 'Erro ao baixar boleto.'));
    } finally {
      setBaixandoBoletoMap((prev) => ({ ...prev, [orcamento._id]: false }));
    }
  };

  const isNotaProcessandoFn = React.useCallback((orcamento) => {
    if (!orcamento?.notaFiscalId) return false;
    const nota = orcamento.notaFiscalId;
    if (typeof nota !== 'object') return false;
    const status = String(nota?.status || '').toLowerCase();
    return status === 'emitindo' || status === 'processando' || nota?.linkNota === 'Processando...';
  }, []);

  // Limpa polling no unmount
  React.useEffect(
    () => () => {
      Object.values(pollingIntervalsRef.current).forEach((intervalId) => clearInterval(intervalId));
      pollingIntervalsRef.current = {};
    },
    []
  );

  // Polling apenas para vendas com nota em processamento
  React.useEffect(() => {
    const lista = Array.isArray(orcamentos) ? orcamentos : [];
    const idsAtuais = lista.map((o) => o?._id).filter(Boolean);

    Object.keys(pollingIntervalsRef.current).forEach((orcamentoId) => {
      if (!idsAtuais.includes(orcamentoId)) {
        clearInterval(pollingIntervalsRef.current[orcamentoId]);
        delete pollingIntervalsRef.current[orcamentoId];
      }
    });

    const idsProcessando = new Set(lista.filter(isNotaProcessandoFn).map((o) => o._id).filter(Boolean));
    const idsComPolling = new Set(Object.keys(pollingIntervalsRef.current));

    idsProcessando.forEach((orcamentoId) => {
      if (idsComPolling.has(orcamentoId)) return;
      pollingIntervalsRef.current[orcamentoId] = setInterval(() => {
        mutateOrcamentos();
      }, 3000);
    });

    idsComPolling.forEach((orcamentoId) => {
      if (!idsProcessando.has(orcamentoId)) {
        clearInterval(pollingIntervalsRef.current[orcamentoId]);
        delete pollingIntervalsRef.current[orcamentoId];
      }
    });
  }, [orcamentos, isNotaProcessandoFn, mutateOrcamentos]);

  const TABLE_HEAD = [
    { id: 'numero', label: 'Número', width: 200, align: 'left' },
    { id: 'cliente', label: 'Cliente' },
    { id: 'status', label: 'Status', width: 250, align: 'center' },
    { id: 'recorrencia', label: 'Recorrência', width: 220, align: 'center' },
    { id: 'valor', label: 'Valor', width: 200, align: 'center' },
    { id: 'dataValidade', label: 'Vencimento', width: 200, align: 'center' },
    { id: 'acoes', label: 'Ações', width: 200, align: 'right' },
  ];

  if (loadingEmpresas || !clienteProprietarioId) return <VendasPageSkeleton />;

  if (!podeCriarOrcamentos)
    return (
      <Box>
        <Typography variant="h6">Funcionalidade não disponível</Typography>
        <Typography variant="body2" color="text.secondary">
          Peça ao administrador para ativar &quot;Vendas/Orçamentos&quot; nas configurações.
        </Typography>
      </Box>
    );

  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <Box
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, // Empilha na vertical no mobile (xs)
              alignItems: { sm: 'center' }, // Centraliza verticalmente no desktop (sm)
              justifyContent: 'space-between',
              gap: 2,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Minhas Vendas
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                Visualize, gerencie e cadastre suas vendas.
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
            >
              {limiteOrcamentos && (
                <Chip
                  label={`${dataFiltered.length} / ${limiteOrcamentos}`}
                  size="small"
                  sx={{ bgcolor: 'black', color: 'common.white' }}
                />
              )}
              <Button
                href="./novo"
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
              >
                Novo Orçamento
              </Button>
            </Stack>
          </Box>

          {stats && (
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatCard title="Pendentes" value={stats.totalPendentes} />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatCard title="Aprovados" value={stats.totalAprovados} />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatCard title="Pagos" value={stats.totalPagos} />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatCard
                    title="Valor Total"
                    value={new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(stats.valorTotal || 0)}
                  />
                </Grid>
                <Grid xs={12} sm={12} md={2.4}>
                  <StatCard title="Taxa Conversão" value={`${stats.taxaConversao}%`} />
                </Grid>
              </Grid>
            </Box>
          )}

          <Box sx={{ p: 2.5, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={filters.status}
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="aprovado">Aprovado</MenuItem>
                  <MenuItem value="pago">Pago</MenuItem>
                  <MenuItem value="recusado">Recusado</MenuItem>
                  <MenuItem value="expirado">Expirado</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Início"
                  value={filters.dataInicio}
                  onChange={(e) => setFilters((f) => ({ ...f, dataInicio: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fim"
                  value={filters.dataFim}
                  onChange={(e) => setFilters((f) => ({ ...f, dataFim: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid xs={12}>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
                    onClick={() => deslocarMesFiltro(-1)}
                  >
                    Mês anterior
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
                    onClick={() => deslocarMesFiltro(1)}
                  >
                    Próximo mês
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {isMobile ? (
              <Stack spacing={2}>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((order, index) => {
                    const podeBaixarBoleto = hasBoletoDisponivelParaDownload(order);
                    return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <ServiceOrderMobileCard
                        serviceOrder={order}
                        getStatusColor={getStatusColor}
                        podeEmitirBoleto={
                          podeEmitirBoletoVenda &&
                          !podeBaixarBoleto
                        }
                        emitindoBoleto={Boolean(emitindoBoletoMap[order._id])}
                        baixandoBoleto={Boolean(baixandoBoletoMap[order._id])}
                        podeBaixarBoleto={podeBaixarBoleto}
                        onEmitirBoleto={handleEmitirBoletoVenda}
                        onBaixarBoleto={handleBaixarBoletoVenda}
                      />
                    </motion.div>
                  );
                  })}
              </Stack>
            ) : (
              <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                <Table size={table.dense ? 'small' : 'medium'}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    onSort={table.onSort}
                  />
                  <TableBody>
                    {isLoading
                      ? [...Array(5)].map((_, i) => <VendaTableRowSkeleton key={i} />)
                      : dataFiltered
                          .slice(
                            table.page * table.rowsPerPage,
                            table.page * table.rowsPerPage + table.rowsPerPage
                          )
                          .map((o) => (
                            <TableRow key={o._id} hover>
                              <TableCell align="left" >
                                <Button
                                  href={`./${o._id}`}
                                  variant="text"
                                  sx={{
                                    px: 0,
                                    pl: 1,
                                    minWidth: 0,
                                    fontWeight: 600,
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {o.numero}
                                </Button>
                              </TableCell>
                              
                              <TableCell align="left">
                                <Typography variant="body2" noWrap sx={{ width: 200 }}>
                                  {o?.clienteDoClienteId?.nome || '-'}
                                </Typography>
                              </TableCell>
                              
                              <TableCell align="center" sx={{ width: 250 }}>
                                <Chip
                                  size="small"
                                  label={toTitleCase(o?.status)}
                                  color={getStatusColor(o.status)}
                                />
                              </TableCell>
                              <TableCell align="center" sx={{ width: 220 }}>
                                <Typography variant="body2">
                                  {formatarTextoRecorrencia(o?.recorrencia)}
                                </Typography>
                              </TableCell>

                              <TableCell align='center' sx={{ width: 200 }}>
                                <Typography variant="body2">
                                  {o?.valorTotal ? formatToCurrency(o?.valorTotal) : '-'}
                                </Typography>
                              </TableCell>

                              <TableCell align="center" sx={{ width: 200 }}>
                                <Typography variant="body2">{formatarVencimento(o)}</Typography>
                              </TableCell>
                              
                              <TableCell align="center" sx={{ width: 200 }}>
                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                  <Tooltip title="Ver venda">
                                    <IconButton href={`./${o._id}`} size="small" color="primary">
                                      <Iconify icon="solar:eye-bold" />
                                    </IconButton>
                                  </Tooltip>
                                  {o?.notaFiscalId?.linkNota && 
                                   o.notaFiscalId.linkNota !== 'Processando...' && (
                                    <Tooltip title="Ver NFSe (PDF)">
                                      <IconButton
                                        href={o.notaFiscalId.linkNota}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="small"
                                        color="default"
                                      >
                                        <Iconify icon="solar:document-text-bold" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  {o?.notaFiscalId?.linkNota === 'Processando...' && (
                                    <Tooltip title="Nota em processo de emissão">
                                      <IconButton size="small" color="warning" disabled>
                                        <Iconify icon="solar:clock-circle-bold" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  {podeEmitirBoletoVenda && (
                                    <Tooltip title="Baixar boleto">
                                      <span>
                                        <LoadingButton
                                          size="small"
                                          variant="text"
                                          loading={Boolean(baixandoBoletoMap[o._id])}
                                          onClick={() => handleBaixarBoletoVenda(o)}
                                          disabled={!hasBoletoDisponivelParaDownload(o)}
                                          sx={{ minWidth: 'auto', px: 0.5 }}
                                        >
                                          <Iconify icon="solar:download-minimalistic-bold" />
                                        </LoadingButton>
                                      </span>
                                    </Tooltip>
                                  )}
                                  {podeEmitirBoletoVenda &&
                                    !hasBoletoDisponivelParaDownload(o) && (
                                    <Tooltip title="Emitir boleto da venda">
                                      <span>
                                        <LoadingButton
                                          size="small"
                                          variant="text"
                                          loading={Boolean(emitindoBoletoMap[o._id])}
                                          onClick={() => handleEmitirBoletoVenda(o._id)}
                                          sx={{ minWidth: 'auto', px: 0.5 }}
                                        >
                                          <Iconify icon="solar:bill-list-bold" />
                                        </LoadingButton>
                                      </span>
                                    </Tooltip>
                                  )}
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            page={table.page}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </motion.div>
    </LazyMotion>
  );
}
