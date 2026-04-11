'use client';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import {
  usePortalApontamentosCompetenciaAno,
  adminReabrirCompetenciaApontamentos,
  portalFecharCompetenciaApontamentos,
  revalidatePortalApontamentosCompetencia,
} from 'src/actions/departamento-pessoal';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const NOMES_MES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const NOMES_MES_COMPLETO = [
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

const SITUACAO_META = {
  em_aberto: { label: 'Em aberto', color: 'warning' },
  validado_com_apontamentos: { label: 'Validado · com apontamentos', color: 'success' },
  validado_sem_apontamentos: { label: 'Validado · sem apontamentos', color: 'info' },
  encerrado_automaticamente: { label: 'Encerrado (prazo)', color: 'default' },
};

function errMsg(err) {
  if (typeof err === 'string') return err;
  return err?.response?.data?.message || err?.message || 'Erro ao processar';
}

function normalizeMesesRow(lista, anoRef) {
  const map = new Map((lista || []).map((d) => [d.mes, d]));
  return Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    const got = map.get(mes);
    if (got) return { ...got, ano: got.ano ?? anoRef, mes };
    return {
      ano: anoRef,
      mes,
      situacao: 'em_aberto',
      possuiAlgumApontamentoLancado: false,
      passouDoPrazo: false,
      dataLimiteEnvioISO: '',
      podeEditarRubricas: true,
    };
  });
}

/**
 * @param {object} props
 * @param {string} props.clienteProprietarioId
 * @param {number} [props.anoSincronizar] — quando definido (ex.: vindo da URL), alinha o seletor de ano.
 * @param {string} [props.funcionarioIdPreservar] — mantém na URL ao ir para lançamentos (deep link).
 * @param {boolean} [props.mostrarAtalhoPortalLancamento] — default true; no admin HUB use false.
 * @param {string} [props.hubTrabalharClienteId] — quando definido, exibe link para a página exclusiva de conferência no dashboard.
 * @param {boolean} [props.habilitarReabrirMesAdmin] — dashboard: permite reabrir mês já fechado para ajustes (API admin).
 */
export function PortalDpCompetenciaMensalPanel({
  clienteProprietarioId,
  anoSincronizar,
  funcionarioIdPreservar,
  mostrarAtalhoPortalLancamento = true,
  hubTrabalharClienteId,
  habilitarReabrirMesAdmin = false,
}) {
  const now = new Date();
  const [ano, setAno] = useState(anoSincronizar ?? now.getFullYear());

  useEffect(() => {
    if (anoSincronizar != null) setAno(anoSincronizar);
  }, [anoSincronizar]);

  const { data: lista, isLoading, error, mutate } = usePortalApontamentosCompetenciaAno(clienteProprietarioId, ano);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalheMes, setDetalheMes] = useState(null);
  const [fechando, setFechando] = useState(false);
  const [dialogReabrirOpen, setDialogReabrirOpen] = useState(false);
  const [reabrindo, setReabrindo] = useState(false);

  const gridMeses = useMemo(() => {
    if (!Array.isArray(lista)) return [];
    return normalizeMesesRow(lista, ano);
  }, [lista, ano]);

  if (!clienteProprietarioId) return null;

  const anosOpts = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  const abrirDetalhe = (det) => {
    setDetalheMes(det);
    setDialogOpen(true);
  };

  const handleFechar = async (modo) => {
    if (!clienteProprietarioId || !detalheMes) return;
    setFechando(true);
    try {
      await portalFecharCompetenciaApontamentos(clienteProprietarioId, ano, detalheMes.mes, { modo });
      toast.success(
        modo === 'declarar_sem_apontamentos'
          ? 'Mês declarado sem apontamentos.'
          : 'Mês finalizado com apontamentos.'
      );
      await mutate();
      await revalidatePortalApontamentosCompetencia(clienteProprietarioId);
      setDialogOpen(false);
      setDetalheMes(null);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setFechando(false);
    }
  };

  const handleReabrirMesConfirm = async () => {
    if (!clienteProprietarioId || !detalheMes || !habilitarReabrirMesAdmin) return;
    setReabrindo(true);
    try {
      await adminReabrirCompetenciaApontamentos(clienteProprietarioId, ano, detalheMes.mes);
      toast.success('Competência reaberta. O mês volta a ficar editável no portal e no HUB.');
      await mutate();
      await revalidatePortalApontamentosCompetencia(clienteProprietarioId);
      setDialogReabrirOpen(false);
      setDialogOpen(false);
      setDetalheMes(null);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setReabrindo(false);
    }
  };

  if (lista === null && !isLoading && !error) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        O resumo de competências por mês ainda não está disponível neste ambiente. Quando a API estiver
        atualizada, você verá aqui o status de envio de cada mês.
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {errMsg(error)}
      </Alert>
    );
  }

  return (
    <Card sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">Situação por mês</Typography>
          <Typography variant="body2" color="text.secondary">
            Veja se cada competência já foi enviada ou declarada para o escritório. Prazo limite conforme regras do
            sistema (mês seguinte à competência).
          </Typography>
        </Box>
        <TextField
          select
          size="small"
          label="Ano"
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          sx={{ minWidth: 120 }}
        >
          {anosOpts.map((a) => (
            <MenuItem key={a} value={a}>
              {a}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {isLoading && <Typography variant="body2">Carregando competências…</Typography>}

      {!isLoading && Array.isArray(lista) && lista.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Nenhum dado de competência para este ano ainda.
        </Typography>
      )}

      {!isLoading && gridMeses.length > 0 && (
        <Grid container spacing={1.5}>
          {gridMeses.map((det) => {
            const meta = SITUACAO_META[det.situacao] || {
              label: det.situacao || '—',
              color: 'default',
            };
            const temLancamento = Boolean(det.possuiAlgumApontamentoLancado);
            const prazo = det.dataLimiteEnvioISO
              ? dayjs(det.dataLimiteEnvioISO).format('DD/MM/YYYY HH:mm')
              : '—';
            return (
              <Grid key={det.mes} xs={6} sm={4} md={3} lg={2}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    height: '100%',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => abrirDetalhe(det)}
                >
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {NOMES_MES[det.mes - 1]} · {ano}
                  </Typography>
                  <Chip size="small" label={meta.label} color={meta.color} variant="soft" sx={{ mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">
                    {temLancamento ? 'Há apontamentos lançados' : 'Sem apontamentos registrados'}
                  </Typography>
                  {det.passouDoPrazo && det.situacao === 'em_aberto' && (
                    <Chip size="small" label="Prazo" color="error" variant="outlined" sx={{ mt: 0.5 }} />
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Limite: {prazo}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => !fechando && !reabrindo && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {detalheMes ? `${NOMES_MES_COMPLETO[detalheMes.mes - 1]} de ${ano}` : 'Competência'}
        </DialogTitle>
        <DialogContent>
          {detalheMes && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  size="small"
                  label={SITUACAO_META[detalheMes.situacao]?.label || detalheMes.situacao}
                  color={SITUACAO_META[detalheMes.situacao]?.color || 'default'}
                  variant="soft"
                />
                {detalheMes.possuiAlgumApontamentoLancado ? (
                  <Chip size="small" label="Com lançamentos" color="primary" variant="outlined" />
                ) : (
                  <Chip size="small" label="Sem lançamentos" variant="outlined" />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Prazo para envio / validação:{' '}
                <strong>
                  {detalheMes.dataLimiteEnvioISO
                    ? dayjs(detalheMes.dataLimiteEnvioISO).format('DD/MM/YYYY HH:mm')
                    : '—'}
                </strong>
              </Typography>
              {detalheMes.fechadoEm && (
                <Typography variant="body2">
                  Encerrado em: {dayjs(detalheMes.fechadoEm).format('DD/MM/YYYY HH:mm')}
                </Typography>
              )}
              {detalheMes.situacao === 'em_aberto' && (
                <Alert severity="info" variant="outlined">
                  Quando terminar os lançamentos nos colaboradores, finalize o mês. Se não houver nada a informar,
                  declare &quot;sem apontamentos&quot; (só permitido se não houver lançamentos no mês).
                </Alert>
              )}
              {habilitarReabrirMesAdmin && detalheMes.situacao && detalheMes.situacao !== 'em_aberto' && (
                <Alert severity="warning" variant="outlined">
                  Este mês já foi validado ou encerrado. Use <strong>Reabrir mês para edição</strong> apenas quando a
                  equipe precisar corrigir apontamentos — o cliente voltará a ver o mês em aberto.
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 1.5,
            px: 3,
            pb: 2,
          }}
        >
          <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
            {hubTrabalharClienteId && detalheMes && (
              <Button
                component={RouterLink}
                href={paths.dashboard.cliente.departamentoPessoalApontamentosHub({
                  cliente: hubTrabalharClienteId,
                  ano,
                  mes: detalheMes.mes,
                })}
                variant="contained"
                color="secondary"
                startIcon={<Iconify icon="solar:clipboard-list-bold-duotone" />}
                disabled={fechando || reabrindo}
                onClick={() => setDialogOpen(false)}
              >
                Conferir / lançar no HUB
              </Button>
            )}
            {mostrarAtalhoPortalLancamento && detalheMes ? (
              <Button
                component={RouterLink}
                href={paths.cliente.departamentoPessoal.apontamentosLancar({
                  ano,
                  mes: detalheMes.mes,
                  ...(funcionarioIdPreservar ? { funcionario: funcionarioIdPreservar } : {}),
                })}
                variant="contained"
                startIcon={<Iconify icon="solar:pen-new-square-bold-duotone" />}
                disabled={fechando}
                onClick={() => setDialogOpen(false)}
              >
                {detalheMes.podeEditarRubricas
                  ? 'Lançar ou editar apontamentos'
                  : 'Ver apontamentos do mês'}
              </Button>
            ) : null}
            {habilitarReabrirMesAdmin &&
              detalheMes?.situacao &&
              detalheMes.situacao !== 'em_aberto' &&
              !fechando && (
                <LoadingButton
                  variant="outlined"
                  color="warning"
                  disabled={reabrindo}
                  onClick={() => setDialogReabrirOpen(true)}
                  startIcon={<Iconify icon="solar:refresh-bold-duotone" />}
                >
                  Reabrir mês para edição
                </LoadingButton>
              )}
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
            <Button onClick={() => setDialogOpen(false)} disabled={fechando || reabrindo}>
              Fechar
            </Button>
            {detalheMes?.situacao === 'em_aberto' && (
              <>
                <LoadingButton
                  variant="contained"
                  color="primary"
                  loading={fechando}
                  disabled={!detalheMes?.possuiAlgumApontamentoLancado}
                  onClick={() => handleFechar('finalizar_com_apontamentos')}
                >
                  Finalizar com apontamentos
                </LoadingButton>
                <LoadingButton
                  variant="outlined"
                  color="inherit"
                  loading={fechando}
                  disabled={detalheMes?.possuiAlgumApontamentoLancado}
                  onClick={() => handleFechar('declarar_sem_apontamentos')}
                >
                  Declarar sem apontamentos
                </LoadingButton>
              </>
            )}
          </Stack>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogReabrirOpen} onClose={() => !reabrindo && setDialogReabrirOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reabrir competência?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            O mês <strong>{detalheMes ? NOMES_MES_COMPLETO[detalheMes.mes - 1] : ''}</strong> de{' '}
            <strong>{ano}</strong> voltará a <strong>em aberto</strong> no portal. Cliente e equipe poderão alterar
            apontamentos até nova validação ou encerramento.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogReabrirOpen(false)} disabled={reabrindo}>
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={reabrindo}
            onClick={handleReabrirMesConfirm}
          >
            Reabrir mês
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
