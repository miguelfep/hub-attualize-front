'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useGetBlogPost } from 'src/actions/blog';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Markdown } from 'src/components/markdown';
import { EmptyContent } from 'src/components/empty-content';

import { PostDetailsHero } from '../post-details-hero';
import { PostCommentModeration } from '../post-comment-moderation';

// ----------------------------------------------------------------------

const STATUS_LABEL = {
  publicado: { text: 'Publicado', color: 'success' },
  rascunho: { text: 'Rascunho', color: 'warning' },
  arquivado: { text: 'Arquivado', color: 'default' },
};

export function PostDetailsView({ slug }) {
  const { post, postLoading } = useGetBlogPost(slug);

  if (!postLoading && !post) {
    return (
      <DashboardContent>
        <EmptyContent
          filled
          title="Post não encontrado!"
          description="A postagem que você está procurando não existe ou foi removida."
        />
      </DashboardContent>
    );
  }

  if (!post) {
    return <DashboardContent>{null}</DashboardContent>;
  }

  const statusInfo = STATUS_LABEL[post.status] || { text: post.status, color: 'default' };

  return (
    <DashboardContent maxWidth={false} disablePadding>
      <Container maxWidth={false} sx={{ px: { sm: 5 } }}>
        <Stack spacing={1.5} direction="row" alignItems="center" sx={{ mb: { xs: 3, md: 5 } }}>
          <Button
            component={RouterLink}
            href={paths.dashboard.post.root}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          >
            Voltar
          </Button>

          <Label color={statusInfo.color}>{statusInfo.text}</Label>

          <Box sx={{ flexGrow: 1 }} />

          {post.status === 'publicado' && (
            <Tooltip title="Ver no site">
              <IconButton
                component={RouterLink}
                href={paths.post.details(post.slug)}
                target="_blank"
              >
                <Iconify icon="eva:external-link-fill" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Editar">
            <IconButton component={RouterLink} href={paths.dashboard.post.edit(post.slug)}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Container>

      <PostDetailsHero
        title={post.title}
        coverUrl={post.coverUrl}
        createdAt={post.createdAt}
        author={post.author?.name}
      />

      <Stack sx={{ pb: 5, mx: 'auto', maxWidth: 720, mt: { xs: 5, md: 10 }, px: { xs: 2, sm: 3 } }}>
        {post.description && <Typography variant="subtitle1">{post.description}</Typography>}

        <Markdown asMarkdown children={post.content} />

        {post.tags?.length > 0 && (
          <Stack
            spacing={3}
            sx={{
              py: 3,
              mt: 3,
              borderTop: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
              borderBottom: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
            }}
          >
            <Stack direction="row" flexWrap="wrap" spacing={1}>
              {post.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="soft" />
              ))}
            </Stack>
          </Stack>
        )}

        {post.faq?.length > 0 && (
          <Stack sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              FAQ
            </Typography>
            {post.faq.map((item, index) => (
              <Stack key={index} spacing={0.5} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">{item.pergunta}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {item.resposta}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}

        <PostCommentModeration postId={post.id} />
      </Stack>
    </DashboardContent>
  );
}
