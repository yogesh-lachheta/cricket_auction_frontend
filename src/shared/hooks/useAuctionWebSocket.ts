/**
 * React Hook for Auction WebSocket Connection
 *
 * Provides easy-to-use WebSocket functionality for auction components.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppSelector } from './redux';
import { AuctionWebSocket } from '@api/utils/websocket';

// Type definitions
interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
}

interface BidData {
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

interface PlayerSoldData {
  player_id: number;
  player_name: string;
  team_id: number;
  team_name: string;
  final_price: number;
}

interface BudgetUpdateData {
  team_id: number;
  remaining_budget: number;
  current_players: number;
}

interface AuctionStatusData {
  status: string;
  current_player_id?: number;
}

type MessageHandler = (message: WebSocketMessage) => void;

export interface UseAuctionWebSocketProps {
  auctionId: number;
  enabled?: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: any) => void;
  onNewBid?: (data: BidData) => void;
  onBidPlaced?: (data: BidData) => void;
  onPlayerSold?: (data: PlayerSoldData) => void;
  onPlayerUnsold?: (data: { player_id: number; player_name: string }) => void;
  onAuctionStatus?: (data: AuctionStatusData) => void;
  onBudgetUpdate?: (data: BudgetUpdateData) => void;
}

export interface UseAuctionWebSocketReturn {
  isConnected: boolean;
  placeBid: (playerId: number, teamId: number, bidAmount: number) => void;
  disconnect: () => void;
  reconnect: () => void;
  connectionState: number | null;
}

/**
 * Custom hook for managing auction WebSocket connection
 *
 * @example
 * const { isConnected, placeBid } = useAuctionWebSocket({
 *   auctionId: 1,
 *   onNewBid: (data) => console.log('New bid:', data),
 *   onPlayerSold: (data) => console.log('Player sold:', data)
 * });
 */
export const useAuctionWebSocket = ({
  auctionId,
  enabled = true,
  onConnected,
  onDisconnected,
  onError,
  onNewBid,
  onBidPlaced,
  onPlayerSold,
  onPlayerUnsold,
  onAuctionStatus,
  onBudgetUpdate
}: UseAuctionWebSocketProps): UseAuctionWebSocketReturn => {
  const { token } = useAppSelector((state) => state.auth);
  const wsRef = useRef<AuctionWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<number | null>(null);

  /**
   * Initialize WebSocket connection
   */
  const connect = useCallback(async () => {
    if (!enabled || !token) return;

    try {
      const ws = new AuctionWebSocket(auctionId, token);
      wsRef.current = ws;

      // Register event handlers
      ws.on('connected', (message: WebSocketMessage) => {
        console.log('[Hook] Connected:', message);
        setIsConnected(true);
        setConnectionState(WebSocket.OPEN);
        onConnected?.();
      });

      ws.on('new_bid', (message: WebSocketMessage) => {
        console.log('[Hook] New bid:', message.data);
        if (onNewBid && message.data) {
          onNewBid(message.data as BidData);
        }
      });

      ws.on('bid_placed', (message: WebSocketMessage) => {
        console.log('[Hook] Bid placed:', message.data);
        if (onBidPlaced && message.data) {
          onBidPlaced(message.data as BidData);
        }
      });

      ws.on('player_sold', (message: WebSocketMessage) => {
        console.log('[Hook] Player sold:', message.data);
        if (onPlayerSold && message.data) {
          onPlayerSold(message.data as PlayerSoldData);
        }
      });

      ws.on('player_unsold', (message: WebSocketMessage) => {
        console.log('[Hook] Player unsold:', message.data);
        if (onPlayerUnsold && message.data) {
          onPlayerUnsold(message.data);
        }
      });

      ws.on('auction_status', (message: WebSocketMessage) => {
        console.log('[Hook] Auction status:', message.data);
        if (onAuctionStatus && message.data) {
          onAuctionStatus(message.data as AuctionStatusData);
        }
      });

      ws.on('budget_update', (message: WebSocketMessage) => {
        console.log('[Hook] Budget update:', message.data);
        if (onBudgetUpdate && message.data) {
          onBudgetUpdate(message.data as BudgetUpdateData);
        }
      });

      ws.on('error', (message: WebSocketMessage) => {
        console.error('[Hook] Error:', message.message);
        if (onError) {
          onError(message.message);
        }
      });

      // Connect to WebSocket
      await ws.connect();

      // Setup ping interval to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.isConnected()) {
          ws.ping();
        }
      }, 30000); // Ping every 30 seconds

      // Cleanup function
      return () => {
        clearInterval(pingInterval);
      };

    } catch (error) {
      console.error('[Hook] Connection error:', error);
      setIsConnected(false);
      setConnectionState(null);
      onError?.(error);
    }
  }, [
    auctionId,
    token,
    enabled,
    onConnected,
    onNewBid,
    onBidPlaced,
    onPlayerSold,
    onPlayerUnsold,
    onAuctionStatus,
    onBudgetUpdate,
    onError
  ]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
      setIsConnected(false);
      setConnectionState(null);
      onDisconnected?.();
    }
  }, [onDisconnected]);

  /**
   * Reconnect to WebSocket
   */
  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  /**
   * Place a bid
   */
  const placeBid = useCallback((playerId: number, teamId: number, bidAmount: number) => {
    if (wsRef.current && wsRef.current.isConnected()) {
      wsRef.current.placeBid(playerId, teamId, bidAmount);
    } else {
      console.error('[Hook] Cannot place bid - not connected');
      onError?.('Not connected to auction');
    }
  }, [onError]);

  /**
   * Connect on mount and disconnect on unmount
   */
  useEffect(() => {
    if (enabled) {
      const cleanup = connect();
      return () => {
        cleanup?.then(fn => fn?.());
        disconnect();
      };
    }
  }, [enabled, connect, disconnect]);

  /**
   * Update connection state periodically
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current) {
        setConnectionState(wsRef.current.getReadyState());
        setIsConnected(wsRef.current.isConnected());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    placeBid,
    disconnect,
    reconnect,
    connectionState
  };
};
