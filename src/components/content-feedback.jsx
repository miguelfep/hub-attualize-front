'use client';

import { useMemo, useState } from 'react';

import { toast } from 'sonner';
import Rating from '@mui/material/Rating';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useAuthContext } from 'src/auth/hooks';
import { useEmpresa } from 'src/hooks/use-empresa';
import { createAvaliacao, useAvaliacoes } from 'src/actions/avaliacoes';

function getInitials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return 'C';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function ContentFeedback({
  feedbackKey,
  referenciaId,
  title = 'Avalie o conteúdo',
  description = 'Nos conte o que achou. Sua opinião é muito importante!',
  questionLabel = 'Como você avalia este conteúdo?',
  placeholder = 'O que mais chamou sua atenção? O que podemos melhorar?',
  helperText = 'Compartilhe seu comentário (opcional)',
  successMessage = 'Obrigado! Seu feedback foi enviado com sucesso.',
  errorMessage = 'Não foi possível enviar o feedback.',
  emptyStateMessage = 'Ainda não recebemos feedbacks para este conteúdo. Seja o primeiro a compartilhar sua opinião!',
}) {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const displayName = user?.displayName || user?.name || user?.fullName || user?.nome || 'Cliente';
  const userEmail = user?.email || user?.mail || '';

  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;

  const { avaliacoes, isLoading, mutate } = useAvaliacoes(
    {
      feedback: feedbackKey,
      status: 'ativo',
      ordenacao: 'recente',
      limit: 50,
    },
    { enabled: Boolean(feedbackKey) }
  );

  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emptyState = useMemo(() => !isLoading && (!avaliacoes || avaliacoes.length === 0), [avaliacoes, isLoading]);

  const canSubmit = Boolean(clienteProprietarioId && nota > 0);

  const handleSubmit = async () => {
    if (!clienteProprietarioId) {
      toast.error('Selecione uma empresa para enviar seu feedback.');
      return;
    }

    if (nota <= 0) {
      toast.error('Escolha uma nota para avaliar o conteúdo.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        clienteProprietarioId,
        feedback: feedbackKey,
        nota,
        comentario: comentario.trim(),
        usuario: {
          id: userId,
          nome: displayName,
          email: userEmail,
        },
      };

      if (referenciaId) {
        payload.referenciaId = referenciaId;
      }

      await createAvaliacao(payload);
      toast.success(successMessage);
      setComentario('');
      setNota(5);
      mutate?.();
    } catch (error) {
      const message = error?.response?.data?.message || errorMessage;
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack spacing={1}>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Stack>

          <Divider flexItem sx={{ borderStyle: 'dashed' }} />

          {!loadingEmpresas && !clienteProprietarioId && (
            <Alert severity="info">Vincule ou selecione uma empresa para registrar sua avaliação.</Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>{getInitials(displayName)}</Avatar>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1">{displayName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {questionLabel}
                </Typography>
              </Stack>
            </Stack>

            <Rating
              name={`${feedbackKey}-rating`}
              value={nota}
              precision={1}
              onChange={(_, value) => setNota(Math.round(value || 0))}
              size="large"
            />
          </Stack>

          <TextField
            fullWidth
            multiline
            minRows={4}
            label={helperText}
            placeholder={placeholder}
            value={comentario}
            onChange={(event) => setComentario(event.target.value)}
            inputProps={{ maxLength: 1000 }}
            helperText={`${comentario.length}/1000`}
          />

          <LoadingButton
            variant="contained"
            size="large"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!canSubmit || submitting}
          >
            Enviar feedback
          </LoadingButton>

          <Divider flexItem sx={{ borderStyle: 'dashed' }} />

          {isLoading && (
            <Stack spacing={2}>
              {[...Array(3)].map((_, index) => (
                <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                  <Skeleton variant="circular" width={48} height={48} />
                  <Stack spacing={1} flex={1}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="20%" />
                    <Skeleton variant="rectangular" height={60} />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}

          {emptyState && (
            <Alert severity="info" variant="outlined">
              {emptyStateMessage}
            </Alert>
          )}

          {!isLoading && !emptyState && (
            <Stack spacing={2.5}>
              <Typography variant="subtitle1">O que os clientes estão dizendo</Typography>
              <Stack spacing={2.5}>
                {avaliacoes.map((item) => {
                  const nome = item?.usuario?.nome || 'Cliente';
                  return (
                    <Stack key={item?._id || `${item?.usuario?.id}-${item?.createdAt}`} spacing={1.5}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>{getInitials(nome)}</Avatar>
                        <Stack spacing={0.5} flex={1}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5} alignItems={{ sm: 'center' }}>
                            <Typography variant="subtitle1">{nome}</Typography>
                            <Rating value={item?.nota || 0} precision={0.5} readOnly size="small" />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(item?.createdAt)}
                          </Typography>
                          {item?.comentario && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {item.comentario}
                            </Typography>
                          )}
                          {item?.respostaEmpresa && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                Resposta da Attualize
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {item.respostaEmpresa}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                                {item?.dataResposta
                                  ? `Respondido em ${formatDate(item.dataResposta)}`
                                  : 'Respondido recentemente'}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Stack>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                    </Stack>
                  );
                })}
              </Stack>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

