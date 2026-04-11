'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { usePortalFuncionarios } from 'src/actions/departamento-pessoal';

import { Iconify } from 'src/components/iconify';

import { useDpPortalContext } from '../dp-shared';
import { PortalDpRubricasView } from './portal-dp-rubricas-view';

// ----------------------------------------------------------------------

const MESES_NOME = [
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

function errMessage(err) {
  if (typeof err === 'string') return err;
  return err?.message || 'Erro ao carregar dados';
}

function parseCompetencia(searchParams) {
  const anoRaw = searchParams.get('ano');
  const mesRaw = searchParams.get('mes');
  const ano = anoRaw != null && anoRaw !== '' ? Number(anoRaw) : null;
  const mes = mesRaw != null && mesRaw !== '' ? Number(mesRaw) : null;
  const valid =
    ano != null &&
    !Number.isNaN(ano) &&
    mes != null &&
    !Number.isNaN(mes) &&
    mes >= 1 &&
    mes <= 12;
  return { ano: valid ? ano : null, mes: valid ? mes : null, valid };
}

export function PortalDpApontamentosLancarView() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { ano, mes, valid: hasCompetencia } = useMemo(
    () => parseCompetencia(searchParams),
    [searchParams]
  );

  const funcionarioParam = searchParams.get('funcionario') || '';

  const setQuery = useCallback(
    (patch) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v == null || v === '') p.delete(k);
        else p.set(k, String(v));
      });
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const handleCompetenciaChange = useCallback(
    (nextAno, nextMes) => {
      setQuery({
        ano: nextAno,
        mes: nextMes,
        funcionario: funcionarioParam || undefined,
      });
    },
    [funcionarioParam, setQuery]
  );

  const { enabled, loadingEmpresas, clienteProprietarioId } = useDpPortalContext();
  const { data: funcionarios, isLoading, error } = usePortalFuncionarios(clienteProprietarioId, {});

  const show403 = error && (error?.status === 403 || String(errMessage(error)).includes('403'));

  const elegiveis = useMemo(
    () => (funcionarios || []).filter((f) => f.statusCadastro === 'aprovado' && f.statusVinculo === 'ativo'),
    [funcionarios]
  );

  const funcionarioSelecionado =
    funcionarioParam && elegiveis.some((f) => f._id === funcionarioParam) ? funcionarioParam : '';

  const colaboradorAtual = useMemo(
    () => elegiveis.find((x) => x._id === funcionarioSelecionado),
    [elegiveis, funcionarioSelecionado]
  );

  if (loadingEmpresas || !clienteProprietarioId) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }} spacing={2}>
        <CircularProgress size={40} />
        <Typography color="text.secondary">Carregando apontamentos…</Typography>
      </Stack>
    );
  }

  if (!enabled) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        O módulo Departamento Pessoal não está habilitado para esta empresa.
      </Alert>
    );
  }

  if (!hasCompetencia) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', py: { xs: 2, md: 4 }, textAlign: 'center' }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Iconify icon="solar:calendar-mark-bold-duotone" width={36} sx={{ color: 'primary.main' }} />
        </Box>
        <Typography variant="h5" component="h1" gutterBottom>
          Escolha o mês primeiro
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
          No resumo de competências, clique no mês e em <strong>Lançar ou editar apontamentos</strong>. Assim você
          chega aqui já com o período certo.
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          href={paths.cliente.departamentoPessoal.apontamentos}
          startIcon={<Iconify icon="solar:calendar-bold-duotone" />}
          sx={{ borderRadius: 2 }}
        >
          Abrir resumo por mês
        </Button>
        {funcionarioParam && !funcionarioSelecionado && elegiveis.length > 0 && (
          <Alert severity="warning" sx={{ mt: 3, borderRadius: 2, textAlign: 'left' }}>
            O colaborador do link não está elegível ou não existe.
          </Alert>
        )}
      </Box>
    );
  }

  const competenciaLabel = `${MESES_NOME[mes - 1]} de ${ano}`;

  return (
    <Box sx={{ maxWidth: 1160, mx: 'auto', pb: { xs: 3, md: 5 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 0.5 }}>
        <Button
          component={RouterLink}
          href={paths.cliente.departamentoPessoal.apontamentos}
          size="small"
          startIcon={<Iconify icon="solar:arrow-left-linear" width={18} />}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          Resumo mensal
        </Button>
        <Typography component="span" variant="caption" color="text.disabled">
          /
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Lançar
        </Typography>
      </Stack>

      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: (t) => `1px solid ${t.palette.divider}`,
          overflow: 'hidden',
          boxShadow: theme.shadows[3],
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
              theme.palette.primary.dark,
              0.06
            )} 100%)`,
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.25 },
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Iconify icon="solar:clipboard-list-bold-duotone" width={28} />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                Lançar apontamentos
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <Chip label={competenciaLabel} size="small" color="primary" variant="soft" sx={{ fontWeight: 600 }} />
                {colaboradorAtual && (
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '100%' }}>
                    Colaborador: <strong>{colaboradorAtual.nome}</strong>
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 }, bgcolor: 'background.default' }}>
          {show403 && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              {errMessage(error)}
            </Alert>
          )}

          {!isLoading && elegiveis.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              Nenhum colaborador disponível. É preciso cadastro aprovado e vínculo ativo.
            </Typography>
          )}

          {elegiveis.length > 0 && (
            <Stack spacing={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 1.75, sm: 2 },
                  borderRadius: 2,
                  borderStyle: 'dashed',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      bgcolor: 'text.primary',
                      color: 'common.white',
                    }}
                  >
                    1
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Quem recebe estes lançamentos?
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25, lineHeight: 1.5 }}>
                      Um colaborador por vez. Você pode voltar e trocar depois de salvar.
                    </Typography>
                  </Box>
                </Stack>

                <TextField
                  select
                  fullWidth
                  label="Colaborador"
                  value={funcionarioSelecionado}
                  onChange={(e) =>
                    setQuery({
                      ano,
                      mes,
                      funcionario: e.target.value || undefined,
                    })
                  }
                  InputProps={{ sx: { borderRadius: 1.5, bgcolor: 'background.paper' } }}
                >
                  <MenuItem value="">
                    <em>Selecione…</em>
                  </MenuItem>
                  {elegiveis.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      <Stack spacing={0}>
                        <Typography variant="body2">{p.nome}</Typography>
                        {p.cargo && (
                          <Typography variant="caption" color="text.secondary">
                            {p.cargo}
                          </Typography>
                        )}
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              </Paper>

              {!funcionarioSelecionado && (
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.grey[500], 0.08),
                  }}
                >
                  <Iconify
                    icon="solar:user-rounded-bold-duotone"
                    width={40}
                    sx={{ color: 'text.disabled', mb: 1 }}
                  />
                  <Typography variant="subtitle2" color="text.secondary">
                    Selecione um colaborador acima para abrir o formulário.
                  </Typography>
                </Paper>
              )}

              {funcionarioParam && !funcionarioSelecionado && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  O colaborador do link não está elegível nesta empresa.
                </Alert>
              )}

              {funcionarioSelecionado && (
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        bgcolor: 'success.main',
                        color: 'success.contrastText',
                      }}
                    >
                      2
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight={700}>
                      O que aconteceu neste mês?
                    </Typography>
                  </Stack>
                  <PortalDpRubricasView
                    funcionarioId={funcionarioSelecionado}
                    embedded
                    competenciaAno={ano}
                    competenciaMes={mes}
                    onCompetenciaChange={handleCompetenciaChange}
                  />
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Card>
    </Box>
  );
}
