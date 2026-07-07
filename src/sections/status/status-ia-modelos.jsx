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
  Divider,
  MenuItem,
  TextField,
  Typography,
  CardContent,
  Autocomplete,
  LinearProgress,
} from '@mui/material';

import { useGetAllClientes } from 'src/actions/clientes';
import { treinarMlCliente, testarSugestaoMl, obterMlStatusCliente } from 'src/actions/conciliacao';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const POLL_INTERVALO = 5000; // 5s
const POLL_MAX_TENTATIVAS = 60; // ~5 minutos

const STATUS_MODELO = {
  active: { label: 'Modelo ativo', color: 'success' },
  training: { label: 'Treinando...', color: 'info' },
  not_trained: { label: 'Não treinado', color: 'default' },
  failed: { label: 'Falha no treino', color: 'error' },
};

function formatarPercentual(valor) {
  if (valor == null || Number.isNaN(Number(valor))) return '—';
  const n = Number(valor);
  return `${(n <= 1 ? n * 100 : n).toFixed(1)}%`;
}

function descreverSkipReason(trainingResult) {
  if (!trainingResult?.skipReason) return null;
  const { skipReason, totalRows, minSamples } = trainingResult;
  if (skipReason === 'insufficient_samples' && minSamples != null) {
    const faltam = Math.max(0, minSamples - (totalRows ?? 0));
    return `Amostras insuficientes: ${totalRows ?? 0} de ${minSamples} transações conciliadas necessárias (faltam ${faltam}).`;
  }
  return `Treino não publicado: ${skipReason}`;
}

/** Normaliza a resposta do testar-sugestao para uma lista de {conta, codigo, confianca}. */
function extrairSugestoes(payload) {
  const d = payload?.data ?? payload;
  const arr =
    d?.sugestoes || d?.suggestions || d?.top3 || d?.resultados || (Array.isArray(d) ? d : []);
  return (arr || []).map((s) => ({
    conta:
      s?.conta?.nome ||
      s?.contaNome ||
      s?.nome ||
      s?.label ||
      (typeof s?.conta === 'string' ? s.conta : null) ||
      'Conta sem nome',
    codigo: s?.conta?.codigo || s?.contaCodigo || s?.codigo || null,
    confianca: s?.confianca ?? s?.confidence ?? s?.score ?? s?.probability ?? null,
  }));
}

// ----------------------------------------------------------------------

export function StatusIaModelos() {
  const { data: clientes, isLoading: clientesLoading } = useGetAllClientes();

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [mlStatus, setMlStatus] = useState(null);
  const [carregandoStatus, setCarregandoStatus] = useState(false);
  const [erroStatus, setErroStatus] = useState(null);

  const [treinando, setTreinando] = useState(false);
  const pollRef = useRef(null);

  const [descricaoTeste, setDescricaoTeste] = useState('');
  const [tipoTeste, setTipoTeste] = useState('debito');
  const [valorTeste, setValorTeste] = useState('');
  const [testando, setTestando] = useState(false);
  const [sugestoes, setSugestoes] = useState(null);

  const pararPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const carregarStatus = useCallback(async (clienteId) => {
    if (!clienteId) return null;
    try {
      setCarregandoStatus(true);
      setErroStatus(null);
      const res = await obterMlStatusCliente(clienteId);
      const data = res.data?.data ?? res.data;
      setMlStatus(data);
      return data;
    } catch (error) {
      setMlStatus(null);
      setErroStatus(error?.response?.data?.message || 'Falha ao consultar o status do modelo');
      return null;
    } finally {
      setCarregandoStatus(false);
    }
  }, []);

  // Troca de cliente: limpa estado anterior e busca o novo status
  useEffect(() => {
    pararPolling();
    setMlStatus(null);
    setSugestoes(null);
    setTreinando(false);
    if (clienteSelecionado?._id) {
      carregarStatus(clienteSelecionado._id);
    }
  }, [clienteSelecionado, carregarStatus, pararPolling]);

  useEffect(() => pararPolling, [pararPolling]);

  const handleRetreinar = async () => {
    if (!clienteSelecionado?._id) return;
    const clienteId = clienteSelecionado._id;
    try {
      setTreinando(true);
      await treinarMlCliente(clienteId);
      toast.success('Treinamento iniciado — acompanhando o progresso...');

      let tentativas = 0;
      pararPolling();
      pollRef.current = setInterval(async () => {
        tentativas += 1;
        const data = await carregarStatus(clienteId);
        const jobStatus = data?.lastJob?.jobStatus;
        if (jobStatus === 'done' || jobStatus === 'failed' || tentativas >= POLL_MAX_TENTATIVAS) {
          pararPolling();
          setTreinando(false);
          if (jobStatus === 'done') {
            toast.success('Treinamento concluído!');
          } else if (jobStatus === 'failed') {
            toast.error('O treinamento falhou — veja os detalhes do último job');
          } else {
            toast.warning('Treinamento ainda em andamento — atualize manualmente mais tarde');
          }
        }
      }, POLL_INTERVALO);
    } catch (error) {
      setTreinando(false);
      toast.error(error?.response?.data?.message || 'Falha ao iniciar o treinamento');
    }
  };

  const handleTestarSugestao = async () => {
    if (!clienteSelecionado?._id || !descricaoTeste.trim()) return;
    // O modelo classifica débito e crédito separadamente: tipo e valor são obrigatórios.
    if (valorTeste === '' || Number.isNaN(Number(valorTeste))) {
      toast.error('Informe o valor da transação para testar.');
      return;
    }
    try {
      setTestando(true);
      setSugestoes(null);
      const payload = {
        descricao: descricaoTeste.trim(),
        tipo: tipoTeste,
        valor: Number(valorTeste),
      };
      const res = await testarSugestaoMl(clienteSelecionado._id, payload);
      setSugestoes(extrairSugestoes(res.data));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Falha ao testar a sugestão');
    } finally {
      setTestando(false);
    }
  };

  const statusInfo = STATUS_MODELO[mlStatus?.status] || {
    label: mlStatus?.status || '—',
    color: 'default',
  };
  const metrics = mlStatus?.metrics || {};
  const avisoSkip = descreverSkipReason(mlStatus?.lastJob?.trainingResult);

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Iconify icon="solar:cpu-bolt-bold" width={24} />
          <Typography variant="h6">Modelos de IA por cliente</Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Classificador de transações em contas contábeis (TensorFlow), treinado por cliente com
          base nas conciliações já confirmadas.
        </Typography>

        <Autocomplete
          options={clientes || []}
          loading={clientesLoading}
          value={clienteSelecionado}
          onChange={(_, novo) => setClienteSelecionado(novo)}
          getOptionLabel={(option) => option?.nome || option?.razaoSocial || ''}
          isOptionEqualToValue={(option, value) => option?._id === value?._id}
          renderInput={(params) => (
            <TextField {...params} label="Cliente" placeholder="Selecione um cliente" />
          )}
          sx={{ maxWidth: 480, mb: 3 }}
        />

        {carregandoStatus && <LinearProgress sx={{ mb: 2 }} />}

        {erroStatus && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {erroStatus}
          </Alert>
        )}

        {clienteSelecionado && mlStatus && (
          <>
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid xs={12} md={4}>
                <Stack spacing={1}>
                  <Chip
                    label={statusInfo.label}
                    color={statusInfo.color}
                    variant="soft"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {mlStatus.version ? `Modelo v${mlStatus.version}` : 'Sem versão publicada'}
                    {mlStatus.activatedAt
                      ? ` — treinado em ${new Date(mlStatus.activatedAt).toLocaleDateString('pt-BR')}`
                      : ''}
                  </Typography>
                  {mlStatus.drift?.score != null && (
                    <Typography variant="body2" color="text.secondary">
                      Drift: {Number(mlStatus.drift.score).toFixed(3)} — quanto maior, mais
                      desatualizado está o modelo
                    </Typography>
                  )}
                </Stack>
              </Grid>

              <Grid xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Acerto 1ª sugestão
                </Typography>
                <Typography variant="h6">{formatarPercentual(metrics.top1Accuracy)}</Typography>
              </Grid>
              <Grid xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Acerto top-3
                </Typography>
                <Typography variant="h6">{formatarPercentual(metrics.top3Accuracy)}</Typography>
              </Grid>
              <Grid xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Amostras de treino
                </Typography>
                <Typography variant="h6">{metrics.totalSamples ?? '—'}</Typography>
              </Grid>
              <Grid xs={6} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <LoadingButton
                  fullWidth
                  variant="outlined"
                  loading={treinando}
                  startIcon={<Iconify icon="solar:refresh-circle-bold" />}
                  onClick={handleRetreinar}
                >
                  {treinando ? 'Treinando...' : 'Retreinar'}
                </LoadingButton>
              </Grid>
            </Grid>

            {avisoSkip && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {avisoSkip}
              </Alert>
            )}

            {mlStatus.lastJob?.jobStatus === 'failed' && !avisoSkip && (
              <Alert severity="error" sx={{ mb: 2 }}>
                O último treinamento falhou.
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Testar sugestão
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Digite a descrição, o tipo (débito/crédito) e o valor de uma transação para ver as
              contas que o modelo sugere.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Descrição da transação"
                placeholder="Ex.: PIX RECEBIDO CONSULTORIA MENSAL"
                value={descricaoTeste}
                onChange={(e) => setDescricaoTeste(e.target.value)}
              />
              <TextField
                select
                label="Tipo"
                value={tipoTeste}
                onChange={(e) => setTipoTeste(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="debito">Débito (saída)</MenuItem>
                <MenuItem value="credito">Crédito (entrada)</MenuItem>
              </TextField>
              <TextField
                label="Valor (R$)"
                type="number"
                required
                value={valorTeste}
                onChange={(e) => setValorTeste(e.target.value)}
                sx={{ minWidth: 160 }}
              />
              <LoadingButton
                variant="contained"
                loading={testando}
                disabled={!descricaoTeste.trim() || valorTeste === '' || mlStatus.status !== 'active'}
                onClick={handleTestarSugestao}
                sx={{ minWidth: 160 }}
              >
                Testar
              </LoadingButton>
            </Stack>

            {mlStatus.status !== 'active' && (
              <Typography variant="caption" color="text.secondary">
                O teste de sugestão fica disponível quando o modelo está ativo.
              </Typography>
            )}

            {sugestoes && sugestoes.length === 0 && (
              <Alert severity="info">O modelo não retornou sugestões para essa descrição.</Alert>
            )}

            {sugestoes && sugestoes.length > 0 && (
              <Stack spacing={1}>
                {sugestoes.map((s, index) => (
                  <Box
                    key={`${s.conta}-${index}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Typography variant="body2">
                      {index + 1}. {s.codigo ? `${s.codigo} — ` : ''}
                      {s.conta}
                    </Typography>
                    <Chip
                      size="small"
                      variant="soft"
                      color={index === 0 ? 'success' : 'default'}
                      label={formatarPercentual(s.confianca)}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </>
        )}

        {!clienteSelecionado && (
          <Typography variant="body2" color="text.secondary">
            Selecione um cliente para ver o status do modelo de IA dele.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default StatusIaModelos;
