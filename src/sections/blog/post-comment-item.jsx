
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

import { PostCommentReplyForm } from './post-comment-reply-form';

// ----------------------------------------------------------------------

export function PostCommentItem({ 
  id, 
  name, 
  avatarUrl, 
  message, 
  tagUser, 
  postedAt, 
  hasReply,
  postId,
  onReplyAdded,
}) {
  const theme = useTheme();
  const reply = useBoolean();

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        p: { xs: 2, sm: 3 },
        position: 'relative',
        border: (themeLocal) => `1px solid ${themeLocal.vars.palette.divider}`,
        borderRadius: 2,
        bgcolor: hasReply 
          ? varAlpha(theme.vars.palette.primary.mainChannel, 0.02)
          : 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: (themeLocal) => themeLocal.customShadows.z8,
          borderColor: 'primary.main',
        },
        ...(hasReply && { 
          ml: { xs: 3, sm: 5, md: 7 },
          borderLeft: (themeLocal) => `3px solid ${themeLocal.vars.palette.primary.main}`,
        }),
      }}
    >
      <Stack direction="row" spacing={2}>
        <Avatar 
          alt={name} 
          src={avatarUrl || undefined}
          sx={{ 
            width: { xs: 40, sm: 48 }, 
            height: { xs: 40, sm: 48 },
            border: (themeLocal) => `2px solid ${themeLocal.vars.palette.primary.main}`,
            bgcolor: 'primary.lighter',
            color: 'primary.main',
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {(!avatarUrl && name) ? name.charAt(0).toUpperCase() : null}
        </Avatar>

        <Stack flexGrow={1} spacing={1.5}>
          <Stack 
            direction="row" 
            alignItems="center" 
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                {name}
              </Typography>
              {hasReply && (
                <Chip
                  label="Resposta"
                  size="small"
                  color="primary"
                  variant="soft"
                  sx={{ 
                    height: 20,
                    fontSize: '0.625rem',
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify 
                  icon="solar:calendar-bold" 
                  width={14} 
                  sx={{ color: 'text.disabled' }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  }}
                >
                  {fDate(postedAt)}
                </Typography>
              </Stack>

              {!hasReply && postId && (
                <Button
                  size="small"
                  variant={reply.value ? 'contained' : 'outlined'}
                  color="primary"
                  startIcon={
                    <Iconify 
                      icon={reply.value ? "solar:close-circle-bold" : "solar:chat-round-dots-bold"} 
                      width={16} 
                    />
                  }
                  onClick={reply.onToggle}
                  sx={{
                    minWidth: 'auto',
                    px: 1.5,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    textTransform: 'none',
                  }}
                >
                  {reply.value ? 'Cancelar' : 'Responder'}
                </Button>
              )}
            </Stack>
          </Stack>

          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 1.5,
              bgcolor: hasReply 
                ? varAlpha(theme.vars.palette.background.neutralChannel, 0.5)
                : 'background.neutral',
              border: (themeLocal) => `1px solid ${themeLocal.vars.palette.divider}`,
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: 1.7,
                color: 'text.primary',
                '& p': {
                  mb: 1.5,
                  '&:last-child': { mb: 0 },
                },
                '& a': {
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                },
              }}
            >
              {tagUser && (
                <Chip
                  component="span"
                  label={`@${tagUser}`}
                  size="small"
                  color="primary"
                  variant="soft"
                  sx={{ 
                    mr: 1,
                    mb: 0.5,
                    height: 22,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                />
              )}
              <span dangerouslySetInnerHTML={{ __html: message }} />
            </Typography>
          </Box>

          {reply.value && postId && (
            <Box 
              sx={{ 
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
                border: (themeLocal) => `1px dashed ${themeLocal.vars.palette.primary.main}`,
              }}
            >
              <PostCommentReplyForm
                postId={postId}
                parentId={id}
                parentAuthorName={name}
                onReplyAdded={() => {
                  reply.onFalse();
                  if (onReplyAdded) {
                    onReplyAdded();
                  }
                }}
                onCancel={reply.onFalse}
              />
            </Box>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
