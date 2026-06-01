import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { PostItemSkeleton } from './post-skeleton';
import { PostItemCompact } from './post-item-compact';
import { PostItemHorizontal } from './post-item-horizontal';

// ----------------------------------------------------------------------

export function PostListHorizontal({ posts, loading, onChanged, view = 'grid' }) {
  if (loading) {
    return (
      <Box gap={3} display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}>
        <PostItemSkeleton variant="horizontal" />
      </Box>
    );
  }

  if (view === 'list') {
    return (
      <Stack spacing={1.5}>
        {posts.map((post) => (
          <PostItemCompact key={post.id} post={post} onChanged={onChanged} />
        ))}
      </Stack>
    );
  }

  return (
    <Box gap={3} display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}>
      {posts.map((post) => (
        <PostItemHorizontal key={post.id} post={post} onChanged={onChanged} />
      ))}
    </Box>
  );
}
