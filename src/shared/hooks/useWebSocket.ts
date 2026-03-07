import { useEffect } from 'react';
import { websocketService, type WebSocketMessage } from '@shared/services/websocketService';
import { useAppSelector } from './redux';

export const useWebSocket = (callback?: (message: WebSocketMessage) => void) => {
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Connect WebSocket when component mounts
    if (token && !websocketService.isConnected()) {
      websocketService.connect(token);
    }

    // Subscribe to messages
    let unsubscribe: (() => void) | undefined;
    if (callback) {
      unsubscribe = websocketService.subscribe(callback);
    }

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [token, callback]);

  return {
    send: websocketService.send.bind(websocketService),
    isConnected: websocketService.isConnected(),
    disconnect: websocketService.disconnect.bind(websocketService),
  };
};
