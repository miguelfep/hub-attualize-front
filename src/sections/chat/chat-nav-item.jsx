import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { fToNow } from 'src/utils/format-time';

import { clickConversation } from 'src/actions/chat';

import { useMockedUser } from 'src/auth/hooks';

import { useNavItem } from './hooks/use-nav-item';
import { InstanceBadge } from 'src/components/chat/instance-badge';

// ----------------------------------------------------------------------

export function ChatNavItem({ selected, collapse, conversation, onCloseMobile }) {
  const { user } = useMockedUser();

  const mdUp = useResponsive('up', 'md');

  const router = useRouter();

  const { group, displayName, displayText, participants, lastActivity, hasOnlineInGroup } =
    useNavItem({ conversation, currentUserId: `${user?.id}` });

  const singleParticipant = participants[0];

  // Verificar se singleParticipant existe
  if (!singleParticipant) {
    return null;
  }

  const { name, avatarUrl, status } = singleParticipant;

  const handleClickConversation = useCallback(async () => {
    try {
      if (!mdUp) {
        onCloseMobile();
      }

      await clickConversation(conversation.id);

      router.push(`${paths.dashboard.chat}?id=${conversation.id}`);
    } catch (error) {
      console.error('Failed to click conversation:', error);
    }
  }, [conversation.id, mdUp, onCloseMobile, router]);

  const renderSingle = (
    <Stack direction="row" alignItems="center" sx={{ width: 1, minWidth: 0 }}>
      <Badge
        variant={status}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiBadge-badge': {
            width: 12,
            height: 12,
            '&::before': {
              width: 12,
              height: 12,
            },
          },
        }}
      >
        <Avatar
          alt={name}
          src={avatarUrl}
          sx={{ width: 48, height: 48 }}
        />
      </Badge>

      <ListItemText
        primary={displayName}
        secondary={displayText}
        primaryTypographyProps={{
          noWrap: true,
          variant: 'subtitle2',
        }}
        secondaryTypographyProps={{
          noWrap: true,
          component: 'span',
          variant: 'body2',
          color: 'text.secondary',
        }}
        sx={{ ml: 2 }}
      />

      <Stack alignItems="flex-end" sx={{ ml: 2, flexShrink: 0 }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* Badge de instância */}
          {conversation?.instanceType && (
            <InstanceBadge 
              instanceType={conversation.instanceType} 
              size="small" 
            />
          )}
        </Stack>
        
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            flexShrink: 0,
            color: 'text.disabled',
          }}
        >
          {fToNow(lastActivity)}
        </Typography>
      </Stack>
    </Stack>
  );

  const renderGroup = (
    <Stack direction="row" alignItems="center" sx={{ width: 1, minWidth: 0 }}>
      <Badge
        variant={hasOnlineInGroup ? 'online' : 'offline'}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <AvatarGroup
          sx={{
            [`& .${avatarGroupClasses.avatar}`]: {
              width: 48,
              height: 48,
            },
          }}
        >
          {participants.slice(0, 2).map((participant) => (
            <Avatar
              key={participant.id}
              alt={participant.name}
              src={participant.avatarUrl}
            />
          ))}
        </AvatarGroup>
      </Badge>

      <ListItemText
        primary={displayName}
        secondary={displayText}
        primaryTypographyProps={{
          noWrap: true,
          variant: 'subtitle2',
        }}
        secondaryTypographyProps={{
          noWrap: true,
          component: 'span',
          variant: 'body2',
          color: 'text.secondary',
        }}
        sx={{ ml: 2 }}
      />

      <Stack alignItems="flex-end" sx={{ ml: 2, flexShrink: 0 }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* Badge de instância */}
          {conversation?.instanceType && (
            <InstanceBadge 
              instanceType={conversation.instanceType} 
              size="small" 
            />
          )}
        </Stack>
        
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            flexShrink: 0,
            color: 'text.disabled',
          }}
        >
          {fToNow(lastActivity)}
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <ListItemButton
      disableGutters
      selected={selected}
      onClick={handleClickConversation}
      sx={{
        py: 1.5,
        px: 2.5,
        mb: 0.5,
        borderRadius: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      {group ? renderGroup : renderSingle}
    </ListItemButton>
  );
}
