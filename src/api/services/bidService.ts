import axiosInstance from '@api/config/axiosInstance';
import type {
  Bid,
  CreateBidRequest,
  PaginatedResponse,
} from '@api/types';

export const bidService = {
  // Get all bids with pagination
  getBids: async (skip = 0, limit = 100): Promise<PaginatedResponse<Bid>> => {
    const response = await axiosInstance.get<PaginatedResponse<Bid>>(
      `/bids?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },

  // Get bid by ID
  getBidById: async (id: number): Promise<Bid> => {
    const response = await axiosInstance.get<Bid>(`/bids/${id}`);
    return response.data;
  },

  // Place a bid
  placeBid: async (data: CreateBidRequest): Promise<Bid> => {
    const response = await axiosInstance.post<Bid>('/bids', data);
    return response.data;
  },

  // Get bids by auction
  getBidsByAuction: async (auctionId: number): Promise<Bid[]> => {
    const response = await axiosInstance.get<Bid[]>(`/bids/auction/${auctionId}`);
    return response.data;
  },

  // Get bids by player
  getBidsByPlayer: async (playerId: number): Promise<Bid[]> => {
    const response = await axiosInstance.get<Bid[]>(`/bids/player/${playerId}`);
    return response.data;
  },

  // Get bids by team
  getBidsByTeam: async (teamId: number): Promise<Bid[]> => {
    const response = await axiosInstance.get<Bid[]>(`/bids/team/${teamId}`);
    return response.data;
  },

  // Get winning bid for a player
  getWinningBid: async (playerId: number): Promise<Bid | null> => {
    const response = await axiosInstance.get<Bid | null>(`/bids/player/${playerId}/winning`);
    return response.data;
  },
};
