import axiosInstance from '@api/config/axiosInstance';
import type {
  Player,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  PaginatedResponse,
} from '@api/types';

export const playerService = {
  // Get all players with pagination
  getPlayers: async (skip = 0, limit = 100): Promise<Player[]> => {
    const response = await axiosInstance.get<Player[]>(
      `/players?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },

  // Get player by ID
  getPlayerById: async (id: number): Promise<Player> => {
    const response = await axiosInstance.get<Player>(`/players/${id}`);
    return response.data;
  },

  // Create new player
  createPlayer: async (data: CreatePlayerRequest): Promise<Player> => {
    const response = await axiosInstance.post<Player>('/players', data);
    return response.data;
  },

  // Update player
  updatePlayer: async (id: number, data: UpdatePlayerRequest): Promise<Player> => {
    const response = await axiosInstance.put<Player>(`/players/${id}`, data);
    return response.data;
  },

  // Delete player
  deletePlayer: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/players/${id}`);
  },

  // Get available players (not sold)
  getAvailablePlayers: async (auctionId?: number): Promise<Player[]> => {
    const params = new URLSearchParams({ status: 'available' });
    if (auctionId) params.append('auction_id', auctionId.toString());
    const response = await axiosInstance.get<Player[]>(`/players?${params.toString()}`);
    return response.data;
  },

  // Get sold players
  getSoldPlayers: async (auctionId?: number): Promise<Player[]> => {
    const params = new URLSearchParams({ status: 'sold' });
    if (auctionId) params.append('auction_id', auctionId.toString());
    const response = await axiosInstance.get<Player[]>(`/players?${params.toString()}`);
    return response.data;
  },
};
