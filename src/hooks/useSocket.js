import { useState, useEffect } from 'react';

import { socketService } from 'src/lib/socket';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketService.connect();
    setIsConnected(true);

    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, []);

  return {
    isConnected,
    joinChat: socketService.joinChat,
    leaveChat: socketService.leaveChat,
    startTyping: socketService.startTyping,
    stopTyping: socketService.stopTyping,
    markAsRead: socketService.markAsRead
  };
};
