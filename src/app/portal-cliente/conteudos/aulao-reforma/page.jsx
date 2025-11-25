'use client';

import { toast } from 'sonner';
import { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import Rating from '@mui/material/Rating';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Avatar,
  Divider,
  Skeleton,
  Container,
  TextField,
  Typography,
  CardContent,
} from '@mui/material';

import { useEmpresa } from 'src/hooks/use-empresa';

import { useAvaliacoes, createAvaliacao } from 'src/actions/avaliacoes';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

const HERO_DESCRIPTION =
  'Assista ao Aulão Reforma exclusivo para clientes Attualize, entenda os impactos da Reforma Tributária e compartilhe seu feedback com o nosso time.';

const AULAO_REFORMA_ID = process.env.NEXT_PUBLIC_AULAO_REFORMA_ID || null;

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

export default function AulaoReformaPage() {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const displayName = user?.displayName || user?.name || user?.fullName || user?.nome || 'Cliente';
  const userEmail = user?.email || user?.mail || '';

  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;

  const {
    avaliacoes,
    isLoading,
    mutate,
  } = useAvaliacoes(
    {
      feedback: 'aulao-reforma',
      status: 'ativo',
      ordenacao: 'recente',
      limit: 50,
    },
    { enabled: true }
  );

  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emptyState = !isLoading && (!avaliacoes || avaliacoes.length === 0);

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
        feedback: 'aulao-reforma',
        nota,
        comentario: comentario.trim(),
        usuario: {
          id: userId,
          nome: displayName,
          email: userEmail,
        },
      };

      if (AULAO_REFORMA_ID) {
        payload.referenciaId = AULAO_REFORMA_ID;
      }

      await createAvaliacao(payload);
      toast.success('Obrigado! Seu feedback foi enviado com sucesso.');
      setComentario('');
      setNota(5);
      mutate?.();
    } catch (error) {
      const message = error?.response?.data?.message || 'Não foi possível enviar o feedback.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
      <Stack spacing={4}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={<Iconify icon="solar:book-bookmark-bold-duotone" />}
              label="Conteúdos Attualize"
              color="primary"
              variant="outlined"
            />
            <Chip icon={<Iconify icon="solar:play-circle-bold-duotone" />} label="Vídeo" size="small" />
          </Stack>

          <Typography variant="h3">Aulão Reforma</Typography>
          <Typography variant="body1" color="text.secondary">
            {HERO_DESCRIPTION}
          </Typography>
        </Stack>

        <Card sx={{ overflow: 'hidden', borderRadius: 3 }}>
          <Box
            sx={{
              position: 'relative',
              paddingTop: '56.25%',
              bgcolor: 'background.neutral',
            }}
          >
            <Box
              component="iframe"
              src="https://www.youtube.com/embed/Qo-tJ6kWTJ8"
              title="Aulão Reforma"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              sx={{
                border: 0,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          </Box>
        </Card>

        {!loadingEmpresas && !clienteProprietarioId && (
          <Alert severity="info">Vincule ou selecione uma empresa para registrar sua avaliação.</Alert>
        )}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={2.5}>
              <Stack spacing={1}>
                <Typography variant="h5">Avalie o conteúdo</Typography>
                <Typography variant="body2" color="text.secondary">
                  Conte pra gente o que achou do Aulão Reforma. Sua opinião é muito importante!
                </Typography>
              </Stack>

              <Divider flexItem sx={{ borderStyle: 'dashed' }} />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>{getInitials(displayName)}</Avatar>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1">{displayName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Como você avalia essa aula?
                    </Typography>
                  </Stack>
                </Stack>

                <Rating
                  name="aulao-reforma-rating"
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
                label="Compartilhe seu comentário (opcional)"
                placeholder="O que mais chamou sua atenção? O que podemos melhorar?"
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
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={2.5}>
              <Stack spacing={1}>
                <Typography variant="h5">O que os clientes estão dizendo</Typography>
                <Typography variant="body2" color="text.secondary">
                  Veja os comentários e notas já enviados para o Aulão Reforma.
                </Typography>
              </Stack>

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
                  Ainda não recebemos feedbacks para esta aula. Seja o primeiro a compartilhar sua opinião!
                </Alert>
              )}

              {!isLoading && !emptyState && (
                <Stack spacing={2.5}>
                  {avaliacoes.map((item) => {
                    const nome = item?.usuario?.nome || 'Cliente';
                    return (
                      <Stack key={item?._id || `${item?.usuario?.id}-${item?.createdAt}`} spacing={1.5}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                            {getInitials(nome)}
                          </Avatar>
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
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}


