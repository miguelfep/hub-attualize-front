'use client';

import { useState, useEffect, useContext, createContext } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const NotificationContext = createContext({});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// ----------------------------------------------------------------------

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    const handleNotification = (event) => {
      const notification = event.detail;
      addNotification(notification);
    };

    // Escutar eventos de notificação do WebSocket
    window.addEventListener('notification', handleNotification);
    window.addEventListener('newChat', handleNotification);
    window.addEventListener('newMessage', handleNotification);

    return () => {
      window.removeEventListener('notification', handleNotification);
      window.removeEventListener('newChat', handleNotification);
      window.removeEventListener('newMessage', handleNotification);
    };
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      type: notification.type || 'info',
      title: notification.title || 'Notificação',
      message: notification.message || notification.content || 'Nova notificação',
      timestamp: new Date(),
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Manter apenas 10 notificações
    setCurrentNotification(newNotification);
    setOpen(true);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_chat':
        return 'eva:message-circle-fill';
      case 'new_message':
        return 'eva:message-fill';
      case 'chat_assigned':
        return 'eva:person-add-fill';
      case 'chat_transferred':
        return 'eva:swap-fill';
      case 'chat_closed':
        return 'eva:close-circle-fill';
      case 'error':
        return 'eva:alert-circle-fill';
      case 'success':
        return 'eva:checkmark-circle-fill';
      case 'warning':
        return 'eva:alert-triangle-fill';
      default:
        return 'eva:bell-fill';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_chat':
        return 'primary';
      case 'new_message':
        return 'info';
      case 'chat_assigned':
        return 'success';
      case 'chat_transferred':
        return 'warning';
      case 'chat_closed':
        return 'error';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Snackbar para notificações em tempo real */}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {currentNotification && (
          <Alert
            onClose={handleClose}
            severity={getNotificationColor(currentNotification.type)}
            variant="filled"
            sx={{ width: '100%' }}
            icon={
              <Iconify 
                icon={getNotificationIcon(currentNotification.type)} 
                sx={{ mr: 1 }}
              />
            }
          >
            <Box>
              <Box component="strong" sx={{ display: 'block' }}>
                {currentNotification.title}
              </Box>
              {currentNotification.message}
            </Box>
          </Alert>
        )}
      </Snackbar>
    </NotificationContext.Provider>
  );
}
