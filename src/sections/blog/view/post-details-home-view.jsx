'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';

import { fShortenNumber } from 'src/utils/format-number';

import { getPostComments } from 'src/actions/blog-ssr';

import { Iconify } from 'src/components/iconify';
import { Markdown } from 'src/components/markdown';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PostItem } from '../post-item';
import { PostDetailsHero } from '../post-details-hero';
import { PostCommentList } from '../post-comment-list';
import { PostCommentForm } from '../post-comment-form';

// ----------------------------------------------------------------------

export function PostDetailsHomeView({ post, latestPosts, initialComments = [], initialTotalComments = 0 }) {
  const [comments, setComments] = useState(initialComments);
  const [totalComments, setTotalComments] = useState(initialTotalComments);
  const [loadingComments, setLoadingComments] = useState(false);

  const reloadComments = useCallback(async () => {
    if (!post?.id) return;
    
    setLoadingComments(true);
    try {
      const { comments: newComments, totalComments: newTotal } = await getPostComments(post.id);
      setComments(newComments);
      setTotalComments(newTotal);
    } catch (error) {
      console.error('Erro ao recarregar comentários:', error);
    } finally {
      setLoadingComments(false);
    }
  }, [post?.id]);
  const formattedPosts = latestPosts
    .filter((latestPost) => latestPost.id !== post.id) // Remover a postagem atual
    .map((latest) => ({
      id: latest.id,
      title: latest.title.rendered,
      date: latest.date,
      content: latest.content.rendered,
      excerpt: latest.excerpt.rendered,
      slug: latest.slug,
      link: latest.link,
      author: latest._embedded?.author[0]?.name || 'Autor Desconhecido',
      authorAvatar:
        latest._embedded?.author?.[0]?.avatar_urls?.['96'] ||
        latest._embedded?.author?.[0]?.avatar_urls?.['48'] ||
        null,
      imageUrl:
        latest.yoast_head_json?.og_image?.[0]?.url ||
        latest.jetpack_featured_media_url ||
        latest._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        '/default-image.png',
    }));

  return (
    <>
      <PostDetailsHero
        title={post?.yoast_head_json.title ?? ''}
        author={post?._embedded?.author?.[0]?.name || post?.yoast_head_json?.author || 'Autor'}
        authorAvatar={
          // WordPress retorna avatares em diferentes tamanhos, tentamos do maior para o menor
          post?._embedded?.author?.[0]?.avatar_urls?.['96'] ||
          post?._embedded?.author?.[0]?.avatar_urls?.['48'] ||
          post?._embedded?.author?.[0]?.avatar_urls?.['24'] ||
          null
        }
        coverUrl={post?.yoast_head_json.og_image[0].url ?? ''}
        createdAt={post?.date}
      />

      <Container
        maxWidth={false}
        sx={{ py: 3, mb: 5, borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}` }}
      >
        <CustomBreadcrumbs
          links={[
            { name: 'Home', href: '/' },
            { name: 'Blog', href: paths.post.blog },
            { name: post?.yoast_head_json.title },
          ]}
          sx={{ maxWidth: { xs: '100%', md: 1000 }, mx: 'auto', px: { xs: 2, md: 0 } }}
        />
      </Container>

      <Container maxWidth={false}>
        <Stack 
          sx={{ 
            maxWidth: { xs: '100%', sm: 800, md: 1000, lg: 1200 }, 
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 3,
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.7,
              color: 'text.secondary',
            }}
          >
            {post?.yoast_head_json.description}
          </Typography>

          <Markdown 
            children={post?.content.rendered}
            sx={{
              '& p': {
                fontSize: { xs: '1rem', md: '1.125rem' },
                lineHeight: 1.8,
                mb: 2,
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                mt: 4,
                mb: 2,
                fontWeight: 600,
              },
              '& h2': {
                fontSize: { xs: '1.5rem', md: '2rem' },
              },
              '& h3': {
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              },
              '& img': {
                borderRadius: 2,
                my: 3,
                maxWidth: '100%',
                height: 'auto',
              },
              '& ul, & ol': {
                pl: 3,
                mb: 2,
              },
              '& li': {
                mb: 1,
                fontSize: { xs: '1rem', md: '1.125rem' },
                lineHeight: 1.8,
              },
              '& blockquote': {
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                pl: 3,
                py: 2,
                my: 3,
                fontStyle: 'italic',
                bgcolor: 'background.neutral',
                borderRadius: 1,
              },
              '& code': {
                bgcolor: 'background.neutral',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.875rem',
              },
              '& pre': {
                bgcolor: 'background.neutral',
                p: 2,
                borderRadius: 2,
                overflow: 'auto',
                mb: 2,
              },
            }}
          />

          <Stack
            spacing={3}
            sx={{
              py: 4,
              mt: 4,
              borderTop: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
              borderBottom: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
            }}
          >
            {post?.tags && post.tags.length > 0 && (
              <Stack direction="row" flexWrap="wrap" spacing={1}>
                {post.tags.map((tag) => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    variant="soft" 
                    size="medium"
                    sx={{ 
                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                      height: { xs: 28, md: 32 },
                    }}
                  />
                ))}
              </Stack>
            )}

            {post?.totalFavorites !== undefined && (
              <Stack direction="row" alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      defaultChecked
                      size="small"
                      color="error"
                      icon={<Iconify icon="solar:heart-bold" />}
                      checkedIcon={<Iconify icon="solar:heart-bold" />}
                      inputProps={{ id: 'favorite-checkbox', 'aria-label': 'Favorite checkbox' }}
                    />
                  }
                  label={fShortenNumber(post.totalFavorites)}
                  sx={{ mr: 1 }}
                />
              </Stack>
            )}
          </Stack>

          <Divider sx={{ mt: 6, mb: 3 }} />
        </Stack>
      </Container>

      {/* Seção de Comentários */}
      {post && (
        <Container maxWidth={false}>
          <Stack 
            sx={{ 
              maxWidth: { xs: '100%', sm: 800, md: 1000, lg: 1200 }, 
              mx: 'auto',
              px: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={2}
              sx={{ 
                mb: 5,
                pb: 2,
                borderBottom: (theme) => `2px solid ${theme.vars.palette.divider}`,
              }}
            >
              <Iconify 
                icon="solar:chat-round-dots-bold" 
                width={32} 
                sx={{ color: 'primary.main' }}
              />
              <Stack>
                <Typography 
                  variant="h4" 
                  component="h2"
                  sx={{ 
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  Comentários
                </Typography>
                {totalComments > 0 && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: { xs: '0.875rem', md: '1rem' },
                    }}
                  >
                    {totalComments} {totalComments === 1 ? 'comentário' : 'comentários'}
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Box sx={{ mb: 5 }}>
              <PostCommentForm postId={post.id} onCommentAdded={reloadComments} />
            </Box>

            {comments.length > 0 ? (
              <PostCommentList 
                comments={comments} 
                postId={post.id}
                onCommentAdded={reloadComments}
              />
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  py: 8,
                  px: 3,
                  borderRadius: 2,
                  bgcolor: 'background.neutral',
                  border: (theme) => `2px dashed ${theme.vars.palette.divider}`,
                }}
              >
                <Iconify 
                  icon="solar:chat-round-dots-bold" 
                  width={64} 
                  sx={{ color: 'text.disabled', mb: 2 }}
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'text.secondary',
                    mb: 1,
                    fontWeight: 600,
                  }}
                >
                  Nenhum comentário ainda
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.disabled',
                    textAlign: 'center',
                    maxWidth: 400,
                  }}
                >
                  Seja o primeiro a compartilhar sua opinião sobre este post!
                </Typography>
              </Stack>
            )}
          </Stack>
        </Container>
      )}

      {!!formattedPosts?.length && (
        <Container 
          maxWidth={false}
          sx={{ 
            pt: 10,
            pb: 15,
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 5,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              fontWeight: 600,
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            Postagens Recentes
          </Typography>

          <Grid container spacing={2.5}>
            {formattedPosts?.slice(formattedPosts.length - 4).map((latestPost) => (
              <Grid key={latestPost.id} xs={12} sm={6} md={4} lg={3}>
                <PostItem post={latestPost} />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </>
  );
}
