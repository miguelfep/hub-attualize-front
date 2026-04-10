'use client';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { PatternFormat } from 'react-number-format';
import { useMemo, useState, useEffect, useCallback } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Divider,
  MenuItem,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import {
  usePortalRubricas,
  portalPutRubricas,
  usePortalFuncionario,
  usePortalApontamentosCompetenciaMes,
  portalFecharCompetenciaApontamentos,
  revalidatePortalApontamentosCompetencia,
} from 'src/actions/departamento-pessoal';

import { Iconify } from 'src/components/iconify';

import { CODIGOS_RUBRICA_SUGERIDOS } from 'src/types/departamento-pessoal';

import { useDpPortalContext } from '../dp-shared';
import { parseDiasIsoFromString, PortalDpFaltasCalendarField } from './portal-dp-faltas-calendar-field';

// ----------------------------------------------------------------------

const MESES = [
  { v: 1, l: 'Janeiro' },
  { v: 2, l: 'Fevereiro' },
  { v: 3, l: 'Março' },
  { v: 4, l: 'Abril' },
  { v: 5, l: 'Maio' },
  { v: 6, l: 'Junho' },
  { v: 7, l: 'Julho' },
  { v: 8, l: 'Agosto' },
  { v: 9, l: 'Setembro' },
  { v: 10, l: 'Outubro' },
  { v: 11, l: 'Novembro' },
  { v: 12, l: 'Dezembro' },
];

const HORAS_CODES = new Set(['HORA_EXTRA_50', 'HORA_EXTRA_100', 'ATRASO']);

const SITUACAO_COMP_LABEL = {
  em_aberto: 'Em aberto — você pode lançar e alterar apontamentos até validar o mês.',
  validado_com_apontamentos: 'Validado com apontamentos. O portal não permite mais edição neste mês.',
  validado_sem_apontamentos: 'Validado sem apontamentos. O portal não permite mais edição neste mês.',
  encerrado_automaticamente: 'Encerrado automaticamente após o prazo. O portal não permite edição.',
};

function errMsg(err) {
  if (typeof err === 'string') return err;
  return err?.response?.data?.message || err?.message || 'Erro';
}

/** @param {string} str */
function parseDiasInput(str) {
  const arr = parseDiasIsoFromString(str);
  return arr.length ? arr : undefined;
}

/** Converte horas decimais da API em HH:MM para exibição. */
function decimalParaHm(dec) {
  if (dec == null || dec === '') return '';
  const n = typeof dec === 'number' ? dec : Number(String(dec).replace(',', '.'));
  if (Number.isNaN(n) || n < 0) return '';
  const totalMin = Math.round(n * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Interpreta HH:MM (ou decimal legado) como horas decimais para a API. */
function hmParaDecimal(str) {
  if (str == null) return undefined;
  const t = String(str).trim();
  if (!t || t === ':' || /^[_:]+$/.test(t)) return undefined;
  const hm = t.match(/^(\d{1,3}):(\d{2})$/);
  if (hm) {
    const hh = Number(hm[1]);
    const mm = Number(hm[2]);
    if (mm > 59 || Number.isNaN(hh)) return undefined;
    return hh + mm / 60;
  }
  const leg = Number(t.replace(',', '.'));
  return Number.isNaN(leg) ? undefined : leg;
}

function emptyItem() {
  return {
    codigo: '',
    descricao: '',
    quantidade: '',
    valor: '',
    horas: '',
    dias: '',
    observacao: '',
  };
}

/** @param {Record<string, unknown>} i */
function itemFromApi(i) {
  const codigo = i.codigo || 'OUTRO';
  const qLegacy = i.quantidade != null && i.quantidade !== '' ? String(i.quantidade) : '';
  let horasDec = null;
  if (i.horas != null && i.horas !== '') {
    const n = Number(String(i.horas).replace(',', '.'));
    if (!Number.isNaN(n)) horasDec = n;
  }
  if (horasDec == null && HORAS_CODES.has(codigo) && qLegacy !== '') {
    const n = Number(String(qLegacy).replace(',', '.'));
    if (!Number.isNaN(n)) horasDec = n;
  }
  const horasDisplay = horasDec != null ? decimalParaHm(horasDec) : '';
  return {
    codigo,
    descricao: i.descricao || '',
    quantidade: HORAS_CODES.has(codigo) ? '' : qLegacy,
    valor: i.valor != null && i.valor !== '' ? String(i.valor) : '',
    horas: horasDisplay,
    dias: Array.isArray(i.dias) && i.dias.length ? i.dias.join('\n') : '',
    observacao: i.observacao || '',
  };
}

/**
 * @param {ReturnType<typeof emptyItem>} i
 * @returns {Record<string, unknown>}
 */
function buildPayloadItem(i) {
  const obs = i.observacao?.trim() || undefined;
  const { codigo: rawCodigo } = i;
  const codigo = rawCodigo && String(rawCodigo).trim() ? rawCodigo : '';
  if (!codigo) {
    return {};
  }

  if (codigo === 'FALTA') {
    const dias = parseDiasInput(i.dias);
    const qRaw = i.quantidade === '' ? undefined : Number(String(i.quantidade).replace(',', '.'));
    if (dias?.length) return { codigo, dias, observacao: obs };
    if (qRaw != null && !Number.isNaN(qRaw)) return { codigo, quantidade: qRaw, observacao: obs };
    if (obs) return { codigo, observacao: obs };
    return { codigo };
  }

  if (HORAS_CODES.has(codigo)) {
    const h = hmParaDecimal(i.horas);
    const qRaw = i.quantidade === '' ? undefined : Number(String(i.quantidade).replace(',', '.'));
    const desc = i.descricao?.trim() || undefined;
    if (h != null && !Number.isNaN(h)) return { codigo, horas: h, observacao: obs, descricao: desc };
    if (qRaw != null && !Number.isNaN(qRaw)) return { codigo, quantidade: qRaw, observacao: obs, descricao: desc };
    if (obs || desc) return { codigo, observacao: obs, descricao: desc };
    return { codigo };
  }

  const q = i.quantidade === '' ? undefined : Number(String(i.quantidade).replace(',', '.'));
  const v = i.valor === '' ? undefined : Number(String(i.valor).replace(',', '.'));
  return {
    codigo,
    descricao: i.descricao?.trim() || undefined,
    quantidade: q != null && !Number.isNaN(q) ? q : undefined,
    valor: v != null && !Number.isNaN(v) ? v : undefined,
    observacao: obs,
  };
}

function itemHasPayload(obj) {
  const keys = Object.keys(obj).filter((k) => k !== 'codigo');
  return keys.some((k) => {
    const v = obj[k];
    if (v === undefined || v === null) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'number') return !Number.isNaN(v);
    return String(v).trim() !== '';
  });
}

/**
 * @param {object} props
 * @param {string} props.funcionarioId
 * @param {boolean} [props.embedded] — layout compacto dentro da página única de apontamentos
 * @param {number} [props.competenciaAno] — competência vinda da URL (hub)
 * @param {number} [props.competenciaMes]
 * @param {(ano: number, mes: number) => void} [props.onCompetenciaChange] — atualiza query string no hub
 * @param {string} [props.hubClienteId] — quando definido (dashboard HUB), usa este cliente em vez do contexto do portal
 * @param {boolean} [props.hubModoInterno] — fluxo equipe interna (links e mensagens do dashboard)
 */
export function PortalDpRubricasView({
  funcionarioId,
  embedded = false,
  competenciaAno,
  competenciaMes,
  onCompetenciaChange,
  hubClienteId = null,
  hubModoInterno = false,
}) {
  const ctx = useDpPortalContext();
  const clienteProprietarioId = hubClienteId || ctx.clienteProprietarioId;
  const enabled = hubClienteId ? true : ctx.enabled;
  const loadingEmpresas = hubClienteId ? false : ctx.loadingEmpresas;
  const { data: f, isLoading: loadingF } = usePortalFuncionario(clienteProprietarioId, funcionarioId);
  const { data: todas, isLoading: loadingR, mutate } = usePortalRubricas(clienteProprietarioId, funcionarioId);

  const theme = useTheme();
  const now = new Date();
  const [ano, setAno] = useState(competenciaAno ?? now.getFullYear());
  const [mes, setMes] = useState(competenciaMes ?? now.getMonth() + 1);
  const [itens, setItens] = useState([emptyItem()]);
  const [observacoesGerais, setObservacoesGerais] = useState('');
  const [saving, setSaving] = useState(false);
  const [fechandoMes, setFechandoMes] = useState(false);

  useEffect(() => {
    if (competenciaAno != null) setAno(competenciaAno);
  }, [competenciaAno]);

  useEffect(() => {
    if (competenciaMes != null) setMes(competenciaMes);
  }, [competenciaMes]);

  const emitCompetencia = useCallback(
    (nextAno, nextMes) => {
      setAno(nextAno);
      setMes(nextMes);
      onCompetenciaChange?.(nextAno, nextMes);
    },
    [onCompetenciaChange]
  );

  const { data: compMes, isLoading: loadComp, mutate: mutComp } = usePortalApontamentosCompetenciaMes(
    clienteProprietarioId,
    ano,
    mes
  );

  const docMes = useMemo(
    () => (Array.isArray(todas) ? todas.find((r) => r.ano === ano && r.mes === mes) : null),
    [todas, ano, mes]
  );

  useEffect(() => {
    if (!docMes) {
      setItens([emptyItem()]);
      setObservacoesGerais('');
      return;
    }
    const arr = docMes.itens?.length ? docMes.itens : [emptyItem()];
    setItens(arr.map((row) => itemFromApi(row)));
    setObservacoesGerais(docMes.observacoesGerais || '');
  }, [docMes, ano, mes]);

  const historicoLista = useMemo(() => {
    if (!Array.isArray(todas)) return [];
    if (embedded) return todas.filter((r) => r.ano === ano && r.mes === mes);
    return todas;
  }, [todas, embedded, ano, mes]);

  const podeEditar = f?.statusCadastro === 'aprovado' && f?.statusVinculo === 'ativo';
  const rubricasTravadasPelaCompetencia = Boolean(compMes && compMes.podeEditarRubricas === false);
  const podeEditarFormulario = podeEditar && !rubricasTravadasPelaCompetencia;

  const handleAddLinha = () => setItens((prev) => [...prev, emptyItem()]);

  const handleRemoveLinha = (idx) => {
    setItens((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const handleChangeItem = (idx, field, value) => {
    setItens((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSalvar = async () => {
    if (!clienteProprietarioId || !funcionarioId) return;
    setSaving(true);
    try {
      const mapped = itens.map((i) => buildPayloadItem(i)).filter(itemHasPayload);
      const payload = {
        ano,
        mes,
        observacoesGerais: observacoesGerais.trim() || undefined,
        itens: mapped,
      };
      await portalPutRubricas(clienteProprietarioId, funcionarioId, payload);
      toast.success('Apontamentos salvos para esta competência.');
      mutate();
      await revalidatePortalApontamentosCompetencia(clienteProprietarioId);
      mutComp();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handleFecharCompetencia = async (modo) => {
    if (!clienteProprietarioId) return;
    setFechandoMes(true);
    try {
      await portalFecharCompetenciaApontamentos(clienteProprietarioId, ano, mes, { modo });
      toast.success(
        modo === 'declarar_sem_apontamentos'
          ? 'Mês declarado sem apontamentos.'
          : 'Mês finalizado com apontamentos.'
      );
      await revalidatePortalApontamentosCompetencia(clienteProprietarioId);
      mutComp();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setFechandoMes(false);
    }
  };

  if (!hubClienteId && (loadingEmpresas || !clienteProprietarioId)) {
    return <Typography sx={{ p: 2 }}>Carregando…</Typography>;
  }

  if (hubClienteId && !clienteProprietarioId) {
    return <Typography sx={{ p: 2 }}>Cliente não selecionado.</Typography>;
  }

  if (!enabled) {
    return <Alert severity="info">Módulo não habilitado.</Alert>;
  }

  if (loadingF || !f) {
    return <Typography sx={{ p: 2 }}>Carregando…</Typography>;
  }

  if (!hubModoInterno && !podeEditar) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Apontamentos só podem ser lançados para colaborador com cadastro aprovado e vínculo ativo.
        <Button component={RouterLink} href={paths.cliente.departamentoPessoal.details(funcionarioId)} sx={{ ml: 1 }}>
          Voltar ao colaborador
        </Button>
      </Alert>
    );
  }

  const anosOpts = [...new Set([now.getFullYear(), now.getFullYear() - 1, ...(todas || []).map((r) => r.ano)])].sort(
    (a, b) => b - a
  );

  const situacaoCurta =
    {
      em_aberto: 'Em aberto',
      validado_com_apontamentos: 'Validado',
      validado_sem_apontamentos: 'Sem ocorrências',
      encerrado_automaticamente: 'Encerrado (prazo)',
    }[compMes?.situacao] || '—';

  const fichaHref = hubModoInterno
    ? paths.dashboard.departamentoPessoal.funcionario(funcionarioId)
    : paths.cliente.departamentoPessoal.details(funcionarioId);

  return (
    <Box>
      {hubModoInterno && !podeEditar && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Colaborador sem cadastro aprovado ou vínculo ativo neste cliente. A equipe pode conferir, mas o formulário fica
          somente leitura.
        </Alert>
      )}
      {!embedded && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 3 }}
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography variant="h4" component="h1">
              Apontamentos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {f.nome} — informe a competência e adicione cada lançamento abaixo.
            </Typography>
          </Box>
          {!hubModoInterno && (
            <Button component={RouterLink} href={paths.cliente.departamentoPessoal.apontamentos} variant="outlined">
              Resumo de apontamentos
            </Button>
          )}
        </Stack>
      )}

      <Box
        component={embedded ? Paper : Card}
        variant={embedded ? 'outlined' : undefined}
        elevation={embedded ? 0 : undefined}
        sx={{
          p: embedded ? { xs: 1.75, sm: 2 } : 2,
          mb: embedded ? 0 : 3,
          borderRadius: 2,
          ...(embedded
            ? {
                bgcolor: 'background.paper',
                borderStyle: 'solid',
              }
            : {}),
          ...(!embedded ? { boxShadow: (t) => t.shadows[1] } : {}),
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.5, fontWeight: 700 }}>
          {embedded ? 'Período' : 'Competência'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5, lineHeight: 1.5 }}>
          {embedded
            ? 'Só altere se precisar corrigir o mês — o ideal é voltar ao resumo e escolher outro mês.'
            : 'Selecione ano e mês dos lançamentos.'}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            select
            label="Ano"
            value={ano}
            onChange={(e) => emitCompetencia(Number(e.target.value), mes)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            {anosOpts.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Mês"
            value={mes}
            onChange={(e) => emitCompetencia(ano, Number(e.target.value))}
            size="small"
            sx={{ minWidth: 180 }}
          >
            {MESES.map((m) => (
              <MenuItem key={m.v} value={m.v}>
                {m.l}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {loadComp && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Consultando situação do mês…
          </Typography>
        )}

        {compMes && (
          <>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 1.5,
                bgcolor: rubricasTravadasPelaCompetencia
                  ? alpha(theme.palette.warning.main, 0.06)
                  : alpha(theme.palette.info.main, 0.06),
                borderColor: rubricasTravadasPelaCompetencia ? 'warning.light' : 'transparent',
              }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={situacaoCurta} color="primary" variant="soft" />
                  {compMes.passouDoPrazo && compMes.situacao === 'em_aberto' && (
                    <Chip size="small" color="error" label="Prazo" variant="outlined" />
                  )}
                  <Chip
                    size="small"
                    variant="outlined"
                    label={compMes.possuiAlgumApontamentoLancado ? 'Com lançamentos' : 'Ainda vazio'}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {SITUACAO_COMP_LABEL[compMes.situacao] || 'Situação desta competência.'}
                </Typography>
                {compMes.dataLimiteEnvioISO ? (
                  <Typography variant="caption" color="text.secondary">
                    Enviar até <strong>{dayjs(compMes.dataLimiteEnvioISO).format('DD/MM/YYYY')}</strong>
                  </Typography>
                ) : null}
              </Stack>
            </Paper>

            {compMes.situacao === 'em_aberto' && compMes.podeEditarRubricas && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }} useFlexGap flexWrap="wrap">
                <LoadingButton
                  size="medium"
                  variant="contained"
                  loading={fechandoMes}
                  disabled={!compMes.possuiAlgumApontamentoLancado}
                  onClick={() => handleFecharCompetencia('finalizar_com_apontamentos')}
                  sx={{ flex: { sm: 1 } }}
                >
                  Enviar mês com apontamentos
                </LoadingButton>
                <LoadingButton
                  size="medium"
                  variant="outlined"
                  loading={fechandoMes}
                  disabled={compMes.possuiAlgumApontamentoLancado}
                  onClick={() => handleFecharCompetencia('declarar_sem_apontamentos')}
                  sx={{ flex: { sm: 1 } }}
                >
                  Mês sem ocorrências
                </LoadingButton>
              </Stack>
            )}
          </>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.5, fontWeight: 700 }}>
          Lançamentos
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2, lineHeight: 1.5 }}>
          Uma linha por tipo (falta, hora extra, etc.). Toque em &quot;Adicionar&quot; se precisar de mais de um.
        </Typography>

        <Stack spacing={1.5}>
          {itens.map((row, idx) => (
            <Paper
              key={idx}
              variant="outlined"
              sx={{
                p: { xs: 1.75, sm: 2 },
                borderRadius: 2,
                borderLeft: 4,
                borderLeftColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      minWidth: 32,
                      height: 32,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      typography: 'subtitle2',
                      fontWeight: 800,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.dark',
                    }}
                  >
                    {idx + 1}
                  </Box>
                  <TextField
                    select
                    label="Tipo de apontamento"
                    size="small"
                    fullWidth
                    disabled={!podeEditarFormulario}
                    value={row.codigo}
                    onChange={(e) => handleChangeItem(idx, 'codigo', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="">
                      <Typography component="span" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Selecione…
                      </Typography>
                    </MenuItem>
                    {CODIGOS_RUBRICA_SUGERIDOS.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveLinha(idx)}
                    disabled={!podeEditarFormulario || itens.length <= 1}
                    sx={{ flexShrink: 0 }}
                    aria-label="Remover lançamento"
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Stack>

                {row.codigo === 'FALTA' && (
                  <PortalDpFaltasCalendarField
                    value={row.dias}
                    onChange={(v) => handleChangeItem(idx, 'dias', v)}
                    ano={ano}
                    mes={mes}
                    disabled={!podeEditarFormulario}
                  />
                )}

                {row.codigo === 'FALTA' && (
                  <TextField
                    label="Quantidade de faltas (opcional, alternativa ao calendário)"
                    size="small"
                    type="number"
                    inputProps={{ min: 0, step: 1 }}
                    disabled={!podeEditarFormulario}
                    value={row.quantidade}
                    onChange={(e) => handleChangeItem(idx, 'quantidade', e.target.value)}
                    helperText="Use apenas se não for marcar dias no calendário."
                  />
                )}

                {HORAS_CODES.has(row.codigo) && (
                  <PatternFormat
                    customInput={TextField}
                    format="##:##"
                    mask="_"
                    allowEmptyFormatting
                    label="Horas e minutos"
                    size="small"
                    fullWidth
                    disabled={!podeEditarFormulario}
                    value={row.horas}
                    onValueChange={(vals) => handleChangeItem(idx, 'horas', vals.formattedValue)}
                    placeholder="00:00"
                    helperText="Formato HH:MM (ex.: 02:30 para 2h30min)."
                  />
                )}

                {(row.codigo === 'ADICIONAL_NOTURNO' || row.codigo === 'OUTRO') && (
                  <>
                    <TextField
                      label="Descrição"
                      size="small"
                      fullWidth
                      disabled={!podeEditarFormulario}
                      value={row.descricao}
                      onChange={(e) => handleChangeItem(idx, 'descricao', e.target.value)}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Quantidade"
                        size="small"
                        type="number"
                        fullWidth
                        disabled={!podeEditarFormulario}
                        value={row.quantidade}
                        onChange={(e) => handleChangeItem(idx, 'quantidade', e.target.value)}
                      />
                      <TextField
                        label="Valor"
                        size="small"
                        type="text"
                        fullWidth
                        disabled={!podeEditarFormulario}
                        value={row.valor}
                        onChange={(e) => handleChangeItem(idx, 'valor', e.target.value)}
                      />
                    </Stack>
                  </>
                )}

                <TextField
                  label="Observação deste apontamento"
                  size="small"
                  fullWidth
                  disabled={!podeEditarFormulario}
                  value={row.observacao}
                  onChange={(e) => handleChangeItem(idx, 'observacao', e.target.value)}
                />
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Button
          startIcon={<Iconify icon="solar:add-circle-bold" />}
          onClick={handleAddLinha}
          sx={{ mt: 2, borderRadius: 2 }}
          variant="outlined"
          disabled={!podeEditarFormulario}
          fullWidth={embedded}
        >
          Adicionar outro lançamento
        </Button>

        <TextField
          label={embedded ? 'Recado para o escritório (opcional)' : 'Observações gerais da competência'}
          fullWidth
          multiline
          rows={2}
          disabled={!podeEditarFormulario}
          value={observacoesGerais}
          onChange={(e) => setObservacoesGerais(e.target.value)}
          sx={{ mt: 2 }}
          placeholder={embedded ? 'Ex.: competência conferida com o gestor…' : ''}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            mt: 3,
            p: embedded ? 2 : 0,
            borderRadius: 2,
            ...(embedded
              ? {
                  bgcolor: alpha(theme.palette.success.main, 0.06),
                  border: (t) => `1px solid ${alpha(t.palette.success.main, 0.2)}`,
                }
              : {}),
          }}
        >
          <LoadingButton
            variant="contained"
            loading={saving || loadingR}
            onClick={handleSalvar}
            size="large"
            disabled={!podeEditarFormulario}
            sx={{ borderRadius: 2, minHeight: 48, ...(embedded ? { flex: 1 } : {}) }}
            fullWidth={embedded}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
          >
            {embedded ? 'Salvar apontamentos' : 'Salvar competência'}
          </LoadingButton>
          {!embedded && (
            <Button
              component={RouterLink}
              href={fichaHref}
              variant="outlined"
              size="large"
              sx={{ borderRadius: 2, minHeight: 48 }}
            >
              Ficha do colaborador
            </Button>
          )}
          {embedded && (
            <Button
              component={RouterLink}
              href={fichaHref}
              variant="text"
              size="large"
              sx={{ color: 'text.secondary' }}
            >
              Ver ficha do colaborador
            </Button>
          )}
        </Stack>
      </Box>

      {!embedded && (
        <>
          <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
            Histórico de competências
          </Typography>
          <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            {!historicoLista?.length && (
              <Typography variant="body2">Nenhuma competência registrada ainda.</Typography>
            )}
            {!!historicoLista?.length && (
              <Stack spacing={0.75}>
                {historicoLista.map((r) => (
                  <Typography key={r._id} variant="body2">
                    {`${String(r.mes).padStart(2, '0')}/${r.ano} — ${r.itens?.length || 0} apontamento(s)`}
                  </Typography>
                ))}
              </Stack>
            )}
          </Card>
        </>
      )}

      {embedded && !!historicoLista?.length && (
        <Alert severity="success" variant="outlined" icon={<Iconify icon="solar:cloud-check-bold-duotone" />} sx={{ mt: 2, borderRadius: 2 }}>
          {historicoLista[0]?.itens?.length
            ? `Já há ${historicoLista[0].itens.length} lançamento(s) salvos neste mês. Edite acima e salve de novo para atualizar.`
            : 'Há registro salvo neste mês.'}
        </Alert>
      )}

      {embedded && !historicoLista?.length && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
          Nenhum salvamento ainda neste mês. Preencha e use &quot;Salvar apontamentos&quot;.
        </Typography>
      )}
    </Box>
  );
}
