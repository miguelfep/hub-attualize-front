'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import LinearProgress from '@mui/material/LinearProgress';

import { fDate } from 'src/utils/format-time';

import {
  deleteBlogComment,
  rejectBlogComment,
  useGetBlogComments,
  approveBlogComment,
  createBlogCommentAdmin,
} from 'src/actions/blog';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function ModerationItem({ postId, comment, onChanged }) {
  const [busy, setBusy] = useState('');

  const pendente = comment.aprovado === false;

  const run = async (key, action, successMsg) => {
    setBusy(key);
    try {
      await action();
      toast.success(successMsg);
      onChanged?.();
    } catch (error) {
      console.error(error);
      toast.error(typeof error === 'string' ? error : 'Não foi possível concluir a ação.');
    } finally {
      setBusy('');
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={2}>
        <Avatar alt={comment.authorName} src={comment.authorAvatar || undefined}>
          {comment.authorName?.charAt(0)?.toUpperCase()}
        </Avatar>

        <Stack flexGrow={1} spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="subtitle2">{comment.authorName}</Typography>
            <Label color={pendente ? 'warning' : 'success'}>
              {pendente ? 'Pendente' : 'Aprovado'}
            </Label>
            {comment.source === 'wordpress' && (
              <Label color="info" variant="soft">
                WordPress
              </Label>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {fDate(comment.publishedAt)}
            </Typography>
          </Stack>

          {comment.authorEmail && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {comment.authorEmail}
            </Typography>
          )}

          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {comment.contentMarkdown}
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {pendente ? (
              <LoadingButton
                size="small"
                color="success"
                variant="outlined"
                loading={busy === 'approve'}
                startIcon={<Iconify icon="solar:check-circle-bold" />}
                onClick={() => run('approve', () => approveBlogComment(postId, comment._id), 'Comentário aprovado.')}
              >
                Aprovar
              </LoadingButton>
            ) : (
              <LoadingButton
                size="small"
                color="warning"
                variant="outlined"
                loading={busy === 'reject'}
                startIcon={<Iconify icon="solar:close-circle-bold" />}
                onClick={() => run('reject', () => rejectBlogComment(postId, comment._id), 'Comentário reprovado (pendente).')}
              >
                Reprovar
              </LoadingButton>
            )}

            <LoadingButton
              size="small"
              color="error"
              variant="outlined"
              loading={busy === 'delete'}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => run('delete', () => deleteBlogComment(postId, comment._id), 'Comentário removido.')}
            >
              Excluir
            </LoadingButton>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

function AddCommentForm({ postId, onAdded }) {
  const [values, setValues] = useState({ authorName: '', contentMarkdown: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.authorName.trim() || !values.contentMarkdown.trim()) {
      toast.error('Preencha o autor e o comentário.');
      return;
    }
    setSubmitting(true);
    try {
      await createBlogCommentAdmin(postId, {
        authorName: values.authorName.trim(),
        contentMarkdown: values.contentMarkdown.trim(),
        aprovado: true,
      });
      toast.success('Comentário adicionado.');
      setValues({ authorName: '', contentMarkdown: '' });
      onAdded?.();
    } catch (error) {
      console.error(error);
      toast.error(typeof error === 'string' ? error : 'Erro ao adicionar comentário.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card component="form" onSubmit={handleSubmit} variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2">Adicionar comentário</Typography>
        <TextField
          size="small"
          label="Autor"
          value={values.authorName}
          onChange={handleChange('authorName')}
        />
        <TextField
          size="small"
          label="Comentário"
          multiline
          rows={3}
          value={values.contentMarkdown}
          onChange={handleChange('contentMarkdown')}
        />
        <Stack direction="row" justifyContent="flex-end">
          <LoadingButton
            type="submit"
            size="small"
            variant="contained"
            loading={submitting}
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Adicionar
          </LoadingButton>
        </Stack>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function PostCommentModeration({ postId }) {
  const { comentarios, comentariosLoading, comentariosMutate } = useGetBlogComments(postId);

  const pendentes = comentarios.filter((c) => c.aprovado === false).length;

  return (
    <Stack spacing={2} sx={{ mt: 4 }}>
      <Divider />

      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="solar:chat-round-dots-bold" width={24} sx={{ color: 'primary.main' }} />
        <Typography variant="h6">Comentários ({comentarios.length})</Typography>
        {pendentes > 0 && <Label color="warning">{pendentes} pendente(s)</Label>}
      </Stack>

      <AddCommentForm postId={postId} onAdded={comentariosMutate} />

      {comentariosLoading && <LinearProgress />}

      {!comentariosLoading && comentarios.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Nenhum comentário neste post.
        </Typography>
      )}

      <Stack spacing={2}>
        {comentarios.map((comment) => (
          <ModerationItem
            key={comment._id}
            postId={postId}
            comment={comment}
            onChanged={comentariosMutate}
          />
        ))}
      </Stack>
    </Stack>
  );
}
