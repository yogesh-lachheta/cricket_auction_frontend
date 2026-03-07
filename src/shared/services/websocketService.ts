import toast from 'react-hot-toast';

export type WebSocketMessage = {
  type: 'BID_PLACED' | 'PLAYER_SOLD' | 'AUCTION_STARTED' | 'AUCTION_ENDED' | 'NOTIFICATION';
  data: any;
  timestamp: string;
};

export type WebSocketCallback = (message: WebSocketMessage) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private callbacks: Set<WebSocketCallback> = new Set();
  private url: string;

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  }

  connect(token?: string) {
    try {
      // Add token as query param if provided
      const wsUrl = token ? `${this.url}?token=${token}` : this.url;
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        toast.success('Connected to real-time updates');
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.socket.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.attemptReconnect(token);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  private attemptReconnect(token?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      
      setTimeout(() => {
        this.connect(token);
      }, this.reconnectDelay);
    } else {
      toast.error('Unable to connect to real-time updates');
    }
  }

  private handleMessage(message: WebSocketMessage) {
    // Notify all subscribers
    this.callbacks.forEach((callback) => callback(message));

    // Show toast notifications based on message type
    switch (message.type) {
      case 'BID_PLACED':
        toast.success(`New bid: ₹${message.data.amount} for ${message.data.playerName}`);
        break;
      case 'PLAYER_SOLD':
        toast.success(`${message.data.playerName} sold to ${message.data.teamName}!`);
        break;
      case 'AUCTION_STARTED':
        toast.success(`Auction "${message.data.title}" has started!`);
        break;
      case 'AUCTION_ENDED':
        toast(`Auction "${message.data.title}" has ended`, {
          icon: 'ℹ️',
        });
        break;
      case 'NOTIFICATION':
        toast(message.data.message, {
          icon: message.data.icon || '📢',
        });
        break;
    }
  }

  subscribe(callback: WebSocketCallback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  send(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.callbacks.clear();
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
