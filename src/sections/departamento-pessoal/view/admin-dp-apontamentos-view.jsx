'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import ToggleButton from '@mui/material/ToggleButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { isClientePortalFlagAtiva } from 'src/utils/cliente-portal-flags';

import { getClientes, getClienteById } from 'src/actions/clientes';
import { getPortalApontamentosCompetenciaMesOptional } from 'src/actions/departamento-pessoal';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { PortalDpCompetenciaMensalPanel } from './portal-dp-competencia-mensal-panel';

// ----------------------------------------------------------------------

const MESES_OPTS = [
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

/** Mês considerado “enviado” no portal: validado ou encerrado (não mais em aberto). */
function mesJaEnviadoNoPortal(data) {
  return Boolean(data?.situacao && data.situacao !== 'em_aberto');
}

function formatClienteOptionLabel(c) {
  if (!c) return '';
  const cod = c.codigo != null && String(c.codigo).trim() !== '' ? String(c.codigo) : '—';
  const rs = (c.razaoSocial || '').trim();
  return `${cod} - ${rs}`;
}

export function AdminDpApontamentosView() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteParam = searchParams.get('cliente') || '';

  const now = useMemo(() => new Date(), []);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clienteRazaoFetched, setClienteRazaoFetched] = useState('');

  const [filtroAno, setFiltroAno] = useState(now.getFullYear());
  const [filtroMes, setFiltroMes] = useState(now.getMonth() + 1);
  const [filtroEnvio, setFiltroEnvio] = useState(() => 'todos');
  const [competenciaMap, setCompetenciaMap] = useState({});
  const [competenciaMapLoading, setCompetenciaMapLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingClientes(true);
        const data = await getClientes({ status: true, tipoContato: 'cliente' });
        const list = Array.isArray(data) ? data : [];
        const filtered = list.filter((c) => isClientePortalFlagAtiva(c?.possuiFuncionario));
        if (!cancelled) setClientes(filtered);
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

  const filtroCompetenciaAtivo = filtroEnvio !== 'todos';

  useEffect(() => {
    if (!filtroCompetenciaAtivo) {
      setCompetenciaMap({});
      setCompetenciaMapLoading(false);
      return undefined;
    }
    if (!clientes.length) {
      setCompetenciaMap({});
      setCompetenciaMapLoading(false);
      return undefined;
    }

    let cancelled = false;
    setCompetenciaMapLoading(true);
    setCompetenciaMap({});

    (async () => {
      const ids = clientes.map((c) => c._id || c.id).filter(Boolean);
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const data = await getPortalApontamentosCompetenciaMesOptional(id, filtroAno, filtroMes);
            return [id, data];
          } catch {
            return [id, null];
          }
        })
      );
      if (cancelled) return;
      setCompetenciaMap(Object.fromEntries(entries));
      setCompetenciaMapLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [filtroCompetenciaAtivo, clientes, filtroAno, filtroMes]);

  const clientesFiltrados = useMemo(() => {
    if (filtroEnvio === 'todos') return clientes;
    if (competenciaMapLoading) return clientes;
    return clientes.filter((c) => {
      const id = c._id || c.id;
      const data = competenciaMap[id];
      const enviado = mesJaEnviadoNoPortal(data);
      if (filtroEnvio === 'enviaram') return enviado;
      return !enviado;
    });
  }, [clientes, filtroEnvio, competenciaMap, competenciaMapLoading]);

  const optionsAutocomplete = useMemo(() => {
    const base = clientesFiltrados;
    const sel = clientes.find((c) => (c._id || c.id) === clienteParam);
    if (sel && !base.some((c) => (c._id || c.id) === (sel._id || sel.id))) {
      return [...base, sel];
    }
    return base;
  }, [clientesFiltrados, clientes, clienteParam]);

  const contagemFiltro = useMemo(() => {
    if (filtroEnvio === 'todos' || competenciaMapLoading || !clientes.length) return null;
    let enviaram = 0;
    let pendentes = 0;
    clientes.forEach((c) => {
      const id = c._id || c.id;
      if (mesJaEnviadoNoPortal(competenciaMap[id])) enviaram += 1;
      else pendentes += 1;
    });
    return { enviaram, pendentes, total: clientes.length };
  }, [clientes, competenciaMap, competenciaMapLoading, filtroEnvio]);

  const selected = optionsAutocomplete.find((c) => (c._id || c.id) === clienteParam) ?? null;
  const razaoFromList = (selected?.razaoSocial || '').trim();

  useEffect(() => {
    let cancelled = false;
    if (razaoFromList) {
      setClienteRazaoFetched('');
    } else if (!clienteParam) {
      setClienteRazaoFetched('');
    } else {
      (async () => {
        try {
          const data = await getClienteById(clienteParam);
          const rs = (data?.razaoSocial || '').trim();
          if (!cancelled) setClienteRazaoFetched(rs);
        } catch {
          if (!cancelled) setClienteRazaoFetched('');
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [clienteParam, razaoFromList]);

  const clienteRazaoSocial = razaoFromList || clienteRazaoFetched;

  const baseApontamentos = paths.dashboard.cliente.departamentoPessoalApontamentos;

  const onChangeCliente = useCallback(
    (_, value) => {
      const id = value?._id || value?.id || '';
      const qs = id ? `?cliente=${encodeURIComponent(id)}` : '';
      router.replace(`${baseApontamentos}${qs}`);
    },
    [router, baseApontamentos]
  );

  const onFiltroEnvioChange = (_e, value) => {
    if (value != null) setFiltroEnvio(value);
  };

  const anosOpts = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];
  const mesLabelAtual = MESES_OPTS.find((m) => m.v === filtroMes)?.l || String(filtroMes);

  return (
    <Box sx={{ maxWidth: 1160, mx: 'auto', pb: { xs: 3, md: 5 } }}>
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
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.25 },
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(
              theme.palette.info.main,
              0.08
            )} 100%)`,
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:calendar-date-bold-duotone" width={28} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
                Apontamentos (DP)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                Situação mensal por empresa. Filtre a lista pelo mês de referência (validação / envio no portal). Ao
                abrir um mês no calendário, use <strong>Conferir / lançar no HUB</strong> para a página exclusiva da
                empresa.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              href={paths.dashboard.cliente.departamentoPessoalHub}
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="solar:users-group-rounded-bold-duotone" />}
              sx={{ flexShrink: 0, bgcolor: 'background.paper' }}
            >
              Colaboradores
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Filtrar empresas por competência
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
            &quot;Já enviaram&quot; = mês já validado ou encerrado no portal (não está mais em aberto). &quot;Ainda não
            enviaram&quot; = mês ainda em aberto ou sem registro de fechamento para esse período.
          </Typography>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
              <TextField
                select
                label="Ano (filtro)"
                value={filtroAno}
                onChange={(e) => setFiltroAno(Number(e.target.value))}
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
                label="Mês (filtro)"
                value={filtroMes}
                onChange={(e) => setFiltroMes(Number(e.target.value))}
                size="small"
                sx={{ minWidth: 180 }}
              >
                {MESES_OPTS.map((m) => (
                  <MenuItem key={m.v} value={m.v}>
                    {m.l}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
                Situação em {mesLabelAtual}/{filtroAno}
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                color="primary"
                value={filtroEnvio}
                onChange={onFiltroEnvioChange}
                sx={{ flexWrap: 'wrap' }}
              >
                <ToggleButton value="todos">Todas</ToggleButton>
                <ToggleButton value="enviaram">Já enviaram</ToggleButton>
                <ToggleButton value="nao_enviaram">Ainda não enviaram</ToggleButton>
              </ToggleButtonGroup>
              {contagemFiltro && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  {contagemFiltro.enviaram} com mês fechado/validado · {contagemFiltro.pendentes} em aberto ·{' '}
                  {contagemFiltro.total} empresas com DP
                </Typography>
              )}
            </Box>
          </Stack>

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Cliente
          </Typography>
          <Autocomplete
            fullWidth
            options={optionsAutocomplete}
            loading={loadingClientes || competenciaMapLoading}
            getOptionLabel={(option) => formatClienteOptionLabel(option)}
            isOptionEqualToValue={(opt, val) => (opt?._id || opt?.id) === (val?._id || val?.id)}
            value={selected}
            onChange={onChangeCliente}
            renderInput={(paramsInput) => (
              <TextField
                {...paramsInput}
                label="Empresa"
                placeholder="Busque por código ou razão social"
                helperText={
                  filtroEnvio !== 'todos' && !competenciaMapLoading
                    ? `${optionsAutocomplete.length} empresa(s) na lista com o filtro atual. Somente clientes com Possui Funcionário ativo.`
                    : 'Somente clientes com Possui Funcionário ativo no cadastro'
                }
                InputProps={{
                  ...paramsInput.InputProps,
                  endAdornment: (
                    <>
                      {competenciaMapLoading && filtroEnvio !== 'todos' ? (
                        <InputAdornment position="end" sx={{ mr: 1 }}>
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null}
                      {paramsInput.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>
      </Card>

      {!clienteParam && !loadingClientes && (
        <EmptyContent
          filled
          title="Selecione uma empresa"
          description="Use o campo acima para carregar o calendário de competências e o status de apontamentos."
          sx={{ py: 6, mt: 3, borderRadius: 2 }}
        />
      )}

      {clienteParam && (
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                Competências
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                {clienteRazaoSocial || 'Carregando…'}
              </Typography>
            </Box>
            <Button
              size="small"
              component={RouterLink}
              href={paths.dashboard.cliente.departamentoPessoal(clienteParam)}
              variant="outlined"
            >
              Abrir lista de colaboradores
            </Button>
          </Stack>

          <PortalDpCompetenciaMensalPanel
            clienteProprietarioId={clienteParam}
            mostrarAtalhoPortalLancamento={false}
            hubTrabalharClienteId={clienteParam}
            habilitarReabrirMesAdmin
          />
        </Box>
      )}
    </Box>
  );
}
