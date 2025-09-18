import { useCallback, useState } from 'react';

import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import Typography from '@mui/material/Typography';

import { useResponsive } from 'src/hooks/use-responsive';

import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { ChatHeaderSkeleton } from './chat-skeleton';
import { TransferChatModal } from 'src/components/chat/transfer-chat-modal';
import { ChatStatusBadge } from 'src/components/chat/chat-status-badge';
import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ChatHeaderDetail({ 
  collapseNav, 
  participants = [], 
  loading, 
  chatId, 
  chatStatus,
  instanceType 
}) {
  const popover = usePopover();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const { user } = useMockedUser();

  const lgUp = useResponsive('up', 'lg');

  const group = participants.length > 1;

  const singleParticipant = participants[0];

  const { collapseDesktop, onCollapseDesktop, onOpenMobile } = collapseNav;

  const handleToggleNav = useCallback(() => {
    if (lgUp) {
      onCollapseDesktop();
    } else {
      onOpenMobile();
    }
  }, [lgUp, onCollapseDesktop, onOpenMobile]);

  const handleCloseChat = async () => {
    try {
      // Aqui você faria a chamada para fechar o chat
      console.log('Fechando chat:', chatId, user.id);
      popover.onClose();
    } catch (error) {
      console.error('Erro ao fechar chat:', error);
    }
  };

  const handleTransferChat = () => {
    setTransferModalOpen(true);
    popover.onClose();
  };

  if (loading) {
    return <ChatHeaderSkeleton />;
  }

  // Verificar se singleParticipant existe
  if (!singleParticipant) {
    return <ChatHeaderSkeleton />;
  }

  const { name, avatarUrl, status } = singleParticipant;

  const renderSingle = (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Badge
        variant={status || 'offline'}
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
          alt={name || 'Usuário'}
          src={avatarUrl}
          sx={{ width: 40, height: 40 }}
        />
      </Badge>

      <Stack sx={{ minWidth: 0, flex: '1 1 auto' }}>
        <Typography variant="subtitle2" noWrap>
          {name || 'Usuário'}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {singleParticipant.address || singleParticipant.phoneNumber || 'N/A'}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1}>
        {/* Status e Instância */}
        <ChatStatusBadge 
          status={chatStatus} 
          instanceType={instanceType}
          size="small"
        />
        
        {/* Menu de ações */}
        <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>
    </Stack>
  );

  const renderGroup = (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Badge
        variant={group ? 'online' : 'offline'}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <AvatarGroup
          sx={{
            [`& .${avatarGroupClasses.avatar}`]: {
              width: 40,
              height: 40,
            },
          }}
        >
          {participants.slice(0, 2).map((participant) => (
            <Avatar
              key={participant.id}
              alt={participant.name || 'Usuário'}
              src={participant.avatarUrl}
            />
          ))}
        </AvatarGroup>
      </Badge>

      <Stack sx={{ minWidth: 0, flex: '1 1 auto' }}>
        <Typography variant="subtitle2" noWrap>
          {participants.length} pessoas
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {participants.slice(0, 2).map((participant) => participant.name || 'Usuário').join(', ')}
          {participants.length > 2 && ` e mais ${participants.length - 2}`}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1}>
        {/* Status e Instância */}
        <ChatStatusBadge 
          status={chatStatus} 
          instanceType={instanceType}
          size="small"
        />
        
        {/* Menu de ações */}
        <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>
    </Stack>
  );

  return (
    <>
      <Stack direction="row" alignItems="center" sx={{ py: 1, pr: 1, pl: 2.5 }}>
        {!lgUp && (
          <IconButton onClick={handleToggleNav} sx={{ mr: 1 }}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>
        )}

        {group ? renderGroup : renderSingle}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuList>
          <MenuItem
            onClick={handleTransferChat}
            sx={{
              typography: 'body2',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Iconify icon="eva:swap-fill" sx={{ mr: 1 }} />
            Transferir Chat
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem
            onClick={handleCloseChat}
            sx={{
              typography: 'body2',
              color: 'error.main',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Iconify icon="eva:close-fill" sx={{ mr: 1 }} />
            Fechar Chat
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <TransferChatModal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        chatId={chatId}
        currentInstance={instanceType}
      />
    </>
  );
}
