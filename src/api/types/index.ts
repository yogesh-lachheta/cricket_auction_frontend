// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// Error types
export interface ApiError {
  detail: string | ValidationError[];
}

export interface ValidationError {
  loc: string[];
  msg: string;
  type: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name: string;
  mobile?: string;
  role?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user_id: number;
  email: string;
  mobile?: string;
  otp_sent_to: string[];
  requires_verification: boolean;
}

export interface OTPVerifyRequest {
  user_id: number;
  otp_type: 'EMAIL' | 'MOBILE';
  code: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_superuser: boolean;
  email_verified: boolean;
  mobile_verified: boolean;
  created_at: string;
}

// Player types
export interface Player {
  id: number;
  name: string;
  age: number;
  role: string;
  batting_style: string;
  bowling_style: string;
  base_price: number;
  country: string;
  is_sold: boolean;
  final_price?: number;
  team_id?: number;
  team?: Team;
  created_at: string;
  updated_at: string;
}

export interface CreatePlayerRequest {
  name: string;
  age: number;
  role: string;
  batting_style: string;
  bowling_style: string;
  base_price: number;
  country: string;
}

export interface UpdatePlayerRequest {
  name?: string;
  age?: number;
  role?: string;
  batting_style?: string;
  bowling_style?: string;
  base_price?: number;
  country?: string;
}

// Team types
export interface Team {
  id: number;
  name: string;
  owner_id: number;
  owner?: User;
  purse_remaining: number;
  max_players: number;
  players?: Player[];
  created_at: string;
  updated_at: string;
}

export interface CreateTeamRequest {
  name: string;
  owner_id: number;
  purse_remaining: number;
  max_players?: number;
}

export interface UpdateTeamRequest {
  name?: string;
  purse_remaining?: number;
  max_players?: number;
}

// Auction types
export interface Auction {
  id: number;
  name: string;
  start_time: string;
  end_time?: string;
  status: 'pending' | 'active' | 'paused' | 'completed';
  current_player_id?: number;
  current_player?: Player;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAuctionRequest {
  name: string;
  start_time: string;
  end_time?: string;
}

export interface UpdateAuctionRequest {
  name?: string;
  start_time?: string;
  end_time?: string;
  status?: 'pending' | 'active' | 'paused' | 'completed';
  current_player_id?: number;
}

// Bid types
export interface Bid {
  id: number;
  auction_id: number;
  player_id: number;
  team_id: number;
  amount: number;
  is_winning: boolean;
  team?: Team;
  player?: Player;
  created_at: string;
}

export interface CreateBidRequest {
  auction_id: number;
  player_id: number;
  team_id: number;
  amount: number;
}
