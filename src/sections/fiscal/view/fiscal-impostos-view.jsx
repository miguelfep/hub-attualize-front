'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import ToggleButton from '@mui/material/ToggleButton';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';

import { formatClienteCodigoRazao } from 'src/utils/formatter';

import { getClientes } from 'src/actions/clientes';
import { DashboardContent } from 'src/layouts/dashboard';
import { consultarDeclaracoes, consultarDeclaracoesFromLog } from 'src/actions/serPro';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { FiscalOperacaoRow } from 'src/sections/fiscal/components/fiscal-operacao-row';
import { GuiaFiscalEmitirDasDialog } from 'src/sections/guias-fiscais/components/guia-fiscal-emitir-das-dialog';
import {
  groupOperacoesByPeriodo,
  parseSerproDeclaracoesPayload,
} from 'src/sections/fiscal/utils/serpro-declaracoes';
import {
  FiscalSyncGuiasDialog,
  formatSyncGuiasResumo,
} from 'src/sections/fiscal/components/fiscal-sync-guias-dialog';
import {
  formatCompetencia,
  MESES_COMPETENCIA_OPTIONS,
  buildPeriodoApuracaoSerpro,
  mesAnoToCompetenciaDisplay,
} from 'src/sections/guias-fiscais/utils';

// ----------------------------------------------------------------------

function apiErrMsg(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.response?.data?.message || err.message || 'Erro na operação';
}

// ----------------------------------------------------------------------

export function FiscalImpostosView() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteParam = searchParams.get('cliente') || '';

  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [modoConsulta, setModoConsulta] = useState('ano');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [consultando, setConsultando] = useState(false);
  const [declaracoes, setDeclaracoes] = useState(null);
  const [consultError, setConsultError] = useState('');
  const [cacheInfo, setCacheInfo] = useState(null);
  const [carregandoCache, setCarregandoCache] = useState(false);
  const [emitDasOpen, setEmitDasOpen] = useState(false);
  const [emitDasPreset, setEmitDasPreset] = useState({ mes: '', ano: '' });
  const [syncGuiasOpen, setSyncGuiasOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingClientes(true);
        const data = await getClientes({ status: true, tipoContato: 'cliente' });
        if (!cancelled) setClientes(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setClientes([]);
      } finally {
        if (!cancelled) setLoadingClientes(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCliente = useMemo(
    () => clientes.find((c) => c._id === clienteParam) ?? null,
    [clientes, clienteParam]
  );

  // Cache: ao selecionar cliente + ano (4 dígitos), carrega do último log CONSDECLARACAO13
  // sem nova chamada à Serpro. Trocas de mês/modo não disparam reload — a filtragem
  // client-side abaixo cuida da consistência visual.
  useEffect(() => {
    let cancelled = false;

    if (!clienteParam) {
      setDeclaracoes(null);
      setCacheInfo(null);
      return () => { };
    }
    const anoDigits = String(ano).replace(/\D/g, '');
    if (anoDigits.length !== 4) {
      setDeclaracoes(null);
      setCacheInfo(null);
      return () => { };
    }

    setCarregandoCache(true);
    (async () => {
      try {
        const res = await consultarDeclaracoesFromLog(clienteParam, { anoCalendario: anoDigits });
        if (cancelled) return;
        setDeclaracoes(res.data);
        setCacheInfo({ consultadoEm: res.data?.consultadoEm || null });
        setConsultError('');
      } catch (err) {
        if (cancelled) return;
        // 404 = sem log salvo para o ano; mantém aviso existente.
        setDeclaracoes(null);
        setCacheInfo(null);
      } finally {
        if (!cancelled) setCarregandoCache(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clienteParam, ano]);

  const competencia = useMemo(() => mesAnoToCompetenciaDisplay(mes, ano), [mes, ano]);
  const periodoApuracao = useMemo(() => buildPeriodoApuracaoSerpro(mes, ano), [mes, ano]);

  const operacoesRows = useMemo(() => {
    if (!declaracoes) return [];
    return parseSerproDeclaracoesPayload(declaracoes, declaracoes?.ultimaEmissaoPorCompetencia);
  }, [declaracoes]);

  // O cache do log devolve o ano inteiro; quando o modo selecionado é mês específico
  // (competência OU ano+mês), filtramos client-side para exibir só o período correto.
  const operacoesRowsFiltradas = useMemo(() => {
    if (!operacoesRows.length) return operacoesRows;
    const pa = modoConsulta === 'competencia' ? periodoApuracao : modoConsulta === 'ano' && mes ? buildPeriodoApuracaoSerpro(mes, ano) : '';
    if (!pa) return operacoesRows;
    return operacoesRows.filter((r) => r.periodoApuracao === pa);
  }, [operacoesRows, modoConsulta, periodoApuracao, mes, ano]);

  const gruposPeriodo = useMemo(() => groupOperacoesByPeriodo(operacoesRowsFiltradas), [operacoesRowsFiltradas]);

  const resumoConsulta = useMemo(() => {
    if (!operacoesRowsFiltradas.length) return null;

    const comDas = operacoesRowsFiltradas.filter((r) => r.isDas).length;
    const pagos = operacoesRowsFiltradas.filter((r) => r.dasPago === true).length;
    const abertos = operacoesRowsFiltradas.filter((r) => r.dasPago === false).length;
    return { total: operacoesRowsFiltradas.length, comDas, pagos, abertos, periodos: gruposPeriodo.length };
  }, [operacoesRowsFiltradas, gruposPeriodo.length]);

  const handleClienteChange = useCallback(
    (_, value) => {
      const id = value?._id || '';
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set('cliente', id);
      else params.delete('cliente');
      const qs = params.toString();
      router.replace(qs ? `${paths.dashboard.fiscal.impostos}?${qs}` : paths.dashboard.fiscal.impostos);
      setDeclaracoes(null);
      setConsultError('');
      setCacheInfo(null);
    },
    [router, searchParams]
  );

  const handleModoConsultaChange = (_, value) => {
    if (!value) return;
    setModoConsulta(value);
    if (value === 'ano') {
      setMes('');
    } else if (!mes) {
      setMes(String(new Date().getMonth() + 1).padStart(2, '0'));
    }
    setDeclaracoes(null);
    setConsultError('');
  };

  const openEmitDas = useCallback((preset = {}) => {
    setEmitDasPreset({
      mes: preset.mes || mes,
      ano: preset.ano || ano,
    });
    setEmitDasOpen(true);
  }, [mes, ano]);

  const handleConsultar = async () => {
    setConsultError('');
    setDeclaracoes(null);

    if (!clienteParam) {
      setConsultError('Selecione um cliente.');
      return;
    }

    const anoDigits = String(ano).replace(/\D/g, '');
    if (anoDigits.length !== 4) {
      setConsultError('Informe um ano válido com 4 dígitos.');
      return;
    }

    if (modoConsulta === 'competencia' && !periodoApuracao) {
      setConsultError('Informe mês e ano válidos.');
      return;
    }

    setConsultando(true);
    try {
      let params;
      if (modoConsulta === 'competencia') {
        params = { periodoApuracao };
      } else if (mes) {
        params = { periodoApuracao: buildPeriodoApuracaoSerpro(mes, anoDigits) };
      } else {
        params = { anoCalendario: anoDigits };
      }

      const res = await consultarDeclaracoes(clienteParam, params);
      setDeclaracoes(res.data);
      setCacheInfo(null);
      const syncResumo = formatSyncGuiasResumo(res.data?.syncGuias);
      toast.success(
        syncResumo
          ? `Declarações consultadas. Guias: ${syncResumo}.`
          : 'Declarações consultadas na Serpro.'
      );
    } catch (err) {
      const message = apiErrMsg(err);
      setConsultError(message);
      toast.error(message);
    } finally {
      setConsultando(false);
    }
  };

  const showCompetenciaInRow = modoConsulta === 'ano' && !mes && gruposPeriodo.length > 1;

  const filtroConsultaLog = useMemo(() => {
    const anoDigits = String(ano).replace(/\D/g, '');
    if (modoConsulta === 'competencia' && periodoApuracao) {
      return { periodoApuracao };
    }
    if (modoConsulta === 'ano' && mes) {
      return { periodoApuracao: buildPeriodoApuracaoSerpro(mes, anoDigits) };
    }
    if (modoConsulta === 'ano' && anoDigits.length === 4) {
      return { anoCalendario: anoDigits };
    }
    return {};
  }, [modoConsulta, periodoApuracao, mes, ano]);

  return (
    <DashboardContent maxWidth="lg">
      <CustomBreadcrumbs
        heading="Impostos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Impostos' },
        ]}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:document-add-bold-duotone" />}
            onClick={() => openEmitDas()}
            disabled={!clienteParam}
            sx={{ boxShadow: theme.customShadows?.primary }}
          >
            Emitir DAS
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={4}>
        <Card
          sx={{
            p: 4,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
            boxShadow: theme.customShadows?.z4,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:calculator-bold-duotone" width={28} sx={{ color: 'primary.main' }} />
                PGDAS-D · Simples Nacional
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4.5 }}>
                Consulte declarações e emita ou reemita DAS via Integra Contador (Serpro).
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              spacing={2}
            >
              <ToggleButtonGroup
                exclusive
                size="small"
                value={modoConsulta}
                onChange={handleModoConsultaChange}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1.5,
                  '& .MuiToggleButton-root': {
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    border: 0,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                    },
                  },
                }}
              >
                <ToggleButton value="ano">
                  <Iconify icon="solar:calendar-minimalistic-bold-duotone" width={18} sx={{ mr: 0.75 }} />
                  Por Ano Calendário
                </ToggleButton>
                <ToggleButton value="competencia">
                  <Iconify icon="solar:calendar-bold-duotone" width={18} sx={{ mr: 0.75 }} />
                  Por Competência
                </ToggleButton>
              </ToggleButtonGroup>

              {modoConsulta === 'competencia' && competencia && periodoApuracao ? (
                <Chip
                  size="small"
                  variant="soft"
                  color="primary"
                  label={`${formatCompetencia(competencia)} · PA ${periodoApuracao}`}
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 600 }}
                />
              ) : null}
              {modoConsulta === 'ano' && ano.length === 4 ? (
                <Chip
                  size="small"
                  variant="soft"
                  color="info"
                  label={
                    mes
                      ? `${formatCompetencia(mesAnoToCompetenciaDisplay(mes, ano))} · PA ${buildPeriodoApuracaoSerpro(mes, ano)}`
                      : `Ano-calendário ${ano} · todos os meses`
                  }
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 600 }}
                />
              ) : null}
            </Stack>

            <Box
              rowGap={2.5}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: '1fr 160px 120px auto',
              }}
              alignItems="center"
            >
              <Autocomplete
                options={clientes}
                loading={loadingClientes}
                value={selectedCliente}
                onChange={handleClienteChange}
                getOptionLabel={(option) => formatClienteCodigoRazao(option)}
                isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cliente"
                    placeholder="Código ou razão social"
                    sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                  />
                )}
              />

              <TextField
                select
                label={modoConsulta === 'ano' ? 'Mês (opcional)' : 'Mês'}
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
              >
                {modoConsulta === 'ano' ? (
                  <MenuItem value="">
                    <em>Todos os meses</em>
                  </MenuItem>
                ) : null}
                {MESES_COMPETENCIA_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Ano"
                value={ano}
                onChange={(e) => setAno(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputProps={{ inputMode: 'numeric', maxLength: 4 }}
                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ height: 56 }}>
                <Button
                  size="large"
                  variant="outlined"
                  color="inherit"
                  onClick={() => setSyncGuiasOpen(true)}
                  disabled={!clienteParam}
                  startIcon={<Iconify icon="solar:refresh-bold" />}
                  sx={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap' }}
                >
                  Atualizar guias
                </Button>
                <Button
                  size="large"
                  variant="contained"
                  color="inherit"
                  onClick={handleConsultar}
                  disabled={consultando || !clienteParam}
                  startIcon={
                    consultando ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Iconify icon="solar:magnifer-bold" />
                    )
                  }
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  Consultar
                </Button>
              </Stack>
            </Box>

            <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />} sx={{ borderRadius: 1.5 }}>
              <Typography variant="caption" component="div">
                {modoConsulta === 'competencia'
                  ? 'Consulta por período de apuração (mês + ano). Ideal para verificar uma competência específica.'
                  : 'Consulta por ano-calendário. Deixe o mês em "Todos" para listar o ano inteiro ou escolha um mês para filtrar.'}
              </Typography>
            </Alert>
          </Stack>
        </Card>

        {consultError ? (
          <Alert severity="error" sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}>
            <AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>Falha na consulta</AlertTitle>
            <Typography variant="body2" sx={{ wordBreak: 'break-word', opacity: 0.9 }}>
              {consultError}
            </Typography>
          </Alert>
        ) : null}

        {!clienteParam ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Selecione um cliente para consultar declarações ou emitir uma nova DAS.
          </Alert>
        ) : null}

        {declaracoes && !carregandoCache && operacoesRowsFiltradas.length === 0 ? (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Nenhuma operação listada para o filtro informado. Você ainda pode emitir a DAS se houver débito apurado.
          </Alert>
        ) : null}

        {operacoesRowsFiltradas.length > 0 ? (
          <Stack spacing={2}>
            {cacheInfo?.consultadoEm ? (
              <Alert
                severity="warning"
                icon={<Iconify icon="solar:history-bold-duotone" width={22} />}
                sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
              >
                <AlertTitle sx={{ fontWeight: 700 }}>Dados do histórico em cache</AlertTitle>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  As informações abaixo foram recuperadas da última consulta registrada em{' '}
                  <strong>{new Date(cacheInfo.consultadoEm).toLocaleString('pt-BR')}</strong>
                  {' '}e podem não refletir a situação mais recente na Serpro. Clique em{' '}
                  <strong>Consultar</strong> para buscar dados atualizados.
                </Typography>
              </Alert>
            ) : null}

            <Card sx={{ borderRadius: 2, boxShadow: theme.customShadows?.z1, overflow: 'hidden' }}>
            <Box
              sx={{
                p: 3,
                bgcolor: 'background.neutral',
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Histórico PGDAS-D
                  </Typography>
                  {selectedCliente ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {formatClienteCodigoRazao(selectedCliente)}
                    </Typography>
                  ) : null}
                </Box>

                {resumoConsulta ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip size="small" variant="soft" label={`${resumoConsulta.periodos} período(s)`} />
                    <Chip size="small" variant="soft" label={`${resumoConsulta.total} operação(ões)`} />
                    {resumoConsulta.pagos > 0 ? (
                      <Chip size="small" variant="soft" color="success" label={`${resumoConsulta.pagos} pago(s)`} />
                    ) : null}
                    {resumoConsulta.abertos > 0 ? (
                      <Chip size="small" variant="soft" color="warning" label={`${resumoConsulta.abertos} em aberto`} />
                    ) : null}
                  </Stack>
                ) : null}
              </Stack>
            </Box>

            {modoConsulta === 'ano' && !mes ? (
              <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
                {gruposPeriodo.map((grupo) => (
                  <Box key={grupo.periodoApuracao}>
                    <Box
                      sx={{
                        px: 3,
                        py: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        borderBottom: `1px dashed ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                        {grupo.competenciaLabel}
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          PA {grupo.periodoApuracao}
                        </Typography>
                      </Typography>
                    </Box>
                    <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed', ml: 3 }} />}>
                      {grupo.items.map((row) => (
                        <FiscalOperacaoRow
                          key={row.id}
                          row={row}
                          showCompetencia={false}
                          onEmitDas={openEmitDas}
                        />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
                {operacoesRowsFiltradas.map((row) => (
                  <FiscalOperacaoRow
                    key={row.id}
                    row={row}
                    showCompetencia={showCompetenciaInRow}
                    onEmitDas={openEmitDas}
                  />
                ))}
              </Stack>
            )}
          </Card>
          </Stack>
        ) : null}
      </Stack>

      <GuiaFiscalEmitirDasDialog
        open={emitDasOpen}
        onClose={() => setEmitDasOpen(false)}
        clientes={clientes}
        loadingClientes={loadingClientes}
        initialClienteId={clienteParam}
        initialMes={emitDasPreset.mes}
        initialAno={emitDasPreset.ano}
        onUploadSuccess={() => {
          setEmitDasOpen(false);
        }}
      />

      <FiscalSyncGuiasDialog
        open={syncGuiasOpen}
        onClose={() => setSyncGuiasOpen(false)}
        clienteId={clienteParam}
        filtroConsulta={filtroConsultaLog}
      />
    </DashboardContent>
  );
}
