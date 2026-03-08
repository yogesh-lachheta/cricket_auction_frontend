import axiosInstance from '@api/config/axiosInstance';
import type {
  Auction,
  CreateAuctionRequest,
  UpdateAuctionRequest,
  PaginatedResponse,
} from '@api/types';

export const auctionService = {
  // Get all auctions with pagination
  getAuctions: async (skip = 0, limit = 100): Promise<Auction[]> => {
    const response = await axiosInstance.get<Auction[]>(
      `/auctions?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },

  // Get auction by ID
  getAuctionById: async (id: number): Promise<Auction> => {
    const response = await axiosInstance.get<Auction>(`/auctions/${id}`);
    return response.data;
  },

  // Create new auction
  createAuction: async (data: CreateAuctionRequest): Promise<Auction> => {
    const response = await axiosInstance.post<Auction>('/auctions', data);
    return response.data;
  },

  // Update auction
  updateAuction: async (id: number, data: UpdateAuctionRequest): Promise<Auction> => {
    const response = await axiosInstance.put<Auction>(`/auctions/${id}`, data);
    return response.data;
  },

  // Delete auction
  deleteAuction: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/auctions/${id}`);
  },

  // Start auction
  startAuction: async (id: number): Promise<Auction> => {
    const response = await axiosInstance.post<Auction>(`/auctions/${id}/start`);
    return response.data;
  },

  // Pause auction
  pauseAuction: async (id: number): Promise<Auction> => {
    const response = await axiosInstance.post<Auction>(`/auctions/${id}/pause`);
    return response.data;
  },

  // Resume auction
  resumeAuction: async (id: number): Promise<Auction> => {
    const response = await axiosInstance.post<Auction>(`/auctions/${id}/resume`);
    return response.data;
  },

  // End auction
  endAuction: async (id: number): Promise<Auction> => {
    const response = await axiosInstance.post<Auction>(`/auctions/${id}/end`);
    return response.data;
  },

  // Get active auction
  getActiveAuction: async (): Promise<Auction | null> => {
    const response = await axiosInstance.get<Auction | null>('/auctions/active');
    return response.data;
  },

  // Set current player for auction
  setCurrentPlayer: async (auctionId: number, playerId: number): Promise<Auction> => {
    const response = await axiosInstance.post<Auction>(
      `/auctions/${auctionId}/set-player`,
      { player_id: playerId }
    );
    return response.data;
  },
};
