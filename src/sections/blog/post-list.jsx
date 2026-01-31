import React, { useMemo, useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';

import { PostItemSkeleton } from './post-skeleton';
import { PostItem, PostItemLatest } from './post-item';

// ----------------------------------------------------------------------

export function PostList({ posts, loading, isLoadingMore = false }) {
  const [visiblePosts, setVisiblePosts] = useState(posts.length);

  useEffect(() => {
    setVisiblePosts(posts.length);
  }, [posts.length]);

  // Memoizar os primeiros 3 posts para evitar re-renderizações
  const firstThreePosts = useMemo(() => posts.slice(0, 3), [posts]);
  const remainingPosts = useMemo(() => posts.slice(3, visiblePosts), [posts, visiblePosts]);

  // Só mostra skeleton completo se não houver posts (carregamento inicial)
  const renderLoading = posts.length === 0 && (
    <Grid container spacing={3}>
      {[...Array(12)].map((_, index) => (
        <Grid key={`skeleton-${index}`} xs={12} sm={6} md={4} lg={3}>
          <PostItemSkeleton amount={1} />
        </Grid>
      ))}
    </Grid>
  );

  const renderList = (
    <>
      <Grid container spacing={3}>
        {/* Primeiros 3 posts - versão desktop (PostItemLatest) */}
        {firstThreePosts.map((post, index) => (
          <Grid
            key={`latest-${post.id}`}
            xs={12}
            sm={6}
            md={4}
            lg={index === 0 ? 6 : 3}
            sx={{ display: { xs: 'none', lg: 'block' } }}
          >
            <PostItemLatest post={post} index={index} />
          </Grid>
        ))}

        {/* Primeiros 3 posts - versão mobile (PostItem) */}
        {firstThreePosts.map((post) => (
          <Grid
            key={`mobile-${post.id}`}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            sx={{ display: { lg: 'none' } }}
          >
            <PostItem post={post} />
          </Grid>
        ))}

        {/* Posts restantes */}
        {remainingPosts.map((post) => (
          <Grid key={post.id} xs={12} sm={6} md={4} lg={3}>
            <PostItem post={post} />
          </Grid>
        ))}
      </Grid>

      {/* Skeleton apenas para posts adicionais sendo carregados */}
      {isLoadingMore && posts.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[...Array(3)].map((_, index) => (
            <Grid key={`loading-skeleton-${index}`} xs={12} sm={6} md={4} lg={3}>
              <PostItemSkeleton amount={1} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );

  return <>{loading && posts.length === 0 ? renderLoading : renderList}</>;
}
