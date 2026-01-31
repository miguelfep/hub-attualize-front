import { memo } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';

import { maxLine, varAlpha } from 'src/theme/styles';
import { AvatarShape } from 'src/assets/illustrations';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function truncateText(htmlString, maxLength) {
  const plainText = htmlString.replace(/(<([^>]+)>)/gi, ''); // Remove HTML tags
  return plainText.length > maxLength ? `${plainText.slice(0, maxLength)}...` : plainText;
}

export const PostItem = memo(({ post }) => {
  const theme = useTheme();

  const linkTo = paths.post.details(post.slug);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative' }}>
        <AvatarShape
          sx={{
            left: 0,
            zIndex: 9,
            width: 72,
            height: 30,
            bottom: -12,
            position: 'absolute',
          }}
        />

        <Avatar
          alt={post.author || 'Autor desconhecido'}
          src={post.authorAvatar || post.author_avatar || ''}
          sx={{
            left: 20,
            zIndex: 9,
            bottom: -20,
            position: 'absolute',
            width: 40,
            height: 40,
          }}
        >
          {!post.authorAvatar && !post.author_avatar && post.author?.charAt(0)?.toUpperCase()}
        </Avatar>

        <Image 
          alt={post.title} 
          src={post.imageUrl} 
          ratio="4/3"
          useIntersectionObserver
          threshold={100}
        />
      </Box>

      <CardContent sx={{ pt: 5, pb: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="caption" 
          component="div" 
          sx={{ mb: 0.75, color: 'text.disabled', fontSize: '0.7rem' }}
        >
          {fDate(post.date)}
        </Typography>

        <Link
          component={RouterLink}
          href={linkTo}
          color="inherit"
          variant="subtitle2"
          sx={{ 
            ...maxLine({ line: 2, persistent: theme.typography.subtitle2 }),
            fontSize: '0.875rem',
            fontWeight: 600,
            mb: 0.75,
          }}
        >
          {post.title}
        </Link>
        <Typography
          variant="body2"
          component="p"
          sx={{ 
            mt: 'auto',
            color: 'text.secondary',
            fontSize: '0.8125rem',
            lineHeight: 1.5,
          }}
          dangerouslySetInnerHTML={{ __html: truncateText(post.excerpt, 80) }}
        />
      </CardContent>
    </Card>
  );
});

// ----------------------------------------------------------------------

export const PostItemLatest = memo(({ post, index }) => {
  const theme = useTheme();

  const linkTo = paths.post.details(post.slug);

  const postSmall = index === 1 || index === 2;

  return (
    <Card>
      <Avatar
        alt={post.author || 'Autor desconhecido'}
        src={post.authorAvatar || post.author_avatar || ''}
        sx={{
          top: 24,
          left: 24,
          zIndex: 9,
          position: 'absolute',
        }}
      >
        {!post.authorAvatar && !post.author_avatar && post.author?.charAt(0)?.toUpperCase()}
      </Avatar>

      <Image
        alt={post.title}
        src={post.imageUrl}
        ratio="4/3"
        sx={{ height: 360 }}
        useIntersectionObserver
        threshold={100}
        slotProps={{ overlay: { bgcolor: varAlpha(theme.vars.palette.grey['900Channel'], 0.48) } }}
      />

      <CardContent
        sx={{
          width: 1,
          zIndex: 9,
          bottom: 0,
          position: 'absolute',
          color: 'common.white',
        }}
      >
        <Typography variant="caption" component="div" sx={{ mb: 1, opacity: 0.64 }}>
          {fDate(post.date)}
        </Typography>

        <Link
          component={RouterLink}
          href={linkTo}
          color="inherit"
          variant={postSmall ? 'subtitle2' : 'h5'}
          sx={{
            ...maxLine({
              line: 2,
              persistent: postSmall ? theme.typography.subtitle2 : theme.typography.h5,
            }),
          }}
        >
          {post.title}
        </Link>
        <Typography
          variant="body2"
          component="p"
          sx={{ mt: 1, color: 'text.white' }}
          dangerouslySetInnerHTML={{ __html: truncateText(post.excerpt, 55) }}
        />
      </CardContent>
    </Card>
  );
});

// ----------------------------------------------------------------------

export function InfoBlock({ totalComments, totalViews, totalShares, sx }) {
  return (
    <Stack
      spacing={1.5}
      direction="row"
      justifyContent="flex-end"
      sx={{
        mt: 3,
        typography: 'caption',
        color: 'text.disabled',
        ...sx,
      }}
    >
      <Stack direction="row" alignItems="center">
        <Iconify icon="eva:message-circle-fill" width={16} sx={{ mr: 0.5 }} />
        {fShortenNumber(totalComments)}
      </Stack>

      <Stack direction="row" alignItems="center">
        <Iconify icon="solar:eye-bold" width={16} sx={{ mr: 0.5 }} />
        {fShortenNumber(totalViews)}
      </Stack>

      <Stack direction="row" alignItems="center">
        <Iconify icon="solar:share-bold" width={16} sx={{ mr: 0.5 }} />
        {fShortenNumber(totalShares)}
      </Stack>
    </Stack>
  );
}
