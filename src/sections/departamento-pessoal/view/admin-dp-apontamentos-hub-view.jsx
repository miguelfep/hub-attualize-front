'use client';

import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { getClienteById } from 'src/actions/clientes';
import {
  useAdminFuncionarios,
  adminDownloadApontamentosTxt,
  adminReabrirCompetenciaApontamentos,
  usePortalApontamentosCompetenciaMes,
  revalidatePortalApontamentosCompetencia,
} from 'src/actions/departamento-pessoal';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { PortalDpRubricasView } from './portal-dp-rubricas-view';

// ----------------------------------------------------------------------

const NOMES_MES = [
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

const SITUACAO_COMP_CHIP = {
  em_aberto: { label: 'Em aberto', color: 'warning' },
  validado_com_apontamentos: { label: 'Validado · com apontamentos', color: 'success' },
  validado_sem_apontamentos: { label: 'Validado · sem apontamentos', color: 'info' },
  encerrado_automaticamente: { label: 'Encerrado (prazo)', color: 'default' },
};

function isVinculoAtivo(f) {
  return f?.statusVinculo !== 'inativo';
}

function errMsg(err) {
  if (typeof err === 'string') return err;
  return err?.response?.data?.message || err?.message || 'Erro ao processar';
}

export function AdminDpApontamentosHubView() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const clienteParam = searchParams.get('cliente') || '';
  const anoNum = Number(searchParams.get('ano'));
  const mesNum = Number(searchParams.get('mes'));

  const anoValido = Number.isFinite(anoNum) && anoNum >= 2000 && anoNum <= 2100;
  const mesValido = Number.isFinite(mesNum) && mesNum >= 1 && mesNum <= 12;

  const [clienteRazao, setClienteRazao] = useState('');
  const [funcionarioHubId, setFuncionarioHubId] = useState('');
  const [exportando, setExportando] = useState(false);
  const [dialogReabrirOpen, setDialogReabrirOpen] = useState(false);
  const [reabrindo, setReabrindo] = useState(false);

  const { data: funcionariosDp, isLoading: loadingFuncDp } = useAdminFuncionarios(
    clienteParam && anoValido && mesValido ? clienteParam : null,
    {}
  );

  const { data: competenciaMesSwr, isLoading: loadingComp, mutate: mutCompMes } =
    usePortalApontamentosCompetenciaMes(
      clienteParam && anoValido && mesValido ? clienteParam : null,
      anoValido ? anoNum : null,
      mesValido ? mesNum : null
    );

  const funcionariosOrdenados = useMemo(() => {
    const list = funcionariosDp || [];
    return [...list].sort((a, b) => {
      const ai = isVinculoAtivo(a) ? 0 : 1;
      const bi = isVinculoAtivo(b) ? 0 : 1;
      if (ai !== bi) return ai - bi;
      return (a.nome || '').localeCompare(b.nome || '', 'pt');
    });
  }, [funcionariosDp]);

  const mesJaFechadoNoPortal = Boolean(
    competenciaMesSwr?.situacao && competenciaMesSwr.situacao !== 'em_aberto'
  );
  const exportarPermitido = mesJaFechadoNoPortal;

  const paramsValidos = Boolean(clienteParam && anoValido && mesValido);

  const voltarApontamentosHref = clienteParam
    ? `${paths.dashboard.cliente.departamentoPessoalApontamentos}?cliente=${encodeURIComponent(clienteParam)}`
    : paths.dashboard.cliente.departamentoPessoalApontamentos;

  useEffect(() => {
    setFuncionarioHubId('');
  }, [clienteParam, anoNum, mesNum]);

  useEffect(() => {
    let cancelled = false;
    if (!clienteParam) {
      setClienteRazao('');
    } else {
      (async () => {
        try {
          const data = await getClienteById(clienteParam);
          const rs = (data?.razaoSocial || '').trim();
          if (!cancelled) setClienteRazao(rs || '—');
        } catch {
          if (!cancelled) setClienteRazao('');
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [clienteParam]);

  const replaceCompetenciaQuery = (ano, mes) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('cliente', clienteParam);
    p.set('ano', String(ano));
    p.set('mes', String(mes));
    router.replace(`${pathname}?${p.toString()}`);
  };

  const handleExportarTxt = async () => {
    if (!clienteParam || !anoValido || !mesValido || !exportarPermitido) return;
    setExportando(true);
    try {
      await adminDownloadApontamentosTxt(clienteParam, anoNum, mesNum);
      toast.success('Arquivo TXT gerado pela API (layout conforme cadastro da empresa).');
    } catch (e) {
      toast.error(e?.message || 'Não foi possível baixar o TXT.');
    } finally {
      setExportando(false);
    }
  };

  const handleReabrirMesConfirm = async () => {
    if (!clienteParam || !anoValido || !mesValido) return;
    setReabrindo(true);
    try {
      await adminReabrirCompetenciaApontamentos(clienteParam, anoNum, mesNum);
      toast.success('Competência reaberta. O mês pode ser editado novamente no portal e aqui.');
      await mutCompMes();
      await revalidatePortalApontamentosCompetencia(clienteParam);
      setDialogReabrirOpen(false);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setReabrindo(false);
    }
  };

  if (!paramsValidos) {
    return (
      <Box sx={{ maxWidth: 1160, mx: 'auto', pb: { xs: 3, md: 5 } }}>
        <EmptyContent
          filled
          title="Parâmetros incompletos"
          description="Abra esta página a partir do calendário de apontamentos (Conferir / lançar no HUB), com empresa, ano e mês."
          action={
            <Button component={RouterLink} href={voltarApontamentosHref} variant="contained" size="small">
              Voltar aos apontamentos
            </Button>
          }
          sx={{ py: 6, borderRadius: 2 }}
        />
      </Box>
    );
  }

  const tituloMes = NOMES_MES[mesNum - 1] || `Mês ${mesNum}`;

  return (
    <Box sx={{ maxWidth: 1160, mx: 'auto', pb: { xs: 3, md: 5 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Conferência no HUB
          </Typography>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            {clienteRazao || 'Carregando empresa…'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Competência{' '}
            <strong>
              {tituloMes} de {anoNum}
            </strong>
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          href={voltarApontamentosHref}
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="solar:arrow-left-line-duotone" />}
        >
          Calendário do cliente
        </Button>
      </Stack>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          borderColor: alpha(theme.palette.secondary.main, 0.35),
          mb: 2,
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            background: `linear-gradient(90deg, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 100%)`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Situação no portal
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                O que o cliente vê neste mês. Atualiza ao salvar apontamentos ou ao encerrar a competência na tela de
                calendário.
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                {loadingComp ? (
                  <Chip size="small" label="Carregando…" variant="outlined" />
                ) : competenciaMesSwr?.situacao ? (
                  <Chip
                    size="small"
                    label={SITUACAO_COMP_CHIP[competenciaMesSwr.situacao]?.label || competenciaMesSwr.situacao}
                    color={SITUACAO_COMP_CHIP[competenciaMesSwr.situacao]?.color || 'default'}
                    variant="soft"
                  />
                ) : (
                  <Chip size="small" label="—" variant="outlined" />
                )}
                {competenciaMesSwr?.possuiAlgumApontamentoLancado ? (
                  <Chip size="small" label="Com lançamentos" color="primary" variant="outlined" />
                ) : (
                  <Chip size="small" label="Sem lançamentos" variant="outlined" />
                )}
              </Stack>
            </Box>
            <Stack direction="row" flexWrap="wrap" spacing={1} justifyContent={{ xs: 'stretch', sm: 'flex-end' }}>
              {mesJaFechadoNoPortal && (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  color="warning"
                  loading={reabrindo}
                  disabled={exportando}
                  onClick={() => setDialogReabrirOpen(true)}
                  startIcon={<Iconify icon="solar:refresh-bold-duotone" />}
                >
                  Reabrir mês
                </LoadingButton>
              )}
              <LoadingButton
                size="small"
                variant="contained"
                color="inherit"
                loading={exportando}
                disabled={!exportarPermitido}
                onClick={handleExportarTxt}
                startIcon={<Iconify icon="solar:file-text-bold-duotone" />}
              >
                Baixar TXT
              </LoadingButton>
            </Stack>
          </Stack>
          {!exportarPermitido && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
              O download do TXT fica disponível quando o mês não estiver mais em aberto (validado ou encerrado por
              prazo). O formato do arquivo segue o toggle <strong>Folha com plano</strong> no cadastro do cliente
              (Prosoft sem plano × legado com plano).
            </Typography>
          )}
        </Box>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
            Colaborador
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
            Vínculos <strong>ativos</strong> aparecem primeiro. <strong>Inativos</strong> vêm em cinza para conferência.
          </Typography>
          <TextField
            select
            fullWidth
            label="Selecione o colaborador"
            value={funcionarioHubId}
            onChange={(e) => setFuncionarioHubId(e.target.value)}
            size="small"
            disabled={loadingFuncDp}
          >
            <MenuItem value="">
              <em>Escolha para ver ou lançar apontamentos</em>
            </MenuItem>
            {funcionariosOrdenados.map((f) => {
              const id = f._id || f.id;
              const inativo = !isVinculoAtivo(f);
              return (
                <MenuItem
                  key={id}
                  value={id}
                  sx={{
                    ...(inativo
                      ? {
                          color: 'text.secondary',
                          bgcolor: alpha(theme.palette.grey[500], 0.12),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.grey[500], 0.2),
                          },
                        }
                      : {}),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 1, py: 0.25 }}>
                    <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          fontWeight: inativo ? 400 : 500,
                          color: inativo ? 'text.disabled' : 'text.primary',
                        }}
                      >
                        {f.nome || '—'}
                        {f.cpf ? ` · ${f.cpf}` : ''}
                      </Typography>
                    </Box>
                    {inativo && (
                      <Chip size="small" label="Inativo" variant="soft" color="default" sx={{ height: 22 }} />
                    )}
                  </Stack>
                </MenuItem>
              );
            })}
          </TextField>
        </Box>
        <Divider />
        {funcionarioHubId ? (
          <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
            <PortalDpRubricasView
              funcionarioId={funcionarioHubId}
              embedded
              hubClienteId={clienteParam}
              hubModoInterno
              competenciaAno={anoNum}
              competenciaMes={mesNum}
              onCompetenciaChange={replaceCompetenciaQuery}
            />
          </Box>
        ) : (
          <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 3 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Selecione um colaborador acima para carregar os apontamentos desta competência.
            </Typography>
          </Box>
        )}
      </Card>

      <Dialog open={dialogReabrirOpen} onClose={() => !reabrindo && setDialogReabrirOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reabrir competência?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            O mês <strong>{tituloMes}</strong> de <strong>{anoNum}</strong> voltará a <strong>em aberto</strong>. Cliente
            e equipe poderão alterar apontamentos até nova validação ou encerramento.
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
    </Box>
  );
}
