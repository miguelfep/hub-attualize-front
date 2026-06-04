import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { maxLine } from 'src/theme/styles';

import {
  PostActionsMenu,
  PostStatusLabel,
  PostCommentsIndicator,
} from './post-actions-menu';

// ----------------------------------------------------------------------

/**
 * Linha compacta de post para a "visualização por lista" do dashboard.
 */
export function PostItemCompact({ post, onChanged }) {
  const { slug, title, status, coverUrl, createdAt, categoria, commentsTotal, commentsPending } =
    post;

  return (
    <Card sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        variant="rounded"
        alt={title}
        src={coverUrl || undefined}
        sx={{ width: 56, height: 56, flexShrink: 0 }}
      >
        {title?.charAt(0)?.toUpperCase()}
      </Avatar>

      <Stack sx={{ flexGrow: 1, minWidth: 0 }} spacing={0.5}>
        <Link
          component={RouterLink}
          href={paths.dashboard.post.details(slug)}
          color="inherit"
          variant="subtitle2"
          sx={{ ...maxLine({ line: 1 }) }}
        >
          {title}
        </Link>

        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
          <PostStatusLabel status={status} />
          {categoria ? (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {categoria}
            </Typography>
          ) : null}
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {fDate(createdAt)}
          </Typography>
        </Stack>
      </Stack>

      <Box sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
        <PostCommentsIndicator slug={slug} total={commentsTotal} pending={commentsPending} />
      </Box>

      <PostActionsMenu post={post} onChanged={onChanged} />
    </Card>
  );
}
