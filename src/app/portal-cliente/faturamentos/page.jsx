'use client';

import dayjs from 'dayjs';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Stack,
  Alert,
  Button,
  Select,
  Tooltip,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  InputLabel,
  Pagination,
  CardContent,
  FormControl,
  FormHelperText,
  CircularProgress,
} from '@mui/material';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useDebounce } from 'src/hooks/use-debounce';

import { toTitleCase } from 'src/utils/helper';
import { formatCpfCnpj, removeFormatting } from 'src/utils/format-input';

import { listarNotasFiscaisPorCliente } from 'src/actions/notafiscal';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';

import { useAuthContext } from 'src/auth/hooks';

const PAGE_SIZE = 50;

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

export default function PortalFaturamentoPage() {
  const theme = useTheme();
  const { user } = useAuthContext();

  const userId = user?.id || user?._id || user?.userId;

  const { empresaAtiva } = useEmpresa(userId);

  const clienteId = empresaAtiva;

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [notas, setNotas] = useState([]);

  const [startDate, setStartDate] = useState(() => dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(() => dayjs().format('YYYY-MM-DD'));

  const [filtroNumeroNota, setFiltroNumeroNota] = useState('');
  const numeroNotaDebounce = useDebounce(filtroNumeroNota, 500);

  const [filtroCpfCnpj, setFiltroCpfCnpj] = useState('');
  const [cpfCnpjAplicado, setCpfCnpjAplicado] = useState('');
  const [cpfCnpjErro, setCpfCnpjErro] = useState('');

  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: PAGE_SIZE,
  });
  const [somaTotal, setSomaTotal] = useState(0);

  const pollingIntervalsRef = useRef({});

  const { totalValorNotas, totalNotas } = useMemo(() => {
    const arr = Array.isArray(notas) ? notas : [];
    const total = arr.reduce((acc, n) => acc + Number(n?.valorServicos || n?.valor || 0), 0);
    return { totalValorNotas: total, totalNotas: arr.length };
  }, [notas]);

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

  // Função auxiliar para verificar se uma nota fiscal está em processamento
  const isNotaProcessando = useCallback((nota) => {
    if (!nota) return false;
    const statusNota = String(nota.status || '').toLowerCase();
    const eNotasStatus = String(nota.eNotasStatus || '').toLowerCase();
    return (
      statusNota === 'emitindo' ||
      statusNota === 'processando' ||
      eNotasStatus === 'emitindo' ||
      eNotasStatus === 'processando' ||
      nota.linkNota === 'Processando...' ||
      String(nota.numeroNota).toLowerCase() === 'processando...'
    );
  }, []);

  const fetchNotas = useCallback(async () => {
    if (!clienteId) return [];

    try {
      const numeroNota = numeroNotaDebounce || undefined;
      const cpfCnpj =
        !numeroNota && (cpfCnpjAplicado.length === 11 || cpfCnpjAplicado.length === 14)
          ? cpfCnpjAplicado
          : undefined;

      // Com busca por número da nota, sempre página 1 na API (evita página obsoleta antes do setState)
      const pageParam = numeroNota ? 1 : page;

      const res = await listarNotasFiscaisPorCliente({
        clienteId,
        page: pageParam,
        limit: PAGE_SIZE,
        numeroNota,
        cpfCnpj,
        status: status || undefined,
        inicio: startDate || undefined,
        fim: endDate || undefined,
      });

      const { data } = res;
      const notasList = data?.notasFiscais || [];
      setNotas(notasList);
      if (data?.pagination) {
        setPaginationMeta(data.pagination);
      }
      setSomaTotal(data?.somaTotal || 0);
      return notasList;
    } catch (e) {
      setNotas([]);
      setSomaTotal(0);
      return [];
    }
  }, [
    clienteId,
    page,
    status,
    startDate,
    endDate,
    numeroNotaDebounce,
    cpfCnpjAplicado,
  ]);

  useEffect(() => {
    setPage(1);
  }, [clienteId]);

  useEffect(() => {
    if (numeroNotaDebounce) setPage(1);
  }, [numeroNotaDebounce]);

  // Fetch inicial com loading
  useEffect(() => {
    const loadNotas = async () => {
      setLoading(true);
      await fetchNotas();
      setLoading(false);
    };
    loadNotas();
  }, [fetchNotas]);

  // Limpar polling quando componente desmontar
  useEffect(
    () => () => {
      Object.values(pollingIntervalsRef.current).forEach((interval) => {
        clearInterval(interval);
      });
      pollingIntervalsRef.current = {};
    },
    []
  );

  // Verificar notas em processamento e iniciar polling
  useEffect(() => {
    if (!Array.isArray(notas) || notas.length === 0) {
      return () => {
        // Cleanup vazio
      };
    }

    const notasProcessando = notas.filter(isNotaProcessando);
    const idsProcessando = new Set(notasProcessando.map((n) => n._id || n.id).filter(Boolean));
    const idsComPolling = new Set(Object.keys(pollingIntervalsRef.current));

    // Iniciar polling para notas que estão processando mas não têm polling
    notasProcessando.forEach((nota) => {
      const notaId = nota._id || nota.id;
      if (!notaId || idsComPolling.has(notaId)) return;

      // Iniciar polling a cada 3 segundos
      pollingIntervalsRef.current[notaId] = setInterval(async () => {
        try {
          const notasAtualizadas = await fetchNotas();
          const notaAtualizada = notasAtualizadas?.find((n) => (n._id || n.id) === notaId);

          if (notaAtualizada && !isNotaProcessando(notaAtualizada)) {
            // Nota foi processada, parar polling
            if (pollingIntervalsRef.current[notaId]) {
              clearInterval(pollingIntervalsRef.current[notaId]);
              delete pollingIntervalsRef.current[notaId];
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status da nota fiscal:', error);
        }
      }, 3000);
    });

    // Parar polling para notas que não estão mais processando
    idsComPolling.forEach((notaId) => {
      if (!idsProcessando.has(notaId)) {
        if (pollingIntervalsRef.current[notaId]) {
          clearInterval(pollingIntervalsRef.current[notaId]);
          delete pollingIntervalsRef.current[notaId];
        }
      }
    });

    // Cleanup: sempre retornar uma função
    return () => {
      // A limpeza completa é feita no outro useEffect de unmount
    };
  }, [notas, clienteId, fetchNotas, isNotaProcessando]);

  const handlePrevMonth = () => {
    const newStart = dayjs(startDate).subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
    const newEnd = dayjs(startDate).subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
    setStartDate(newStart);
    setEndDate(newEnd);
    setPage(1);
  };

  const handleNextMonth = () => {
    const newStart = dayjs(startDate).add(1, 'month').startOf('month').format('YYYY-MM-DD');
    const newEnd = dayjs(startDate).add(1, 'month').endOf('month').format('YYYY-MM-DD');
    setStartDate(newStart);
    setEndDate(newEnd);
    setPage(1);
  };


  return (
    <Card sx={{ borderRadius: 3 }}>
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Minhas Notas Fiscais
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Visualize e baixe o PDF ou XML de todas suas notas fiscais.
        </Typography>
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status da Nota</InputLabel>
              <Select
                label="Status da Nota"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
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
          <Grid xs={12} md={3}>
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
          <Grid xs={12} sm={6} md={3}>
            <TextField
              label="De"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              InputLabelProps={{ shrink: true }}
              disabled={!!filtroNumeroNota}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <TextField
              label="Até"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              InputLabelProps={{ shrink: true }}
              disabled={!!filtroNumeroNota}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Stack spacing={0}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'stretch', sm: 'flex-end' }}
              >
                <TextField
                  label="CPF ou CNPJ do Cliente"
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
                  inputProps={{ 'aria-describedby': 'portal-faturamento-cpf-cnpj-helper' }}
                  InputProps={{
                    endAdornment: <Iconify icon="solar:user-id-bold" sx={{ color: 'text.disabled' }} />,
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
                id="portal-faturamento-cpf-cnpj-helper"
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
        </Grid>

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
            {paginationMeta.pages > 1 && (
              <Pagination
                count={paginationMeta.pages}
                page={page}
                onChange={(_, value) => {
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
              {paginationMeta.total} nota(s) no total com os filtros atuais
              {paginationMeta.pages > 1
                ? ` · Página ${paginationMeta.page} de ${paginationMeta.pages} (${PAGE_SIZE} por página)`
                : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Soma dos valores nesta página: {formatToCurrency(totalValorNotas)} • Total geral: {formatToCurrency(somaTotal)}
            </Typography>
          </Stack>
        </Stack>

        <Box sx={{ position: 'relative' }} aria-busy={loading && !!clienteId} aria-live="polite">
          <Stack spacing={1.5}>
            {loading && clienteId
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
                const servicoDesc = Array.isArray(n.servicos) && n.servicos.length ? n.servicos[0]?.descricao : (n.descricao || n.discriminacao);
                const isSieg = n.origem === 'sieg';
                const isEnotas = n.origem === 'enotas' || !n.origem;
                const tomadorNome = n.tomador?.razaoSocial || n.tomador?.nome;
                const tomadorDocFmt = n.tomador?.cpfCnpj
                  ? formatCpfCnpj(removeFormatting(n.tomador.cpfCnpj))
                  : '';

                return (
                  <Card key={n._id || n.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle2">
                          Nota #{isSieg ? (n.siegNumero || n.numeroNota || '-') : (n.numeroNota || n.numero || '-')}
                        </Typography>
                        {n.serie && (
                          <Label variant="soft" color="default">Série {n.serie}</Label>
                        )}
                        {isNotaProcessando(n) ? (
                          <Tooltip title="Nota fiscal em processamento...">
                            <Label
                              color="warning"
                              variant="soft"
                              startIcon={<CircularProgress size={12} />}
                            >
                              {toTitleCase(statusLabel)}
                            </Label>
                          </Tooltip>
                        ) : (
                          <Label color={color} variant="soft">{toTitleCase(statusLabel)}</Label>
                        )}
                        {isEnotas && (
                          <Label
                            color={isNotaProcessando(n) ? 'warning' : colorEnotas}
                            variant="soft"
                          >
                            Status: {eNotasLabel}
                          </Label>
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {dataEmissao
                          ? (() => {
                            // Extrair apenas a parte da data da string ISO para evitar problemas de timezone
                            if (typeof dataEmissao === 'string' && dataEmissao.includes('T')) {
                              const datePart = dataEmissao.split('T')[0];
                              const timePart = dataEmissao.split('T')[1]?.split('.')[0] || '';
                              const [ano, mes, dia] = datePart.split('-');
                              const [hora, minuto] = timePart.split(':');
                              return `${dia}/${mes}/${ano} ${hora || '00'}:${minuto || '00'}`;
                            }
                            return dayjs(dataEmissao).format('DD/MM/YYYY HH:mm');
                          })()
                          : '-'}
                      </Typography>
                    </Stack>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1.5 }}>
                      <Box flex={1} sx={notaInnerBoxSx}>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Iconify icon="solar:user-bold" width={18} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                            <Typography
                              variant="overline"
                              sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8, lineHeight: 1.2 }}
                            >
                              Tomador
                            </Typography>
                          </Stack>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
                            {tomadorNome || '-'}
                          </Typography>
                          {!!tomadorDocFmt && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                letterSpacing: 0.4,
                              }}
                            >
                              {tomadorDocFmt}
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      <Box flex={2} sx={notaInnerBoxSx}>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Iconify icon="solar:document-text-bold" width={18} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                            <Typography
                              variant="overline"
                              sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8, lineHeight: 1.2 }}
                            >
                              Serviço
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
                            {formatToCurrency(valor)}
                          </Typography>
                          {!!n.valorIss && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              ISS {formatToCurrency(n.valorIss)}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Stack>

                    {(n.eNotasErro || n.motivoCancelamento) && (
                      <Alert severity={se === 'cancelada' || s === 'cancelada' ? 'warning' : 'error'} sx={{ mt: 1.5 }}>
                        {n.motivoCancelamento ? `Motivo do Cancelamento: ${n.motivoCancelamento}` : `Observação: ${n.eNotasErro}`}
                      </Alert>
                    )}

                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap">
                      {isNotaProcessando(n) ? (
                        <Tooltip title="Nota fiscal em processamento, aguarde...">
                          <Button
                            size="small"
                            variant="outlined"
                            disabled
                            startIcon={<CircularProgress size={14} />}
                          >
                            Processando...
                          </Button>
                        </Tooltip>
                      ) : (
                        <>
                          {!!n.linkNota && n.linkNota !== 'Processando...' && (
                            <Button size="small" variant="contained" href={n.linkNota} target="_blank" rel="noopener noreferrer" startIcon={<Iconify icon="solar:document-text-bold" />}>Baixar PDF</Button>
                          )}
                          {!!n.linkXml && (
                            <Button size="small" variant="outlined" href={n.linkXml} target="_blank" rel="noopener noreferrer" startIcon={<Iconify icon="solar:code-square-bold" />}>Baixar XML</Button>
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
                          Baixar XML
                        </Button>
                      )}
                    </Stack>
                  </Card>
                );
              })}
          </Stack>
        </Box>

        {paginationMeta.pages > 1 && (
          <Stack alignItems="center" sx={{ mt: 3 }}>
            <Pagination
              count={paginationMeta.pages}
              page={page}
              onChange={(_, value) => {
                setPage(value);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              color="primary"
              showFirstButton
              showLastButton
              disabled={loading}
            />
          </Stack>
        )}

      </CardContent>
    </Card>
  );
}