import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { maxLine } from 'src/theme/styles';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

import {
  PostActionsMenu,
  PostStatusLabel,
  PostCommentsIndicator,
} from './post-actions-menu';

// ----------------------------------------------------------------------

export function PostItemHorizontal({ post, onChanged }) {
  const theme = useTheme();

  const {
    slug,
    title,
    author,
    status,
    coverUrl,
    createdAt,
    readingTimeMin,
    description,
    commentsTotal,
    commentsPending,
  } = post;

  return (
    <Card sx={{ display: 'flex' }}>
      <Stack spacing={1} sx={{ p: theme.spacing(3, 3, 2, 3), flexGrow: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <PostStatusLabel status={status} />

          <Box component="span" sx={{ typography: 'caption', color: 'text.disabled' }}>
            {fDate(createdAt)}
          </Box>
        </Box>

        <Stack spacing={1} flexGrow={1}>
          <Link
            component={RouterLink}
            href={paths.dashboard.post.details(slug)}
            color="inherit"
            variant="subtitle2"
            sx={{ ...maxLine({ line: 2 }) }}
          >
            {title}
          </Link>

          <Typography variant="body2" sx={{ ...maxLine({ line: 2 }), color: 'text.secondary' }}>
            {description}
          </Typography>
        </Stack>

        <Box display="flex" alignItems="center">
          <PostActionsMenu post={post} onChanged={onChanged} />

          <Box
            gap={1.5}
            flexGrow={1}
            display="flex"
            flexWrap="wrap"
            alignItems="center"
            justifyContent="flex-end"
            sx={{ typography: 'caption', color: 'text.disabled' }}
          >
            {readingTimeMin ? (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Iconify icon="solar:clock-circle-bold" width={16} />
                {readingTimeMin} min
              </Box>
            ) : null}

            <PostCommentsIndicator slug={slug} total={commentsTotal} pending={commentsPending} />
          </Box>
        </Box>
      </Stack>

      <Box
        sx={{
          p: 1,
          width: 180,
          height: 240,
          flexShrink: 0,
          position: 'relative',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Avatar
          alt={author?.name}
          src={author?.avatarUrl}
          sx={{ top: 16, right: 16, zIndex: 9, position: 'absolute' }}
        >
          {author?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
        {coverUrl ? <Image alt={title} src={coverUrl} sx={{ height: 1, borderRadius: 1.5 }} /> : null}
      </Box>
    </Card>
  );
}
