'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import ToggleButton from '@mui/material/ToggleButton';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { formatClienteCodigoRazao } from 'src/utils/formatter';

import { downloadGuiaFiscal, visualizarGuiaFiscal } from 'src/actions/guias-fiscais';
import {
  finalizarLote,
  getLoteDetalhe,
  emitirGuiaDctfWeb,
  emitirLoteDctfWeb,
  listarLotesAtivos,
  consultarStatusLote,
  getRelatorioDctfWeb,
  listarHistoricoLotes,
} from 'src/actions/dctf-web';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { traduzirErroDctf } from 'src/sections/fiscal/utils/dctf-erro';
import { MESES_NOME_PT, MESES_COMPETENCIA_OPTIONS } from 'src/sections/guias-fiscais/utils';

import { SelecionarClientesDialog } from './selecionar-clientes-dialog';

const CATEGORIAS = [
  { value: 'GERAL_MENSAL', label: 'Geral Mensal (PJ)', code: 40 },
  { value: 'PF_MENSAL', label: 'Pessoa Física Mensal', code: 50 },
  { value: 'GERAL_13o_SALARIO', label: '13º Salário Geral', code: 41 },
  { value: 'PF_13o_SALARIO', label: '13º Salário PF', code: 51 },
];

const CATEGORIAS_SEM_MES = ['GERAL_13o_SALARIO', 'PF_13o_SALARIO'];

// ─── Sistema de Origem (idsSistemaOrigem) ─────────────────────────────────
// Filtro OPCIONAL que separa os débitos da folha (eSocial) dos débitos fiscais
// (EFD-Reinf RET). Nenhum selecionado = guia completa (todos os débitos).
const ID_ESOCIAL = 1;
const ID_EFD_REINF_RET = 7;

// Retenções fiscais (ID 7) só existem na DCTFWeb de Lucro Presumido/Real. No
// Simples, esses tributos (PIS/COFINS/CSLL/IRPJ) vão no DAS.
const REGIMES_COM_FISCAL = ['presumido', 'real'];
const REGIMES_SIMPLES = ['simples', 'simei'];

const SISTEMAS_ORIGEM = [
  {
    id: ID_ESOCIAL,
    label: 'Folha · eSocial',
    desc: 'INSS patronal, INSS retido, Terceiros e IRRF da folha',
    icon: 'solar:users-group-rounded-bold-duotone',
    somenteFiscal: false,
  },
  // TEMP: opção de Retenções (EFD-Reinf) removida da UI enquanto a REINF não é
  // reativada. Para reativar: descomentar o item abaixo.
  // {
  //   id: ID_EFD_REINF_RET,
  //   label: 'Retenções Fiscais · EFD-Reinf',
  //   desc: 'PIS, COFINS, CSLL e IRPJ de notas fiscais',
  //   icon: 'solar:bill-list-bold-duotone',
  //   somenteFiscal: true,
  // },
];

const regimePodeFiscal = (regime) => REGIMES_COM_FISCAL.includes(regime);

/**
 * Seletor opcional de Sistema de Origem. Mostra o checkbox de Retenções Fiscais
 * apenas quando `podeFiscal` é verdadeiro (Lucro Presumido/Real).
 */
function OrigensSelector({ value, onChange, podeFiscal, avisoSimples, theme }) {
  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  const opcoes = SISTEMAS_ORIGEM.filter((o) => podeFiscal || !o.somenteFiscal);
  const nenhum = value.length === 0;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: alpha(theme.palette.background.default, 0.4),
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
        <Iconify icon="solar:filter-bold-duotone" width={18} sx={{ color: 'warning.main' }} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          Tipos de guia a gerar (opcional)
        </Typography>
      </Stack>

      <FormGroup row sx={{ gap: 1 }}>
        {opcoes.map((o) => (
          <FormControlLabel
            key={o.id}
            control={
              <Checkbox
                size="small"
                color="warning"
                checked={value.includes(o.id)}
                onChange={() => toggle(o.id)}
              />
            }
            label={
              <Tooltip title={o.desc} placement="top">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Iconify icon={o.icon} width={18} sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2">{o.label}</Typography>
                </Stack>
              </Tooltip>
            }
            sx={{ mr: 1 }}
          />
        ))}
      </FormGroup>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        {nenhum
          ? 'Nenhum selecionado — a guia completa (todos os débitos) será emitida.'
          : 'A guia trará apenas os débitos das origens selecionadas.'}
      </Typography>

      {avisoSimples && (
        <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <Iconify icon="solar:info-circle-bold" width={14} />
          Clientes do Simples no lote receberão apenas a guia da folha (eSocial); as retenções fiscais são ignoradas.
        </Typography>
      )}
    </Box>
  );
}

const STATUS_ICONS = {
  completed: 'solar:check-circle-bold-duotone',
  failed: 'solar:close-circle-bold-duotone',
  active: 'solar:clock-circle-bold-duotone',
  waiting: 'solar:hourglass-line-duotone',
  delayed: 'solar:hourglass-line-duotone',
  paused: 'solar:pause-circle-bold-duotone',
};

const STATUS_COLORS = {
  completed: 'success',
  failed: 'error',
  active: 'warning',
  waiting: 'default',
  delayed: 'default',
  paused: 'default',
};

const STATUS_LABELS = {
  completed: 'Sucesso',
  failed: 'Erro',
  active: 'Processando',
  waiting: 'Aguardando',
  delayed: 'Aguardando',
  paused: 'Pausado',
};

const getMesNome = (mes) => MESES_NOME_PT[parseInt(mes, 10) - 1] || mes;

const getCategoriaLabel = (value) => CATEGORIAS.find((c) => c.value === value)?.label || value;

// 'AAAAMM' -> { anoPA, mesPA }; 'AAAA' (13º) -> { anoPA, mesPA: undefined }
function parseCompetencia(competencia) {
  const c = String(competencia || '').replace(/\D/g, '');
  if (c.length === 6) return { anoPA: c.slice(0, 4), mesPA: c.slice(4, 6) };
  if (c.length === 4) return { anoPA: c, mesPA: undefined };
  return { anoPA: '', mesPA: undefined };
}

function fmtCompetencia(competencia) {
  const { anoPA, mesPA } = parseCompetencia(competencia);
  if (!anoPA) return competencia;
  return mesPA ? `${getMesNome(mesPA)}/${anoPA}` : `13º ${anoPA}`;
}

function apiErrMsg(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.response?.data?.message || err.message || 'Erro na operação';
}

export function FiscalDctfWebPanel({
  clientes,
  loadingClientes,
  clienteParam,
  selectedCliente,
  onClienteChange,
  loteParam,
}) {
  const theme = useTheme();

  const [modo, setModo] = useState('individual');

  const [categoria, setCategoria] = useState('GERAL_MENSAL');
  const [origens, setOrigens] = useState([]); // idsSistemaOrigem — [] = guia completa
  const [mes, setMes] = useState(String(new Date().getMonth()).padStart(2, '0'));
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [emitindo, setEmitindo] = useState(false);
  const [clientesLote, setClientesLote] = useState([]);
  const [dialogClienteOpen, setDialogClienteOpen] = useState(false);

  const [loteJobIds, setLoteJobIds] = useState(null);
  const [loteStatus, setLoteStatus] = useState(null);
  const [loteLoteId, setLoteLoteId] = useState(null);
  const pollingRef = useRef(null);

  // Consultar Realizadas
  const [relMes, setRelMes] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [relAno, setRelAno] = useState(String(new Date().getFullYear()));
  const [relClientes, setRelClientes] = useState([]);
  const [relDialogClienteOpen, setRelDialogClienteOpen] = useState(false);
  const [relConsultando, setRelConsultando] = useState(false);
  const [relResultado, setRelResultado] = useState(null);

  // Histórico de lotes (últimas filas) — auto-carregado ao abrir a aba
  const [historicoLotes, setHistoricoLotes] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [openLoteIds, setOpenLoteIds] = useState(() => new Set());
  const [loteDetalheMap, setLoteDetalheMap] = useState({});
  const [loadingDetalheIds, setLoadingDetalheIds] = useState(() => new Set());
  const [reemitindoKeys, setReemitindoKeys] = useState(() => new Set());

  const loteAtivo = Array.isArray(loteJobIds) && loteJobIds.length > 0;
  const loteFinalizado = loteStatus && (loteStatus.concluidas + loteStatus.falhas) >= loteStatus.total;
  const precisaMes = !CATEGORIAS_SEM_MES.includes(categoria);
  const relCompetencia = `${relAno}${relMes}`;

  // Sistema de Origem: fiscal (ID 7) só para Presumido/Real.
  // Individual → regime do cliente selecionado; Lote → se algum cliente do lote comporta fiscal.
  const podeFiscal =
    modo === 'lote'
      ? clientesLote.some((c) => regimePodeFiscal(c.regimeTributario))
      : regimePodeFiscal(selectedCliente?.regimeTributario);

  // No lote, avisa quando há clientes do Simples junto com fiscal selecionado.
  const avisoSimplesLote =
    modo === 'lote' &&
    origens.includes(ID_EFD_REINF_RET) &&
    clientesLote.some((c) => REGIMES_SIMPLES.includes(c.regimeTributario));

  // Mantém a seleção coerente: retira o ID 7 quando o contexto não permite fiscal.
  useEffect(() => {
    if (!podeFiscal && origens.includes(ID_EFD_REINF_RET)) {
      setOrigens((prev) => prev.filter((x) => x !== ID_EFD_REINF_RET));
    }
  }, [podeFiscal, origens]);

  // Cross-session: detectar lote ativo ao montar o componente
  // (deep-link para uma fila específica tem precedência — ver efeito mais abaixo).
  useEffect(() => {
    if (loteParam) return;
    const checkLotes = async () => {
      try {
        const res = await listarLotesAtivos();
        if (res.data?.length > 0) {
          const lote = res.data[0];
          setLoteJobIds(lote.jobIds);
          setLoteLoteId(lote.loteId);
          setClientesLote(
            lote.clientes.map((c) => ({ _id: c._id, razaoSocial: c.nome, nome: c.nome }))
          );
          setModo('lote');
        }
      } catch {
        // sem lote ativo — normal
      }
    };
    checkLotes();
  }, [loteParam]);

  // Polling do lote
  useEffect(() => {
    if (loteAtivo && !loteFinalizado) {
      const poll = async () => {
        try {
          const res = await consultarStatusLote({ jobIds: loteJobIds });
          if (res.data?.success) {
            setLoteStatus(res.data);
            if ((res.data.concluidas + res.data.falhas) >= res.data.total) {
              // Lote finalizado — manter no Redis como processando até o usuário
              // limpar explicitamente, mas podemos atualizar o status
            }
          }
        } catch {
          // keep polling
        }
      };

      poll();
      pollingRef.current = setInterval(poll, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [loteAtivo, loteFinalizado, loteJobIds]);

  // Carrega o histórico de filas (lote e individuais) da aba "Consultar Realizadas".
  const carregarHistorico = useCallback(async () => {
    setCarregandoHistorico(true);
    try {
      const res = await listarHistoricoLotes({ page: 1, limit: 20 });
      setHistoricoLotes(res.data?.lotes || []);
    } catch {
      setHistoricoLotes([]);
    } finally {
      setCarregandoHistorico(false);
    }
  }, []);

  // Auto-carrega o histórico ao abrir a aba "Consultar Realizadas".
  useEffect(() => {
    if (modo !== 'consultar') return;
    carregarHistorico();
  }, [modo, carregarHistorico]);

  const carregarDetalheLote = useCallback(async (loteId) => {
    setLoadingDetalheIds((prev) => new Set(prev).add(loteId));
    try {
      const res = await getLoteDetalhe(loteId);
      setLoteDetalheMap((prev) => ({ ...prev, [loteId]: res.data }));
    } catch (err) {
      toast.error(apiErrMsg(err));
    } finally {
      setLoadingDetalheIds((prev) => {
        const next = new Set(prev);
        next.delete(loteId);
        return next;
      });
    }
  }, []);

  const toggleLoteExpand = useCallback(
    (loteId) => {
      setOpenLoteIds((prev) => {
        const next = new Set(prev);
        if (next.has(loteId)) next.delete(loteId);
        else next.add(loteId);
        return next;
      });
      if (!loteDetalheMap[loteId]) carregarDetalheLote(loteId);
    },
    [loteDetalheMap, carregarDetalheLote]
  );

  // Deep-link ?lote=<id> (notificação de fila DCTFWeb finalizada): abre a aba
  // "Consultar Realizadas" já com a fila expandida e o detalhe carregado.
  useEffect(() => {
    if (!loteParam) return;
    setModo('consultar');
    setOpenLoteIds((prev) => new Set(prev).add(loteParam));
    carregarDetalheLote(loteParam);
  }, [loteParam, carregarDetalheLote]);

  const handleReemitirCliente = useCallback(async (lote, detalhe) => {
    const key = `${lote.loteId}:${detalhe.clienteId}`;
    const { anoPA, mesPA } = parseCompetencia(lote.competencia);
    const precisa = !CATEGORIAS_SEM_MES.includes(lote.categoria);
    setReemitindoKeys((prev) => new Set(prev).add(key));
    try {
      const res = await emitirGuiaDctfWeb(detalhe.clienteId, {
        categoria: lote.categoria,
        anoPA,
        mesPA: precisa ? mesPA : undefined,
      });
      if (res.data?.success) {
        toast.success('Reemissão enfileirada. Atualize o detalhe em instantes para ver o arquivo.');
      } else {
        toast.error('Resposta inesperada do servidor.');
      }
    } catch (err) {
      toast.error(apiErrMsg(err));
    } finally {
      setReemitindoKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, []);

  const handleVerArquivo = useCallback(async (detalhe) => {
    try {
      await visualizarGuiaFiscal(detalhe.guiaFiscalId, detalhe.nomeArquivo);
    } catch (err) {
      toast.error(apiErrMsg(err));
    }
  }, []);

  const handleCategoriaChange = (e) => {
    const novaCategoria = e.target.value;
    setCategoria(novaCategoria);
    if (CATEGORIAS_SEM_MES.includes(novaCategoria)) {
      setMes('');
    } else if (!mes) {
      setMes(String(new Date().getMonth() + 1).padStart(2, '0'));
    }
  };

  const handleLimparPainelLote = async () => {
    if (loteLoteId) {
      try {
        await finalizarLote(loteLoteId);
      } catch {
        // best-effort
      }
    }
    setLoteJobIds(null);
    setLoteStatus(null);
    setLoteLoteId(null);
    setClientesLote([]);
  };

  const handleEmitirGuia = useCallback(async () => {
    if (!clienteParam) {
      toast.error('Selecione um cliente.');
      return;
    }

    const anoDigits = String(ano).replace(/\D/g, '');
    if (anoDigits.length !== 4) {
      toast.error('Informe um ano válido.');
      return;
    }

    if (precisaMes && (!mes || mes.length !== 2)) {
      toast.error('Informe o mês.');
      return;
    }

    setEmitindo(true);
    try {
      const res = await emitirGuiaDctfWeb(clienteParam, {
        categoria,
        anoPA: anoDigits,
        mesPA: precisaMes ? mes : undefined,
        idsSistemaOrigem: origens,
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Guia enfileirada.');
        // A emissão individual vira uma fila de 1 cliente — recarrega o histórico
        // para que apareça em "Consultar Realizadas → Últimas filas processadas".
        carregarHistorico();
      } else {
        toast.error('Resposta inesperada.');
      }
    } catch (err) {
      toast.error(apiErrMsg(err));
    } finally {
      setEmitindo(false);
    }
  }, [clienteParam, categoria, ano, mes, precisaMes, origens, carregarHistorico]);

  const handleEmitirLote = useCallback(async () => {
    if (!clientesLote.length) {
      toast.error('Selecione pelo menos um cliente.');
      return;
    }

    const anoDigits = String(ano).replace(/\D/g, '');
    if (anoDigits.length !== 4) {
      toast.error('Informe um ano válido.');
      return;
    }

    if (precisaMes && (!mes || mes.length !== 2)) {
      toast.error('Informe o mês.');
      return;
    }

    setEmitindo(true);
    try {
      const res = await emitirLoteDctfWeb({
        clienteIds: clientesLote.map((c) => c._id),
        categoria,
        anoPA: anoDigits,
        mesPA: precisaMes ? mes : undefined,
        idsSistemaOrigem: origens,
      });

      if (res.data?.success) {
        const { jobIds: ids, loteId } = res.data;
        setLoteJobIds(ids || []);
        if (loteId) setLoteLoteId(loteId);
        setLoteStatus(null);
      } else {
        toast.error('Resposta inesperada do servidor.');
      }
    } catch (err) {
      toast.error(apiErrMsg(err));
    } finally {
      setEmitindo(false);
    }
  }, [clientesLote, categoria, ano, mes, precisaMes, origens]);

  // ─── Mapa clienteId → job state ──────────────────────────────────────
  const jobStatusMap = {};
  if (loteStatus?.jobs) {
    loteStatus.jobs.forEach((job) => {
      jobStatusMap[job.clienteId] = job.state;
    });
  }

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <Stack spacing={4}>
      <Card
        sx={{
          p: 4,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
          boxShadow: theme.customShadows?.z4,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
        }}
      >
        <Stack spacing={3}>
          {/* CABEÇALHO */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:document-bold-duotone" width={28} sx={{ color: 'warning.main' }} />
              DCTFWeb · DARF Previdenciário
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Emita guias de arrecadação do INSS via DCTFWeb ou consulte o relatório de execução mensal.
            </Typography>
          </Box>

          <ToggleButtonGroup
            color="warning"
            value={modo}
            exclusive
            onChange={(e, val) => {
              if (val !== null) setModo(val);
            }}
            size="small"
            sx={{ bgcolor: 'background.paper', alignSelf: 'flex-start' }}
          >
            <ToggleButton value="individual" sx={{ px: 2 }}>
              <Iconify icon="solar:user-circle-bold" width={18} sx={{ mr: 1 }} /> Individual
            </ToggleButton>
            <ToggleButton value="lote" sx={{ px: 2 }}>
              <Iconify icon="solar:users-group-rounded-bold" width={18} sx={{ mr: 1 }} /> Lote
            </ToggleButton>
            <ToggleButton value="consultar" sx={{ px: 2 }}>
              <Iconify icon="solar:chart-square-bold-duotone" width={18} sx={{ mr: 1 }} /> Consultar Realizadas
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* ═══════════════ INDIVIDUAL ═══════════════ */}
          {modo === 'individual' && (
            <>
              <Box
                rowGap={2.5}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{ xs: '1fr', md: '1fr 220px 100px 120px' }}
                alignItems="flex-start"
              >
                <Autocomplete
                  options={clientes}
                  loading={loadingClientes}
                  value={selectedCliente}
                  onChange={onClienteChange}
                  getOptionLabel={(option) => formatClienteCodigoRazao(option)}
                  isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
                  renderInput={(params) => (
                    <TextField {...params} label="Cliente" placeholder="Código ou razão social" sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />
                  )}
                />

                <TextField select label="Categoria" value={categoria} onChange={handleCategoriaChange} sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                  {CATEGORIAS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>

                <TextField label="Ano" value={ano} onChange={(e) => setAno(e.target.value.replace(/\D/g, '').slice(0, 4))} inputProps={{ inputMode: 'numeric', maxLength: 4 }} sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />

                {precisaMes ? (
                  <TextField select label="Mês" value={mes} onChange={(e) => setMes(e.target.value)} sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                    {MESES_COMPETENCIA_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <Chip label="13º Salário — mês não aplicável" variant="soft" color="info" icon={<Iconify icon="solar:info-circle-bold" />} />
                )}
              </Box>

              <OrigensSelector value={origens} onChange={setOrigens} podeFiscal={podeFiscal} theme={theme} />

              <Box display="flex" justifyContent="flex-end" alignItems="center" flexWrap="wrap" gap={2}>
                <Button
                  size="large"
                  variant="contained"
                  color="warning"
                  onClick={handleEmitirGuia}
                  disabled={emitindo || !clienteParam}
                  startIcon={emitindo ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="solar:document-add-bold" />}
                >
                  Emitir Guia
                </Button>
              </Box>

              <Box>
                <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />} sx={{ borderRadius: 1.5 }}>
                  A guia será gerada via SerPro. Após o processamento, o PDF estará disponível na pasta do cliente.
                </Alert>

                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 1.5,
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.background.default, 0.4),
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 700 }}>
                    <Iconify icon="solar:folder-path-bold" width={16} sx={{ mr: 0.75, verticalAlign: 'middle', color: 'warning.main' }} />
                    Estrutura do arquivo na pasta do cliente:
                  </Typography>

                  <Box sx={{ '& > div': { py: 0.15 }, fontSize: '0.825rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:folder-bold" width={18} sx={{ color: 'warning.main', flexShrink: 0 }} />
                      <span>
                        {selectedCliente
                          ? (selectedCliente.razaoSocial || selectedCliente.nome || 'Cliente')
                          : '[Cliente]'}
                      </span>
                    </Box>
                    <Box sx={{ pl: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:folder-bold" width={18} sx={{ color: 'warning.main', flexShrink: 0 }} />
                      <span>Departamento pessoal</span>
                    </Box>
                    <Box sx={{ pl: 6, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:folder-bold" width={18} sx={{ color: 'warning.main', flexShrink: 0 }} />
                      <span>{ano}</span>
                    </Box>
                    {precisaMes && (
                      <Box sx={{ pl: 9, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="solar:folder-bold" width={18} sx={{ color: 'warning.main', flexShrink: 0 }} />
                        <span>{getMesNome(mes)}</span>
                      </Box>
                    )}
                    <Box sx={{ pl: precisaMes ? 12 : 9, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:file-text-bold" width={18} sx={{ color: 'primary.main', flexShrink: 0 }} />
                      <strong>
                        INSS-{ano}{precisaMes ? `-${mes}` : ''}.pdf
                      </strong>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </>
          )}

          {/* ═══════════════ LOTE ═══════════════ */}
          {modo === 'lote' && (
            <>
              {!loteAtivo && (
                <>
                  <Box
                    rowGap={2.5}
                    columnGap={2}
                    display="grid"
                    gridTemplateColumns={{ xs: '1fr', md: '1fr 220px 100px 120px' }}
                    alignItems="flex-start"
                  >
                    <Box sx={{ width: '100%' }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        size="large"
                        onClick={() => setDialogClienteOpen(true)}
                        startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
                        sx={{
                          height: 56,
                          justifyContent: 'flex-start',
                          px: 2,
                          borderStyle: 'dashed',
                          borderWidth: 2,
                          bgcolor: clientesLote.length > 0 ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                        }}
                      >
                        {clientesLote.length > 0
                          ? `${clientesLote.length} cliente${clientesLote.length !== 1 ? 's' : ''} selecionado${clientesLote.length !== 1 ? 's' : ''}`
                          : 'Selecionar clientes para emissão em lote'}
                      </Button>

                      {clientesLote.length > 0 && (
                        <Box sx={{ mt: 1.5, maxHeight: 140, overflowY: 'auto', p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {clientesLote.map((empresa) => (
                              <Chip
                                key={empresa._id}
                                label={empresa.razaoSocial || empresa.nome}
                                size="small"
                                color="primary"
                                variant="outlined"
                                onDelete={() => setClientesLote(clientesLote.filter((c) => c._id !== empresa._id))}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>

                    <TextField select label="Categoria" value={categoria} onChange={handleCategoriaChange} sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                      {CATEGORIAS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </TextField>

                    <TextField label="Ano" value={ano} onChange={(e) => setAno(e.target.value.replace(/\D/g, '').slice(0, 4))} inputProps={{ inputMode: 'numeric', maxLength: 4 }} sx={{ bgcolor: 'background.paper', borderRadius: 1 }} />

                    {precisaMes ? (
                      <TextField select label="Mês" value={mes} onChange={(e) => setMes(e.target.value)} sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                        {MESES_COMPETENCIA_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <Chip label="13º Salário — mês não aplicável" variant="soft" color="info" icon={<Iconify icon="solar:info-circle-bold" />} />
                    )}
                  </Box>

                  <OrigensSelector
                    value={origens}
                    onChange={setOrigens}
                    podeFiscal={podeFiscal}
                    avisoSimples={avisoSimplesLote}
                    theme={theme}
                  />

                  <Box display="flex" justifyContent="flex-end" alignItems="center" flexWrap="wrap" gap={2}>
                    <Button
                      size="large"
                      variant="contained"
                      color="warning"
                      onClick={handleEmitirLote}
                      disabled={emitindo || !clientesLote.length}
                      startIcon={emitindo ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="solar:document-add-bold" />}
                    >
                      Emitir Lote ({clientesLote.length})
                    </Button>
                  </Box>
                </>
              )}

              {/* PAINEL DE PROGRESSO DO LOTE */}
              {loteAtivo && (
                <Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.background.default, 0.6), borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">
                        {loteFinalizado ? 'Processamento Finalizado' : 'Processando Emissão em Lote...'}
                      </Typography>
                      {loteStatus && (
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          {loteStatus.concluidas + loteStatus.falhas} / {loteStatus.total}
                        </Typography>
                      )}
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={loteStatus ? ((loteStatus.concluidas + loteStatus.falhas) / loteStatus.total) * 100 : 0}
                      color={loteFinalizado && loteStatus?.falhas === 0 ? 'success' : (loteStatus?.falhas > 0 ? 'error' : 'warning')}
                      sx={{ height: 8, borderRadius: 4 }}
                    />

                    <Stack direction="row" spacing={2}>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>{loteStatus?.concluidas || 0} sucesso</Typography>
                      <Typography variant="caption" sx={{ color: 'error.main' }}>{loteStatus?.falhas || 0} erros</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {Math.max(0, (loteStatus?.total || 0) - (loteStatus?.concluidas || 0) - (loteStatus?.falhas || 0))} pendentes
                      </Typography>
                    </Stack>

                    {/* TABELA POR CLIENTE */}
                    {clientesLote.length > 0 && loteStatus?.jobs && (
                      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', maxHeight: 320 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                              <TableCell sx={{ fontWeight: 700, width: 140 }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {clientesLote.map((cliente) => {
                              const state = jobStatusMap[cliente._id] || 'waiting';
                              return (
                                <TableRow key={cliente._id} hover>
                                  <TableCell>{cliente.razaoSocial || cliente.nome || cliente._id}</TableCell>
                                  <TableCell>
                                    <Chip
                                      size="small"
                                      variant="soft"
                                      color={STATUS_COLORS[state] || 'default'}
                                      icon={<Iconify icon={STATUS_ICONS[state] || 'solar:question-circle-bold-duotone'} width={16} />}
                                      label={STATUS_LABELS[state] || state}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                    {loteFinalizado && (
                      <Alert
                        severity={loteStatus.falhas > 0 ? 'warning' : 'success'}
                        action={<Button color="inherit" size="small" onClick={handleLimparPainelLote}>Nova Emissão</Button>}
                      >
                        O lote foi processado. Foram emitidas <strong>{loteStatus.concluidas}</strong> guias com sucesso e ocorreram <strong>{loteStatus.falhas}</strong> falhas.
                      </Alert>
                    )}
                  </Stack>
                </Box>
              )}

              <SelecionarClientesDialog
                open={dialogClienteOpen}
                onClose={() => setDialogClienteOpen(false)}
                clientes={clientes}
                selected={clientesLote}
                onConfirm={(selectedClientes) => setClientesLote(selectedClientes)}
              />
            </>
          )}

          {/* ═══════════════ CONSULTAR REALIZADAS ═══════════════ */}
          {modo === 'consultar' && (
            <Box>
              <Stack spacing={3}>
                <Box
                  rowGap={2.5}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{ xs: '1fr', md: '1fr 160px 120px auto' }}
                  alignItems="center"
                >
                  <Box sx={{ width: '100%' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      size="large"
                      onClick={() => setRelDialogClienteOpen(true)}
                      startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
                      sx={{
                        height: 56,
                        justifyContent: 'flex-start',
                        px: 2,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        bgcolor: relClientes.length > 0 ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                      }}
                    >
                      {relClientes.length > 0
                        ? `${relClientes.length} cliente${relClientes.length !== 1 ? 's' : ''} selecionado${relClientes.length !== 1 ? 's' : ''}`
                        : 'Todos os clientes (sem filtro)'}
                    </Button>
                  </Box>

                  <TextField
                    select
                    label="Mês"
                    value={relMes}
                    onChange={(e) => setRelMes(e.target.value)}
                    sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                  >
                    {MESES_COMPETENCIA_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Ano"
                    value={relAno}
                    onChange={(e) => setRelAno(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    inputProps={{ inputMode: 'numeric', maxLength: 4 }}
                    sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                  />

                  <Button
                    size="large"
                    variant="contained"
                    color="warning"
                    onClick={async () => {
                      setRelConsultando(true);
                      setRelResultado(null);
                      try {
                        const res = await getRelatorioDctfWeb({
                          competencia: relCompetencia,
                          clienteIds: relClientes.map((c) => c._id),
                        });
                        setRelResultado(res.data);
                      } catch (err) {
                        toast.error(apiErrMsg(err));
                      } finally {
                        setRelConsultando(false);
                      }
                    }}
                    disabled={relConsultando}
                    startIcon={relConsultando ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="solar:magnifer-bold" />}
                    sx={{ height: 56, minWidth: 0 }}
                  >
                    Consultar
                  </Button>
                </Box>

                {relResultado && (
                  <>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      <Chip size="medium" variant="soft" color="default" label={`Total: ${relResultado.total}`} />
                      <Chip size="medium" variant="soft" color="success" label={`Sucesso: ${relResultado.sucesso}`} />
                      <Chip size="medium" variant="soft" color="error" label={`Erro: ${relResultado.erro}`} />
                      <Chip size="medium" variant="soft" color="warning" label={`Não processados: ${relResultado.naoProcessados}`} />
                    </Stack>

                    {relResultado.detalhes?.length > 0 && (
                      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Tempo</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Erro</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {relResultado.detalhes.map((d) => (
                              <TableRow key={d.clienteId} hover>
                                <TableCell>{d.razaoSocial || d.clienteId}</TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    variant="soft"
                                    color={
                                      d.status === 'SUCESSO' ? 'success' :
                                        d.status === 'ERRO' ? 'error' : 'warning'
                                    }
                                    label={
                                      d.status === 'SUCESSO' ? 'Sucesso' :
                                        d.status === 'ERRO' ? 'Erro' : 'Não processado'
                                    }
                                    icon={
                                      <Iconify
                                        icon={
                                          d.status === 'SUCESSO' ? 'solar:check-circle-bold-duotone' :
                                            d.status === 'ERRO' ? 'solar:close-circle-bold-duotone' : 'solar:clock-circle-bold-duotone'
                                        }
                                        width={16}
                                      />
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {d.criadoEm ? new Date(d.criadoEm).toLocaleString('pt-BR') : '—'}
                                </TableCell>
                                <TableCell>
                                  {d.tempoResposta ? `${d.tempoResposta}ms` : '—'}
                                </TableCell>
                                <TableCell sx={{ maxWidth: 200 }}>
                                  {d.erro ? (
                                    <Tooltip title={d.erro}>
                                      <Box
                                        component="span"
                                        sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'help' }}
                                      >
                                        {traduzirErroDctf(d.erro)}
                                      </Box>
                                    </Tooltip>
                                  ) : (
                                    '—'
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </>
                )}

                <Divider sx={{ borderStyle: 'dashed' }} />

                {/* ─── HISTÓRICO: ÚLTIMAS FILAS ─── */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Iconify icon="solar:history-bold-duotone" width={20} sx={{ color: 'warning.main' }} />
                    <Typography variant="subtitle2">Últimas filas processadas</Typography>
                    {carregandoHistorico && <CircularProgress size={16} />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Histórico das emissões individuais e em lote. Expanda uma fila para ver os clientes, acessar o arquivo na pasta ou reemitir.
                  </Typography>

                  {!carregandoHistorico && historicoLotes.length === 0 && (
                    <Alert severity="info" variant="outlined" sx={{ borderRadius: 1.5 }}>
                      Nenhuma fila registrada ainda.
                    </Alert>
                  )}

                  <Stack spacing={1.5}>
                    {historicoLotes.map((lote) => {
                      const aberto = openLoteIds.has(lote.loteId);
                      const detalhe = loteDetalheMap[lote.loteId];
                      const carregandoDet = loadingDetalheIds.has(lote.loteId);
                      return (
                        <Paper key={lote.loteId} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                          <Box
                            onClick={() => toggleLoteExpand(lote.loteId)}
                            sx={{
                              p: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <Iconify icon={aberto ? 'eva:chevron-down-fill' : 'eva:chevron-right-fill'} width={20} />
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                                <Chip
                                  size="small"
                                  variant="soft"
                                  color={lote.tipo === 'individual' ? 'info' : 'primary'}
                                  label={lote.tipo === 'individual' ? 'Individual' : 'Lote'}
                                />
                                <Typography variant="subtitle2" noWrap>
                                  {getCategoriaLabel(lote.categoria)} · {fmtCompetencia(lote.competencia)}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {lote.criadoEm ? new Date(lote.criadoEm).toLocaleString('pt-BR') : '—'} · {lote.totalClientes} cliente{lote.totalClientes !== 1 ? 's' : ''}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.75} flexShrink={0} alignItems="center">
                              <Chip size="small" variant="soft" color="success" label={`${lote.totais?.sucesso ?? 0}`} icon={<Iconify icon="solar:check-circle-bold-duotone" width={14} />} />
                              <Chip size="small" variant="soft" color="error" label={`${lote.totais?.erro ?? 0}`} icon={<Iconify icon="solar:close-circle-bold-duotone" width={14} />} />
                              {lote.totais?.pendente > 0 && (
                                <Chip size="small" variant="soft" color="warning" label={`${lote.totais.pendente}`} icon={<Iconify icon="solar:clock-circle-bold-duotone" width={14} />} />
                              )}
                              <Chip
                                size="small"
                                variant="outlined"
                                color={lote.status === 'finalizado' ? 'default' : 'warning'}
                                label={lote.status === 'finalizado' ? 'Finalizado' : 'Processando'}
                              />
                            </Stack>
                          </Box>

                          <Collapse in={aberto} unmountOnExit>
                            <Divider />
                            <Box sx={{ p: 2 }}>
                              {carregandoDet && (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <CircularProgress size={16} />
                                  <Typography variant="caption">Carregando detalhe...</Typography>
                                </Stack>
                              )}
                              {!carregandoDet && detalhe && (
                                <>
                                  <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                                    <Button size="small" color="inherit" startIcon={<Iconify icon="solar:refresh-bold" />} onClick={() => carregarDetalheLote(lote.loteId)}>
                                      Atualizar
                                    </Button>
                                  </Stack>
                                  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                          <TableCell sx={{ fontWeight: 700 }}>Arquivo</TableCell>
                                          <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {detalhe.detalhes.map((d) => {
                                          const key = `${lote.loteId}:${d.clienteId}`;
                                          const reemitindo = reemitindoKeys.has(key);
                                          return (
                                            <TableRow key={d.clienteId} hover>
                                              <TableCell>{d.razaoSocial || d.clienteId}</TableCell>
                                              <TableCell>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                  <Chip
                                                    size="small"
                                                    variant="soft"
                                                    color={d.status === 'SUCESSO' ? 'success' : d.status === 'ERRO' ? 'error' : 'warning'}
                                                    label={d.status === 'SUCESSO' ? 'Sucesso' : d.status === 'ERRO' ? 'Erro' : 'Não processado'}
                                                  />
                                                  {d.status === 'ERRO' && (
                                                    <Tooltip title={traduzirErroDctf(d.erro)}>
                                                      <span style={{ display: 'inline-flex', cursor: 'help' }}>
                                                        <Iconify icon="solar:info-circle-bold" width={16} sx={{ color: 'error.main' }} />
                                                      </span>
                                                    </Tooltip>
                                                  )}
                                                </Stack>
                                              </TableCell>
                                              <TableCell>
                                                {d.arquivoDisponivel ? (
                                                  <Chip size="small" variant="soft" color="success" icon={<Iconify icon="solar:file-check-bold-duotone" width={14} />} label="Na pasta" />
                                                ) : (
                                                  <Chip size="small" variant="outlined" color="default" label="Sem arquivo" />
                                                )}
                                              </TableCell>
                                              <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                  {d.arquivoDisponivel && (
                                                    <>
                                                      <Tooltip title="Ver arquivo">
                                                        <IconButton size="small" color="primary" onClick={() => handleVerArquivo(d)}>
                                                          <Iconify icon="solar:eye-bold" width={18} />
                                                        </IconButton>
                                                      </Tooltip>
                                                      <Tooltip title="Baixar">
                                                        <IconButton size="small" onClick={() => downloadGuiaFiscal(d.guiaFiscalId, d.nomeArquivo)}>
                                                          <Iconify icon="solar:download-minimalistic-bold" width={18} />
                                                        </IconButton>
                                                      </Tooltip>
                                                    </>
                                                  )}
                                                  <Tooltip title={d.arquivoDisponivel ? 'Reemitir (substitui na pasta)' : 'Emitir e salvar na pasta'}>
                                                    <span>
                                                      <IconButton size="small" color="warning" disabled={reemitindo} onClick={() => handleReemitirCliente(lote, d)}>
                                                        {reemitindo ? <CircularProgress size={16} /> : <Iconify icon="solar:refresh-circle-bold" width={18} />}
                                                      </IconButton>
                                                    </span>
                                                  </Tooltip>
                                                </Stack>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </>
                              )}
                            </Box>
                          </Collapse>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Box>
              </Stack>

              <SelecionarClientesDialog
                open={relDialogClienteOpen}
                onClose={() => setRelDialogClienteOpen(false)}
                clientes={clientes}
                selected={relClientes}
                onConfirm={(selected) => setRelClientes(selected)}
              />
            </Box>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
