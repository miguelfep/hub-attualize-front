'use client';

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

import { Iconify } from 'src/components/iconify';
import { Markdown } from 'src/components/markdown';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PostItem } from '../post-item';
import { PostDetailsHero } from '../post-details-hero';

// ----------------------------------------------------------------------

export function PostDetailsHomeView({ post, latestPosts }) {
  const formattedPosts = latestPosts
    .filter((latestPost) => latestPost.id !== post.id)  // Remover a postagem atual
    .map((latest) => ({
      id: latest.id,
      title: latest.title.rendered,
      date: latest.date,
      content: latest.content.rendered,
      excerpt: latest.excerpt.rendered,
      slug: latest.slug,
      link: latest.link,
      author: latest._embedded?.author[0]?.name || 'Autor Desconhecido',
      imageUrl: latest.jetpack_featured_media_url || '/default-image.png',
    }));

    

  return (
    <>
      <PostDetailsHero
        title={post?.yoast_head_json.title ?? ''}
        author={post?.yoast_head_json.author}
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
            { name: 'Blog', href: paths.post.root },
            { name: post?.yoast_head_json.title },
          ]}
          sx={{ maxWidth: 720, mx: 'auto' }}
        />
      </Container>

      <Container maxWidth={false}>
        <Stack sx={{ maxWidth: 720, mx: 'auto' }}>
          <Typography variant="subtitle1">{post?.yoast_head_json.description}</Typography>

          <Markdown children={post?.content.rendered} />

          <Stack
            spacing={3}
            sx={{
              py: 3,
              borderTop: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
              borderBottom: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
            }}
          >
            <Stack direction="row" flexWrap="wrap" spacing={1}>
              {post?.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="soft" />
              ))}
            </Stack>

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
                label={fShortenNumber(post?.totalFavorites)}
                sx={{ mr: 1 }}
              />

            </Stack>
          </Stack>

          <Divider sx={{ mt: 5, mb: 2 }} />
        </Stack>
      </Container>

      {!!formattedPosts?.length && (
        <Container sx={{ pb: 15 }}>
          <Typography variant="h4" sx={{ mb: 5 }}>
            Postagens Recentes
          </Typography>

          <Grid container spacing={3}>
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
