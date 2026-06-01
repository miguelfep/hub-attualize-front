'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { Markdown } from 'src/components/markdown';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PostItem } from '../post-item';
import { BlogLeadCta } from '../blog-lead-cta';
import { PostComments } from '../post-comments';
import { PostDetailsHero } from '../post-details-hero';

// ----------------------------------------------------------------------

const markdownSx = {
  '& p': { fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.8, mb: 2 },
  '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 4, mb: 2, fontWeight: 600 },
  '& h2': { fontSize: { xs: '1.5rem', md: '2rem' } },
  '& h3': { fontSize: { xs: '1.25rem', md: '1.5rem' } },
  '& img': { borderRadius: 2, my: 3, maxWidth: '100%', height: 'auto' },
  '& ul, & ol': { pl: 3, mb: 2 },
  '& li': { mb: 1, fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.8 },
  '& blockquote': {
    position: 'relative',
    maxWidth: '100%',
    width: '100%',
    margin: '24px 0',
    px: 3,
    py: 2,
    borderLeft: '4px solid',
    borderColor: 'primary.main',
    bgcolor: 'background.neutral',
    borderRadius: 1,
    fontFamily: 'inherit',
    fontStyle: 'italic',
    fontSize: { xs: '1rem', md: '1.125rem' },
    lineHeight: 1.7,
    color: 'text.secondary',
    // Remove a aspa grande (::before) do tema, que ficava sobre o texto
    '&::before': { content: 'none', display: 'none' },
    '& p': { margin: 0, fontSize: 'inherit', fontFamily: 'inherit' },
  },
  '& code': { bgcolor: 'background.neutral', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.875rem' },
  '& pre': { bgcolor: 'background.neutral', p: 2, borderRadius: 2, overflow: 'auto', mb: 2 },
};

const contentMaxWidth = { xs: '100%', sm: 800, md: 1000, lg: 1200 };

export function PostDetailsHomeView({ post, latestPosts = [] }) {
  if (!post) {
    return (
      <Container sx={{ my: 5 }}>
        <EmptyContent
          filled
          title="Post não encontrado!"
          description="A postagem que você está procurando não existe ou foi removida."
        />
      </Container>
    );
  }

  const relatedPosts = latestPosts.filter((latest) => latest.id !== post.id);

  const autorRole = post.category
    ? `Contadora Especialista na área ${post.category}`
    : 'Contadora Especialista';

  return (
    <>
      <PostDetailsHero
        title={post.title}
        author="Anne Monteiro"
        authorRole={autorRole}
        authorAvatar="/assets/images/about/anne.jpg"
        coverUrl={post.coverImage}
        createdAt={post.date}
      />

      <Container
        maxWidth={false}
        sx={{ py: 3, mb: 5, borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}` }}
      >
        <CustomBreadcrumbs
          links={[
            { name: 'Home', href: '/' },
            { name: 'Blog', href: paths.post.blog },
            { name: post.title },
          ]}
          sx={{ maxWidth: { xs: '100%', md: 1000 }, mx: 'auto', px: { xs: 2, md: 0 } }}
        />
      </Container>

      <Container maxWidth={false}>
        <Stack sx={{ maxWidth: contentMaxWidth, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Meta: tempo de leitura + atalho para comentários */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ mb: 2, color: 'text.secondary', typography: 'body2' }}
          >
            {post.readingTime ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Iconify icon="solar:clock-circle-bold" width={16} />
                {post.readingTime} min de leitura
              </Box>
            ) : null}

            <Link
              href="#comentarios"
              color="inherit"
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <Iconify icon="solar:chat-round-dots-bold" width={16} />
              {post.comentarios?.length || 0}{' '}
              {(post.comentarios?.length || 0) === 1 ? 'comentário' : 'comentários'}
            </Link>
          </Stack>

          {post.excerpt && (
            <Typography
              variant="subtitle1"
              sx={{
                mb: 3,
                fontSize: { xs: '1rem', md: '1.125rem' },
                lineHeight: 1.7,
                color: 'text.secondary',
              }}
            >
              {post.excerpt}
            </Typography>
          )}

          <Markdown asMarkdown children={post.content} sx={markdownSx} />

          {/* FAQ (rich snippet — também presente no JSON-LD) */}
          {post.faq?.length > 0 && (
            <Stack sx={{ mt: 6 }}>
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                Perguntas frequentes
              </Typography>
              {post.faq.map((item, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                    <Typography variant="subtitle1">{item.pergunta}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ color: 'text.secondary' }}>{item.resposta}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          )}

          {post.tags?.length > 0 && (
            <Stack
              spacing={3}
              sx={{
                py: 4,
                mt: 4,
                borderTop: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
                borderBottom: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
              }}
            >
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
            </Stack>
          )}

          <Divider sx={{ mt: 6, mb: 3 }} />

          <BlogLeadCta
            origem={`Blog - ${post.slug}`}
            subtitulo={`Precisa de contabilidade especializada${post.category ? ` em ${post.category}` : ''}? Deixe seus dados e um especialista entra em contato.`}
          />

          <PostComments slug={post.slug} comments={post.comentarios} />
        </Stack>
      </Container>

      {!!relatedPosts.length && (
        <Container maxWidth={false} sx={{ pt: 10, pb: 15, px: { xs: 2, sm: 3, md: 4 } }}>
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
            {relatedPosts.slice(0, 4).map((relatedPost) => (
              <Grid key={relatedPost.id} xs={12} sm={6} md={4} lg={3}>
                <PostItem post={relatedPost} />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </>
  );
}
