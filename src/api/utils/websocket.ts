/**
 * WebSocket Auction Connection Utility
 *
 * Handles real-time WebSocket connections for live auction bidding.
 */

// WebSocket Message Types
export interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
}

// Bid Data Interface
export interface BidData {
  id: number;
  auction_id: number;
  player_id: number;
  team_id: number;
  bid_amount: number;
  is_winning_bid: boolean;
  created_at: string;
  team?: {
    id: number;
    name: string;
    short_name: string;
  };
  player?: {
    id: number;
    name: string;
    role: string;
  };
}

// Player Sold Data Interface
export interface PlayerSoldData {
  player_id: number;
  player_name: string;
  team_id: number;
  team_name: string;
  final_price: number;
}

// Budget Update Data Interface
export interface BudgetUpdateData {
  team_id: number;
  remaining_budget: number;
  current_players: number;
}

// Auction Status Data Interface
export interface AuctionStatusData {
  status: string;
  current_player_id?: number;
}

// Message Handler Type
export type MessageHandler = (message: WebSocketMessage) => void;

export class AuctionWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private isIntentionallyClosed = false;

  constructor(
    private auctionId: number,
    private token: string,
    private baseUrl: string = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
  ) {}

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isIntentionallyClosed = false;
        const wsUrl = `${this.baseUrl}/api/v1/auctions/${this.auctionId}/ws?token=${this.token}`;

        console.log('[WebSocket] Connecting to:', wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = (event) => {
          console.log('[WebSocket] Connected to auction', this.auctionId);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('[WebSocket] Message received:', message);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('[WebSocket] Connection closed:', event.code, event.reason);

          if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };

      } catch (error) {
        console.error('[WebSocket] Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    console.log('[WebSocket] Disconnecting...');
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }

    // Also call generic handlers
    const genericHandlers = this.messageHandlers.get('*');
    if (genericHandlers) {
      genericHandlers.forEach(handler => handler(message));
    }
  }

  /**
   * Register a message handler for a specific message type
   */
  on(messageType: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  /**
   * Unregister a message handler
   */
  off(messageType: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Send a message to the server
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('[WebSocket] Cannot send message - connection not open');
    }
  }

  /**
   * Place a bid
   */
  placeBid(playerId: number, teamId: number, bidAmount: number): void {
    this.send({
      action: 'place_bid',
      player_id: playerId,
      team_id: teamId,
      bid_amount: bidAmount
    });
  }

  /**
   * Send a ping to keep connection alive
   */
  ping(): void {
    this.send({ action: 'ping' });
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getReadyState(): number | null {
    return this.ws ? this.ws.readyState : null;
  }
}

/**
 * Hook-friendly WebSocket manager
 */
export class AuctionWebSocketManager {
  private connections: Map<number, AuctionWebSocket> = new Map();

  /**
   * Get or create a WebSocket connection for an auction
   */
  getConnection(auctionId: number, token: string): AuctionWebSocket {
    if (!this.connections.has(auctionId)) {
      const ws = new AuctionWebSocket(auctionId, token);
      this.connections.set(auctionId, ws);
    }
    return this.connections.get(auctionId)!;
  }

  /**
   * Disconnect and remove a connection
   */
  removeConnection(auctionId: number): void {
    const connection = this.connections.get(auctionId);
    if (connection) {
      connection.disconnect();
      this.connections.delete(auctionId);
    }
  }

  /**
   * Disconnect all connections
   */
  disconnectAll(): void {
    this.connections.forEach((connection) => {
      connection.disconnect();
    });
    this.connections.clear();
  }
}

// Global singleton instance
export const wsManager = new AuctionWebSocketManager();
