'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { formatClienteCodigoRazao } from 'src/utils/formatter';

import { consultarPagamentoWeb, consultarPagamentoWebFromLog } from 'src/actions/pagamento-web';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { MESES_COMPETENCIA_OPTIONS } from 'src/sections/guias-fiscais/utils';

import { FiscalConciliacaoDialog } from './fiscal-conciliacao-dialog';

const STATUS_CONFIG = {
  pago: { color: 'success', label: 'Pago', icon: 'solar:check-circle-bold-duotone' },
  parcial: { color: 'warning', label: 'Parcial', icon: 'solar:shield-warning-bold-duotone' },
  pendente: { color: 'error', label: 'Pendente', icon: 'solar:shield-warning-bold-duotone' },
};

const TIPO_ICON = {
  DAS: 'solar:bill-list-bold-duotone',
  DARF: 'solar:document-bold-duotone',
};

function formatValue(val) {
  if (val === undefined || val === null) return '\u2014';
  return `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(val) {
  if (!val) return '\u2014';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '\u2014';
  return d.toLocaleDateString('pt-BR');
}

function sumValues(items, field) {
  return items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
}

const MESES_LABEL = [
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

// Agrupa por mês da data de arrecadação usando fatiamento de string (mesmo critério do backend,
// evita deslocamento de fuso ao dar new Date em ISO sem timezone).
function mesAnoDaData(iso) {
  const datePart = String(iso || '').split('T')[0]; // YYYY-MM-DD
  const [yy, mm] = datePart.split('-');
  if (yy && mm) {
    return { key: `${yy}-${mm}`, label: `${MESES_LABEL[Number(mm) - 1] || mm} de ${yy}` };
  }
  return { key: 'sem-data', label: 'Sem data' };
}

function apiErrMsg(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.response?.data?.message || err.message || 'Erro na operação';
}

function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pendente;
  return (
    <Chip
      size="small"
      variant="soft"
      color={cfg.color}
      label={cfg.label}
      icon={<Iconify icon={cfg.icon} width={14} />}
      sx={{ fontWeight: 600, fontSize: 12 }}
    />
  );
}

// Par label/valor do bloco "Detalhes do documento".
function DetailField({ label, value, mono, bold }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        noWrap
        sx={{
          fontSize: 13,
          fontWeight: bold ? 700 : 500,
          fontFamily: mono ? 'monospace' : 'inherit',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// O backend (resolverReceita) já envia `dividaAtiva`/`natureza`. A regex é só fallback
// para logs antigos em cache, gravados antes do plug do mapa oficial.
const RE_DIVIDA_ATIVA = /d[.\s]*ativa|d[íi]vida\s*ativa/i;

function isDividaAtiva(doc) {
  if (typeof doc.dividaAtiva === 'boolean') return doc.dividaAtiva;
  return (doc.desmembramentos || []).some(
    (d) => d.natureza === 'dividaAtiva' || RE_DIVIDA_ATIVA.test(d.descricaoReceita || '')
  );
}

// Título legível do documento. Prefere o nome resolvido pelo mapa oficial (doc.nome);
// só cai no desmembramento quando o backend ainda não resolveu (cache antigo).
function docTitulo(doc) {
  if (doc.nome) return doc.nome;
  const des = doc.desmembramentos || [];
  if (des.length === 0) return doc.tipoDocumento || 'Documento';
  const primeiro =
    des[0].nome || des[0].descricaoReceita || `Receita ${des[0].codigoReceita || ''}`.trim();
  return des.length > 1 ? `${primeiro} e mais ${des.length - 1}` : primeiro;
}

function docKey(doc) {
  return `${doc.numeroDocumento}-${doc.dataArrecadacao}`;
}

// Layout A: documento como linha recolhível (resumo-primeiro). Some a tabela de 9 colunas;
// o detalhamento vira lista compacta que abre sob demanda.
function DocumentAccordion({ doc, open, onToggle }) {
  const theme = useTheme();
  const statusCfg = STATUS_CONFIG[doc.statusPagamento] || STATUS_CONFIG.pendente;
  const docIcon = TIPO_ICON[doc.tipoDocumento] || 'solar:document-text-bold-duotone';
  const diva = isDividaAtiva(doc);
  const encargos = (Number(doc.valorMulta) || 0) + (Number(doc.valorJuros) || 0);
  const borderColor = theme.palette[statusCfg.color]?.main || theme.palette.grey[400];
  const des = doc.desmembramentos || [];

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: theme.customShadows?.z1,
        overflow: 'hidden',
        borderLeft: `4px solid ${diva ? theme.palette.secondary.main : borderColor}`,
      }}
    >
      <ButtonBase
        onClick={onToggle}
        aria-expanded={open}
        sx={{
          width: '100%',
          px: { xs: 2, sm: 3 },
          py: 1.75,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto',
          gap: { xs: 1.5, sm: 2 },
          alignItems: 'center',
          textAlign: 'left',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(theme.palette[statusCfg.color]?.main || theme.palette.grey[500], 0.1),
          }}
        >
          <Iconify icon={docIcon} width={22} sx={{ color: `${statusCfg.color}.main` }} />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
            {docTitulo(doc)}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            sx={{ mt: 0.25, rowGap: 0.5 }}
          >
            <Chip
              size="small"
              variant="soft"
              color={doc.tipoDocumento === 'DAS' ? 'success' : 'default'}
              label={doc.tipoDocumento}
              sx={{ height: 20, fontSize: 10.5, fontWeight: 700 }}
            />
            {diva ? (
              <Chip
                size="small"
                variant="soft"
                color="secondary"
                label="Dívida Ativa"
                sx={{ height: 20, fontSize: 10.5, fontWeight: 700 }}
              />
            ) : null}
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {doc.numeroDocumento}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              · Comp. {doc.periodoApuracao || '—'}
              {des.length > 1 ? ` · ${des.length} receitas` : ''}
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            {formatValue(doc.valorTotal)}
          </Typography>
          {encargos > 0 ? (
            <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 600 }}>
              +{formatValue(encargos)} encargos
            </Typography>
          ) : null}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <StatusChip status={doc.statusPagamento} />
          <Iconify
            icon="eva:chevron-down-fill"
            width={18}
            sx={{
              color: 'text.disabled',
              transition: theme.transitions.create('transform'),
              transform: open ? 'rotate(180deg)' : 'none',
            }}
          />
        </Stack>
      </ButtonBase>

      <Collapse in={open} unmountOnExit>
        <Box
          sx={{ borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.neutral' }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 1.5,
            }}
          >
            <DetailField label="Número" value={doc.numeroDocumento || '—'} mono />
            <DetailField label="Cód. receita" value={doc.codigoReceita || '—'} mono />
            {doc.sigla ? <DetailField label="Sigla" value={doc.sigla} /> : null}
            <DetailField label="Competência" value={doc.periodoApuracao || '—'} />
            <DetailField label="Arrecadação" value={formatDate(doc.dataArrecadacao)} />
            <DetailField label="Vencimento" value={formatDate(doc.dataVencimento)} />
            <DetailField label="Principal" value={formatValue(doc.valorPrincipal)} mono />
            <DetailField label="Multa" value={formatValue(doc.valorMulta)} mono />
            <DetailField label="Juros" value={formatValue(doc.valorJuros)} mono />
            <DetailField label="Total" value={formatValue(doc.valorTotal)} mono bold />
            <DetailField label="Saldo" value={formatValue(doc.valorSaldoTotal)} mono />
          </Box>

          {des.length > 0 ? (
            <>
              <Box
                sx={{
                  px: { xs: 2, sm: 3 },
                  pt: 1.25,
                  pb: 0.5,
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10.5 }}>
                  Detalhamento de receitas
                </Typography>
              </Box>
              {des.map((d, idx) => {
                const dStatusCfg = STATUS_CONFIG[d.statusPagamento] || STATUS_CONFIG.pendente;
                const dEnc = (Number(d.valorMulta) || 0) + (Number(d.valorJuros) || 0);
                return (
                  <Box
                    key={`${d.codigoReceita}-${idx}`}
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: 1.25,
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto auto',
                      gap: 1.5,
                      alignItems: 'center',
                      borderBottom:
                        idx < des.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                    }}
                  >
                    <Chip
                      size="small"
                      variant="outlined"
                      label={d.codigoReceita || '—'}
                      sx={{ height: 22, fontFamily: 'monospace', fontSize: 11.5, fontWeight: 600 }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontSize: 13 }}>
                        {d.nome || d.descricaoReceita || `Receita ${d.codigoReceita || ''}`}
                      </Typography>
                      {d.extensaoReceita ? (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                          {d.extensaoReceita}
                        </Typography>
                      ) : null}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}
                      >
                        {formatValue(d.valorTotal)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', fontSize: 10.5 }}
                      >
                        principal {formatValue(d.valorPrincipal)}
                        {dEnc > 0 ? (
                          <Box component="span" sx={{ color: 'warning.main', fontWeight: 600 }}>
                            {' · +'}
                            {formatValue(dEnc)} enc.
                          </Box>
                        ) : null}
                        {Number(d.valorSaldoTotal) > 0 ? (
                          <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>
                            {' · saldo '}
                            {formatValue(d.valorSaldoTotal)}
                          </Box>
                        ) : null}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      variant="soft"
                      color={dStatusCfg.color}
                      label={dStatusCfg.label}
                      sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
                    />
                  </Box>
                );
              })}
            </>
          ) : (
            <Box
              sx={{ p: 3, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}
            >
              <Typography variant="body2" color="text.secondary">
                Nenhum detalhamento de receita disponível.
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Card>
  );
}

export function FiscalPagtoWebPanel({
  clientes,
  loadingClientes,
  clienteParam,
  selectedCliente,
  onClienteChange,
}) {
  const theme = useTheme();

  const hoje = new Date();
  const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
  const anoAtual = String(hoje.getFullYear());

  const [modoConsulta, setModoConsulta] = useState('ano'); // 'ano' | 'competencia'
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState(anoAtual);
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [consultError, setConsultError] = useState('');
  const [cacheInfo, setCacheInfo] = useState(null);
  const [carregandoCache, setCarregandoCache] = useState(false);
  const [openKeys, setOpenKeys] = useState(() => new Set());
  const [conciliacaoOpen, setConciliacaoOpen] = useState(false);
  // Incrementado após uma baixa: força o efeito de leitura do log a rodar de novo,
  // reaproveitando o caminho de recarga que já existe em vez de criar outra fonte.
  const [refreshKey, setRefreshKey] = useState(0);

  const anoDigits = useMemo(() => String(ano).replace(/\D/g, '').slice(0, 4), [ano]);
  const anoValido = anoDigits.length === 4;
  // Mês só participa da consulta no modo competência; no modo ano busca-se o ano inteiro.
  const mesConsulta = modoConsulta === 'competencia' && mes ? mes : undefined;

  const handleModoConsultaChange = useCallback(
    (_, value) => {
      if (!value) return;
      setModoConsulta(value);
      setMes(value === 'ano' ? '' : mesAtual);
      setResultado(null);
      setConsultError('');
    },
    [mesAtual]
  );

  useEffect(() => {
    let cancelled = false;
    setResultado(null);
    setCacheInfo(null);

    if (!clienteParam || !anoValido)
      return () => {
        cancelled = true;
      };
    // No modo competência sem mês selecionado não há recorte a buscar.
    if (modoConsulta === 'competencia' && !mes)
      return () => {
        cancelled = true;
      };

    setCarregandoCache(true);
    (async () => {
      try {
        const res = await consultarPagamentoWebFromLog(clienteParam, {
          ano: anoDigits,
          mes: mesConsulta,
        });
        if (cancelled) return;
        setResultado(res);
        setCacheInfo({ consultadoEm: res.consultadoEm });
        setConsultError('');
      } catch {
        if (cancelled) return;
        setResultado(null);
        setCacheInfo(null);
      } finally {
        if (!cancelled) setCarregandoCache(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clienteParam, anoDigits, anoValido, mes, mesConsulta, modoConsulta, refreshKey]);

  const handleConsultar = useCallback(async () => {
    setConsultError('');
    setResultado(null);
    setCacheInfo(null);

    if (!clienteParam) {
      setConsultError('Selecione um cliente.');
      return;
    }

    if (!selectedCliente?.cnpj) {
      setConsultError('Cliente não possui CNPJ cadastrado.');
      return;
    }

    if (!anoValido) {
      setConsultError('Informe um ano válido (AAAA).');
      return;
    }

    if (modoConsulta === 'competencia' && !mes) {
      setConsultError('Selecione o mês da competência.');
      return;
    }

    setConsultando(true);
    try {
      const res = await consultarPagamentoWeb({
        clienteId: clienteParam,
        cnpj: selectedCliente.cnpj,
        ano: anoDigits,
        mes: mesConsulta,
      });
      setResultado(res);
      const count = res.documentos?.length ?? 0;
      toast.success(
        res.cacheHit
          ? `${count} documento(s) obtido(s) do cache.`
          : `${count} documento(s) consultados na Serpro.`
      );
    } catch (err) {
      const message = apiErrMsg(err);
      setConsultError(message);
      toast.error(message);
    } finally {
      setConsultando(false);
    }
  }, [clienteParam, anoDigits, anoValido, mes, mesConsulta, modoConsulta, selectedCliente]);

  const handleLimpar = useCallback(() => {
    setResultado(null);
    setConsultError('');
  }, []);

  // Abre por padrão o que precisa de atenção (pendente/parcial); pagos entram recolhidos.
  useEffect(() => {
    const docs = resultado?.documentos || [];
    setOpenKeys(new Set(docs.filter((d) => d.statusPagamento !== 'pago').map(docKey)));
  }, [resultado]);

  const toggleDoc = useCallback((key) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const documentos = useMemo(() => resultado?.documentos || [], [resultado]);

  // Modo anual: agrupa por mês de arrecadação (janeiro → dezembro) para varredura do ano.
  const gruposPorMes = useMemo(() => {
    const map = new Map();
    documentos.forEach((doc) => {
      const { key, label } = mesAnoDaData(doc.dataArrecadacao);
      if (!map.has(key)) map.set(key, { key, label, docs: [] });
      map.get(key).docs.push(doc);
    });
    return Array.from(map.values()).sort((a, b) => (a.key < b.key ? -1 : 1));
  }, [documentos]);
  const agruparPorMes = modoConsulta === 'ano' && gruposPorMes.length > 1;

  const allOpen = documentos.length > 0 && openKeys.size === documentos.length;
  const toggleAll = useCallback(() => {
    setOpenKeys((prev) =>
      prev.size === documentos.length ? new Set() : new Set(documentos.map(docKey))
    );
  }, [documentos]);

  const resumo = resultado?.resumo;

  return (
    <>
      <Stack spacing={4}>
        {/* ===== Search Card ===== */}
        <Card
          sx={{
            p: 4,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
            boxShadow: theme.customShadows?.z4,
            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Iconify
                  icon="solar:wallet-money-bold-duotone"
                  width={28}
                  sx={{ color: 'success.main' }}
                />
                Pagamento Web
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4.5 }}>
                Consulte pagamentos de guias e declarações por data de arrecadação.
              </Typography>
            </Box>

            <ToggleButtonGroup
              exclusive
              size="small"
              value={modoConsulta}
              onChange={handleModoConsultaChange}
              sx={{
                alignSelf: 'flex-start',
                '& .MuiToggleButton-root': {
                  px: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    color: 'success.dark',
                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) },
                  },
                },
              }}
            >
              <ToggleButton value="ano">Por Ano Calendário</ToggleButton>
              <ToggleButton value="competencia">Por Arrecadação</ToggleButton>
            </ToggleButtonGroup>

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
                onChange={onClienteChange}
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
                label="Mês"
                value={modoConsulta === 'competencia' ? mes : ''}
                onChange={(e) => setMes(e.target.value)}
                disabled={modoConsulta !== 'competencia'}
                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
              >
                {modoConsulta !== 'competencia' ? (
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
                sx={{ height: 56, flex: 1, minWidth: 0 }}
              >
                Consultar
              </Button>
            </Box>

            {anoValido ? (
              <Chip
                size="small"
                variant="soft"
                color="success"
                icon={<Iconify icon="solar:calendar-bold-duotone" width={16} />}
                label={
                  modoConsulta === 'competencia' && mes
                    ? `Arrecadação: ${mes}/${anoDigits}`
                    : `Ano-calendário: ${anoDigits} · todos os meses`
                }
                sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
              />
            ) : null}
          </Stack>
        </Card>

        {/* ===== Error ===== */}
        {consultError ? (
          <Alert
            severity="error"
            sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
          >
            <AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>Falha na consulta</AlertTitle>
            <Typography variant="body2" sx={{ wordBreak: 'break-word', opacity: 0.9 }}>
              {consultError}
            </Typography>
          </Alert>
        ) : null}

        {/* ===== Empty State ===== */}
        {!clienteParam ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Selecione um cliente para consultar pagamentos.
          </Alert>
        ) : null}

        {resultado && resultado.documentos && resultado.documentos.length === 0 ? (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Nenhum pagamento encontrado para o período informado.
          </Alert>
        ) : null}

        {/* ===== Results ===== */}
        {resultado && resultado.documentos && resultado.documentos.length > 0 ? (
          <Stack spacing={2}>
            {/* Cache notice — histórico */}
            {cacheInfo?.consultadoEm ? (
              <Alert
                severity="warning"
                icon={<Iconify icon="solar:history-bold-duotone" width={22} />}
                sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
              >
                <AlertTitle sx={{ fontWeight: 700 }}>Dados do histórico em cache</AlertTitle>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  As informações abaixo foram recuperadas da última consulta registrada em{' '}
                  <strong>{new Date(cacheInfo.consultadoEm).toLocaleString('pt-BR')}</strong>.
                  Clique em <strong>Consultar</strong> para buscar dados atualizados na Serpro.
                </Typography>
              </Alert>
            ) : null}

            {/* Cache notice — mesma consulta no dia */}
            {resultado.cacheHit && !cacheInfo ? (
              <Alert
                severity="info"
                icon={<Iconify icon="solar:history-bold-duotone" width={22} />}
                sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
              >
                <AlertTitle sx={{ fontWeight: 700 }}>Cache ativo</AlertTitle>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Dados recuperados de consulta anterior neste mesmo dia.
                </Typography>
              </Alert>
            ) : null}

            {/* ===== Summary Bar ===== */}
            {resumo ? (
              <Card sx={{ borderRadius: 2, boxShadow: theme.customShadows?.z1 }}>
                <Grid container spacing={0} sx={{ px: 3, py: 2.5 }}>
                  <Grid item xs={6} sm={3}>
                    <Stack spacing={0.5}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {resumo.totalDocumentos}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Documentos
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Stack spacing={0.5}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {resumo.totalReceitas}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Receitas
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Stack spacing={0.5}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {formatValue(resumo.valorTotal)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Valor total
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                      <Chip
                        size="small"
                        variant="soft"
                        color="success"
                        label={`${resumo.pagos} pago(s)`}
                        sx={{ fontWeight: 600 }}
                      />
                      {resumo.parciais > 0 ? (
                        <Chip
                          size="small"
                          variant="soft"
                          color="warning"
                          label={`${resumo.parciais} parcial(is)`}
                          sx={{ fontWeight: 600 }}
                        />
                      ) : null}
                      {resumo.pendentes > 0 ? (
                        <Chip
                          size="small"
                          variant="soft"
                          color="error"
                          label={`${resumo.pendentes} pendente(s)`}
                          sx={{ fontWeight: 600 }}
                        />
                      ) : null}
                    </Stack>
                  </Grid>
                </Grid>
              </Card>
            ) : null}

            {/* ===== Documentos (Layout A · acordeão resumo-primeiro) ===== */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: -0.5 }}
            >
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={() => setConciliacaoOpen(true)}
                startIcon={<Iconify icon="solar:check-circle-bold" width={16} />}
              >
                Conciliar pagamentos
              </Button>

              <Button
                size="small"
                color="inherit"
                onClick={toggleAll}
                startIcon={
                  <Iconify icon={allOpen ? 'eva:collapse-fill' : 'eva:expand-fill'} width={16} />
                }
                sx={{ color: 'text.secondary' }}
              >
                {allOpen ? 'Recolher tudo' : 'Expandir tudo'}
              </Button>
            </Stack>

            {agruparPorMes
              ? gruposPorMes.map((grupo) => (
                  <Stack key={grupo.key} spacing={2}>
                    <Box
                      sx={{
                        mt: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {grupo.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {grupo.docs.length} doc(s) ·{' '}
                        {formatValue(sumValues(grupo.docs, 'valorTotal'))}
                      </Typography>
                    </Box>
                    {grupo.docs.map((doc) => {
                      const key = docKey(doc);
                      return (
                        <DocumentAccordion
                          key={key}
                          doc={doc}
                          open={openKeys.has(key)}
                          onToggle={() => toggleDoc(key)}
                        />
                      );
                    })}
                  </Stack>
                ))
              : resultado.documentos.map((doc) => {
                  const key = docKey(doc);
                  return (
                    <DocumentAccordion
                      key={key}
                      doc={doc}
                      open={openKeys.has(key)}
                      onToggle={() => toggleDoc(key)}
                    />
                  );
                })}

            {/* ===== Global Total Footer ===== */}
            {resumo && resultado.documentos.length > 1 ? (
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: theme.customShadows?.z1,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Total consolidado · {resumo.totalDocumentos} documento(s) ·{' '}
                    {resumo.totalReceitas} receita(s)
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}
                  >
                    {formatValue(resumo.valorTotal)}
                  </Typography>
                </Box>
              </Card>
            ) : null}
          </Stack>
        ) : null}
      </Stack>

      <FiscalConciliacaoDialog
        open={conciliacaoOpen}
        onClose={() => setConciliacaoOpen(false)}
        clienteId={clienteParam}
        ano={anoDigits}
        mes={mesConsulta}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
