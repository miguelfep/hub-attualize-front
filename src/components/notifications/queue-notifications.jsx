'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import { useNotifications } from 'src/hooks/use-socket';

// ----------------------------------------------------------------------

export function QueueNotifications() {
  const { notifications, clearNotification } = useNotifications();
  const [openNotifications, setOpenNotifications] = useState([]);

  useEffect(() => {
    // Mostrar notificações mais recentes
    const recentNotifications = notifications.slice(-3);
    setOpenNotifications(recentNotifications);
  }, [notifications]);

  const handleClose = (notificationId) => {
    setOpenNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    clearNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return 'eva:message-circle-fill';
      case 'chat_assigned':
        return 'eva:user-check-fill';
      case 'chat_closed':
        return 'eva:close-circle-fill';
      case 'queue_updated':
        return 'eva:refresh-fill';
      default:
        return 'eva:bell-fill';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_message':
        return 'info';
      case 'chat_assigned':
        return 'success';
      case 'chat_closed':
        return 'warning';
      case 'queue_updated':
        return 'primary';
      default:
        return 'info';
    }
  };

  return (
    <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
      <Stack spacing={1}>
        {openNotifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open={true}
            autoHideDuration={6000}
            onClose={() => handleClose(notification.id)}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              severity={getNotificationColor(notification.type)}
              variant="filled"
              onClose={() => handleClose(notification.id)}
              icon={<Iconify icon={getNotificationIcon(notification.type)} />}
              sx={{
                minWidth: 300,
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {notification.title || 'Notificação'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {notification.message}
                </Typography>
                {notification.timestamp && (
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </Typography>
                )}
              </Box>
            </Alert>
          </Snackbar>
        ))}
      </Stack>
    </Box>
  );
}
