'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  deleteBlogComment,
  rejectBlogComment,
  approveBlogComment,
  useGetAllBlogComments,
} from 'src/actions/blog';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'pendente', label: 'Pendentes' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'all', label: 'Todos' },
];

export function PostCommentsInboxView() {
  const [tab, setTab] = useState('pendente');

  const status = tab === 'all' ? undefined : tab;
  const { comentarios, comentariosLoading, comentariosMutate } = useGetAllBlogComments({
    status,
    limit: 200,
  });

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Comentários"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Blog', href: paths.dashboard.post.root },
          { name: 'Comentários' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {comentariosLoading && <LinearProgress sx={{ mb: 2 }} />}

      {!comentariosLoading && comentarios.length === 0 && (
        <EmptyContent
          filled
          title="Nenhum comentário"
          description={
            tab === 'pendente'
              ? 'Não há comentários aguardando moderação.'
              : 'Nenhum comentário encontrado.'
          }
          sx={{ py: 8 }}
        />
      )}

      <Stack spacing={2}>
        {comentarios.map((item) => (
          <InboxItem
            key={item.comentario._id}
            item={item}
            onChanged={comentariosMutate}
          />
        ))}
      </Stack>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function InboxItem({ item, onChanged }) {
  const { postId, postTitulo, postSlug, comentario } = item;
  const [busy, setBusy] = useState('');

  const pendente = comentario.aprovado === false;

  const run = useCallback(
    async (key, action, msg) => {
      setBusy(key);
      try {
        await action();
        toast.success(msg);
        onChanged?.();
      } catch (error) {
        console.error(error);
        toast.error(typeof error === 'string' ? error : 'Não foi possível concluir a ação.');
      } finally {
        setBusy('');
      }
    },
    [onChanged]
  );

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={2}>
        <Avatar alt={comentario.authorName} src={comentario.authorAvatar || undefined}>
          {comentario.authorName?.charAt(0)?.toUpperCase()}
        </Avatar>

        <Stack flexGrow={1} spacing={1} sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="subtitle2">{comentario.authorName}</Typography>
            <Label color={pendente ? 'warning' : 'success'}>
              {pendente ? 'Pendente' : 'Aprovado'}
            </Label>
            {comentario.source === 'wordpress' && (
              <Label color="info" variant="soft">
                WordPress
              </Label>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {fDate(comentario.publishedAt)}
            </Typography>
          </Stack>

          {/* Post de origem */}
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
            <Iconify icon="solar:document-text-bold" width={14} />
            <Typography variant="caption">em</Typography>
            <Link
              component={RouterLink}
              href={paths.dashboard.post.details(postSlug)}
              variant="caption"
              sx={{ fontWeight: 600 }}
            >
              {postTitulo}
            </Link>
          </Stack>

          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {comentario.contentMarkdown}
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {pendente ? (
              <LoadingButton
                size="small"
                color="success"
                variant="outlined"
                loading={busy === 'approve'}
                startIcon={<Iconify icon="solar:check-circle-bold" />}
                onClick={() =>
                  run('approve', () => approveBlogComment(postId, comentario._id), 'Comentário aprovado.')
                }
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
                onClick={() =>
                  run('reject', () => rejectBlogComment(postId, comentario._id), 'Comentário reprovado (pendente).')
                }
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
              onClick={() =>
                run('delete', () => deleteBlogComment(postId, comentario._id), 'Comentário removido.')
              }
            >
              Excluir
            </LoadingButton>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
