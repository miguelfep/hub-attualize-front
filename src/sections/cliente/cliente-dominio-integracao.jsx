'use client';

import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Card,
  Stack,
  Alert,
  Button,
  Switch,
  Divider,
  Tooltip,
  Skeleton,
  TextField,
  CardHeader,
  Typography,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { updateSettings } from 'src/actions/settings';
import {
  ativarDominio,
  normalizarCnpj,
  getDominioStatus,
  enviarLoteDominio,
  validarChaveDominio,
  mensagemErroDominio,
} from 'src/actions/notafiscal';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function ResumoCard({ icon, color, label, value }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: (t) => alpha(t.palette[color].main, 0.08),
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        height: '100%',
      }}
    >
      <Iconify icon={icon} width={28} sx={{ color: `${color}.main`, flexShrink: 0 }} />
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
          {value ?? 0}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

/**
 * Card de configuração da Integração Domínio Sistemas (envio automático de XML
 * de NFS-e emitidas ao escritório de contabilidade). Autocontido: lê o status
 * via `getDominioStatus` e grava o toggle/BOX-e via `updateSettings`.
 *
 * @param {string} clienteId
 * @param {string} [clienteCnpj] - CNPJ do cliente no hub, para conferir com a chave
 */
export function ClienteDominioIntegracao({ clienteId, clienteCnpj }) {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [integrationKeyConfigurada, setIntegrationKeyConfigurada] = useState(false);

  // Wizard de ativação
  const [chaveContador, setChaveContador] = useState('');
  const [validando, setValidando] = useState(false);
  const [info, setInfo] = useState(null); // dados retornados pelo dominio/info
  const [ativando, setAtivando] = useState(false);

  // Toggle / BOX-e
  const [salvando, setSalvando] = useState(false);

  // Envio em lote
  const [enviarDialogOpen, setEnviarDialogOpen] = useState(false);
  const [dataInicio, setDataInicio] = useState(() => dayjs().startOf('month').format('YYYY-MM-DD'));
  const [dataFim, setDataFim] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [enviando, setEnviando] = useState(false);
  const [resultadoEnvio, setResultadoEnvio] = useState(null);

  const carregar = useCallback(async () => {
    if (!clienteId) return;
    try {
      setLoading(true);
      const res = await getDominioStatus(clienteId);
      const data = res.data || {};
      setConfig(data.dominioConfig || null);
      setResumo(data.resumo || null);
      setIntegrationKeyConfigurada(Boolean(data.dominioConfig?.integrationKeyConfigurada));
    } catch (e) {
      setConfig(null);
      setResumo(null);
      setIntegrationKeyConfigurada(false);
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const cnpjConfere =
    !clienteCnpj || !info?.clienteCnpj || normalizarCnpj(clienteCnpj) === normalizarCnpj(info.clienteCnpj);

  const handleValidarChave = async () => {
    const chave = chaveContador.trim();
    if (!chave) {
      toast.error('Informe a chave fornecida pelo contador');
      return;
    }
    try {
      setValidando(true);
      setInfo(null);
      const res = await validarChaveDominio(clienteId, chave);
      const dados = res.data?.info || {};
      setInfo(dados);
      if (clienteCnpj && dados.clienteCnpj && normalizarCnpj(clienteCnpj) !== normalizarCnpj(dados.clienteCnpj)) {
        toast.warning('A chave pertence a outro CNPJ. Confira com o contador antes de ativar.');
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Falha ao consultar a chave no Domínio';
      toast.error(msg);
    } finally {
      setValidando(false);
    }
  };

  const handleAtivar = async () => {
    const chave = chaveContador.trim();
    if (!chave) return;
    if (!cnpjConfere) {
      toast.error('A chave pertence a outro CNPJ. Verifique com seu contador.');
      return;
    }
    try {
      setAtivando(true);
      await ativarDominio(clienteId, chave);
      toast.success('Integração Domínio ativada com sucesso');
      setChaveContador('');
      setInfo(null);
      await carregar();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Falha ao ativar a integração Domínio';
      toast.error(msg);
    } finally {
      setAtivando(false);
    }
  };

  const salvarConfig = async (patch) => {
    try {
      setSalvando(true);
      await updateSettings(clienteId, { dominioConfig: patch });
      // Atualiza otimisticamente e recarrega o resumo
      setConfig((prev) => ({ ...(prev || {}), ...patch }));
      await carregar();
      return true;
    } catch (e) {
      const msg = e?.response?.data?.message || 'Falha ao salvar a configuração';
      toast.error(msg);
      return false;
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleHabilitado = async (e) => {
    const checked = e.target.checked;
    if (checked && !integrationKeyConfigurada) {
      toast.error('Ative a integração Domínio antes de habilitar o envio automático');
      return;
    }
    const ok = await salvarConfig({ habilitado: checked });
    if (ok) {
      toast.success(checked ? 'Envio automático habilitado' : 'Envio automático desabilitado');
    }
  };

  const handleToggleBoxe = async (e) => {
    const ok = await salvarConfig({ boxeFile: e.target.checked });
    if (ok) toast.success('Configuração BOX-e atualizada');
  };

  const handleEnviarLote = async () => {
    try {
      setEnviando(true);
      setResultadoEnvio(null);
      const res = await enviarLoteDominio(clienteId, { dataInicio, dataFim });
      const data = res.data || {};
      setResultadoEnvio(data);
      if (data.erros > 0) {
        toast.warning(`${data.enviadas} enviada(s), ${data.erros} com erro`);
      } else {
        toast.success(`${data.enviadas ?? 0} nota(s) enviada(s) ao Domínio`);
      }
      await carregar();
    } catch (e) {
      const msg = e?.response?.data?.message || 'Falha ao enviar notas ao Domínio';
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  };

  const handleOpenEnviar = () => {
    setResultadoEnvio(null);
    setEnviarDialogOpen(true);
  };

  const renderHeader = (
    <CardHeader
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <span>Integração Domínio (Contabilidade)</span>
          {integrationKeyConfigurada && (
            <Label color={config?.habilitado ? 'success' : 'warning'} variant="soft">
              {config?.habilitado ? 'Ativa' : 'Ativada (envio off)'}
            </Label>
          )}
        </Stack>
      }
      titleTypographyProps={{ variant: 'h6' }}
      subheader="Envia automaticamente o XML das NFS-e emitidas ao escritório de contabilidade (Onvio / Domínio Sistemas)"
      sx={{ pb: 0 }}
      action={
        <Tooltip title="Recarregar">
          <span>
            <IconButton onClick={carregar} disabled={loading}>
              <Iconify icon="solar:refresh-linear" />
            </IconButton>
          </span>
        </Tooltip>
      }
    />
  );

  if (loading) {
    return (
      <Card>
        {renderHeader}
        <Divider sx={{ mt: 2 }} />
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={80} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {renderHeader}
      <Divider sx={{ mt: 2 }} />
      <CardContent>
        {!integrationKeyConfigurada ? (
          // ── Wizard de ativação ──────────────────────────────────────────
          <Stack spacing={2}>
            <Alert severity="info">
              O contador gera uma chave de integração no Domínio (uma por CNPJ, não expira). Cole-a
              abaixo para validar e ativar o envio automático dos XMLs.
            </Alert>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
              <TextField
                fullWidth
                label="Chave do contador"
                value={chaveContador}
                onChange={(e) => setChaveContador(e.target.value)}
                placeholder="Cole aqui a chave fornecida pelo escritório"
              />
              <LoadingButton
                variant="outlined"
                loading={validando}
                onClick={handleValidarChave}
                startIcon={<Iconify icon="solar:check-circle-bold" />}
                sx={{ minWidth: 140, height: 56 }}
              >
                Validar
              </LoadingButton>
            </Stack>

            {info && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: 1,
                  borderColor: cnpjConfere ? 'divider' : 'error.light',
                  bgcolor: (t) => alpha(t.palette.grey[500], 0.06),
                }}
              >
                <Typography variant="overline" color="text.secondary">
                  Conferência
                </Typography>
                <Grid container spacing={1.5} sx={{ mt: 0 }}>
                  <Grid xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Escritório
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {info.escritorioNome || '-'}
                    </Typography>
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Cliente (Domínio)
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {info.clienteNome || '-'}
                    </Typography>
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      CNPJ
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {info.clienteCnpj || '-'}
                    </Typography>
                  </Grid>
                </Grid>
                {!cnpjConfere && (
                  <Alert severity="error" sx={{ mt: 1.5 }}>
                    A chave pertence a outro CNPJ ({info.clienteCnpj}). O CNPJ deste cliente é{' '}
                    {clienteCnpj}. Verifique com seu contador.
                  </Alert>
                )}
              </Box>
            )}

            <Box>
              <LoadingButton
                variant="contained"
                loading={ativando}
                disabled={!info || !cnpjConfere}
                onClick={handleAtivar}
                startIcon={<Iconify icon="solar:link-bold" />}
              >
                Ativar integração
              </LoadingButton>
            </Box>
          </Stack>
        ) : (
          // ── Integração ativada ──────────────────────────────────────────
          <Stack spacing={3}>
            {/* Dados do escritório */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                bgcolor: (t) => alpha(t.palette.grey[500], 0.06),
              }}
            >
              <Grid container spacing={1.5}>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Escritório
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {config?.escritorioNome || '-'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Cliente
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {config?.clienteNome || '-'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Ativada em
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {config?.ativadoEm ? dayjs(config.ativadoEm).format('DD/MM/YYYY HH:mm') : '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Toggles */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(config?.habilitado)}
                      onChange={handleToggleHabilitado}
                      disabled={salvando}
                    />
                  }
                  label="Envio automático de XML"
                />
                <Tooltip title="Serviço extra da Domínio para guardar os XMLs na nuvem por 5 anos. O contador informa se o escritório usa.">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(config?.boxeFile)}
                        onChange={handleToggleBoxe}
                        disabled={salvando}
                      />
                    }
                    label="Usar BOX-e"
                  />
                </Tooltip>
              </Box>

              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:upload-square-bold" />}
                onClick={handleOpenEnviar}
              >
                Enviar pendentes
              </Button>
            </Stack>

            {!config?.habilitado && (
              <Alert severity="warning">
                A integração está ativada, mas o envio automático está desligado. Ligue o toggle
                acima para que novas NFS-e sejam enviadas automaticamente.
              </Alert>
            )}

            {/* Resumo */}
            <Grid container spacing={2}>
              <Grid xs={6} md={3}>
                <ResumoCard icon="solar:check-circle-bold" color="success" label="Enviados" value={resumo?.enviados} />
              </Grid>
              <Grid xs={6} md={3}>
                <ResumoCard icon="solar:clock-circle-bold" color="warning" label="Processando" value={resumo?.processando} />
              </Grid>
              <Grid xs={6} md={3}>
                <ResumoCard icon="solar:hourglass-bold" color="info" label="Pendentes" value={resumo?.pendentes} />
              </Grid>
              <Grid xs={6} md={3}>
                <ResumoCard icon="solar:danger-triangle-bold" color="error" label="Erros" value={resumo?.erros} />
              </Grid>
            </Grid>

            {/* Resumo dos eventos de cancelamento (NFS-e nacional) */}
            {resumo?.cancelamentos &&
              (resumo.cancelamentos.processando > 0 ||
                resumo.cancelamentos.enviados > 0 ||
                resumo.cancelamentos.erros > 0) && (
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Cancelamentos enviados ao Domínio
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid xs={4}>
                      <ResumoCard icon="solar:check-circle-bold" color="success" label="Enviados" value={resumo.cancelamentos.enviados} />
                    </Grid>
                    <Grid xs={4}>
                      <ResumoCard icon="solar:clock-circle-bold" color="warning" label="Processando" value={resumo.cancelamentos.processando} />
                    </Grid>
                    <Grid xs={4}>
                      <ResumoCard icon="solar:danger-triangle-bold" color="error" label="Erros" value={resumo.cancelamentos.erros} />
                    </Grid>
                  </Grid>
                </Box>
              )}

            <Typography variant="caption" color="text.secondary">
              Reenviar a chave do contador (POST ativar) substitui a chave anterior. Suporte Domínio:
              api.dominio@thomsonreuters.com
            </Typography>
          </Stack>
        )}
      </CardContent>

      {/* Modal — enviar pendentes por período */}
      <Dialog open={enviarDialogOpen} onClose={() => !enviando && setEnviarDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:upload-square-bold" width={24} sx={{ color: 'primary.main' }} />
            <Typography variant="h6">Enviar NFS-e pendentes ao Domínio</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Envia as NFS-e de saída emitidas no período que ainda não foram enviadas ao Domínio
              (máx. 200 por vez).
            </Alert>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                type="date"
                label="Início"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={enviando}
              />
              <TextField
                fullWidth
                type="date"
                label="Fim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={enviando}
              />
            </Stack>

            {resultadoEnvio && (
              <Stack spacing={1}>
                <Alert severity={resultadoEnvio.erros > 0 ? 'warning' : 'success'}>
                  <Typography variant="body2">
                    Total: {resultadoEnvio.total ?? 0} · Enviadas: {resultadoEnvio.enviadas ?? 0} ·
                    Erros: {resultadoEnvio.erros ?? 0}
                  </Typography>
                </Alert>
                {Array.isArray(resultadoEnvio.detalhes) &&
                  resultadoEnvio.detalhes.filter((d) => !d.sucesso).length > 0 && (
                    <Box
                      sx={{
                        maxHeight: 200,
                        overflow: 'auto',
                        p: 1.5,
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider',
                      }}
                    >
                      {resultadoEnvio.detalhes
                        .filter((d) => !d.sucesso)
                        .map((d) => (
                          <Typography key={d.notaFiscalId} variant="caption" display="block" color="error.main">
                            {d.notaFiscalId}: {mensagemErroDominio(d.erro) || 'erro'}
                          </Typography>
                        ))}
                    </Box>
                  )}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setEnviarDialogOpen(false)} disabled={enviando}>
            Fechar
          </Button>
          <LoadingButton
            variant="contained"
            loading={enviando}
            startIcon={<Iconify icon="solar:upload-square-bold" />}
            onClick={handleEnviarLote}
          >
            Enviar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
