'use client';

import { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';

import Rating from '@mui/material/Rating';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard/main';
import {
  useAvaliacao,
  atualizarStatusAvaliacao,
  responderAvaliacao,
  deletarAvaliacao,
} from 'src/actions/avaliacoes';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'oculto', label: 'Oculto' },
  { value: 'reportado', label: 'Reportado' },
];

function formatDate(value, withTime = true) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return withTime
    ? date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : date.toLocaleDateString('pt-BR');
}

function getStatusColor(status) {
  switch (status) {
    case 'pendente':
      return 'warning';
    case 'ativo':
      return 'success';
    case 'reportado':
      return 'warning';
    case 'oculto':
    default:
      return 'default';
  }
}

// ----------------------------------------------------------------------

export default function AvaliacaoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const avaliacaoId = params?.id;

  const { data, isLoading, error, mutate } = useAvaliacao(avaliacaoId);

  const avaliacao = data?.data || data;

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [respostaDialogOpen, setRespostaDialogOpen] = useState(false);
  const [novoStatus, setNovoStatus] = useState('pendente');
  const [resposta, setResposta] = useState('');

  const handleOpenStatusDialog = useCallback(() => {
    setNovoStatus(avaliacao?.status || 'pendente');
    setStatusDialogOpen(true);
  }, [avaliacao]);

  const handleOpenRespostaDialog = useCallback(() => {
    setResposta(avaliacao?.respostaEmpresa || '');
    setRespostaDialogOpen(true);
  }, [avaliacao]);

  const closeDialogs = () => {
    setStatusDialogOpen(false);
    setRespostaDialogOpen(false);
  };

  const handleAtualizarStatus = async () => {
    try {
      await atualizarStatusAvaliacao(avaliacaoId, { status: novoStatus });
      toast.success('Status atualizado com sucesso!');
      closeDialogs();
      mutate?.();
    } catch (err) {
      const message = err?.response?.data?.message || 'Erro ao atualizar status.';
      toast.error(message);
    }
  };

  const handleResponder = async () => {
    try {
      await responderAvaliacao(avaliacaoId, { respostaEmpresa: resposta.trim() });
      toast.success('Resposta registrada.');
      closeDialogs();
      mutate?.();
    } catch (err) {
      const message = err?.response?.data?.message || 'Erro ao responder avaliação.';
      toast.error(message);
    }
  };

  const handleExcluir = async () => {
    try {
      await deletarAvaliacao(avaliacaoId);
      toast.success('Avaliação excluída.');
      router.push(paths.dashboard.avaliacoes.root);
    } catch (err) {
      const message = err?.response?.data?.message || 'Erro ao excluir avaliação.';
      toast.error(message);
    }
  };

  const clienteNome = useMemo(() => {
    const cliente = avaliacao?.clienteProprietarioId;
    if (!cliente) return '—';
    return cliente.nome || cliente.razaoSocial || cliente.nomeFantasia || cliente.email || '—';
  }, [avaliacao]);

  if (isLoading) {
    return (
      <DashboardContent>
        <Stack spacing={3} alignItems="center" sx={{ py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Carregando avaliação...
          </Typography>
        </Stack>
      </DashboardContent>
    );
  }

  if (error || !avaliacao) {
    return (
      <DashboardContent>
        <Alert severity="error">
          Não foi possível carregar esta avaliação. Verifique se ela ainda existe ou tente novamente.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => router.push(paths.dashboard.avaliacoes.root)}>
            Voltar para listagem
          </Button>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="h4">Detalhes da avaliação</Typography>
            <Typography variant="body2" color="text.secondary">
              Visualize e gerencie o feedback enviado pelo cliente.
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" color="warning" onClick={handleOpenStatusDialog}>
              Alterar status
            </Button>
            <Button variant="outlined" color="info" onClick={handleOpenRespostaDialog}>
              Responder
            </Button>
            <Button variant="outlined" color="error" onClick={handleExcluir}>
              Excluir
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                    <Stack spacing={0.5}>
                      <Typography variant="h6">{clienteNome}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {avaliacao?.usuario?.nome} • {avaliacao?.usuario?.email}
                      </Typography>
                    </Stack>
                    <Chip
                      label={avaliacao.status}
                      color={getStatusColor(avaliacao.status)}
                      variant="soft"
                    />
                  </Stack>

                  <Divider flexItem sx={{ borderStyle: 'dashed' }} />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <Rating value={avaliacao.nota || 0} precision={1} readOnly size="large" />
                    <Typography variant="subtitle1">{avaliacao.nota}/5</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {avaliacao.feedback}
                    </Typography>
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Comentário</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {avaliacao.comentario || '—'}
                    </Typography>
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Resposta da empresa</Typography>
                    {avaliacao.respostaEmpresa ? (
                      <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'background.neutral' }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {avaliacao.respostaEmpresa}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Respondido em {formatDate(avaliacao.dataResposta)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma resposta registrada até o momento.
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
              <CardActions>
                <Button onClick={() => router.push(paths.dashboard.avaliacoes.root)}>Voltar</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1">Metadados</Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Avaliação ID
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {avaliacaoId}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Cliente proprietario
                    </Typography>
                    <Typography variant="body2">
                      {avaliacao?.clienteProprietarioId?._id || '—'}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Referencia (opcional)
                    </Typography>
                    <Typography variant="body2">
                      {avaliacao?.referenciaId || '—'}
                    </Typography>
                  </Stack>

                  <Divider flexItem sx={{ borderStyle: 'dashed', my: 1 }} />

                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Criado em
                    </Typography>
                    <Typography variant="body2">{formatDate(avaliacao?.createdAt)}</Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Atualizado em
                    </Typography>
                    <Typography variant="body2">{formatDate(avaliacao?.updatedAt)}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      <Dialog open={statusDialogOpen} onClose={closeDialogs} maxWidth="xs" fullWidth>
        <DialogTitle>Alterar status</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Defina o status desta avaliação. Itens ocultos não aparecem na listagem pública.
            </Typography>
            <TextField
              select
              label="Status"
              value={novoStatus}
              onChange={(event) => setNovoStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Cancelar</Button>
          <LoadingButton variant="contained" color="warning" onClick={handleAtualizarStatus}>
            Atualizar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={respostaDialogOpen} onClose={closeDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Responder avaliação</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Escreva uma resposta para o cliente. Ela ficará visível no portal.
            </Typography>
            <TextField
              label="Resposta"
              multiline
              minRows={3}
              value={resposta}
              onChange={(event) => setResposta(event.target.value)}
              inputProps={{ maxLength: 1000 }}
              helperText={`${resposta.length}/1000 caracteres`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Cancelar</Button>
          <LoadingButton variant="contained" onClick={handleResponder}>
            Enviar resposta
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}


