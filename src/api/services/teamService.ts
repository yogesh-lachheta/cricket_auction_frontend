import axiosInstance from '@api/config/axiosInstance';
import type {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  PaginatedResponse,
} from '@api/types';

export const teamService = {
  // Get all teams with pagination
  getTeams: async (skip = 0, limit = 100): Promise<PaginatedResponse<Team>> => {
    const response = await axiosInstance.get<PaginatedResponse<Team>>(
      `/teams?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },

  // Get team by ID
  getTeamById: async (id: number): Promise<Team> => {
    const response = await axiosInstance.get<Team>(`/teams/${id}`);
    return response.data;
  },

  // Create new team
  createTeam: async (data: CreateTeamRequest): Promise<Team> => {
    const response = await axiosInstance.post<Team>('/teams', data);
    return response.data;
  },

  // Update team
  updateTeam: async (id: number, data: UpdateTeamRequest): Promise<Team> => {
    const response = await axiosInstance.put<Team>(`/teams/${id}`, data);
    return response.data;
  },

  // Delete team
  deleteTeam: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/teams/${id}`);
  },

  // Get my teams (for logged-in team owner)
  getMyTeams: async (): Promise<Team[]> => {
    const response = await axiosInstance.get<Team[]>('/teams/my-teams');
    return response.data;
  },

  // Get team players
  getTeamPlayers: async (teamId: number): Promise<Team> => {
    const response = await axiosInstance.get<Team>(`/teams/${teamId}/players`);
    return response.data;
  },
};
