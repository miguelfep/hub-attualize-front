import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

import { useResponsive } from 'src/hooks/use-responsive';

import Iconify from 'src/components/iconify';
import { fToNow } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function ContactItem({ 
  contact, 
  onStartConversation, 
  onSendMessage,
  onEdit,
  onDelete,
  currentUserId 
}) {
  const mdUp = useResponsive('up', 'md');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartConversation = async () => {
    if (onStartConversation) {
      setIsLoading(true);
      try {
        await onStartConversation(contact._id, contact.instanceType, currentUserId);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (onSendMessage) {
      setIsLoading(true);
      try {
        await onSendMessage(contact._id, currentUserId);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getInstanceColor = (instanceType) => {
    switch (instanceType) {
      case 'operacional':
        return 'success';
      case 'financeiro-comercial':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getInstanceLabel = (instanceType) => {
    switch (instanceType) {
      case 'operacional':
        return 'Operacional';
      case 'financeiro-comercial':
        return 'Financeiro/Comercial';
      default:
        return instanceType;
    }
  };

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2,
        borderRadius: 1,
        mb: 0.5,
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
        {/* Avatar */}
        <Avatar
          src={contact.profilePicture}
          alt={contact.name}
          sx={{ width: 48, height: 48 }}
        >
          {contact.name.charAt(0).toUpperCase()}
        </Avatar>

        {/* Informações do contato */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2" noWrap>
              {contact.name}
            </Typography>
            
            {contact.clienteId && (
              <Chip
                label="Cliente"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.75rem' }}
              />
            )}
            
            <Chip
              label={getInstanceLabel(contact.instanceType)}
              size="small"
              color={getInstanceColor(contact.instanceType)}
              variant="outlined"
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {contact.whatsappNumber}
            </Typography>
            
            {contact.lastSeen && (
              <>
                <Typography variant="caption" color="text.secondary">
                  •
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {fToNow(contact.lastSeen)}
                </Typography>
              </>
            )}
          </Stack>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
              {contact.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.7rem' }}
                />
              ))}
              {contact.tags.length > 3 && (
                <Chip
                  label={`+${contact.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.7rem' }}
                />
              )}
            </Stack>
          )}
        </Box>

        {/* Ações */}
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Iniciar conversa">
            <IconButton
              size="small"
              onClick={handleStartConversation}
              disabled={isLoading}
              color="primary"
            >
              <Iconify icon="eva:message-circle-fill" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Enviar mensagem">
            <IconButton
              size="small"
              onClick={handleSendMessage}
              disabled={isLoading}
              color="success"
            >
              <Iconify icon="eva:paper-plane-fill" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editar contato">
            <IconButton
              size="small"
              onClick={() => onEdit?.(contact)}
              color="inherit"
            >
              <Iconify icon="eva:edit-fill" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Deletar contato">
            <IconButton
              size="small"
              onClick={() => onDelete?.(contact)}
              color="error"
            >
              <Iconify icon="eva:trash-2-fill" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </ListItemButton>
  );
} 