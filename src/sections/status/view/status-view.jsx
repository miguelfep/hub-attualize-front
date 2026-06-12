'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Table,
  Switch,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  CardContent,
  TableContainer,
  FormControlLabel,
} from '@mui/material';

import { getHealth, formatarUptime } from 'src/actions/health';

import { Iconify } from 'src/components/iconify';

import { StatusIaModelos } from '../status-ia-modelos';

// ----------------------------------------------------------------------

const INTERVALO_AUTO_REFRESH = 30000; // 30s
const MAX_HISTORICO = 20;

const STATUS_GERAL = {
  ok: { label: 'Operacional', color: 'success', icone: 'solar:check-circle-bold' },
  degraded: { label: 'Degradado', color: 'warning', icone: 'solar:danger-triangle-bold' },
  down: { label: 'Fora do ar', color: 'error', icone: 'solar:close-circle-bold' },
};

function infoStatusGeral(status) {
  return STATUS_GERAL[status] || { label: status || '—', color: 'default', icone: 'solar:question-circle-bold' };
}

function corCheck(check) {
  if (!check) return 'default';
  return check.status === 'ok' ? 'success' : 'error';
}

function corLatencia(ms) {
  if (ms == null) return 'default';
  if (ms < 300) return 'success';
  if (ms < 1000) return 'warning';
  return 'error';
}

function StatusCard({ titulo, icone, cor, valor, descricao }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              borderRadius: 1.5,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              bgcolor: (theme) => theme.palette[cor]?.lighter || 'background.neutral',
              color: (theme) => theme.palette[cor]?.main || 'text.secondary',
            }}
          >
            <Iconify icon={icone} width={28} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {titulo}
            </Typography>
            <Typography variant="h6" noWrap>
              {valor}
            </Typography>
            {descricao && (
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {descricao}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function StatusView() {
  const [resultado, setResultado] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [checando, setChecando] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [ultimaChecagem, setUltimaChecagem] = useState(null);

  // Evita duas checagens simultâneas (auto-refresh + clique manual)
  const checandoRef = useRef(false);

  const checar = useCallback(async () => {
    if (checandoRef.current) return;
    checandoRef.current = true;
    setChecando(true);
    try {
      const res = await getHealth();
      const agora = new Date();
      setResultado(res);
      setUltimaChecagem(agora);
      setHistorico((prev) =>
        [
          {
            horario: agora,
            online: res.online,
            statusGeral: res.data?.status || null,
            mongo: res.data?.checks?.mongo?.status || null,
            redis: res.data?.checks?.redis?.status || null,
            fila: res.data?.checks?.uploadQueue?.status || null,
            latencia: res.latencia,
            erro: res.erro,
          },
          ...prev,
        ].slice(0, MAX_HISTORICO)
      );
    } finally {
      checandoRef.current = false;
      setChecando(false);
    }
  }, []);

  // Primeira checagem ao abrir a página
  useEffect(() => {
    checar();
  }, [checar]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(checar, INTERVALO_AUTO_REFRESH);
    return () => clearInterval(id);
  }, [autoRefresh, checar]);

  const health = resultado?.data || null;
  const checks = health?.checks || {};
  const processo = health?.process || null;
  const memoria = processo?.memory || null;
  const fila = checks.uploadQueue || null;
  const statusGeral = infoStatusGeral(health?.status);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2" color="text.secondary">
          {ultimaChecagem
            ? `Última checagem: ${ultimaChecagem.toLocaleTimeString('pt-BR')}`
            : 'Aguardando primeira checagem...'}
          {health?.version ? ` · API v${health.version}` : ''}
          {processo?.env ? ` · ambiente: ${processo.env}` : ''}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label={`Atualizar a cada ${INTERVALO_AUTO_REFRESH / 1000}s`}
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
          />
          <LoadingButton
            variant="contained"
            loading={checando}
            startIcon={<Iconify icon="eva:refresh-fill" />}
            onClick={checar}
          >
            Verificar agora
          </LoadingButton>
        </Stack>
      </Stack>

      {resultado && !resultado.online && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Não foi possível contatar a API{resultado.erro ? ` — ${resultado.erro}` : ''}. Verifique
          se o backend está no ar.
        </Alert>
      )}

      {health?.status === 'degraded' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          A API está de pé, mas com dependência degradada (Redis ou fila de uploads). Veja os cards
          abaixo.
        </Alert>
      )}

      {health?.status === 'down' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          MongoDB fora do ar — a API respondeu, mas está sem banco de dados.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <StatusCard
            titulo="API"
            icone={statusGeral.icone}
            cor={resultado && !resultado.online ? 'error' : statusGeral.color}
            valor={resultado && !resultado.online ? 'Inacessível' : statusGeral.label}
            descricao={health?.version ? `v${health.version}` : null}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <StatusCard
            titulo="MongoDB"
            icone="solar:database-bold"
            cor={corCheck(checks.mongo)}
            valor={checks.mongo?.connectionState || (checks.mongo?.status === 'ok' ? 'Conectado' : '—')}
            descricao={checks.mongo?.latencyMs != null ? `ping: ${checks.mongo.latencyMs} ms` : null}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <StatusCard
            titulo="Redis"
            icone="solar:server-bold"
            cor={corCheck(checks.redis)}
            valor={checks.redis?.connectionState || (checks.redis?.status === 'ok' ? 'Pronto' : '—')}
            descricao={checks.redis?.latencyMs != null ? `ping: ${checks.redis.latencyMs} ms` : null}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <StatusCard
            titulo="Latência do /health"
            icone="solar:bolt-bold"
            cor={corLatencia(resultado?.latencia)}
            valor={resultado?.latencia != null ? `${resultado.latencia} ms` : '—'}
            descricao="Tempo total da requisição"
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <StatusCard
            titulo="Uptime"
            icone="solar:clock-circle-bold"
            cor="info"
            valor={formatarUptime(health?.uptimeSeconds)}
            descricao="Desde o último restart da API"
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <StatusCard
            titulo="Node.js"
            icone="solar:code-bold"
            cor="info"
            valor={processo?.node || '—'}
            descricao={processo?.env ? `ambiente: ${processo.env}` : null}
          />
        </Grid>

        <Grid xs={12} sm={6} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Memória do processo
              </Typography>
              {memoria ? (
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="h6">{memoria.rssMb} MB</Typography>
                    <Typography variant="caption" color="text.secondary">
                      RSS
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6">{memoria.heapUsedMb} MB</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Heap usado
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6">{memoria.heapTotalMb} MB</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Heap total
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography variant="h6">—</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">Fila de uploads</Typography>
                {fila && (
                  <Chip
                    size="small"
                    variant="soft"
                    color={corCheck(fila)}
                    label={fila.status === 'ok' ? 'Saudável' : 'Com problemas'}
                  />
                )}
              </Stack>

              {fila ? (
                <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
                  {[
                    { label: 'Aguardando', valor: fila.waiting, cor: 'text.primary' },
                    { label: 'Em processamento', valor: fila.active, cor: 'info.main' },
                    { label: 'Agendados', valor: fila.delayed, cor: 'text.primary' },
                    { label: 'Falhados', valor: fila.failed, cor: fila.failed > 0 ? 'error.main' : 'text.primary' },
                    { label: 'Concluídos', valor: fila.completed, cor: 'success.main' },
                  ].map((item) => (
                    <Box key={item.label}>
                      <Typography variant="h6" sx={{ color: item.cor }}>
                        {item.valor ?? '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sem dados da fila.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12}>
          <StatusIaModelos />
        </Grid>

        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Histórico desta sessão
              </Typography>

              {historico.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma checagem realizada ainda.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Horário</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>MongoDB</TableCell>
                        <TableCell>Redis</TableCell>
                        <TableCell>Fila</TableCell>
                        <TableCell align="right">Latência</TableCell>
                        <TableCell>Detalhe</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historico.map((item, index) => {
                        const info = item.online
                          ? infoStatusGeral(item.statusGeral)
                          : { label: 'Inacessível', color: 'error' };
                        return (
                          <TableRow key={`${item.horario.getTime()}-${index}`}>
                            <TableCell>{item.horario.toLocaleTimeString('pt-BR')}</TableCell>
                            <TableCell>
                              <Chip size="small" label={info.label} color={info.color} variant="soft" />
                            </TableCell>
                            {[item.mongo, item.redis, item.fila].map((dep, depIndex) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <TableCell key={depIndex}>
                                <Chip
                                  size="small"
                                  variant="soft"
                                  label={dep === 'ok' ? 'OK' : dep || '—'}
                                  color={dep === 'ok' ? 'success' : dep ? 'error' : 'default'}
                                />
                              </TableCell>
                            ))}
                            <TableCell align="right">
                              <Chip
                                size="small"
                                label={`${item.latencia} ms`}
                                color={corLatencia(item.latencia)}
                                variant="soft"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {item.erro || '—'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default StatusView;
