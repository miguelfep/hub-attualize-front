'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { fDate } from 'src/utils/format-time';

import { createBlogComment } from 'src/actions/blog';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Comentários: exibe os aprovados (somente leitura) e oferece formulário
// para o visitante enviar um novo comentário (entra pendente até aprovação).
// Aninhamento via `parentWordpressId` (comentários do site são de topo).
// ----------------------------------------------------------------------

const commentKey = (c) => c._id || (c.wordpressId != null ? `wp-${c.wordpressId}` : null);

function countAll(comments) {
  return comments.reduce((total, c) => total + 1 + countAll(c.children || []), 0);
}

// Monta a árvore a partir da lista plana.
function buildTree(comments = []) {
  const nodes = comments.map((c) => ({ ...c, children: [] }));
  const byWpId = new Map();
  nodes.forEach((n) => {
    if (n.wordpressId != null) byWpId.set(n.wordpressId, n);
  });

  const roots = [];
  nodes.forEach((n) => {
    const parent = n.parentWordpressId != null ? byWpId.get(n.parentWordpressId) : null;
    if (parent) {
      parent.children.push(n);
    } else {
      roots.push(n);
    }
  });

  return roots;
}

// ----------------------------------------------------------------------

function CommentNode({ comment, depth = 0 }) {
  const { authorName, authorUrl, authorAvatar, contentHtml, contentMarkdown, publishedAt, children } =
    comment;

  return (
    <Box sx={{ ...(depth > 0 && { ml: { xs: 2, sm: 4 }, mt: 2 }) }}>
      <Card
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          borderRadius: 2,
          ...(depth > 0 && {
            borderLeft: (theme) => `3px solid ${theme.vars.palette.primary.main}`,
          }),
        }}
      >
        <Stack direction="row" spacing={2}>
          <Avatar
            alt={authorName}
            src={authorAvatar || undefined}
            sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
          >
            {authorName?.charAt(0)?.toUpperCase()}
          </Avatar>

          <Stack flexGrow={1} spacing={1}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
            >
              {authorUrl ? (
                <Link
                  href={authorUrl}
                  target="_blank"
                  rel="noopener nofollow"
                  variant="subtitle2"
                  color="inherit"
                >
                  {authorName}
                </Link>
              ) : (
                <Typography variant="subtitle2">{authorName}</Typography>
              )}

              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="solar:calendar-bold" width={14} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {fDate(publishedAt)}
                </Typography>
              </Stack>
            </Stack>

            {contentHtml ? (
              <Typography
                variant="body2"
                component="div"
                sx={{
                  lineHeight: 1.7,
                  color: 'text.primary',
                  '& p': { mb: 1.5, '&:last-child': { mb: 0 } },
                  '& a': { color: 'primary.main' },
                }}
                // Conteúdo já sanitizado pela API (contentHtml)
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {contentMarkdown}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Card>

      {children?.map((child) => (
        <CommentNode key={commentKey(child)} comment={child} depth={depth + 1} />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------

function CommentForm({ slug, onSubmitted }) {
  const [values, setValues] = useState({ authorName: '', authorEmail: '', contentMarkdown: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.authorName.trim() || !values.contentMarkdown.trim()) {
      toast.error('Preencha seu nome e o comentário.');
      return;
    }
    setSubmitting(true);
    try {
      await createBlogComment(slug, {
        authorName: values.authorName.trim(),
        authorEmail: values.authorEmail.trim() || undefined,
        contentMarkdown: values.contentMarkdown.trim(),
      });
      toast.success('Comentário enviado! Ele aparecerá após aprovação.');
      setValues({ authorName: '', authorEmail: '', contentMarkdown: '' });
      onSubmitted?.();
    } catch (error) {
      console.error(error);
      toast.error(typeof error === 'string' ? error : 'Não foi possível enviar o comentário.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Deixe seu comentário
      </Typography>

      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            required
            label="Nome"
            value={values.authorName}
            onChange={handleChange('authorName')}
          />
          <TextField
            fullWidth
            type="email"
            label="E-mail (não publicado)"
            value={values.authorEmail}
            onChange={handleChange('authorEmail')}
          />
        </Stack>

        <TextField
          fullWidth
          required
          multiline
          rows={4}
          label="Comentário"
          value={values.contentMarkdown}
          onChange={handleChange('contentMarkdown')}
        />

        <Stack direction="row" justifyContent="flex-end">
          <LoadingButton type="submit" variant="contained" loading={submitting}>
            Enviar comentário
          </LoadingButton>
        </Stack>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function PostComments({ slug, comments = [] }) {
  const tree = buildTree(comments);
  const total = countAll(tree);

  return (
    <Stack id="comentarios" sx={{ mt: 6, scrollMarginTop: 80 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ mb: 4, pb: 2, borderBottom: (theme) => `2px solid ${theme.vars.palette.divider}` }}
      >
        <Iconify icon="solar:chat-round-dots-bold" width={32} sx={{ color: 'primary.main' }} />
        <Stack>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
            Comentários
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {total} {total === 1 ? 'comentário' : 'comentários'}
          </Typography>
        </Stack>
      </Stack>

      {slug && <CommentForm slug={slug} />}

      {total > 0 ? (
        <Stack spacing={3}>
          {tree.map((comment) => (
            <CommentNode key={commentKey(comment)} comment={comment} />
          ))}
        </Stack>
      ) : (
        <Alert severity="info" variant="outlined">
          Seja o primeiro a comentar!
        </Alert>
      )}
    </Stack>
  );
}
